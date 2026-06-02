import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)
  const frontendOrigin = config.get<string>('FRONTEND_ORIGIN', 'http://localhost:5173')

  app.setGlobalPrefix('api')
  app.enableCors({ origin: frontendOrigin.split(',').map((origin) => origin.trim()) })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  await app.listen(config.get<number>('PORT', 3000))
}

void bootstrap()
