import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { Msg, Jwt } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * 新規登録
   */
  async signUp(dto: AuthDto): Promise<Msg> {
    // 受け取ったパスワードをハッシュ化させる
    const hashed = await bcrypt.hash(dto.password, 12);
    try {
      // PrismaServiceのメソッドを呼び出していく
      // ここのuserの部分は前に作成したModelに対応している
      await this.prisma.user.create({
        data: {
          email: dto.email,
          hashedPassword: hashed,
        },
      });
      // 成功した時の処理
      return {
        message: 'ok',
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // モデルでユニーク属性をつけたためそのエラーコードはドキュメントよりP2002となり既に登録済みのアドレスというエラーになる
        if (error.code === 'P2002') {
          throw new ForbiddenException('This Email is already taken');
        }
      }
      throw error;
    }
  }

  /**
   * ログイン
   */
  async login(dto: AuthDto): Promise<Jwt> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // DBのuserにEmailが登録されていなければ
    if (!user) throw new ForbiddenException('ログイン情報が一致しません');
    // 入力されたPWとDBのハッシュ化されたPWの検証：bcryptのcompareを使用
    const isValid = await bcrypt.compare(dto.password, user.hashedPassword);
    if (!isValid) throw new ForbiddenException('ログイン情報が一致しません');
    // 全て一致した場合はアクセストークンを返す
    return this.generateJwt(user.id, user.email);
  }

  /**
   * ログインのトークンを作成するためのJWT生成
   */
  async generateJwt(userId: number, email: string): Promise<Jwt> {
    // JWT生成するためのペイロードを指定
    const payload = {
      sub: userId,
      email,
    };
    // 環境変数のシークレット
    const secret = this.config.get('JWT_SECRET');
    // JweServiceで提供されているsignAsyncというメソッドを使ってアクセストークンを生成
    const token = await this.jwt.signAsync(payload, {
      // 有効期限
      expiresIn: '5m',
      // シークレットキー
      secret: secret,
    });
    return {
      accessToken: token,
    };
  }
}
