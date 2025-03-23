import { InjectRedis } from '@nestjs-modules/ioredis';
import { BadRequestException, ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { enumSystemConfig } from 'src/constants/system.const';
import { User } from 'src/database/entities/user.entity';
import { UserLoginDto } from 'src/modules/auth/dto/uesr-login.dto';
import { UsersService } from 'src/modules/users/users.service';
import { compareWithBcrypt, hashWithBcrypt } from 'src/utils/hashing';
import md5 from 'md5';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { TDataUserGoogle } from 'src/modules/auth/type/auth.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPasswordDto } from 'src/modules/auth/dto/reset-password.dto';

@Injectable()
export class AuthService {

  userAgent: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
    @InjectRedis() private readonly redis: Redis,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly mailerService: MailerService,
  ) { }

  // 1. Create Token
  async createTokenPair(user: Pick<User, 'id' | 'email'>) {
    const payload = {
      sub: user.id,
      email: user.email,
      userAgent: this.userAgent
    }
    const accessToken = this.jwtService.sign(payload,
      {
        expiresIn: this.configService.get<string>(enumSystemConfig.jwtActExpiresIn)
      }
    );
    const refreshToken = this.jwtService.sign(payload,
      {
        expiresIn: this.configService.get<string>(enumSystemConfig.jwtRefExpiresIn)
      }
    );

    await this.saveTokenToRedis({ accessToken, refreshToken });
    return { accessToken, refreshToken };
  }

  // 2. Verify Token
  verifyToken(token: string) {
    return this.jwtService.verify(token);
  }

  // 3. Refresh Token
  /**
   * Refresh-Token: Không cần có Auth ở headers => Gặp bất lợi: Chỉ lấy lại được ACT khi ACT còn hạn
   * ACT hết hạn => Không pass qua Middleware AuthGuard => Không lấy lại được ACT
   * @param refreshToken 
   */
  async refreshToken(refreshToken: string) {
    // 1. Kiểm tra tính hợp lệ của RFT: token đúng không? token còn hạn không?
    const decodedRFT = this.decodeToken(refreshToken);
    if (!decodedRFT) {
      return false
    }

    // 2. Kiểm tra RFT có tồn tại trong Redis không?
    const hashRFT = md5(refreshToken);
    const tokenFromRedis = await this.redis.get(`token_${hashRFT}`);
    if (!tokenFromRedis) {
      return false
    }
    const accessTokenHashFromRedis = JSON.parse(tokenFromRedis).accessToken;

    // Sau khi cấp lại token thì xóa refresh token cũ
    await this.revokeRefreshToken(refreshToken);
    // Thêm accessToken cũ vào blacklist
    await this.redis.set(`blacklist_access_token_${accessTokenHashFromRedis}`, accessTokenHashFromRedis);

    return this.createTokenPair({
      id: decodedRFT.sub,
      email: decodedRFT.email,
    });
  }

  // 4. Revoke Refresh Token
  async revokeRefreshToken(refreshToken: string) {
    const hashRFT = md5(refreshToken);
    await this.redis.del(`token_${hashRFT}`);
    return true;
  }

  // 4. Decode Token
  decodeToken(token: string) {
    return this.jwtService.decode(token);
  }

  // 5. Check Auth
  async checkAuth(email: string, password: string): Promise<User | false> {
    // TODO: 1. Check user
    const userExist = await this.userService.checkEmailExist(email);
    if (!userExist) {
      return false;
    }

    // TODO: 2. Check password
    const isPasswordMatch = await compareWithBcrypt(password, userExist.password);
    if (!isPasswordMatch) {
      return false
    };

    return userExist
  }

  // 6. Login
  async login(user: UserLoginDto, userAgent: string) {
    this.userAgent = md5(userAgent)
    const userAuth = await this.checkAuth(user.email, user.password);
    if (!userAuth) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
    }
    const token = await this.createTokenPair(userAuth);
    await this.saveTokenToRedis(token);
    return token;
  }

  // 7. Register
  async register(user: CreateUserDto) {
    const userExist = await this.userService.checkEmailExist(user.email);
    if (userExist) {
      throw new ConflictException('Email đã tồn tại!');
    }
    const newUser = await this.userService.create(user);
    const token = await this.createTokenPair(newUser);
    await this.saveTokenToRedis(token);
    return {
      user: newUser,
      token
    };
  }

  // 8. Logout
  async logout(accessToken: string, exp: number) {
    const hashACT = md5(accessToken)
    // Lưu vào blacklist
    // Tính thời gian exp còn lại của ACT
    const currentTime = Math.floor(Date.now() / 1000); // Thời gian hiện tại tính theo giây
    const expACTRedisTTL = exp - currentTime;
    await this.redis.set(`blacklist_access_token_${hashACT}`, hashACT, 'EX', expACTRedisTTL);
  }

  // 9. Forgot Password
  async forgotPassword(email: string) {
    const user = await this.userService.checkEmailExist(email);
    if (!user) {
      throw new BadRequestException('Email này chưa đăng ký trên hệ thống!');
    }

    // TODO: 1. Tạo forgot code + lưu vào redis có EXP
    const forgotCode = Math.random().toString(36).substring(7);
    // TTL Forgot Code: 180s
    await this.redis.set(`forgot_password_${email}`, forgotCode, 'EX', 180);
    // TODO: 2. Gửi email chứa link Front-End reset password (có chứa token)
    // VD: https://domain.com/reset-password?email=${}&token=${token}
    await this.mailerService.sendMail({
      to: email,
      subject: 'Quên mật khẩu',
      template: 'forgot-password',
      context: {
        linkResetPassword: `http://localhost:5500/reset-password?fogot-code=${forgotCode}&email=${email}`
      }
    })
    return {
      success: true,
      message: 'Vui lòng kiểm tra email để reset mật khẩu!'
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {

    const { email, forgotCode, newPassword } = resetPasswordDto;

    const forgotCodeFromRedis = await this.redis.get(`forgot_password_${email}`);

    if (!forgotCodeFromRedis) throw new ForbiddenException('Mã xác thực đã hết hạn!');

    if (forgotCodeFromRedis !== forgotCode) {
      throw new BadRequestException('Mã xác thực không hợp lệ!');
    }

    const user = await this.userService.checkEmailExist(email);
    if (!user) {
      throw new BadRequestException('Email này chưa đăng ký trên hệ thống!');
    }

    const passwordHash = await hashWithBcrypt(newPassword);
    await this.userRepository.update(user.id, {
      password: passwordHash
    });
    await this.redis.del(`forgot_password_${email}`);
    return user
  }

  // 10. Get User with Token
  async getUserWithToken(token: string, userAgent: string) {
    const payload = this.decodeToken(token);

    if (md5(userAgent) !== payload.userAgent) throw new UnauthorizedException('User-Agent không hợp lệ!');

    if (!payload) {
      return false
    }

    const isTokenInBlacklist = await this.redis.get(`blacklist_access_token_${md5(token)}`);
    if (isTokenInBlacklist) {
      return false
    }

    return this.userService.findOne(payload.sub);
  }

  // 11. Save token to Redis
  async saveTokenToRedis(token: { accessToken: string, refreshToken: string }) {
    // Khi khởi tạo thì lưu accessToken, refreshToken vào db (Dùng Redis)
    // Lưu RFT -> nhằm mục đích khi user logout hoặc đổi mật khẩu thì xóa RFT
    /**
     * Cần xác định hệ thông sẽ đăng nhập trên 1 hay nhiều thiết bị
     * 1. Nếu đăng nhập trên 1 thiết bị thì lưu refreshToken đè lên refreshToken cũ
     * 2. Nếu đăng nhập trên nhiều thiết bị thì lưu refreshToken vào mảng refreshToken
     *
     * Format để lưu vào Redis: nên dùng hash ngắn gọn, không bị thay đổi key (MD5, ...) -> vì RFT rất dài
     * key: rft_{hashRFT}
     * value: hashRFT
     */
    // const hashRFT = md5(refreshToken);
    // Để an toàn hơn => thiết lập thêm TTL = exp của RFT => Redis tự động xoá key khi hết hạn
    // Format Redis set hạn sử dụng: set key value EX TTL => Tính theo giây
    // redis.set('key', 'value', 'EX', TTL)
    // VD: redis.set('refresh_token_123', '123', 'EX', 3600)
    // Tính thời gian TTL expire của RFT
    // TODO: 1. Lấy thời gian hết hạn của RFT
    // const expRFT = this.decodeToken(refreshToken).exp;
    // const currentTime = Math.floor(Date.now() / 1000); // Thời gian hiện tại tính theo giây
    // const expRedisTTL = expRFT - currentTime;
    // await this.redis.set(`${prefixRFT}${hashRFT}`, hashRFT, 'EX', expRedisTTL);

    const hashRefreshToken = md5(token.refreshToken);
    const dataTokenHash = JSON.stringify({
      accessToken: md5(token.accessToken),
      refreshToken: md5(token.refreshToken)
    });

    const expRefreshToken = this.decodeToken(token.refreshToken).exp;
    const currentTime = Math.floor(Date.now() / 1000); // Thời gian hiện tại tính theo giây
    const expRefreshTokenFromRedisTTL = expRefreshToken - currentTime;

    await this.redis.set(`token_${hashRefreshToken}`, dataTokenHash, 'EX', expRefreshTokenFromRedisTTL);
  }

  // 12. service Google OAuth
  async getGoogleProfile(OAuth_AccessToken: string): Promise<TDataUserGoogle> {
    // try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${OAuth_AccessToken}`,
      {
        method: 'GET'
      }
    );
    if (!response.ok) {
      throw new UnauthorizedException(response.statusText);
    }
    const data = await response.json();
    return data;
    // } catch (error) {
    //   throw new Error(error.message);
    // }
  }

  async loginWithGoogle(userGoogle: TDataUserGoogle, userAgent: string) {
    this.userAgent = md5(userAgent);
    let user = await this.userService.checkEmailExist(userGoogle.email);

    if (user) {
      const token = await this.createTokenPair(user);
      await this.saveTokenToRedis(token);
      return token;
    }

    const userData = await this.userService.create({
      email: userGoogle.email,
      password: userGoogle.id,
      status: true,
    });
    user = {
      ...userData,
      password: userGoogle.id
    }
    const { password, ...safeUser } = user;

    const token = await this.createTokenPair(safeUser);
    return token
  }
}
