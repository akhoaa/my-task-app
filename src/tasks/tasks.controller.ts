import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @Post()
  @ApiOperation({ summary: 'Tạo một công việc mới' })
  @ApiResponse({ status: 201, description: 'Công việc đã được tạo thành công.' })
  create(@Body(new ValidationPipe()) createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách công việc của người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách công việc.' })
  findAll(@Request() req) {
    return this.tasksService.findAll(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một công việc bằng ID' })
  @ApiParam({ name: 'id', description: 'ID của công việc' })
  @ApiResponse({ status: 200, description: 'Trả về chi tiết công việc.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công việc.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Không có quyền truy cập.' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.tasksService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật một công việc' })
  @ApiParam({ name: 'id', description: 'ID của công việc' })
  @ApiResponse({ status: 200, description: 'Cập nhật công việc thành công.' })
  update(@Param('id') id: string, @Body(new ValidationPipe()) updateTaskDto: UpdateTaskDto, @Request() req) {
    return this.tasksService.update(id, updateTaskDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một công việc' })
  @ApiParam({ name: 'id', description: 'ID của công việc' })
  @ApiResponse({ status: 200, description: 'Xóa công việc thành công.' })
  remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(id, req.user);
  }
}