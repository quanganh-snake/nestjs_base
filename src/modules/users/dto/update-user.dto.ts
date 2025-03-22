import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, Length, IsPhoneNumber, IsArray, IsNumber } from 'class-validator';
/**
 * PartialType(CreateUserDto): Biến tất cả các trường của CreateUserDto thành tùy chọn (optional).
 * PickType(..., ['phone_number', 'password']): Chỉ lấy các trường phone_number và password để cập nhật.
 */
export class UpdateUserDto extends PickType(PartialType(CreateUserDto), ['phone_number', 'password', 'roles', 'permissions']) {
  @IsOptional()
  @IsPhoneNumber('VN', {
    message: 'Số điện thoại không hợp lệ',
  })
  @Length(10, 12, {
    message: 'Số điện thoại phải có độ dài từ 10 đến 12 ký tự',
  })
  phone_number?: string;

  @IsOptional()
  @IsString({ message: 'Password phải là một chuỗi' })
  @Length(6, 100, {
    message: 'Password phải có độ dài từ 6 đến 100 ký tự',
  })
  password?: string;

  @IsOptional()
  @IsArray({ message: 'Roles phải là một mảng' })
  @IsNumber({}, { each: true, message: 'Mỗi phần tử của roles phải là số' })
  roles?: number[]

  @IsOptional()
  @IsArray({ message: 'Permissions phải là một mảng' })
  @IsNumber({}, { each: true, message: 'Mỗi phần tử của permissions phải là số' })
  permissions?: number[]
}
