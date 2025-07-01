import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true }) // tự động thêm createdAt và updatedAt
export class User {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ type: String, default: null })
    resetPasswordToken: string;

    @Prop({ type: Date, default: null })
    resetPasswordExpires: Date;

    @Prop({ type: Boolean, default: false })
    isActive: boolean;

    @Prop({ type: String, default: '' })
    activationToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);