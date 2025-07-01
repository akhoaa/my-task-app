import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email); // Bạn cần tạo hàm này trong UsersService
        if (user && await bcrypt.compare(pass, user.password)) {
            if (!user.isActive) {
                return null;
            }
            const { password, ...result } = user.toObject();
            return result;
        }
        return null;
    }

    // trong src/auth/auth.service.ts
    async login(user: any) {
        const payload = { email: user.email, sub: user._id, role: user.role };
        const { password, ...userInfo } = user;

        return {
            access_token: this.jwtService.sign(payload),
            user: userInfo // Phải có trường này!
        };
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await this.userModel.findOne({ resetPasswordToken: token });
        if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            return { message: 'Invalid or expired token.' };
        }
        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        user.resetPasswordToken = '';
        user.resetPasswordExpires = new Date(0);
        await user.save();
        return { message: 'Password reset successful.' };
    }

    async verifyAccount(token: string) {
        const user = await this.userModel.findOne({ activationToken: token });
        if (!user) {
            return { message: 'Invalid token or account already verified.' };
        }
        user.isActive = true;
        user.activationToken = '';
        await user.save();
        return { message: 'Account verified successfully.' };
    }
}
