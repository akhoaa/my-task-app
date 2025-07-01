import { Controller, Post, UseGuards, Request, Body, Param, Get } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
    ) { }
    /**
     * User registration endpoint
     * Creates a new user, sends verification email
     */
    @Post('register')
    @ApiOperation({ summary: 'User registration' })
    @ApiBody({ description: 'User registration data', type: CreateUserDto })
    @ApiResponse({
        status: 201,
        description: 'Registration successful. Verification email sent.',
        schema: {
            example: {
                message: 'Registration successful. Please check your email to verify your account.',
                data: {
                    _id: '...',
                    name: 'John Doe',
                    email: 'johndoe@example.com',
                    isActive: false,
                    role: 'user',
                }
            }
        }
    })
    @ApiResponse({ status: 409, description: 'Email already exists in the system.' })
    async register(@Body() createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto);
        return {
            message: 'Registration successful. Please check your email to verify your account.',
            data: user,
        };
    }

    /**
     * User login endpoint
     * Returns JWT access_token and user info if successful
     */
    @Post('login')
    @UseGuards(LocalAuthGuard)
    @ApiOperation({ summary: 'User login' })
    @ApiBody({
        description: 'User login credentials',
        type: LoginDto
    })
    @ApiResponse({
        status: 201,
        description: 'Login successful, returns access_token.',
        schema: {
            example: {
                message: 'Login successful',
                data: {
                    access_token: 'jwt.token.here',
                    user: { _id: '...', email: '...', name: '...' }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized. Invalid email or password.' })
    async login(@Request() req) {
        const data = await this.authService.login(req.user);
        return { message: 'Login successful', data };
    }

    /**
     * Reset password using token (forgot password flow)
     */
    @Post('reset-password/:token')
    @ApiOperation({ summary: 'Reset password using token (forgot password)' })
    @ApiBody({ type: ResetPasswordDto })
    @ApiResponse({
        status: 200,
        description: 'Password reset successful.',
        schema: { example: { message: 'Password reset successful.' } }
    })
    @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
    async resetPassword(@Param('token') token: string, @Body() body: ResetPasswordDto) {
        return this.authService.resetPassword(token, body.newPassword);
    }

    /**
     * Verify account via email link
     */
    @Get('verify/:token')
    @ApiOperation({ summary: 'Verify account via email' })
    @ApiResponse({
        status: 200,
        description: 'Account verified successfully.',
        schema: { example: { message: 'Account verified successfully.' } }
    })
    @ApiResponse({ status: 400, description: 'Invalid token or account already verified.' })
    async verifyAccount(@Param('token') token: string) {
        return this.authService.verifyAccount(token);
    }

    /**
     * Forgot password endpoint
     * Gửi email reset password nếu email tồn tại
     */
    @Post('forgot-password')
    @ApiOperation({ summary: 'Forgot password - gửi email đặt lại mật khẩu' })
    @ApiBody({ type: ForgotPasswordDto })
    @ApiResponse({ status: 200, description: 'Nếu email tồn tại, sẽ gửi link đặt lại mật khẩu.' })
    async forgotPassword(@Body() body: ForgotPasswordDto) {
        await this.authService.forgotPassword(body.email);
        return { message: 'Nếu email tồn tại, hệ thống sẽ gửi link đặt lại mật khẩu.' };
    }
}