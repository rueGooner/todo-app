import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  handleSignup(@Body() body: AuthDto) {
    return this.authService.signup(body);
  }

  @Post('signin')
  handleSignin(@Body() body: AuthDto) {
    return this.authService.signin(body);
  }
}
