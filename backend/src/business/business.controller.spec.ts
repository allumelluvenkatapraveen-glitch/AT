import { Test, TestingModule } from '@nestjs/testing';
import { BusinessController } from './business.controller.js';
import { BusinessService } from './business.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

describe('BusinessController', () => {
  let controller: BusinessController;

  beforeEach(async () => {
    const builder = Test.createTestingModule({
      controllers: [BusinessController],
      providers: [
        { provide: BusinessService, useValue: {} },
      ],
    }).overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true }).overrideGuard(RolesGuard).useValue({ canActivate: () => true });
    const module: TestingModule = await builder.compile();

    controller = module.get<BusinessController>(BusinessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
