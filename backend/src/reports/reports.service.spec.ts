import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PassStatus } from '@prisma/client';

describe('ReportsService - S3 Zero-Exposure Pipeline (Unit Test)', () => {
  let service: ReportsService;
  let prisma: PrismaService;

  const mockPrisma = {
    consultationPass: {
      findUnique: jest.fn(),
    },
    medicalReport: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockConfig = {
    get: jest.fn().mockImplementation((key, defaultVal) => defaultVal),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateUploadUrl', () => {
    it('should generate a 5-minute pre-signed S3 URL for an active pass', async () => {
      mockPrisma.consultationPass.findUnique.mockResolvedValue({
        id: 'pass-active-1',
        patientId: 'patient-101',
        status: PassStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 86400000 * 4),
      });

      mockPrisma.medicalReport.create.mockResolvedValue({
        id: 'rep-uuid-1',
        fileName: 'lipid_profile.pdf',
        s3ObjectKey: 'patients/patient-101/...',
      });

      const res = await service.generateUploadUrl('patient-101', {
        passId: 'pass-active-1',
        fileName: 'lipid_profile.pdf',
        mimeType: 'application/pdf',
      });

      expect(res.reportId).toBe('rep-uuid-1');
      expect(res.uploadUrl).toBeDefined();
      expect(res.expiresInSeconds).toBe(300); // 5 minutes
    });

    it('should throw ForbiddenException if pass has expired', async () => {
      mockPrisma.consultationPass.findUnique.mockResolvedValue({
        id: 'pass-expired',
        patientId: 'patient-101',
        status: PassStatus.EXPIRED,
        expiresAt: new Date(Date.now() - 5000),
      });

      await expect(
        service.generateUploadUrl('patient-101', {
          passId: 'pass-expired',
          fileName: 'ecg.pdf',
          mimeType: 'application/pdf',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('generateDownloadUrl', () => {
    it('should prevent unauthorized third-party users from accessing patient report', async () => {
      mockPrisma.medicalReport.findUnique.mockResolvedValue({
        id: 'rep-secret-1',
        patientId: 'legitimate-patient',
        s3ObjectKey: 'patients/legitimate-patient/secret.pdf',
        pass: {
          doctor: { userId: 'assigned-doctor' },
        },
      });

      await expect(
        service.generateDownloadUrl('unauthorized-attacker', 'PATIENT', 'rep-secret-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow assigned doctor to access pre-signed view URL', async () => {
      mockPrisma.medicalReport.findUnique.mockResolvedValue({
        id: 'rep-secret-1',
        fileName: 'lipid_report.pdf',
        mimeType: 'application/pdf',
        patientId: 'patient-101',
        s3ObjectKey: 'patients/patient-101/lipid_report.pdf',
        pass: {
          doctor: { userId: 'doctor-user-id' },
        },
      });

      const res = await service.generateDownloadUrl('doctor-user-id', 'DOCTOR', 'rep-secret-1');
      expect(res.downloadUrl).toBeDefined();
      expect(res.expiresInSeconds).toBe(600); // 10 minutes
    });
  });
});
