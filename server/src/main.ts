import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from 'src/app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter());
  const PORT = process.env.PORT ?? 8000;
  await app.listen(PORT);
  console.log(`Nestjs server is listening on port ${PORT}`);
}
bootstrap();
