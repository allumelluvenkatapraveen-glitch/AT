import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller.js';
import { ProductService } from './product.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

describe('ProductController', () => {
  let controller: ProductController;

  beforeEach(async () => {
    const builder = Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        { provide: ProductService, useValue: {} },
      ],
    }).overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true }).overrideGuard(RolesGuard).useValue({ canActivate: () => true });
    const module: TestingModule = await builder.compile();

    controller = module.get<ProductController>(ProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
