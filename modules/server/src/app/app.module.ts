import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AtemModule } from 'src/atem';
import { AtemTallyModule } from 'src/atem-tally';
import { AuthModule } from 'src/auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [AtemModule, AtemTallyModule, AuthModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
