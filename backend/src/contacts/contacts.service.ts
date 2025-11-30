import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
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

    // Build query builder
    const queryBuilder = this.contactRepository.createQueryBuilder('contact');

    // Ownership filter: regular users see only their own, admin sees all
    if (currentUser.role !== UserRole.ADMIN) {
      queryBuilder.where('contact.ownerId = :ownerId', { ownerId: currentUser.id });
    }

    // Search filter: search by name or email
    if (search) {
      queryBuilder.andWhere(
        '(contact.name ILIKE :search OR contact.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Sorting
    const orderBy = `contact.${sortBy}`;
    queryBuilder.orderBy(orderBy, sortOrder);

    // Get total count before pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const items = await queryBuilder.getMany();

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async create(createContactDto: CreateContactDto, currentUser: User): Promise<Contact> {
    const contact = this.contactRepository.create({
      ...createContactDto,
      ownerId: currentUser.id,
    });

    return this.contactRepository.save(contact);
  }

  async findOne(id: string, currentUser: User): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id },
    });

    if (!contact) {
      this.logger.warn(`Contact not found with ID: ${id}`);
      throw new NotFoundException(APP_CONSTANTS.ERRORS.CONTACT_NOT_FOUND);
    }

    // Ownership check: user can only access their own contacts, admin can access any
    if (currentUser.role !== UserRole.ADMIN && contact.ownerId !== currentUser.id) {
      this.logger.warn(
        `Unauthorized access attempt: User ${currentUser.id} tried to access contact ${id}`,
      );
      throw new ForbiddenException(APP_CONSTANTS.ERRORS.UNAUTHORIZED_ACCESS);
    }

    return contact;
  }

  async update(
    id: string,
    updateContactDto: UpdateContactDto,
    currentUser: User,
  ): Promise<Contact> {
    const contact = await this.findOne(id, currentUser);

    // Update contact fields
    Object.assign(contact, updateContactDto);

    return this.contactRepository.save(contact);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const contact = await this.findOne(id, currentUser);
    await this.contactRepository.remove(contact);
  }
}

