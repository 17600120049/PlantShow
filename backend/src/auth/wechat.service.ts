import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type Code2SessionResponse = {
  openid?: string;
  session_key?: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
};

@Injectable()
export class WechatService {
  constructor(private readonly configService: ConfigService) {}

  async code2Session(code: string) {
    const appId = this.configService.get<string>('WECHAT_APPID');
    const secret = this.configService.get<string>('WECHAT_SECRET');

    if (!appId || !secret) {
      throw new BadRequestException('微信登录未配置，请联系管理员设置 WECHAT_APPID 和 WECHAT_SECRET');
    }

    const params = new URLSearchParams({
      appid: appId,
      secret,
      js_code: code,
      grant_type: 'authorization_code',
    });

    const response = await fetch(
      `https://api.weixin.qq.com/sns/jscode2session?${params.toString()}`,
    );
    const data = (await response.json()) as Code2SessionResponse;

    if (data.errcode || !data.openid) {
      throw new UnauthorizedException(data.errmsg || '微信登录失败，请重试');
    }

    return {
      openid: data.openid,
      sessionKey: data.session_key,
      unionid: data.unionid,
    };
  }
}
