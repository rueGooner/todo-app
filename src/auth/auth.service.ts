import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

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

    return this.signToken(user.id, user.email);
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

      return this.signToken(user.id, user.email);
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

  async signToken(
    id: number,
    email: string,
  ): Promise<{
    access_token: string;
  }> {
    const secret = this.config.get('JWT_SECRET');

    const payload = { username: email, sub: id };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret,
    });
    return {
      access_token: token,
    };
  }
}
