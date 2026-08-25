import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  type: 'user' | 'partner';
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  type: 'user' | 'partner';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    if (payload.type === 'partner') {
      const partner = await this.prisma.deliveryPartner.findUnique({ where: { id: payload.sub } });
      if (!partner) throw new UnauthorizedException();
      return { id: partner.id, email: partner.email, role: 'DELIVERY_PARTNER', type: 'partner' };
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException();
    return { id: user.id, email: user.email, role: user.role, type: 'user' };
  }
}
