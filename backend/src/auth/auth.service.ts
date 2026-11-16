import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { phone: dto.phone }] },
    });

    if (existing) {
      throw new ConflictException('User with this email or phone already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName: dto.fullName,
          phone: dto.phone,
          email: dto.email,
          passwordHash,
          role: dto.role,
        },
      });

      if (dto.role === Role.DOCTOR) {
        await tx.doctorProfile.create({
          data: {
            userId: user.id,
            specialization: dto.specialization || 'General Medicine',
            registrationNumber: dto.registrationNumber || `MCI-${Math.floor(10000 + Math.random() * 90000)}`,
            consultationFee: 500,
            passDurationDays: 7,
            isVerified: false,
          },
        });
      }

      const token = this.generateToken(user.id, user.email, user.role);
      return {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        accessToken: token,
      };
    });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { doctorProfile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        doctorProfile: user.doctorProfile,
      },
      accessToken: token,
    };
  }

  generateToken(userId: string, email: string, role: Role): string {
    return this.jwtService.sign(
      { sub: userId, email, role },
      { expiresIn: '7d' },
    );
  }
}
