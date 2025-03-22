import { IsDefined, IsEmail, IsString } from "class-validator";

export class UserLoginDto {
  @IsDefined({
    message: 'Trường email là bắt buộc!'
  })
  @IsString()
  @IsEmail({}, {
    message: 'Email không đúng định dạng!'
  })
  email: string;

  @IsDefined({
    message: 'Trường password là bắt buộc!'
  })
  password: string;
}