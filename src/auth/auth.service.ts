import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  signin() {
    return 'The login method';
  }

  async signup(payload: AuthDto) {
    const hash = await argon.hash(
      payload.password,
    );

    try {
      const user = await this.prisma.user.create({
        data: {
          email: payload.email,
          hash,
        },
        select: {
          id: true,
          email: true,
          joined: true,
        },
      });

      return user;
    } catch (error) {
      if (
        error instanceof
          PrismaClientKnownRequestError &&
        error.code === 'P2002'
      )
        throw new ForbiddenException(
          'User Credentials already taken.',
        );
      throw error;
    }
  }
}
