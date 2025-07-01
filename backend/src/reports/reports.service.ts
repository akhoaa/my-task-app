import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from '../tasks/schemas/task.schema';
import { TaskStatus } from '../tasks/interfaces/task.interface';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Role } from '../users/interfaces/user.interface';

@Injectable()
export class ReportsService {
    constructor(
        @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) { }

    async getTaskReport() {
        const total = await this.taskModel.countDocuments();
        const done = await this.taskModel.countDocuments({ status: TaskStatus.DONE });
        const pending = await this.taskModel.countDocuments({ status: TaskStatus.PENDING });
        const inProgress = await this.taskModel.countDocuments({ status: TaskStatus.IN_PROGRESS });
        return {
            total,
            done,
            pending,
            inProgress,
        };
    }

    async getUserReport() {
        const total = await this.userModel.countDocuments();
        const admin = await this.userModel.countDocuments({ role: Role.ADMIN });
        const user = await this.userModel.countDocuments({ role: Role.USER });
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const newUsers = await this.userModel.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
        return {
            total,
            admin,
            user,
            newUsersLast7Days: newUsers,
        };
    }
} 