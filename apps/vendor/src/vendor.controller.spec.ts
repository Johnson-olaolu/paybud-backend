import { Test, TestingModule } from '@nestjs/testing';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';

describe('VendorController', () => {
  let vendorController: VendorController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [VendorController],
      providers: [VendorService],
    }).compile();

    vendorController = app.get<VendorController>(VendorController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(vendorController.getHello()).toBe('Hello World!');
    });
  });
});
