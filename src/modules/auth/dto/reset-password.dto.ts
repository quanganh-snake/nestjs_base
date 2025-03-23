import { IsDefined, IsEmail, Length } from "class-validator";

export class ResetPasswordDto {
  @IsDefined({ message: 'Trường email là bắt buộc' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsDefined({ message: 'Trường mã xác nhận là bắt buộc' })
  @Length(4, 10, { message: 'Mã xác nhận có độ dài không hợp lệ' })
  forgotCode: string;

  @IsDefined({ message: 'Trường mật khẩu mới là bắt buộc' })
  newPassword: string;
}