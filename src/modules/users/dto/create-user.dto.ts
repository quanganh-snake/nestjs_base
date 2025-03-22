import { IsArray, IsDefined, IsEmail, IsNumber, IsOptional, IsPhoneNumber, IsString, Length, MaxLength } from "class-validator"

export class CreateUserDto {
  // @IsDefined({ message: 'Trường username là bắt buộc' })
  @IsOptional()
  @IsString({ message: 'Username phải là một chuỗi' })
  @Length(5, 50, {
    message: 'Username phải có độ dài từ 5 đến 50 ký tự'
  })
  username?: string

  @IsDefined({ message: 'Trường email là bắt buộc' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(100, {
    message: 'Email không được vượt quá 100 ký tự'
  })
  email: string

  @IsOptional()
  @IsPhoneNumber('VN', {
    message: 'Số điện thoại không hợp lệ'
  })
  @Length(10, 12, {
    message: 'Số điện thoại phải có độ dài từ 10 đến 12 ký tự'
  })
  phone_number?: string

  @IsDefined({ message: 'Trường password là bắt buộc' })
  @IsString({ message: 'Password phải là một chuỗi' })
  @Length(6, 100, {
    message: 'Password phải có độ dài từ 6 đến 100 ký tự'
  })
  password: string
  status: boolean

  @IsOptional()
  @IsArray({ message: 'Roles phải là một mảng' })
  @IsNumber({}, { each: true, message: 'Mỗi phần tử của roles phải là số' })
  roles?: number[]

  @IsOptional()
  @IsArray({ message: 'Permissions phải là một mảng' })
  @IsNumber({}, { each: true, message: 'Mỗi phần tử của permissions phải là số' })
  permissions?: number[]
}