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
        // payload là thông tin đã được giải mã từ JWT
        return { userId: payload.sub, email: payload.email };
    }
}