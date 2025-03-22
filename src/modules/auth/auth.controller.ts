import { Body, Controller, Delete, Get, HttpStatus, Post, Req, Request, Response, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from 'src/modules/auth/dto/uesr-login.dto';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { Response as ResponseExpress, Request as RequestExpress } from 'express';
import { TRefreshToken } from 'src/modules/auth/type/auth.type';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // 1. Login
  @Post('login')
  async login(@Body() bodyLogin: UserLoginDto, @Response() res: ResponseExpress, @Request() request: RequestExpress) {
    const userAgent = request.headers['user-agent'];
    // const decryptPassword = decryptData(bodyLogin.password);
    // bodyLogin.password = decryptPassword.toString();
    const dataLogin = await this.authService.login(bodyLogin, userAgent);
    if (!dataLogin) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Unauthorized'
      });
    }

    return res.status(200).json({
      message: 'Đăng nhập thành công',
      data: dataLogin
    });
  }

  // 2. register
  @Post('register')
  async register(@Body() body: CreateUserDto) {
    return this.authService.register(body);
  }

  // 3. logout
  @Delete('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req: RequestExpress & { user: { [key: string]: string } }) {
    const accessToken = req.user.accessToken
    const exp = req.user.tokenExp
    await this.authService.logout(accessToken, parseInt(exp));
    return {
      success: true,
      message: 'Đăng xuất thành công!'
    }
  }

  // 4. refresh token
  @Post('refresh-token')
  async refreshToken(@Body() { refreshToken }: TRefreshToken) {
    const data = await this.authService.refreshToken(refreshToken);
    if (!data) throw new UnauthorizedException('Refreshtoken không hợp lệ!');

    return data;
  }

  // 5. Thu hồi refresh token
  @Delete('revoke-refresh-token')
  async revokeRefreshToken(@Body() { refreshToken }: TRefreshToken) {
    await this.authService.revokeRefreshToken(refreshToken);
    return {
      success: true,
      message: 'Thu hồi refresh token thành công!'
    }
  }

  // 5. forgot password
  @Post('forgot-password')
  async forgotPassword(@Body() { email }: { email: string }) {
    return this.authService.forgotPassword(email);
  }

  // 6. Profile
  @UseGuards(AuthGuard)
  @Get('profile')
  async profile(@Req() req: RequestExpress & { user: { [key: string]: string } }) {
    const { accessToken, tokenExp, ...safeUser } = req.user;
    return safeUser;
  }

}
