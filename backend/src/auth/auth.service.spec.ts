import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService (Unit Test)', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    doctorProfile: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock_jwt_token_xyz'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a new patient and return an access token', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'usr-123',
        fullName: 'Rahul Sen',
        email: 'rahul@example.com',
        phone: '+919999988888',
        role: Role.PATIENT,
      });

      const res = await service.register({
        fullName: 'Rahul Sen',
        email: 'rahul@example.com',
        phone: '+919999988888',
        password: 'password123',
        role: Role.PATIENT,
      });

      expect(res.accessToken).toBe('mock_jwt_token_xyz');
      expect(res.user.fullName).toBe('Rahul Sen');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should reject with ConflictException if email or phone is already taken', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({ id: 'existing-id' });

      await expect(
        service.register({
          fullName: 'Duplicate User',
          email: 'dup@example.com',
          phone: '+919999988888',
          password: 'password123',
          role: Role.PATIENT,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should authenticate user with valid credentials and return access token', async () => {
      const hashedPassword = await bcrypt.hash('secret123', 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'usr-456',
        fullName: 'Dr. Arvind',
        email: 'arvind@hospital.org',
        phone: '+919876543210',
        passwordHash: hashedPassword,
        role: Role.DOCTOR,
        doctorProfile: { id: 'doc-1' },
      });

      const res = await service.login({
        email: 'arvind@hospital.org',
        password: 'secret123',
      });

      expect(res.accessToken).toBe('mock_jwt_token_xyz');
      expect(res.user.email).toBe('arvind@hospital.org');
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      const hashedPassword = await bcrypt.hash('correct_password', 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'usr-456',
        email: 'arvind@hospital.org',
        passwordHash: hashedPassword,
      });

      await expect(
        service.login({
          email: 'arvind@hospital.org',
          password: 'wrong_password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
