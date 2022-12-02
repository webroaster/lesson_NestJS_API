import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// PrismaClientというClassを使う↓
import { PrismaClient } from '@prisma/client';

@Injectable()
// 作成したPrismaServiceでPrismaClientを使いたいため継承（extends）する
export class PrismaService extends PrismaClient {
  // DIするためconstructorを記述
  constructor(private readonly config: ConfigService) {
    // 継承しているPrismaClientクラスのコンストラクターの処理をスーパーを使って参照
    super({
      // PrismaClientの定義されているデータベースURLの引数をこのdatasourcesのオプションで指定する↓
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }
}
