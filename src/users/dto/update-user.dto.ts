// src/users/dto/update-user.dto.ts

import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsOptional } from 'class-validator'; // Import IsEnum, IsOptional
import { Role } from '../interfaces/user.interface'; // Import Role enum

// PartialType sẽ lấy tất cả các thuộc tính từ CreateUserDto
// và làm cho chúng thành không bắt buộc (optional)
export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({
        enum: Role,
        example: Role.USER,
        required: false,
        description: 'Vai trò mới của người dùng (chỉ Admin được thay đổi)',
    })
    @IsOptional()
    @IsEnum(Role) // Đảm bảo giá trị truyền vào phải là 'user' hoặc 'admin'
    role?: Role; // Thêm thuộc tính role, nó là optional
}