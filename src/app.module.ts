import { Module, OnApplicationBootstrap, Inject } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
import { TaskService } from './task/task.service';
import { AaaModule } from './aaa/aaa.module';
import { CronJob } from 'cron';

@Module({
  imports: [ScheduleModule.forRoot(), AaaModule],
  controllers: [AppController],
  providers: [AppService, TaskService],
})
export class AppModule implements OnApplicationBootstrap {
  @Inject(SchedulerRegistry)
  private schedulerRegistry: SchedulerRegistry;

  onApplicationBootstrap() {
    const cronsJobs = this.schedulerRegistry.getCronJobs();
    cronsJobs.forEach((cronsJob, key) => {
      cronsJob.stop();
      this.schedulerRegistry.deleteCronJob(key);
    });

    // 为什么停掉 CronJob 用 job.stop 而停掉 timeout 和 interval 用 clearTimeout 和 clearInterval 呢？
    // 因为 timeout 和 interval 本来就是基于 setTimeout、setInterval 的原生 api 封装出来的
    const intervals = this.schedulerRegistry.getIntervals();
    intervals.forEach((item) => {
      const interval = this.schedulerRegistry.getInterval(item);
      clearInterval(interval);
      this.schedulerRegistry.deleteInterval(interval);
    });

    const timeouts = this.schedulerRegistry.getTimeouts();
    timeouts.forEach((item) => {
      const timeout = this.schedulerRegistry.getTimeout(item);
      clearTimeout(timeout);
      this.schedulerRegistry.deleteTimeout(timeout);
    });

    console.log('getCronJobs', this.schedulerRegistry.getCronJobs());
    console.log('getIntervals', this.schedulerRegistry.getIntervals());
    console.log('getTimeouts', this.schedulerRegistry.getTimeouts());

    // 这里可以看出来 CronJob 是基于 cron 包封装的，而 interval 和 timeout 就是用的原生 api。
    const cronJob = new CronJob(`0/5 * * * * *`, () => {
      console.log('cron job', cronJob);
    });
    this.schedulerRegistry.addCronJob('job1', cronJob);
    cronJob.start();

    const interval = setInterval(() => {
      console.log('interval', interval);
    }, 500);
    this.schedulerRegistry.addInterval('job2', interval);

    const timeout = setTimeout(() => {
      console.log('timeout123', timeout);
    }, 1000);
    this.schedulerRegistry.addTimeout('job3', timeout);
  }
}
