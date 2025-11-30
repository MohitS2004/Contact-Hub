import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Contact } from '../entities/contact.entity';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { PaginatedResponse } from '../common/interfaces/api-response.interface';
import { GetContactsQueryDto } from '../contacts/dto/get-contacts-query.dto';
import { APP_CONSTANTS } from '../common/constants/app.constants';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  async findAllUsers(query: GetUsersQueryDto): Promise<PaginatedResponse<User>> {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.where('user.email ILIKE :search', { search: `%${search}%` });
    }

    queryBuilder.orderBy('user.createdAt', 'DESC');
    const total = await queryBuilder.getCount();
    queryBuilder.skip(skip).take(limit);
    const items = await queryBuilder.getMany();

    const usersWithoutPassword = items.map((user) => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items: usersWithoutPassword as User[],
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['contacts'],
    });

    if (!user) {
      this.logger.warn(`User not found: ${id}`);
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['contacts'],
    });

    if (!user) {
      this.logger.warn(`User not found: ${id}`);
      throw new NotFoundException('User not found');
    }

    if (user.contacts && user.contacts.length > 0) {
      await this.contactRepository.remove(user.contacts);
      this.logger.log(`Deleted ${user.contacts.length} contacts for user ${id}`);
    }

    await this.userRepository.remove(user);
    this.logger.log(`Deleted user: ${id}`);
  }

  async updateUserRole(id: string, updateRoleDto: UpdateUserRoleDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      this.logger.warn(`User not found: ${id}`);
      throw new NotFoundException('User not found');
    }

    user.role = updateRoleDto.role;
    const updatedUser = await this.userRepository.save(user);
    this.logger.log(`Updated role for user ${id}: ${updateRoleDto.role}`);

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as User;
  }

  async findAllContacts(query: GetContactsQueryDto): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const skip = (page - 1) * limit;
    const queryBuilder = this.contactRepository
      .createQueryBuilder('contact')
      .leftJoinAndSelect('contact.owner', 'owner');

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

    const contactsWithOwner = items.map((contact) => ({
      ...contact,
      ownerEmail: contact.owner?.email || null,
      ownerName: contact.owner?.email?.split('@')[0] || null,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      items: contactsWithOwner,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getStats(): Promise<{ totalUsers: number; totalContacts: number }> {
    const totalUsers = await this.userRepository.count();
    const totalContacts = await this.contactRepository.count();

    return {
      totalUsers,
      totalContacts,
    };
  }

  async findContactById(id: string): Promise<any> {
    const contact = await this.contactRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!contact) {
      this.logger.warn(`Contact not found: ${id}`);
      throw new NotFoundException('Contact not found');
    }

    return {
      ...contact,
      ownerEmail: contact.owner?.email || null,
      ownerName: contact.owner?.email?.split('@')[0] || null,
    };
  }

  async deleteContact(id: string): Promise<void> {
    const contact = await this.contactRepository.findOne({
      where: { id },
    });

    if (!contact) {
      this.logger.warn(`Contact not found: ${id}`);
      throw new NotFoundException('Contact not found');
    }

    await this.contactRepository.remove(contact);
    this.logger.log(`Admin deleted contact: ${id}`);
  }
}

