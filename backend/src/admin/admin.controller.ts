import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { AdminService } from './admin.service';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { GetContactsQueryDto } from '../contacts/dto/get-contacts-query.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  async findAllUsers(@Query() query: GetUsersQueryDto) {
    return this.adminService.findAllUsers(query);
  }

  @Get('users/:id')
  async findUserById(@Param('id') id: string) {
    return this.adminService.findUserById(id);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    await this.adminService.deleteUser(id);
  }

  @Put('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(id, updateRoleDto);
  }

  // Contact management endpoints
  @Get('contacts')
  async findAllContacts(@Query() query: GetContactsQueryDto) {
    return this.adminService.findAllContacts(query);
  }

  @Get('contacts/:id')
  async findContactById(@Param('id') id: string) {
    return this.adminService.findContactById(id);
  }

  @Delete('contacts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteContact(@Param('id') id: string) {
    await this.adminService.deleteContact(id);
  }
}

