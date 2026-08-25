import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginPartnerDto } from './dto/login-partner.dto';
import { RegisterPartnerDto } from './dto/register-partner.dto';

@Injectable()
export class DeliveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async register(dto: RegisterPartnerDto) {
    const existing = await this.prisma.deliveryPartner.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('A partner with this email already exists');

    const partner = await this.prisma.deliveryPartner.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        vehicleType: dto.vehicleType,
        passwordHash: await hash(dto.password, 12),
      },
    });

    const token = this.authService.sign(partner.id, partner.email, 'DELIVERY_PARTNER', 'partner');
    return { partner: this.publicPartner(partner), token };
  }

  async login(dto: LoginPartnerDto) {
    const partner = await this.prisma.deliveryPartner.findUnique({ where: { email: dto.email } });
    if (!partner || !(await compare(dto.password, partner.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const token = this.authService.sign(partner.id, partner.email, 'DELIVERY_PARTNER', 'partner');
    return { partner: this.publicPartner(partner), token };
  }

  findAssignments() {
    return this.prisma.deliveryAssignment.findMany({
      include: {
        partner: {
          select: { id: true, name: true, email: true, phone: true, vehicleType: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAvailablePartners() {
    return this.prisma.deliveryPartner.findMany({
      where: { status: 'AVAILABLE' },
      select: { id: true, name: true, email: true, phone: true, vehicleType: true, status: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOpenOrders() {
    return this.prisma.order.findMany({
      where: { status: 'READY' },
      include: { restaurant: { select: { name: true, address: true } }, items: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findMyAssignments(partnerId: string) {
    return this.prisma.deliveryAssignment.findMany({
      where: { partnerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyHistory(partnerId: string) {
    return this.prisma.deliveryAssignment.findMany({
      where: { partnerId, status: 'DELIVERED' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyEarnings(partnerId: string) {
    const assignments = await this.prisma.deliveryAssignment.findMany({
      where: { partnerId, status: 'DELIVERED' },
      select: { payout: true, createdAt: true },
    });

    const total = assignments.reduce((sum, a) => sum + a.payout, 0);
    return {
      totalEarnings: total,
      deliveryCount: assignments.length,
      breakdown: assignments,
    };
  }

  async updateMyStatus(partnerId: string, status: 'AVAILABLE' | 'OFFLINE') {
    const partner = await this.prisma.deliveryPartner.findUnique({ where: { id: partnerId } });
    if (!partner) throw new NotFoundException('Partner not found');
    return this.prisma.deliveryPartner.update({ where: { id: partnerId }, data: { status } });
  }

  async acceptOrder(partnerId: string, orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { restaurant: true },
      });
      if (!order) throw new NotFoundException('Order not found');

      const claimedOrder = await tx.order.updateMany({
        where: { id: orderId, status: 'READY' },
        data: { status: 'PICKED_UP' },
      });
      if (claimedOrder.count !== 1) {
        throw new ConflictException('Order is no longer available for pickup');
      }

      const claimedPartner = await tx.deliveryPartner.updateMany({
        where: { id: partnerId, status: 'AVAILABLE' },
        data: { status: 'ASSIGNED' },
      });
      if (claimedPartner.count !== 1) {
        throw new ConflictException('Delivery partner is not available');
      }

      return tx.deliveryAssignment.create({
        data: {
          partnerId,
          orderId,
          pickupAddress: order.restaurant.address,
          dropAddress: order.address,
          estimatedMinutes: 30,
          payout: Math.round(order.total * 0.05),
          status: 'ASSIGNED',
        },
      });
    });
  }

  private publicPartner(partner: { id: string; name: string; email: string; phone: string; vehicleType: string; status: string }) {
    return { id: partner.id, name: partner.name, email: partner.email, phone: partner.phone, vehicleType: partner.vehicleType, status: partner.status };
  }
}
