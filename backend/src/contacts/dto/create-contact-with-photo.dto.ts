import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

export class CreateContactWithPhotoDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  phone: string;

  @IsOptional()
  @IsString()
  photo?: string;
}

