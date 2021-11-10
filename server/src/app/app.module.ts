import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AtemModule } from 'src/atem';
import { AtemTallyModule } from 'src/atem-tally';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [AtemModule, AtemTallyModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
