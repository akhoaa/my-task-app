import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, ValidationPipe, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from './interfaces/user.interface';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({ summary: 'Đăng ký một người dùng mới' })
  create(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }


  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng (chỉ Admin)' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin một người dùng bằng ID (chỉ Admin)' })
  @ApiParam({ name: 'id', description: 'ID của người dùng', type: String })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findOneForAdmin(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng (Admin có thể cập nhật bất kỳ ai)' })
  @ApiParam({ name: 'id', description: 'ID của người dùng cần cập nhật' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateUserByAdmin(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
    @Request() req
  ) {
    return this.usersService.update(id, updateUserDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một người dùng (chỉ Admin)' })
  @ApiParam({ name: 'id', description: 'ID của người dùng cần xóa' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Tự cập nhật thông tin profile' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  updateMyProfile(
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
    @Request() req
  ) {
    return this.usersService.update(req.user.userId, updateUserDto, req.user);
  }
}