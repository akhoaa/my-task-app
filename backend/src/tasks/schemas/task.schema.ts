import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { TaskStatus } from '../interfaces/task.interface';
import { User } from 'src/users/schemas/user.schema';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true })
export class Task {
    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ type: String, enum: TaskStatus, default: TaskStatus.PENDING })
    status: TaskStatus;

    // Liên kết Task với User (người tạo hoặc người được giao)
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    assignee: User; // Người được giao việc

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    createdBy: User; // Người tạo việc
}

export const TaskSchema = SchemaFactory.createForClass(Task);