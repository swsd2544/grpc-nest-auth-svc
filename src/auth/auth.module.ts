import { ConfigService } from '@nestjs/config';
import { JwtService } from './service/jwt.service';
import { AuthService } from './service/auth.service';
import { Auth } from './auth.entity';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('SECRET'),
        signOptions: { expiresIn: config.get<string>('EXPIRES_IN') },
      }),
    }),
    TypeOrmModule.forFeature([Auth]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService],
})
export class AuthModule {}
