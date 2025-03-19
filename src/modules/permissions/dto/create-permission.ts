import { IsBoolean, IsDefined, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class CreatePermissionDto {
  @IsDefined({ message: 'Trường dữ liệu name chưa được khai báo!' })
  @IsString({
    message: 'Tên permission phải là chuỗi'
  })
  @IsNotEmpty({
    message: 'Tên permission không được để trống'
  })
  @Length(1, 255, {
    message: 'Tên permission phải có độ dài từ 1 đến 255 ký tự'
  })
  name: string;

  @IsBoolean({
    message: 'Trạng thái phải là boolean (true/false)'
  })
  @IsOptional()
  status: boolean;
}