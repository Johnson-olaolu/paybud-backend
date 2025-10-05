import { Controller, Get, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('settings')
export class SettingsController {
  constructor(private settingService: SettingsService) {}

  //   @UseGuards(AuthGuard('jwt'))
  @Get('banks')
  async getBanks() {
    const data = await this.settingService.fetchBanks();
    return {
      success: true,
      message: 'banks fetched successfully',
      data,
    };
  }
}
