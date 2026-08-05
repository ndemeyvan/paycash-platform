import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller.js';
import { TransactionService } from '../services/transaction.service.js';
import { TransactionStatus, Operator } from '../../../types/index.js';

describe('TransactionController', () => {
  let controller: TransactionController;

  const mockTransactionService = {
    initiate: jest.fn(),
    getStatus: jest.fn(),
    getAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        { provide: TransactionService, useValue: mockTransactionService },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    jest.clearAllMocks();
  });

  describe('initiate', () => {
    it('should return transaction response on successful initiation', async () => {
      const mockResponse = {
        transactionId: 'TRX-TEST001',
        status: TransactionStatus.PENDING,
        signature: 'abc123',
        fees: 50,
        createdAt: new Date().toISOString(),
      };

      mockTransactionService.initiate.mockResolvedValue(mockResponse);

      const result = await controller.initiate({
        phoneNumber: '671234567',
        amount: 5000,
        reference: 'TEST-001',
        operator: Operator.ORANGE,
      });

      expect(result).toEqual(mockResponse);
      expect(mockTransactionService.initiate).toHaveBeenCalledTimes(1);
    });
  });

  describe('getStatus', () => {
    it('should return transaction status when found', async () => {
      const mockStatus = {
        id: 'TRX-TEST001',
        status: TransactionStatus.PENDING,
        amount: 5000,
        phoneNumber: '671234567',
        fees: 50,
        createdAt: new Date().toISOString(),
      };

      mockTransactionService.getStatus.mockResolvedValue(mockStatus);

      const result = await controller.getStatus('TRX-TEST001');

      expect(result).toEqual(mockStatus);
      expect(mockTransactionService.getStatus).toHaveBeenCalledWith(
        'TRX-TEST001',
      );
    });
  });

  describe('getAll', () => {
    it('should return paginated list of transactions', async () => {
      const mockResult = {
        items: [
          {
            id: 'TRX-001',
            status: TransactionStatus.PENDING,
            amount: 5000,
            phoneNumber: '671234567',
            fees: 50,
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockTransactionService.getAll.mockResolvedValue(mockResult);

      const result = await controller.getAll('1', '10');

      expect(result).toEqual(mockResult);
      expect(mockTransactionService.getAll).toHaveBeenCalledWith(1, 10);
    });
  });
});
