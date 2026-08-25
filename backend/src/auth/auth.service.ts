import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthUser } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('A user with this email already exists');

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        role: dto.role ?? 'CUSTOMER',
        passwordHash: await hash(dto.password, 12),
      },
    });

    return { user: this.publicUser(user), token: this.sign(user.id, user.email, user.role, 'user') };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return { user: this.publicUser(user), token: this.sign(user.id, user.email, user.role, 'user') };
  }

  async me(authUser: AuthUser) {
    if (authUser.type === 'partner') {
      const partner = await this.prisma.deliveryPartner.findUnique({ where: { id: authUser.id } });
      if (!partner) throw new UnauthorizedException();
      return {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        phone: partner.phone,
        role: 'DELIVERY_PARTNER',
        vehicleType: partner.vehicleType,
        status: partner.status,
      };
    }

    const user = await this.prisma.user.findUnique({ where: { id: authUser.id } });
    if (!user) throw new UnauthorizedException();
    return this.publicUser(user);
  }

  sign(sub: string, email: string, role: string, type: 'user' | 'partner') {
    return this.jwt.sign({ sub, email, role, type });
  }

  private publicUser(user: { id: string; name: string; email: string; phone: string | null; role: string }) {
    return { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
  }
}
