import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { TodoService } from './todo.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from '@prisma/client';

@UseGuards(AuthGuard('jwt'))
@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  /**
   * 自身のタスクすべて取得エンドポイント
   */
  @Get()
  getTasks(@Req() req: Request): Promise<Task[]> {
    return this.todoService.getTasks(req.user.id);
  }

  /**
   * 任意の自身のタスク取得エンドポイント
   */
  @Get(':id')
  getTaskById(
    @Req() req: Request,
    // Paramでコレーたでエンドポイント末尾のパラメータを取得して
    // ParseIntPipeによって取得したid変数をINT型に変換してtaskIdに格納
    @Param('id', ParseIntPipe) taskId: number,
  ): Promise<Task> {
    return this.todoService.getTaskById(req.user.id, taskId);
  }

  /**
   * タスク作成エンドポイント
   */
  @Post()
  createTask(@Req() req: Request, @Body() dto: CreateTaskDto): Promise<Task> {
    return this.todoService.createTask(req.user.id, dto);
  }

  /**
   * タスク更新エンドポイント
   */
  @Patch(':id')
  updateTaskById(
    @Req() req: Request,
    // Patchの末尾のidをParamデコレータで取得してParseIntPipeでINT型に定義の後taskIdに格納
    @Param('id', ParseIntPipe) taskId: number,
    @Body() dto: UpdateTaskDto,
  ): Promise<Task> {
    return this.todoService.updateTaskById(req.user.id, taskId, dto);
  }

  /**
   * タスク削除エンドポイント
   */
  // HttpCodeでコレーたでデリートに成功した時のステータスをNO_CONTENTにカスタマイズ
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteTaskById(
    @Req() req: Request,
    // 同じくParamで:idを取得し、ParseIntPipeでINT型で定義の後taskIdに格納
    @Param('id', ParseIntPipe) taskId: number,
  ): Promise<void> {
    return this.todoService.deleteTaskById(req.user.id, taskId);
  }

  // 自身の関係なく前タスク取得のエンドポイント、ビジネスロジック作成できそう
}
