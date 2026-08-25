import { Body, Controller, Get, Post, Query, Redirect, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SyncPlacesDto } from './dto/sync-places.dto';
import { PlacesService } from './places.service';

@Controller()
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('places/sync-restaurants')
  syncRestaurants(@Body() dto: SyncPlacesDto) {
    return this.placesService.syncRestaurants(dto.queries, dto.city);
  }

  @Get('place-photos/media-url')
  getMediaUrl(@Query('name') name: string, @Query('maxWidthPx') maxWidthPx = '1200') {
    return this.placesService.getPhotoMediaUrl(name, Number(maxWidthPx));
  }

  @Get('place-photos/image')
  @Redirect()
  async redirectImage(@Query('name') name: string, @Query('maxWidthPx') maxWidthPx = '1200') {
    const url = await this.placesService.getPhotoMediaUrl(name, Number(maxWidthPx));
    return { url, statusCode: 302 };
  }
}
