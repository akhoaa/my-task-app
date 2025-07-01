import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                (req: Request) => {
                    const auth = req.headers['authorization'];
                    if (auth && !auth.startsWith('Bearer ')) {
                        return auth;
                    }
                    return null;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || '', // Sửa tại đây
        });
    }

    async validate(payload: any) {
        // Trả về cả role để guard kiểm tra phân quyền
        return { userId: payload.sub, email: payload.email, role: payload.role };
    }
}