import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// DTOクラスバリデーションの実装した機能を有効化するためのモジュール
import { ValidationPipe } from '@nestjs/common';
// Expressからリクエストのデータ型をインポート
import { Request } from 'express';
// JWTトークンのデータのやり取りをクッキーベースで行うため
// クライアントのリクエストからクッキーを取り出すモジュール
import * as cookieParser from 'cookie-parser';
// CSRFトークンを使えるようにするため
import * as csurf from 'csurf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // TDOのクラスバリデーションの処理を有効化するための記述
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // コルスの設定
  app.enableCors({
    // JWTトークンをクッキーベースで通信するため↓
    credentials: true,
    // バックエンドのサービスアクセスを許可したり、フロントエンドのドメインを設定したりする↓
    origin: ['http://localhost:3000'],
  });
  // フロントエンドから受けとったのクッキーを解析できるようにするため↓
  app.use(cookieParser());

  // csrfの設定
  app.use(
    csurf({
      cookie: {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      },
      // リクエストヘッダーにvalueを送信する
      value: (req: Request) => {
        return req.header('csrf-token');
      },
    }),
  );

  // 環境変数に本番環境のポート番号があればそれを有効に、なければローカルの3005番に
  await app.listen(process.env.PORT || 3005);
}
bootstrap();
