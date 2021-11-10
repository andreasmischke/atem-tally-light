import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleOauth20Strategy } from './google-oauth-20.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, GoogleOauth20Strategy],
})
export class AuthModule {}
