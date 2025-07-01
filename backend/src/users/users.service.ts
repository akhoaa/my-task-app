import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { MailerService } from '@nestjs-modules/mailer';
import { randomBytes } from 'crypto';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { Role } from './interfaces/user.interface'; // Import Role enum để code an toàn hơn

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly mailerService: MailerService,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const { email, password, name } = createUserDto;

    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('Email already exists in the system.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Sinh activationToken
    const activationToken = randomBytes(32).toString('hex');

    // Mặc định role khi tạo mới là 'user'
    const createdUser = new this.userModel({
      name,
      email,
      password: hashedPassword,
      role: Role.USER, // Thêm dòng này để đảm bảo role luôn được khởi tạo
      isActive: false,
      activationToken,
    });

    const savedUser = await createdUser.save();

    // Gửi email xác thực
    await this.mailerService.sendMail({
      to: email,
      subject: 'Xác thực tài khoản My Task App',
      template: './verify-account',
      context: {
        name,
        url: `${process.env.APP_URL || 'http://localhost:3000'}/auth/verify/${activationToken}`,
      },
    });

    const { password: _, ...result } = savedUser.toObject();
    return result;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException(`User with ID: ${id} not found`);
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: any): Promise<User> {
    // currentUser là req.user được truyền từ controller, chứa userId và role
    const isNotAdmin = currentUser.role !== Role.ADMIN;

    // 1. Phân quyền: User thường chỉ được cập nhật profile của chính mình
    if (isNotAdmin && currentUser.userId !== id) {
      throw new ForbiddenException('Bạn chỉ có thể cập nhật profile của chính mình.');
    }

    // 2. Tạo một bản sao của DTO để tránh thay đổi đối tượng gốc
    const dtoToUpdate = { ...updateUserDto };

    // 3. Xử lý logic mật khẩu: Nếu người dùng gửi lên mật khẩu mới, ta cần hash nó
    if (dtoToUpdate.password) {
      const salt = await bcrypt.genSalt(10);
      dtoToUpdate.password = await bcrypt.hash(dtoToUpdate.password, salt);
    }

    // 4. Phân quyền: Ngăn người dùng thường tự đổi vai trò của mình
    if (isNotAdmin && dtoToUpdate.role) {
      throw new ForbiddenException('Bạn không có quyền thay đổi vai trò.');
    }

    // 5. Thực hiện cập nhật
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, dtoToUpdate, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID: ${id} not found`);
    }

    return updatedUser;
  }

  async remove(id: string): Promise<{ message: string }> {
    // Thêm logic không cho admin tự xóa chính mình
    // Bạn cần truyền currentUser vào hàm remove từ controller
    // if(currentUser.userId === id) {
    //   throw new ForbiddenException('Bạn không thể tự xóa chính mình.');
    // }

    const result = await this.userModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`User with ID: ${id} not found`);
    }
    return { message: `Successfully deleted user with ID: ${id}` };
  }
}