import { JwtService } from './service/jwt.service';
import { PrismaService } from './service/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { LoginResponse, RegisterResponse, ValidateResponse } from './auth.pb';
import { AuthService } from './service/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpStatus } from '@nestjs/common';

describe('AuthController', () => {
  let authService: AuthService;
  let authController: AuthController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            secret: config.get<string>('SECRET'),
            signOptions: { expiresIn: config.get<string>('EXPIRES_IN') },
          }),
        }),
      ],
      controllers: [AuthController],
      providers: [AuthService, PrismaService, JwtService],
    }).compile();

    authService = app.get<AuthService>(AuthService);
    authController = app.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should return a register response', async () => {
      const result: RegisterResponse = { status: HttpStatus.OK, error: null };

      jest.spyOn(authService, 'register').mockResolvedValue(result);

      expect(
        await authController.register({
          email: 'test@example.com',
          password: 'password',
        }),
      ).toBe(result);
    });
  });

  describe('login', () => {
    it('should return a login response', async () => {
      const result: LoginResponse = {
        status: HttpStatus.OK,
        error: null,
        token: 'token',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(result);

      expect(
        await authController.login({
          email: 'test@example.com',
          password: 'password',
        }),
      ).toBe(result);
    });
  });

  describe('validate', () => {
    it('should return a validate response', async () => {
      const result: ValidateResponse = {
        status: HttpStatus.OK,
        error: null,
        userId: 1,
      };

      jest.spyOn(authService, 'validate').mockResolvedValue(result);

      expect(await authController.validate({ token: 'token' })).toBe(result);
    });
  });
});
