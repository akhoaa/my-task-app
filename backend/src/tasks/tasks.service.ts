import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { Model } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) { }

  async create(createTaskDto: CreateTaskDto, user: any): Promise<Task> {
    const createdTask = new this.taskModel({
      ...createTaskDto,
      createdBy: user.userId, // Gán người tạo là user đang đăng nhập
    });
    return createdTask.save();
  }

  async findAll(user: any): Promise<Task[]> {
    // Chỉ trả về các task do user đó tạo
    const query = user.role === 'admin' ? {} : { createdBy: user.userId };
    return this.taskModel.find(query).populate('assignee', 'name email').exec();
  }

  async findOne(id: string, user: any): Promise<Task> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    if (user.role !== 'admin' && task.createdBy.toString() !== user.userId) {
      throw new ForbiddenException('You are not allowed to view this task.');
    }
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: any): Promise<Task> {
    // Tái sử dụng hàm findOne để kiểm tra quyền trước
    // Bây giờ findOne đã có tham số user, nên không còn lỗi
    await this.findOne(id, user);

    const updatedTask = await this.taskModel.findByIdAndUpdate(id, updateTaskDto, { new: true });
    if (!updatedTask) {
      // Dòng này thực ra khó xảy ra vì findOne đã check rồi, nhưng vẫn nên có để đảm bảo
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return updatedTask;
  }

  async remove(id: string, user: any): Promise<any> {
    // Tái sử dụng hàm findOne để kiểm tra quyền trước
    await this.findOne(id, user);

    const result = await this.taskModel.deleteOne({ _id: id }).exec();
    // Không cần check result.deletedCount nữa vì findOne đã đảm bảo task tồn tại
    return { message: `Task with ID "${id}" has been deleted.` };
  }
}
