import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtGuard } from '../auth/jwt.guard';
import { AuthUser } from '../auth/jwt.strategy';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { DeliveryService } from './delivery.service';
import { LoginPartnerDto } from './dto/login-partner.dto';
import { RegisterPartnerDto } from './dto/register-partner.dto';
import { UpdatePartnerStatusDto } from './dto/update-partner-status.dto';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post('auth/register')
  register(@Body() dto: RegisterPartnerDto) {
    return this.deliveryService.register(dto);
  }

  @Post('auth/login')
  login(@Body() dto: LoginPartnerDto) {
    return this.deliveryService.login(dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('assignments')
  findAssignments() {
    return this.deliveryService.findAssignments();
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('partners/available')
  findAvailablePartners() {
    return this.deliveryService.findAvailablePartners();
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('DELIVERY_PARTNER')
  @Get('orders/open')
  findOpenOrders() {
    return this.deliveryService.findOpenOrders();
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('DELIVERY_PARTNER')
  @Get('my/assignments')
  findMyAssignments(@CurrentUser() user: AuthUser) {
    return this.deliveryService.findMyAssignments(user.id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('DELIVERY_PARTNER')
  @Get('my/history')
  findMyHistory(@CurrentUser() user: AuthUser) {
    return this.deliveryService.findMyHistory(user.id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('DELIVERY_PARTNER')
  @Get('my/earnings')
  findMyEarnings(@CurrentUser() user: AuthUser) {
    return this.deliveryService.findMyEarnings(user.id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('DELIVERY_PARTNER')
  @Patch('my/status')
  updateMyStatus(@CurrentUser() user: AuthUser, @Body() dto: UpdatePartnerStatusDto) {
    return this.deliveryService.updateMyStatus(user.id, dto.status);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('DELIVERY_PARTNER')
  @Post('orders/:orderId/accept')
  acceptOrder(@Param('orderId') orderId: string, @CurrentUser() user: AuthUser) {
    return this.deliveryService.acceptOrder(user.id, orderId);
  }
}
