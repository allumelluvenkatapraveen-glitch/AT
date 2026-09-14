import { Test, TestingModule } from '@nestjs/testing';
import { BusinessService } from './business.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('BusinessService', () => {
  let service: BusinessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<BusinessService>(BusinessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
