import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/interfaces/user.interface';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('tasks')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Get task report (admin only)' })
    @ApiResponse({ status: 200, description: 'Task report', schema: { example: { total: 10, done: 5, pending: 3, inProgress: 2 } } })
    async getTaskReport() {
        return this.reportsService.getTaskReport();
    }
} 