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
    console.log(body.email, body.password);

    return this.authService.signup();
  }

  @Post('signin')
  handleSignin() {
    return this.authService.signin();
  }
}
