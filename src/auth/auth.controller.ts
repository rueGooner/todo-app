import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
// import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  handleSignup(@Body() body: AuthDto) {
    return this.authService.signup(body);
  }

  @Post('signin')
  handleSignin() {
    return this.authService.signin();
  }
}
