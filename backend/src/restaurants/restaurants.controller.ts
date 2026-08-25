import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtGuard } from '../auth/jwt.guard';
import { AuthUser } from '../auth/jwt.strategy';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ClaimRestaurantDto } from './dto/claim-restaurant.dto';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { FindAvailabilityDto } from './dto/find-availability.dto';
import { SearchRestaurantsDto } from './dto/search-restaurants.dto';
import { RestaurantsService } from './restaurants.service';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('RESTAURANT_OWNER')
  @Post()
  create(@Body() dto: CreateRestaurantDto, @CurrentUser() user: AuthUser) {
    return this.restaurantsService.create(dto, user.id);
  }

  @Get()
  findAll(@Query() query: SearchRestaurantsDto) {
    return this.restaurantsService.findAll(query);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('RESTAURANT_OWNER')
  @Get('mine')
  findMine(@CurrentUser() user: AuthUser) {
    return this.restaurantsService.findByOwner(user.id);
  }

  @Get(':idOrSlug')
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.restaurantsService.findOne(idOrSlug);
  }

  @Get(':restaurantId/availability')
  findAvailability(
    @Param('restaurantId') restaurantId: string,
    @Query() query: FindAvailabilityDto,
  ) {
    const bookingTime = query.bookingTime ? new Date(query.bookingTime) : undefined;
    return this.restaurantsService.findAvailability(
      restaurantId,
      query.partySize,
      query.preferredViews ?? [],
      bookingTime,
    );
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('RESTAURANT_OWNER')
  @Patch(':id/open-status')
  toggleOpenStatus(@Param('id') id: string, @Body('isOpen') isOpen: boolean, @CurrentUser() user: AuthUser) {
    return this.restaurantsService.toggleOpenStatus(id, isOpen, user.id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @Post(':id/claim')
  claimRestaurant(@Param('id') id: string, @Body() dto: ClaimRestaurantDto) {
    return this.restaurantsService.claimRestaurant(id, dto.ownerId);
  }
}
