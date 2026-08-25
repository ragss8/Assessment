import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('restaurants')
  findAllRestaurants() {
    return this.adminService.findAllRestaurants();
  }

  @Get('restaurants/pending')
  findPendingRestaurants() {
    return this.adminService.findPendingRestaurants();
  }

  @Patch('restaurants/:id/approve')
  approveRestaurant(@Param('id') id: string) {
    return this.adminService.setApprovalStatus(id, 'APPROVED');
  }

  @Patch('restaurants/:id/reject')
  rejectRestaurant(@Param('id') id: string) {
    return this.adminService.setApprovalStatus(id, 'REJECTED');
  }

  @Get('users')
  findAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Get('orders')
  findAllOrders() {
    return this.adminService.findAllOrders();
  }
}
