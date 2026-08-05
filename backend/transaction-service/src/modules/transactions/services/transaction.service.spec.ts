import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service.js';
import { TransactionRepository } from '../repositories/transaction.repository.js';
import {
  InitiateTransactionDto,
  TransactionStatus,
  Operator,
} from '../../../types/index.js';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TransactionService', () => {
  let service: TransactionService;

  const mockRepository = {
    save: jest.fn().mockImplementation((tx) => Promise.resolve(tx)),
    findById: jest.fn(),
    findAll: jest.fn(),
    findAllPaginated: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockHttpService = {
    axiosRef: {
      post: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: TransactionRepository, useValue: mockRepository },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    jest.clearAllMocks();
  });

  describe('initiate', () => {
    const validDto: InitiateTransactionDto = {
      phoneNumber: '671234567',
      amount: 5000,
      reference: 'TEST-001',
      operator: Operator.ORANGE,
    };

    it('should initiate a transaction successfully', async () => {
      mockHttpService.axiosRef.post
        .mockResolvedValueOnce({ data: { data: { isValid: true } } })
        .mockResolvedValueOnce({ data: { data: { total: 50 } } });

      const result = await service.initiate(validDto);

      expect(result).toHaveProperty('transactionId');
      expect(result.transactionId).toMatch(/^TRX-/);
      expect(result.status).toBe(TransactionStatus.PENDING);
      expect(result.fees).toBe(50);
      expect(result).toHaveProperty('signature');
      expect(result).toHaveProperty('createdAt');
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when partner verification fails', async () => {
      mockHttpService.axiosRef.post.mockResolvedValueOnce({
        data: { data: { isValid: false } },
      });

      await expect(service.initiate(validDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should auto-detect operator when not provided', async () => {
      const dtoWithoutOperator: InitiateTransactionDto = {
        phoneNumber: '661234567',
        amount: 5000,
        reference: 'TEST-002',
      };

      mockHttpService.axiosRef.post
        .mockResolvedValueOnce({ data: { data: { isValid: true } } })
        .mockResolvedValueOnce({ data: { data: { total: 60 } } });

      const result = await service.initiate(dtoWithoutOperator);

      expect(result).toHaveProperty('transactionId');
    });

    it('should throw when operator cannot be detected', async () => {
      const dto: InitiateTransactionDto = {
        phoneNumber: '601234567',
        amount: 5000,
        reference: 'TEST-003',
      };

      await expect(service.initiate(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getStatus', () => {
    it('should return transaction status when found', async () => {
      const mockTx = {
        id: 'TRX-TEST001',
        phoneNumber: '671234567',
        amount: 5000,
        operator: Operator.ORANGE,
        reference: 'TEST-001',
        fees: 50,
        status: TransactionStatus.PENDING,
        metadata: {},
        createdAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockTx);

      const result = await service.getStatus('TRX-TEST001');

      expect(result.id).toBe('TRX-TEST001');
      expect(result.status).toBe(TransactionStatus.PENDING);
      expect(result.amount).toBe(5000);
    });

    it('should throw NotFoundException when transaction not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.getStatus('NONEXISTENT')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAll', () => {
    it('should return paginated transactions', async () => {
      const mockTxs = [
        {
          id: 'TRX-001',
          phoneNumber: '671234567',
          amount: 1000,
          operator: Operator.ORANGE,
          reference: 'REF-001',
          fees: 10,
          status: TransactionStatus.PENDING,
          metadata: {},
          createdAt: new Date(),
        },
        {
          id: 'TRX-002',
          phoneNumber: '661234567',
          amount: 2000,
          operator: Operator.MTN,
          reference: 'REF-002',
          fees: 24,
          status: TransactionStatus.SUCCESS,
          metadata: {},
          createdAt: new Date(),
        },
      ];

      mockRepository.findAllPaginated.mockResolvedValue({
        items: mockTxs,
        total: 2,
      });

      const result = await service.getAll(1, 10);

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(result.items[0].id).toBe('TRX-001');
      expect(result.items[1].id).toBe('TRX-002');
    });
  });
});
