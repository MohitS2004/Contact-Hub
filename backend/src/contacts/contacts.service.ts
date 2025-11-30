import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Contact } from '../entities/contact.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { GetContactsQueryDto, SortBy, SortOrder } from './dto/get-contacts-query.dto';
import { PaginatedResponse } from '../common/interfaces/api-response.interface';
import { APP_CONSTANTS } from '../common/constants/app.constants';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  async findAll(
    query: GetContactsQueryDto,
    currentUser: User,
  ): Promise<PaginatedResponse<Contact>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = SortBy.CREATED_AT,
      sortOrder = SortOrder.DESC,
    } = query;

    const skip = (page - 1) * limit;
    const queryBuilder = this.contactRepository.createQueryBuilder('contact');

    if (currentUser.role !== UserRole.ADMIN) {
      queryBuilder.where('contact.ownerId = :ownerId', { ownerId: currentUser.id });
    }

    if (search) {
      queryBuilder.andWhere(
        '(contact.name ILIKE :search OR contact.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const orderBy = `contact.${sortBy}`;
    queryBuilder.orderBy(orderBy, sortOrder);

    const total = await queryBuilder.getCount();
    queryBuilder.skip(skip).take(limit);
    const items = await queryBuilder.getMany();
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async create(
    createContactDto: CreateContactDto,
    currentUser: User,
    file?: Express.Multer.File,
  ): Promise<Contact> {
    this.logger.log(`Creating contact for user ${currentUser.id}`);
    this.logger.log(`File received: ${file ? file.filename : 'none'}`);

    const photoPath = file ? `/uploads/contacts/${file.filename}` : undefined;
    if (photoPath) {
      this.logger.log(`Photo path: ${photoPath}`);
    }

    const contact = this.contactRepository.create({
      ...createContactDto,
      photo: photoPath,
      ownerId: currentUser.id,
    });

    const savedContact = await this.contactRepository.save(contact);
    this.logger.log(`Contact created with ID: ${savedContact.id}, Photo: ${savedContact.photo}`);
    return savedContact;
  }

  async findOne(id: string, currentUser: User): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id },
    });

    if (!contact) {
      this.logger.warn(`Contact not found: ${id}`);
      throw new NotFoundException(APP_CONSTANTS.ERRORS.CONTACT_NOT_FOUND);
    }

    if (currentUser.role !== UserRole.ADMIN && contact.ownerId !== currentUser.id) {
      this.logger.warn(`Unauthorized access: User ${currentUser.id} -> Contact ${id}`);
      throw new ForbiddenException(APP_CONSTANTS.ERRORS.UNAUTHORIZED_ACCESS);
    }

    return contact;
  }

  async update(
    id: string,
    updateContactDto: UpdateContactDto,
    currentUser: User,
    file?: Express.Multer.File,
  ): Promise<Contact> {
    const contact = await this.findOne(id, currentUser);

    this.logger.log(`Updating contact ${id} for user ${currentUser.id}`);
    this.logger.log(`File received: ${file ? file.filename : 'none'}`);

    if (file) {
      if (contact.photo) {
        const oldPhotoPath = path.join(process.cwd(), contact.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
          this.logger.log(`Deleted old photo: ${oldPhotoPath}`);
        }
      }
      contact.photo = `/uploads/contacts/${file.filename}`;
      this.logger.log(`New photo path: ${contact.photo}`);
    }

    if (updateContactDto.name !== undefined && updateContactDto.name !== '') {
      contact.name = updateContactDto.name;
    }
    if (updateContactDto.email !== undefined && updateContactDto.email !== '') {
      contact.email = updateContactDto.email;
    }
    if (updateContactDto.phone !== undefined && updateContactDto.phone !== '') {
      contact.phone = updateContactDto.phone;
    }

    const savedContact = await this.contactRepository.save(contact);
    this.logger.log(`Contact updated: ${savedContact.id}, Photo: ${savedContact.photo}`);
    return savedContact;
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const contact = await this.findOne(id, currentUser);

    if (contact.photo) {
      const photoPath = path.join(process.cwd(), contact.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
        this.logger.log(`Deleted photo file: ${photoPath}`);
      }
    }

    await this.contactRepository.remove(contact);
  }

  async exportToCsv(currentUser: User): Promise<string> {
    const queryBuilder = this.contactRepository.createQueryBuilder('contact');

    if (currentUser.role !== UserRole.ADMIN) {
      queryBuilder.where('contact.ownerId = :ownerId', { ownerId: currentUser.id });
    }

    queryBuilder.orderBy('contact.createdAt', 'DESC');
    const contacts = await queryBuilder.getMany();

    const escapeCsvField = (field: string): string => {
      return `"${field.replace(/"/g, '""')}"`;
    };

    const headers = ['Name', 'Email', 'Phone', 'Created At'];
    const csvRows = [headers.join(',')];

    for (const contact of contacts) {
      const row = [
        escapeCsvField(contact.name),
        escapeCsvField(contact.email),
        escapeCsvField(contact.phone),
        escapeCsvField(new Date(contact.createdAt).toISOString()),
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }
}

