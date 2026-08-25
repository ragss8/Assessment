import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtGuard } from '../auth/jwt.guard';
import { AuthUser } from '../auth/jwt.strategy';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('CUSTOMER')
  @Post()
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: AuthUser) {
    return this.ordersService.create(dto, user.id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('RESTAURANT_OWNER')
  @Get('restaurant/:restaurantId')
  findByRestaurant(@Param('restaurantId') restaurantId: string, @CurrentUser() user: AuthUser) {
    return this.ordersService.findByRestaurant(restaurantId, user.id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('CUSTOMER')
  @Get(':id/status')
  getStatus(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.ordersService.getStatus(id, user.id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('CUSTOMER')
  @Get('my')
  findMyOrders(@CurrentUser() user: AuthUser) {
    return this.ordersService.findByCustomer(user.id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('RESTAURANT_OWNER')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto, @CurrentUser() user: AuthUser) {
    return this.ordersService.updateStatus(id, dto.status, user.id);
  }
}
