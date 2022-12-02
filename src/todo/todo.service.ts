import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from '@prisma/client';

@Injectable()
export class TodoService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 自身のタスクをすべて呼び出す
   */
  getTasks(userId: number): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: {
        // ログイン中のuserIdが一致するか
        userId,
      },
      orderBy: {
        // 並び替え：新しい順
        createdAt: 'desc',
      },
    });
  }

  /**
   * 任意のタスクを呼び出す
   */
  getTaskById(userId: number, taskId: number): Promise<Task> {
    return this.prisma.task.findFirst({
      where: {
        userId,
        id: taskId,
      },
    });
  }

  /**
   * タスクを作成する
   */
  async createTask(userId: number, dto: CreateTaskDto): Promise<Task> {
    const task = await this.prisma.task.create({
      data: {
        userId,
        ...dto,
      },
    });
    return task;
  }

  /**
   * タスクを更新する
   */
  async updateTaskById(
    userId: number,
    taskId: number,
    dto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!task || task.userId !== userId)
      throw new ForbiddenException('タスクが見つかりませんでした');

    return this.prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...dto,
      },
    });
  }

  /**
   * タスクを削除する
   */
  async deleteTaskById(userId: number, taskId: number): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!task || task.userId !== userId)
      throw new ForbiddenException('削除するタスクが見つかりませんでした。');

    await this.prisma.task.delete({
      where: {
        id: taskId,
      },
    });
  }
}
