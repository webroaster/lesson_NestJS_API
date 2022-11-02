import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// AppServiceのgetHelloメソッドを呼び出したい...

/**
 * 通常考えられるやり方ならこのAppControllerの中で
 * AppServiceをインスタンス化して、
 * そのインスタンス.getHello()とする形で取得する
 *
 * そうしてしまうと、app.serviceとapp.controllerの依存関係が
 * 強くなってしまうからそれを防ぐためにDI（Dependency Injection）を使うポイント
 */

// /rootというエンドポイントを指定できる↓
@Controller()

/**
 * DIでは既にインスタンス化されたものを
 * AppControllerのコンストラクター経由で
 * Controller()に注入する形をとる
 */
export class AppController {
  // 注入したいServiceをAppControllerのconstructorで指定
  constructor(private readonly appService: AppService) {}
  /**
   * いわゆるコピーしたものをAppControllerのものとして扱う。
   * コピーといったものはNestJSのIoC Containerという機能で管理されている
   *
   * IoC ContainerではAppServiceで生成されたインスタンスは
   * キャッシュされて他のControllerやServiceで再利用される
   * この機能をSingletonという
   */

  // /root/nextのエンドポイントを指定できる↓
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
