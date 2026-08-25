import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthUser } from '../auth/jwt.strategy';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuService } from './menu.service';

@Controller('menu-items')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('restaurant/:restaurantId')
  findByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.menuService.findByRestaurant(restaurantId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('RESTAURANT_OWNER')
  @Post()
  create(@Body() dto: CreateMenuItemDto, @CurrentUser() user: AuthUser) {
    return this.menuService.create(dto, user.id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('RESTAURANT_OWNER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMenuItemDto, @CurrentUser() user: AuthUser) {
    return this.menuService.update(id, dto, user.id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('RESTAURANT_OWNER')
  @Patch(':id/availability')
  toggleAvailability(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.menuService.toggleAvailability(id, user.id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('RESTAURANT_OWNER')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.menuService.remove(id, user.id);
  }
}
