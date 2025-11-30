import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { APP_CONSTANTS } from '../common/constants/app.constants';

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      this.logger.warn(`Registration failed: User ${email} already exists`);
      throw new ConflictException(APP_CONSTANTS.ERRORS.USER_ALREADY_EXISTS);
    }

    const passwordHash = await bcrypt.hash(
      password,
      APP_CONSTANTS.BCRYPT_SALT_ROUNDS,
    );

    const user = this.userRepository.create({
      email,
      passwordHash,
      role: UserRole.USER,
    });

    const savedUser = await this.userRepository.save(user);
    this.logger.log(`User registered: ${savedUser.id}`);

    const payload = {
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        role: savedUser.role,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      this.logger.warn(`Login failed: User ${email} not found`);
      throw new UnauthorizedException(APP_CONSTANTS.ERRORS.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password for ${email}`);
      throw new UnauthorizedException(APP_CONSTANTS.ERRORS.INVALID_CREDENTIALS);
    }

    this.logger.log(`User logged in: ${user.id}`);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}

