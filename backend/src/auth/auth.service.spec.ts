import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';

describe('AuthService', () => {
  let service: AuthService;
  const prisma = {
    user: { findUnique: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
  };
  const jwtService = { signAsync: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('registers customers without accepting a client role', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ id: 'customer-1', role: 'CUSTOMER' });

    const result = await service.register({
      email: 'customer@example.com',
      password: 'password123',
      firstName: 'Customer',
    });

    expect(result.role).toBe('CUSTOMER');
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({ role: 'ADMIN' }),
      }),
    );
  });

  it('rejects duplicate customer emails', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

    await expect(
      service.register({
        email: 'customer@example.com',
        password: 'password123',
        firstName: 'Customer',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('requires every business-owner agreement', async () => {
    await expect(
      service.registerBusiness({
        email: 'owner@example.com',
        password: 'password123',
        firstName: 'Owner',
        businessName: 'Shop',
        addressLine1: '1 Main',
        city: 'City',
        countryCode: 'US',
        latitude: 1,
        longitude: 1,
        termsAccepted: false,
        marketplaceRulesAccepted: true,
        privacyAccepted: true,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('blocks inactive users from login', async () => {
    prisma.user.findUnique.mockResolvedValue({
      status: 'SUSPENDED',
      passwordHash: 'hash',
    });

    await expect(
      service.login({ email: 'owner@example.com', password: 'password123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
