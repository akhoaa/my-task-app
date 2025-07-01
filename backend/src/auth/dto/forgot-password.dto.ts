import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
    @ApiProperty({ example: 'user@example.com', description: 'Email để nhận link đặt lại mật khẩu' })
    @IsEmail()
    @IsNotEmpty()
    email: string;
}
