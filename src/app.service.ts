import { Injectable } from '@nestjs/common';

// インジェクタブルというデコレーターで装飾されている↓
/**
 * Injectable()とすることで、
 * このAppServiceを他のService,Controllerに
 * インジェクション（注入）することができる
 */
@Injectable()
// AppServiceというクラスを定義
export class AppService {
  // getHelloというビジネスロジックとしてのメソッド
  getHello(): string {
    return 'Hello World!';
  }
}
