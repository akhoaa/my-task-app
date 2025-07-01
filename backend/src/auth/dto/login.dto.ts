import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'test@example.com', description: 'Email để đăng nhập' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'password123', description: 'Mật khẩu' })
    @IsNotEmpty()
    password: string;
}