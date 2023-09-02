import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { AaaService } from '../aaa/aaa.service';

@Injectable()
export class TaskService {
  @Inject(AaaService)
  private aaaService: AaaService;

  // CronJob 是基于 cron 包封装的
  @Cron(CronExpression.EVERY_5_SECONDS, {
    name: 'task1',
    timeZone: 'Asia/Shanghai',
  })
  task1() {
    console.log('task1 executes', this.aaaService.findAll());
  }

  // interval 和 timeout 就是用的原生 api。
  // 用 @Interval 指定任务的执行间隔，参数是毫秒值
  @Interval('task2', 500)
  task2() {
    console.log('task2 executes', this.aaaService.findAll());
  }

  // 用 @Timeout 指定多长时间后执行一次：
  @Timeout('task3', 500)
  task3() {
    console.log('task3 executes', this.aaaService.findAll());
  }
}
