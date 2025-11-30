import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../entities/contact.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { APP_CONSTANTS } from '../common/constants/app.constants';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  async findAll(currentUser: User): Promise<Contact[]> {
    // Admin sees all contacts, normal user sees only their own
    if (currentUser.role === UserRole.ADMIN) {
      return this.contactRepository.find();
    }
    return this.contactRepository.find({
      where: { ownerId: currentUser.id },
    });
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

