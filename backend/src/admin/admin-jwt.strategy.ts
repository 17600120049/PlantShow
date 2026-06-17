import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AdminAuthService } from './admin-auth.service';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    private readonly adminAuthService: AdminAuthService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'ADMIN_JWT_SECRET',
        configService.get<string>('JWT_SECRET', 'plant-wander-jwt-secret-key-2024'),
      ),
    });
  }

  async validate(payload: { sub: string; type?: string }) {
    if (payload.type !== 'admin') {
      return null;
    }
    return this.adminAuthService.validateAdmin(payload.sub);
  }
}
