import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
// PassportStrategyという抽象クラスを継承しておく。抽象メソッドもある
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    // 継承元のPassportStrategyのコンストラクターの処理を参照でき、オプションとしてカスタマイズを記述
    super({
      // リクエストのどこにJWTが格納されているかを指定
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          let jwt = null;
          if (req && req.cookies) {
            jwt = req.cookies['access_token'];
          }
          return jwt;
        },
      ]),
      // JWTの有効期限が切れていた場合は有効なJWTと判定されないため
      ignoreExpiration: false,
      // JWTを生成する時に使ったシークレットキーを指定
      secretOrKey: config.get('JWT_SECRET'),
    });
  }
  // ここではJWTトークンとシークレットキーでpayloadを復元してvalidateメソッドに渡される

  // 抽象メソッドのvalidateを実装
  // 引数にはAuthServiceのJWTを生成する時に定義されたpayloadと同じ
  async validate(payload: { sub: number; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });
    delete user.hashedPassword;
    // ログインしているユーザーのオブジェクトを返している
    return user;
  }
}
