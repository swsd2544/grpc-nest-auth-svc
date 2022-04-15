import { AuthService } from './auth.service';
import { PrismaService } from './prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { LoginResponse, RegisterResponse, ValidateResponse } from '../auth.pb';

describe('AuthController', () => {
  let authService: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

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
      providers: [AuthService, PrismaService, JwtService],
    }).compile();

    authService = app.get<AuthService>(AuthService);
    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should return an E-Mail already register response', async () => {
      const result: RegisterResponse = {
        status: HttpStatus.CONFLICT,
        error: ['E-Mail already exists'],
      };

      jest.spyOn(prisma.auth, 'findFirst').mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'password',
      });

      expect(
        await authService.register({
          email: 'test@example.com',
          password: 'password',
        }),
      ).toStrictEqual(result);
    });

    it('should return a user-created response', async () => {
      const result: RegisterResponse = {
        status: HttpStatus.CREATED,
        error: null,
      };

      jest.spyOn(prisma.auth, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.auth, 'create').mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'password',
      });

      expect(
        await authService.register({
          email: 'test@example.com',
          password: 'password',
        }),
      ).toStrictEqual(result);
    });
  });

  describe('login', () => {
    it('should return an E-Mail not found response', async () => {
      const result: LoginResponse = {
        status: HttpStatus.NOT_FOUND,
        error: ['E-Mail not found'],
        token: null,
      };

      jest.spyOn(prisma.auth, 'findFirst').mockResolvedValue(null);

      expect(
        await authService.login({
          email: 'test@example.com',
          password: 'password',
        }),
      ).toStrictEqual(result);
    });

    it('should return a wrong password response', async () => {
      const result: LoginResponse = {
        status: HttpStatus.NOT_FOUND,
        error: ['Password wrong'],
        token: null,
      };

      jest.spyOn(prisma.auth, 'findFirst').mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'wrongPassword',
      });
      jest
        .spyOn(jwtService, 'isPasswordValid')
        .mockImplementation(
          (password, userPassword) => password === userPassword,
        );

      expect(
        await authService.login({
          email: 'test@example.com',
          password: 'password',
        }),
      ).toStrictEqual(result);
    });

    it('should return a login token response', async () => {
      const result: LoginResponse = {
        token: 'token',
        status: HttpStatus.OK,
        error: null,
      };

      jest.spyOn(prisma.auth, 'findFirst').mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'password',
      });
      jest
        .spyOn(jwtService, 'isPasswordValid')
        .mockImplementation(
          (password, userPassword) => password === userPassword,
        );
      jest.spyOn(jwtService, 'generateToken').mockReturnValue('token');

      expect(
        await authService.login({
          email: 'test@example.com',
          password: 'password',
        }),
      ).toStrictEqual(result);
    });
  });

  describe('validate', () => {
    it('should return token invalid response', async () => {
      const result: ValidateResponse = {
        status: HttpStatus.FORBIDDEN,
        error: ['Token is invalid'],
        userId: null,
      };

      jest.spyOn(jwtService, 'decode').mockResolvedValue(null);

      expect(
        await authService.validate({
          token: 'token',
        }),
      ).toStrictEqual(result);
    });

    it('should return user not found response', async () => {
      const result: ValidateResponse = {
        status: HttpStatus.CONFLICT,
        error: ['User not found'],
        userId: null,
      };

      jest.spyOn(jwtService, 'decode').mockResolvedValue({ id: 1 });
      jest.spyOn(jwtService, 'validateUser').mockResolvedValue(null);

      expect(
        await authService.validate({
          token: 'token',
        }),
      ).toStrictEqual(result);
    });

    it('should return userId response', async () => {
      const result: ValidateResponse = {
        status: HttpStatus.OK,
        error: null,
        userId: 1,
      };

      jest.spyOn(jwtService, 'decode').mockResolvedValue({ id: 1 });
      jest.spyOn(jwtService, 'validateUser').mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'password',
      });

      expect(
        await authService.validate({
          token: 'token',
        }),
      ).toStrictEqual(result);
    });
  });
});
