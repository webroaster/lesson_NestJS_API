import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { UserModule } from './user.module';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ニックネーム更新
   */
  async updateUser(
    userId: number,
    dto: UpdateUserDto,
  ): Promise<Omit<User, 'hashedPassword'>> {
    // updateが更新関数。
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });
    // 返り値には変更されたユーザーのオブジェクトが生成されるがprisma/clientで生成されている型を見ると
    // ハッシュ化したパスワードが入っているため一旦削除してから返す↓
    delete user.hashedPassword;
    return user;
  }
}
