import { Controller, Post, UseGuards, Request, Body, Param, Get } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @UseGuards(LocalAuthGuard)
    @ApiOperation({ summary: 'Đăng nhập người dùng' })
    @ApiBody({
        description: 'Thông tin đăng nhập của người dùng',
        type: LoginDto
    })
    @ApiResponse({ status: 201, description: 'Đăng nhập thành công, trả về access_token.' })
    @ApiResponse({ status: 401, description: 'Unauthorized. Sai email hoặc mật khẩu.' })
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @Post('reset-password/:token')
    @ApiOperation({ summary: 'Đặt lại mật khẩu bằng token (quên mật khẩu)' })
    @ApiBody({ type: ResetPasswordDto })
    @ApiResponse({ status: 200, description: 'Đặt lại mật khẩu thành công.' })
    @ApiResponse({ status: 400, description: 'Token không hợp lệ hoặc đã hết hạn.' })
    async resetPassword(@Param('token') token: string, @Body() body: ResetPasswordDto) {
        return this.authService.resetPassword(token, body.newPassword);
    }

    @Get('verify/:token')
    @ApiOperation({ summary: 'Xác thực tài khoản qua email' })
    @ApiResponse({ status: 200, description: 'Tài khoản đã được xác thực thành công.' })
    @ApiResponse({ status: 400, description: 'Token không hợp lệ hoặc đã được xác thực.' })
    async verifyAccount(@Param('token') token: string) {
        return this.authService.verifyAccount(token);
    }
}