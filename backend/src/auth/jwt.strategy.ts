import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'MY_SECRET_KEY', // Phải giống với secret trong auth.module
        });
    }

    async validate(payload: any) {
        // Trả về cả role để guard kiểm tra phân quyền
        return { userId: payload.sub, email: payload.email, role: payload.role };
    }
}