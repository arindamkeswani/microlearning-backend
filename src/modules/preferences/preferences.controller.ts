import { Controller, Get } from '@nestjs/common';
import { PreferencesService } from './preferences.service';

@Controller('preferences')
export class PreferencesController {
    constructor(
        private preferencesService: PreferencesService
    ) {}

    @Get()
    async getPreferences() {
        return await this.preferencesService.updateUserTopics();
    }
}
