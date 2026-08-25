import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  async create(dto: CreateOrderDto, customerId: string) {
    await this.restaurantsService.ensureOrderableRestaurant(dto.restaurantId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        restaurantId: dto.restaurantId,
        id: { in: dto.items.map((item) => item.menuItemId) },
        isAvailable: true,
      },
    });

    if (menuItems.length !== dto.items.length) {
      throw new BadRequestException('One or more menu items are unavailable');
    }

    const menuById = new Map(menuItems.map((item) => [item.id, item]));
    const orderItems = dto.items.map((item) => {
      const menuItem = menuById.get(item.menuItemId);
      if (!menuItem) throw new BadRequestException(`Menu item unavailable: ${item.menuItemId}`);
      return { menuItemId: menuItem.id, name: menuItem.name, quantity: item.quantity, unitPrice: menuItem.price };
    });

    const total = orderItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    return this.prisma.order.create({
      data: {
        restaurantId: dto.restaurantId,
        customerId,
        customerName: dto.customerName,
        phone: dto.phone,
        address: dto.address,
        total,
        items: { create: orderItems },
      },
      include: { items: true, restaurant: { select: { name: true } } },
    });
  }

  async findByRestaurant(restaurantId: string, ownerId: string) {
    await this.restaurantsService.ensureOwner(restaurantId, ownerId);
    return this.prisma.order.findMany({
      where: { restaurantId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCustomer(customerId: string) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: { items: true, restaurant: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStatus(id: string, customerId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id, customerId },
      select: { id: true, status: true, updatedAt: true, restaurant: { select: { name: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: OrderStatus, ownerId: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    await this.restaurantsService.ensureOwner(order.restaurantId, ownerId);

    const allowedTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
      PLACED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'],
    };
    if (!allowedTransitions[order.status]?.includes(status)) {
      throw new BadRequestException(`Cannot change order status from ${order.status} to ${status}`);
    }
    return this.prisma.order.update({ where: { id }, data: { status } });
  }
}
