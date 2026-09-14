import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { BusinessRegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const email = registerDto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: registerDto.firstName.trim(),
        lastName: registerDto.lastName?.trim() || null,
        phone: registerDto.phone?.trim() || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  async registerBusiness(registerDto: BusinessRegisterDto) {
    if (!registerDto.termsAccepted || !registerDto.marketplaceRulesAccepted || !registerDto.privacyAccepted) {
      throw new UnauthorizedException('All business owner agreements are required');
    }

    const email = registerDto.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new ConflictException('Email is already registered');
    const passwordHash = await bcrypt.hash(registerDto.password, 12);
    const slug = `${registerDto.businessName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()}`;

    return this.prisma.$transaction(async (tx) => tx.user.create({
      data: {
        email,
        passwordHash,
        firstName: registerDto.firstName.trim(),
        lastName: registerDto.lastName?.trim() || null,
        phone: registerDto.phone?.trim() || null,
        role: 'BUSINESS_OWNER',
        businesses: {
          create: {
            name: registerDto.businessName.trim(),
            slug,
            description: registerDto.businessDescription?.trim() || null,
            status: 'PENDING',
            locations: {
              create: {
                addressLine1: registerDto.addressLine1.trim(),
                addressLine2: registerDto.addressLine2?.trim() || null,
                city: registerDto.city.trim(),
                state: registerDto.state?.trim() || null,
                postalCode: registerDto.postalCode?.trim() || null,
                countryCode: registerDto.countryCode.trim().toUpperCase(),
                latitude: registerDto.latitude,
                longitude: registerDto.longitude,
              },
            },
          },
        },
      },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, status: true, role: true, businesses: { select: { id: true, name: true, status: true, locations: true } } },
    }));
  }

  async login(loginDto: LoginDto) {
    const email = loginDto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        status: user.status,
        role: user.role,
      },
    };
  }

}