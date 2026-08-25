import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtGuard } from '../auth/jwt.guard';
import { AuthUser } from '../auth/jwt.strategy';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('CUSTOMER')
  @Post()
  create(@Body() dto: CreateBookingDto, @CurrentUser() user: AuthUser) {
    return this.bookingsService.create(dto, user.id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('RESTAURANT_OWNER')
  @Get('restaurant/:restaurantId')
  findByRestaurant(@Param('restaurantId') restaurantId: string, @CurrentUser() user: AuthUser) {
    return this.bookingsService.findByRestaurant(restaurantId, user.id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('RESTAURANT_OWNER')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateBookingStatusDto, @CurrentUser() user: AuthUser) {
    return this.bookingsService.updateStatus(id, dto.status, user.id);
  }
}
