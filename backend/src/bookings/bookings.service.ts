import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  async create(dto: CreateBookingDto, customerId: string) {
    await this.restaurantsService.ensureBookableRestaurant(dto.restaurantId);
    const bookingTime = new Date(dto.bookingTime);

    if (Number.isNaN(bookingTime.getTime()) || bookingTime < new Date()) {
      throw new BadRequestException('Booking time must be a future date');
    }

    const tableId = dto.tableId ?? (await this.suggestTable(dto, bookingTime));

    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${tableId}))`;
      await this.ensureTableCanHost(tx, tableId, dto.restaurantId, dto.partySize, bookingTime);

      return tx.booking.create({
        data: {
          restaurantId: dto.restaurantId,
          tableId,
          customerId,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          partySize: dto.partySize,
          bookingTime,
          preferredViews: dto.preferredViews ?? [],
          specialRequests: dto.specialRequests,
          status: 'REQUESTED',
        },
        include: {
          restaurant: true,
          table: { include: { zone: true } },
        },
      });
    });
  }

  async findByRestaurant(restaurantId: string, ownerId: string) {
    await this.restaurantsService.ensureOwner(restaurantId, ownerId);
    return this.prisma.booking.findMany({
      where: { restaurantId },
      include: { table: { include: { zone: true } } },
      orderBy: { bookingTime: 'asc' },
    });
  }

  async updateStatus(id: string, status: BookingStatus, ownerId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    await this.restaurantsService.ensureOwner(booking.restaurantId, ownerId);

    const allowedTransitions: Partial<Record<BookingStatus, BookingStatus[]>> = {
      REQUESTED: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['SEATED', 'CANCELLED'],
      SEATED: ['COMPLETED'],
    };
    if (!allowedTransitions[booking.status]?.includes(status)) {
      throw new BadRequestException(`Cannot change booking status from ${booking.status} to ${status}`);
    }
    return this.prisma.booking.update({ where: { id }, data: { status } });
  }

  private async suggestTable(dto: CreateBookingDto, bookingTime: Date) {
    const candidates = await this.restaurantsService.findAvailability(
      dto.restaurantId,
      dto.partySize,
      dto.preferredViews ?? [],
      bookingTime,
    );

    if (!candidates.length) {
      throw new BadRequestException('No table can host this party size');
    }

    return candidates[0].id;
  }

  private async ensureTableCanHost(
    tx: Prisma.TransactionClient,
    tableId: string,
    restaurantId: string,
    partySize: number,
    bookingTime: Date,
  ) {
    const table = await tx.restaurantTable.findFirst({
      where: { id: tableId, restaurantId, isActive: true },
    });

    if (!table) {
      throw new NotFoundException('Table not found for this restaurant');
    }

    if (table.capacity < partySize) {
      throw new BadRequestException('Selected table cannot host this party size');
    }

    const startWindow = new Date(bookingTime.getTime() - 90 * 60 * 1000);
    const endWindow = new Date(bookingTime.getTime() + 90 * 60 * 1000);
    const conflictingBooking = await tx.booking.findFirst({
      where: {
        tableId,
        status: { in: ['REQUESTED', 'CONFIRMED', 'SEATED'] },
        bookingTime: { gte: startWindow, lte: endWindow },
      },
    });

    if (conflictingBooking) {
      throw new BadRequestException('Selected table is already booked around that time');
    }
  }
}
