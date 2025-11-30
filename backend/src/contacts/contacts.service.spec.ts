import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { Contact } from '../entities/contact.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { GetContactsQueryDto, SortBy, SortOrder } from './dto/get-contacts-query.dto';

describe('ContactsService', () => {
  let service: ContactsService;
  let repository: Repository<Contact>;

  const mockRepository = {
    createQueryBuilder: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
    contacts: [],
  };

  const mockAdmin: User = {
    id: 'admin-1',
    email: 'admin@example.com',
    passwordHash: 'hashed',
    role: UserRole.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
    contacts: [],
  };

  const mockContact: Contact = {
    id: 'contact-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    ownerId: 'user-1',
    owner: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        {
          provide: getRepositoryToken(Contact),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ContactsService>(ContactsService);
    repository = module.get<Repository<Contact>>(getRepositoryToken(Contact));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated contacts for regular user', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue([mockContact]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const query: GetContactsQueryDto = {
        page: 1,
        limit: 10,
        sortBy: SortBy.CREATED_AT,
        sortOrder: SortOrder.DESC,
      };

      const result = await service.findAll(query, mockUser);

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('totalPages');
      expect(queryBuilder.where).toHaveBeenCalledWith('contact.ownerId = :ownerId', {
        ownerId: mockUser.id,
      });
    });

    it('should return all contacts for admin user', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue([mockContact]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const query: GetContactsQueryDto = {
        page: 1,
        limit: 10,
      };

      await service.findAll(query, mockAdmin);

      expect(queryBuilder.where).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new contact', async () => {
      const createDto: CreateContactDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+1234567891',
      };

      const newContact = { ...mockContact, ...createDto };
      mockRepository.create.mockReturnValue(newContact);
      mockRepository.save.mockResolvedValue(newContact);

      const result = await service.create(createDto, mockUser);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        ownerId: mockUser.id,
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(newContact);
    });
  });

  describe('findOne', () => {
    it('should return a contact if found and user owns it', async () => {
      mockRepository.findOne.mockResolvedValue(mockContact);

      const result = await service.findOne('contact-1', mockUser);

      expect(result).toEqual(mockContact);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'contact-1' },
      });
    });

    it('should throw NotFoundException if contact not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own contact', async () => {
      const otherUserContact = { ...mockContact, ownerId: 'other-user' };
      mockRepository.findOne.mockResolvedValue(otherUserContact);

      await expect(service.findOne('contact-1', mockUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow admin to access any contact', async () => {
      mockRepository.findOne.mockResolvedValue(mockContact);

      const result = await service.findOne('contact-1', mockAdmin);

      expect(result).toEqual(mockContact);
    });
  });

  describe('update', () => {
    it('should update a contact', async () => {
      const updateDto: UpdateContactDto = {
        name: 'Updated Name',
      };

      mockRepository.findOne.mockResolvedValue(mockContact);
      const updatedContact = { ...mockContact, ...updateDto };
      mockRepository.save.mockResolvedValue(updatedContact);

      const result = await service.update('contact-1', updateDto, mockUser);

      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('remove', () => {
    it('should remove a contact', async () => {
      mockRepository.findOne.mockResolvedValue(mockContact);
      mockRepository.remove.mockResolvedValue(mockContact);

      await service.remove('contact-1', mockUser);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockContact);
    });
  });

  describe('exportToCsv', () => {
    it('should export contacts as CSV', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockContact]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.exportToCsv(mockUser);

      expect(result).toContain('Name,Email,Phone,Created At');
      expect(result).toContain('John Doe');
      expect(result).toContain('john@example.com');
    });
  });
});

