import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AtemTallyModule } from './atem-tally/atem-tally.module';
import { AtemModule } from './atem/atem.module';

@Module({
  imports: [AtemModule, AtemTallyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
