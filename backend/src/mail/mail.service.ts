import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import { readFile } from 'fs/promises';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.example.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER || 'your@email.com',
                pass: process.env.SMTP_PASS || 'yourpassword',
            },
        });
    }

    async sendMail(options: {
        to: string;
        subject: string;
        templatePath?: string;
        context?: Record<string, any>;
        html?: string;
        text?: string;
    }) {
        let html = options.html;
        if (options.templatePath) {
            try {
                const templateSource = await readFile(options.templatePath, 'utf8');
                const template = handlebars.compile(templateSource);
                html = template(options.context || {});
            } catch (err) {
                throw new InternalServerErrorException('Error reading email template');
            }
        }
        return this.transporter.sendMail({
            from: process.env.SMTP_FROM || 'no-reply@my-task-app.com',
            to: options.to,
            subject: options.subject,
            html,
            text: options.text,
        });
    }
}
