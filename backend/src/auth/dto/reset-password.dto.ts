import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @ApiProperty({ example: 'newStrongPassword123', description: 'Mật khẩu mới' })
    @IsString()
    @MinLength(6)
    newPassword: string;
} 