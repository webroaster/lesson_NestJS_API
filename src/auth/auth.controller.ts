import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  Get,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Csrf, Msg } from './interfaces/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/csrf')
  getCsrfToken(@Req() req: Request): Csrf {
    return { csrfToken: req.csrfToken() };
  }

  /**
   * 新規登録
   */
  @Post('signup')
  /**
   * クライアントからリクエストBodyを取り出したい時は
   * ＠Bodyデコレータを使用することで
   * リクエストボディーを取り出せる
   **/
  signUp(@Body() dto: AuthDto): Promise<Msg> {
    return this.authService.signUp(dto);
  }

  /**
   * ログイン
   */
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async login(
    // リクエストボディーから送られたEmail Passを取得するために型定義
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Msg> {
    // authServiceのloginメソッドを呼び出す
    // AuthService loginメソッドはJWTを返される
    const jwt = await this.authService.login(dto);
    // res.cookieでクッキーを設定する
    res.cookie('access_token', jwt.accessToken, {
      httpOnly: true,
      // ローカルでは一旦falseに設定。httpsでの通信になるとtrueに設定する
      secure: true,
      sameSite: 'none',
      path: '/',
    });
    return {
      message: 'ok',
    };
  }

  /**
   * ログアウト
   */
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Msg {
    // アクセストークンを空の値に更新している感じ
    res.cookie('access_token', '', {
      httpOnly: true,
      secure: true,
      path: '/',
    });
    return {
      message: 'ok',
    };
  }
}
