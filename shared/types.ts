/**
 * Shared Type Definitions & Contracts
 * Shared between NestJS Backend and Next.js Frontend
 */

export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN',
}

export enum PassStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum SlotStatus {
  AVAILABLE = 'AVAILABLE',
  LOCKED = 'LOCKED',
  BOOKED = 'BOOKED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum MessageType {
  TEXT = 'TEXT',
  REPORT_REF = 'REPORT_REF',
  PRESCRIPTION_NOTE = 'PRESCRIPTION_NOTE',
  SYSTEM = 'SYSTEM',
}

export enum ReportCategory {
  LAB_REPORT = 'LAB_REPORT',
  CARDIOLOGY_TRACE = 'CARDIOLOGY_TRACE',
  PRESCRIPTION = 'PRESCRIPTION',
  RADIOLOGY = 'RADIOLOGY',
}

export interface UserDto {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: UserRole;
  hospitalId?: string | null;
  createdAt: string;
}

export interface DoctorProfileDto {
  id: string;
  userId: string;
  specialization: string;
  registrationNumber: string;
  consultationFee: number;
  passDurationDays: number;
  isVerified: boolean;
  hospitalName?: string;
  user?: UserDto;
}

export interface ConsultationPassDto {
  id: string;
  patientId: string;
  doctorId: string;
  paymentOrderId: string;
  amountPaid: number;
  currency: string;
  startsAt: string;
  expiresAt: string;
  status: PassStatus;
  doctor?: DoctorProfileDto;
  patient?: UserDto;
}

export interface TimeSlotDto {
  id: string;
  doctorId: string;
  patientId?: string | null;
  passId?: string | null;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  turnNumber?: number;
  doctor?: DoctorProfileDto;
  patient?: UserDto;
}

export interface MedicalReportDto {
  id: string;
  patientId: string;
  passId: string;
  fileName: string;
  s3ObjectKey: string;
  mimeType: string;
  category: ReportCategory;
  summary?: string;
  uploadedAt: string;
  preSignedUrl?: string;
}

export interface ChatMessageDto {
  id: string;
  passId: string;
  senderId: string;
  senderRole: UserRole | 'SYSTEM';
  senderName: string;
  messageType: MessageType;
  content: string;
  reportId?: string | null;
  createdAt: string;
}

export interface PrescriptionDetails {
  medications: string;
  clinicalAdvice: string;
  doctorName: string;
  registrationNumber: string;
  issuedAt: string;
}
