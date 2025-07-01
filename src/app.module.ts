import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    // 1. ConfigModule: Luôn đặt ở đầu tiên để các module khác có thể sử dụng.
    // isGlobal: true giúp bạn không cần import lại ConfigModule ở các module con.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Chỉ định file môi trường
    }),

    // 2. MongooseModule: Kết nối với MongoDB.
    // Sử dụng forRootAsync để có thể inject ConfigService và đọc URI từ .env.
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'), // Đảm bảo tên biến trong .env là MONGO_URI
      }),
      inject: [ConfigService],
    }),

    // 3. MailerModule: Cấu hình để gửi email.
    // Cũng sử dụng forRootAsync để đọc thông tin từ .env.
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'), // smtp.gmail.com
          secure: false, // Luôn là false cho GMail với port 587
          auth: {
            user: configService.get<string>('MAIL_USER'), // Email của bạn
            pass: configService.get<string>('MAIL_PASSWORD'), // Mật khẩu ứng dụng 16 ký tự
          },
        },
        defaults: {
          from: `"No Reply" <${configService.get<string>('MAIL_FROM')}>`,
        },
        template: {
          // Đường dẫn tới thư mục chứa các file template email.
          // join(__dirname, '..', 'templates') sẽ trỏ tới thư mục 'templates' ở thư mục gốc.
          dir: join(__dirname, '..', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),

    // 4. Các module nghiệp vụ của bạn
    UsersModule,
    AuthModule,
    TasksModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }