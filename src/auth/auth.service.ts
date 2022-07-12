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

  async signin(payload: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (!user)
      throw new ForbiddenException(
        'No Users match the given credentials.',
      );

    const passwordMatch = await argon.verify(
      user.hash,
      payload.password,
    );

    if (!passwordMatch)
      throw new ForbiddenException(
        'Passwords do not match',
      );

    delete user.hash;
    return user;
  }

  async signup(payload: AuthDto) {
    try {
      const hash = await argon.hash(payload.password);
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
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ForbiddenException(
            'User Credentials already taken.',
          );
      }
      throw error;
    }
  }
}
