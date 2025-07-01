import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { MailService } from '../mail/mail.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private mailService: MailService,
    ) { }

    /**
     * Validate user credentials for local strategy
     * @param email User email
     * @param pass User password
     * @returns user object (without password) if valid and active, otherwise null
     */
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

    /**
     * Login user and return JWT access token and user info
     * @param user User object
     * @returns { access_token, user }
     */
    async login(user: any) {
        const payload = { email: user.email, sub: user._id, role: user.role };
        const { password, ...userInfo } = user;

        return {
            access_token: this.jwtService.sign(payload),
            user: userInfo // Phải có trường này!
        };
    }

    /**
     * Reset password using reset token
     * @param token Reset password token
     * @param newPassword New password
     * @throws BadRequestException if token is invalid or expired
     * @returns void
     */
    async resetPassword(token: string, newPassword: string) {
        const user = await this.userModel.findOne({ resetPasswordToken: token });
        if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            throw new BadRequestException('Invalid or expired token.');
        }
        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        user.resetPasswordToken = '';
        user.resetPasswordExpires = new Date(0);
        await user.save();
    }

    /**
     * Verify account using activation token
     * @param token Activation token
     * @throws BadRequestException if token is invalid or already verified
     * @returns void
     */
    async verifyAccount(token: string) {
        const user = await this.userModel.findOne({ activationToken: token });
        if (!user) {
            throw new BadRequestException('Invalid token or account already verified.');
        }
        user.isActive = true;
        user.activationToken = '';
        await user.save();
    }

    /**
     * Forgot password: generate token, send email
     */
    async forgotPassword(email: string) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            // Không tiết lộ user tồn tại hay không
            return;
        }
        const resetToken = randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
        await user.save();
        await this.mailService.sendMail({
            to: user.email,
            subject: 'Reset your My Task App password',
            templatePath: __dirname + '/../mail/templates/reset-password.hbs',
            context: {
                name: user.name,
                url: `${process.env.APP_URL || 'http://localhost:3000'}/auth/reset-password/${resetToken}`,
            },
        });
    }
}
