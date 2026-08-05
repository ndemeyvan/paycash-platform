import { FeesController } from './fees.controller.js';
import { FeesService } from '../services/fees.service.js';
import { Test, TestingModule } from '@nestjs/testing';
import { Operator, TransactionType } from '../../../types/index.js';

describe('FeesController', () => {
  let controller: FeesController;

  const mockFeesService = {
    calculate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeesController],
      providers: [{ provide: FeesService, useValue: mockFeesService }],
    }).compile();

    controller = module.get<FeesController>(FeesController);
    jest.clearAllMocks();
  });

  describe('calculate', () => {
    it('should return fee calculation result', async () => {
      const mockResult = {
        total: 51,
        baseFee: 50,
        tax: 1,
        rate: 0.01,
        transactionType: TransactionType.P2P,
        grossAmount: 5000,
        netAmount: 4949,
      };

      mockFeesService.calculate.mockResolvedValue(mockResult);

      const result = await controller.calculate({
        amount: 5000,
        operator: Operator.ORANGE,
        transactionType: TransactionType.P2P,
        userPaysFees: true,
      });

      expect(result).toEqual(mockResult);
      expect(mockFeesService.calculate).toHaveBeenCalledWith(
        5000,
        Operator.ORANGE,
        TransactionType.P2P,
        true,
      );
    });
  });

  describe('getRates', () => {
    it('should return fee rate grids', () => {
      const result = controller.getRates();

      expect(result).toHaveProperty('operators');
      expect(result.operators).toHaveProperty('ORANGE');
      expect(result.operators).toHaveProperty('MTN');
      expect(result).toHaveProperty('tax');
      expect(result).toHaveProperty('currency', 'XAF');
    });
  });
});
