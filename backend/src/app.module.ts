import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { LeaderBoardModule } from './leaderboard/leaderboard.module';
import { SidebarModule } from './sidebar/sidebar.module';

@Module({
  imports: [
    AuthModule,
    LeaderBoardModule,
    AccountModule,
    SidebarModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
