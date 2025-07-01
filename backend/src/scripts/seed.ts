import 'dotenv/config';
import { connect, connection } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Task } from '../tasks/schemas/task.schema';
import * as bcrypt from 'bcryptjs';

async function seed() {
    await connect(process.env.MONGO_URI || '', {});

    // Xóa dữ liệu cũ
    await connection.collection('users').deleteMany({});
    await connection.collection('tasks').deleteMany({});


    // Tạo nhiều user (2 admin, 5 user)
    const usersData: Array<{
        name: string;
        email: string;
        password: string;
        role: string;
        isActive: boolean;
        createdAt?: Date;
        updatedAt?: Date;
    }> = [
            { name: 'Admin 1', email: 'admin1@example.com', password: 'admin123', role: 'admin', isActive: true, createdAt: undefined, updatedAt: undefined },
            { name: 'Admin 2', email: 'admin2@example.com', password: 'admin123', role: 'admin', isActive: true, createdAt: undefined, updatedAt: undefined },
            { name: 'User 1', email: 'user1@example.com', password: 'user123', role: 'user', isActive: true, createdAt: undefined, updatedAt: undefined },
            { name: 'User 2', email: 'user2@example.com', password: 'user123', role: 'user', isActive: true, createdAt: undefined, updatedAt: undefined },
            { name: 'User 3', email: 'user3@example.com', password: 'user123', role: 'user', isActive: true, createdAt: undefined, updatedAt: undefined },
            { name: 'User 4', email: 'user4@example.com', password: 'user123', role: 'user', isActive: true, createdAt: undefined, updatedAt: undefined },
            { name: 'User 5', email: 'user5@example.com', password: 'user123', role: 'user', isActive: true, createdAt: undefined, updatedAt: undefined },
        ];
    const now = new Date();
    for (const u of usersData) {
        u.password = await bcrypt.hash(u.password, 10);
        u.isActive = true;
        u.createdAt = now;
        u.updatedAt = now;
    }
    const usersResult = await connection.collection('users').insertMany(usersData);

    // Tạo nhiều task cho mỗi user
    const tasksData: Array<{
        title: string;
        description: string;
        createdBy: any;
        status: string;
        deadline: Date;
        createdAt: Date;
        updatedAt: Date;
    }> = [];
    const statusList = ['todo', 'in-progress', 'done'];
    const deadlineBase = new Date();
    let i = 1;
    for (const [idx, userId] of Object.values(usersResult.insertedIds).entries()) {
        for (let t = 0; t < 2; t++) {
            tasksData.push({
                title: `Task ${i}`,
                description: `Task ${i} for user ${idx + 1}`,
                createdBy: userId,
                status: statusList[i % 3],
                deadline: new Date(deadlineBase.getTime() + (i * 24 * 60 * 60 * 1000)),
                createdAt: now,
                updatedAt: now,
            });
            i++;
        }
    }
    await connection.collection('tasks').insertMany(tasksData);

    console.log('Seed completed!');
    process.exit(0);
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});

