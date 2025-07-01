import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { TaskStatus } from '../interfaces/task.interface';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
    @ApiProperty({
        enum: TaskStatus,
        example: TaskStatus.IN_PROGRESS,
        required: false,
        description: 'Trạng thái mới của công việc',
    })
    @IsOptional()
    @IsEnum(TaskStatus)
    status: TaskStatus;
}