import { IsBoolean, IsOptional, IsString, Length } from "class-validator";

export class CreateRoleDto {
  @IsString({
    message: 'Tên role không hợp lệ'
  })
  @Length(1, 50, {
    message: 'Tên role phải có độ dài từ 1 đến 50 ký tự'
  })
  name: string;

  @IsBoolean()
  @IsOptional()
  status: boolean;

  @IsOptional()
  permissions: number[];
}