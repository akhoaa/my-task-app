import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

import { MailService } from '../mail/mail.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { Role } from './interfaces/user.interface'; // Import Role enum để code an toàn hơn

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly mailService: MailService,
  ) { }

  /**
   * Create a new user, send verification email
   * @param createUserDto DTO with name, email, password
   * @throws ConflictException if email already exists
   * @returns user object (without password)
   */
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const { email, password, name } = createUserDto;

    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('Email already exists in the system.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate activationToken
    const activationToken = randomBytes(32).toString('hex');

    // Default role is 'user'
    const createdUser = new this.userModel({
      name,
      email,
      password: hashedPassword,
      role: Role.USER, // Thêm dòng này để đảm bảo role luôn được khởi tạo
      isActive: false,
      activationToken,
    });

    const savedUser = await createdUser.save();

    // Send verification email
    await this.mailService.sendMail({
      to: email,
      subject: 'Verify your My Task App account',
      templatePath: __dirname + '/../mail/templates/verify-account.hbs',
      context: {
        name,
        url: `${process.env.APP_URL || 'http://localhost:3000'}/auth/verify/${activationToken}`,
      },
    });

    const { password: _, ...result } = savedUser.toObject();
    return result;
  }

  /**
   * Get all users (without password)
   * @returns array of users
   */
  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  /**
   * Get user by id (without password)
   * @param id user id
   * @throws NotFoundException if user not found
   * @returns user object
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException(`User with ID: ${id} not found`);
    }
    return user;
  }

  /**
   * Get user by email
   * @param email user email
   * @returns user document or null
   */
  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  /**
   * Update user profile (admin can update any, user can only update self)
   * @param id user id
   * @param updateUserDto DTO with fields to update
   * @param currentUser current user info (from request)
   * @throws ForbiddenException if not allowed
   * @throws NotFoundException if user not found
   * @returns updated user object
   */
  async update(id: string, updateUserDto: UpdateUserDto, currentUser: any): Promise<User> {
    const isNotAdmin = currentUser.role !== Role.ADMIN;

    // Only allow user to update their own profile
    if (isNotAdmin && currentUser.userId !== id) {
      throw new ForbiddenException('You can only update your own profile.');
    }

    // Clone DTO to avoid mutating original
    const dtoToUpdate = { ...updateUserDto };

    // Hash new password if provided
    if (dtoToUpdate.password) {
      const salt = await bcrypt.genSalt(10);
      dtoToUpdate.password = await bcrypt.hash(dtoToUpdate.password, salt);
    }

    // Prevent non-admin from changing role
    if (isNotAdmin && dtoToUpdate.role) {
      throw new ForbiddenException('You are not allowed to change your role.');
    }

    // Update user
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, dtoToUpdate, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID: ${id} not found`);
    }

    return updatedUser;
  }

  /**
   * Delete user by id
   * @param id user id
   * @throws NotFoundException if user not found
   * @returns void
   */
  async remove(id: string): Promise<void> {
    // You can add logic to prevent admin from deleting themselves if needed
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`User with ID: ${id} not found`);
    }
  }
}