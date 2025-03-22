import { BadRequestException, Body, Controller, Post, Request } from "@nestjs/common";
import { Request as RequestExpress } from "express";
import { AuthService } from "src/modules/auth/auth.service";
import { TDataUserGoogle } from "src/modules/auth/type/auth.type";

@Controller('auth/social')
export class SocialLoginController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @Post('google')
  async googleLogin(@Body() { GoogleOAuth_AccessToken }: { GoogleOAuth_AccessToken: string }, @Request() request: RequestExpress) {

    const userAgent = request.headers['user-agent'];
    if (!userAgent) throw new BadRequestException('User-Agent is required');

    if (!GoogleOAuth_AccessToken) throw new BadRequestException('GoogleOAuth_AccessToken is required');

    const dataUserGoogle: TDataUserGoogle = await this.authService.getGoogleProfile(GoogleOAuth_AccessToken);

    return this.authService.loginWithGoogle(dataUserGoogle, userAgent);
  }
}