import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateTaskDto {
    @ApiProperty({
        example: 'Làm báo cáo doanh thu quý 2',
        description: 'Tiêu đề của công việc',
    })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({
        example: 'Cần tổng hợp số liệu từ bộ phận Sales và Marketing.',
        required: false,
        description: 'Mô tả chi tiết công việc',
    })
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty({
        example: '60c72b2f9b1d8c001f8e4e0a', // Ví dụ một MongoID
        required: false,
        description: 'ID của người được giao thực hiện công việc',
    })
    @IsOptional()
    @IsMongoId({ message: 'Assignee ID is not valid' })
    assignee: string;
}