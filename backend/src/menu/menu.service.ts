import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMenuItemDto, ownerId: string) {
    await this.assertOwner(dto.restaurantId, ownerId);
    return this.prisma.menuItem.create({
      data: {
        restaurantId: dto.restaurantId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        isVeg: dto.isVeg ?? true,
        category: dto.category ?? 'Main',
      },
    });
  }

  async update(id: string, dto: UpdateMenuItemDto, ownerId: string) {
    const item = await this.findItem(id);
    await this.assertOwner(item.restaurantId, ownerId);
    return this.prisma.menuItem.update({ where: { id }, data: dto });
  }

  async toggleAvailability(id: string, ownerId: string) {
    const item = await this.findItem(id);
    await this.assertOwner(item.restaurantId, ownerId);
    return this.prisma.menuItem.update({
      where: { id },
      data: { isAvailable: !item.isAvailable },
    });
  }

  async remove(id: string, ownerId: string) {
    const item = await this.findItem(id);
    await this.assertOwner(item.restaurantId, ownerId);
    await this.prisma.menuItem.delete({ where: { id } });
    return { deleted: true };
  }

  async findByRestaurant(restaurantId: string) {
    return this.prisma.menuItem.findMany({
      where: { restaurantId },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  private async findItem(id: string) {
    const item = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }

  private async assertOwner(restaurantId: string, ownerId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (restaurant.ownerId !== ownerId) throw new ForbiddenException('You do not own this restaurant');
  }
}
