import './environments';
import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './users/users.entity';
import { Report } from './reports/reports.entity';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

const cookieSession = require('cookie-session');
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      schema: process.env.DB_SCHEMA,
      entities: [User, Report],
      autoLoadEntities: true,
      synchronize: false,
      logging: false,
    }),
    ConfigModule.forRoot(),
    UsersModule,
    ReportsModule,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ whitelist: true }),
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          keys: ['userId'],
        }),
      )
      .forRoutes('*');
  }
}
