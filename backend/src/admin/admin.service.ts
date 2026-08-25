import { Injectable, NotFoundException } from '@nestjs/common';
import { ApprovalStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  findPendingRestaurants() {
    return this.prisma.restaurant.findMany({
      where: { approvalStatus: 'PENDING' },
      include: { owner: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  findAllRestaurants() {
    return this.prisma.restaurant.findMany({
      include: { owner: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async setApprovalStatus(id: string, status: ApprovalStatus) {
    const restaurant = await this.prisma.restaurant.findUnique({ where: { id } });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return this.prisma.restaurant.update({ where: { id }, data: { approvalStatus: status } });
  }

  findAllUsers() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllOrders() {
    return this.prisma.order.findMany({
      include: { restaurant: { select: { name: true } }, items: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
