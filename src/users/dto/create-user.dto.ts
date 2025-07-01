import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({
        example: 'John Doe',
        description: 'Họ và tên đầy đủ của người dùng',
    })
    @IsNotEmpty({ message: 'Name must not be empty' })
    @IsString()
    name: string;

    @ApiProperty({
        example: 'johndoe@example.com',
        description: 'Địa chỉ email duy nhất của người dùng',
    })
    @IsEmail({}, { message: 'Email is not valid' })
    @IsNotEmpty({ message: 'Email must not be empty' })
    email: string;

    @ApiProperty({
        example: 'password123',
        description: 'Mật khẩu, yêu cầu ít nhất 6 ký tự',
    })
    @IsNotEmpty({ message: 'Password must not be empty' })
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    password: string;
}