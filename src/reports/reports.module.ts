import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Task, TaskSchema } from '../tasks/schemas/task.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
    imports: [MongooseModule.forFeature([
        { name: Task.name, schema: TaskSchema },
        { name: User.name, schema: UserSchema },
    ])],
    controllers: [ReportsController],
    providers: [ReportsService],
})
export class ReportsModule { } 