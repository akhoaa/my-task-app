import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cấu hình ValidationPipe toàn cục
  // Giúp tự động validate các DTO ở tất cả các controller
  app.useGlobalPipes(new ValidationPipe());

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('My Task App API') // Tiêu đề của tài liệu
    .setDescription('The API documentation for My Task App application. This provides a detailed list of all available endpoints.') // Mô tả chi tiết
    .setVersion('1.0') // Phiên bản API
    .addTag('auth', 'Endpoints for user authentication') // Gom nhóm các API của Auth
    .addTag('users', 'Endpoints for user management') // Gom nhóm các API của Users
    .addTag('tasks', 'Endpoints for task management') // Gom nhóm các API của Tasks
    .addBearerAuth( // Thêm tùy chọn nhập Bearer Token vào Swagger UI
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // Tên của security scheme, có thể đặt tùy ý
    )
    .build();

  // Tạo tài liệu Swagger từ cấu hình đã tạo
  const document = SwaggerModule.createDocument(app, config);

  // Thiết lập endpoint để phục vụ tài liệu Swagger
  // Trang tài liệu sẽ có thể truy cập tại: http://localhost:3000/api
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Giữ lại token sau khi refresh trang
    }
  });

  // Khởi động ứng dụng
  // Sử dụng biến môi trường PORT nếu có, nếu không thì dùng cổng 3000
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}

// Chạy hàm bootstrap
bootstrap();