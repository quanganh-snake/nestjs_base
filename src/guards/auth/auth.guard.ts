import { BadRequestException, CanActivate, ExecutionContext, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private readonly authService: AuthService
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request = context.switchToHttp().getRequest()
    const userAgent = request.get('user-agent');
    if (!userAgent) {
      throw new UnauthorizedException('UserAgent is required');
    }

    const token = request.get('authorization')?.split('Bearer ')[1]

    if (!token) throw new BadRequestException('Invalid token')

    const decodeToken = this.authService.decodeToken(token)
    // Kiểm tra acessToken có hợp lệ không
    // 1. accessToken đã tồn tại trong blackList chưa?
    const user = await this.authService.getUserWithToken(token, userAgent)
    if (user) {
      // Set user to request
      request.user = user
      request.user.accessToken = token
      request.user.tokenExp = decodeToken.exp
      return true;
    }

    throw new UnauthorizedException({
      status: HttpStatus.UNAUTHORIZED,
      error: 'Unauthorized',
      message: 'Invalid accessToken',
    });
  }
}
