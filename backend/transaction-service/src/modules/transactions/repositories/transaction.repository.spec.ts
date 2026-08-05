import { Test, TestingModule } from '@nestjs/testing';
import { TransactionRepository } from './transaction.repository.js';
import { Transaction } from '../entities/transaction.entity.js';
import { TransactionStatus, Operator } from '../../../types/index.js';

describe('TransactionRepository', () => {
  let repository: TransactionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionRepository],
    }).compile();

    repository = module.get<TransactionRepository>(TransactionRepository);
  });

  describe('save', () => {
    it('should save and return a transaction', async () => {
      const tx = new Transaction();
      tx.id = 'TRX-001';
      tx.phoneNumber = '671234567';
      tx.amount = 5000;
      tx.operator = Operator.ORANGE;
      tx.reference = 'REF-001';
      tx.fees = 50;
      tx.status = TransactionStatus.PENDING;
      tx.metadata = {};
      tx.createdAt = new Date();

      const saved = await repository.save(tx);

      expect(saved.id).toBe('TRX-001');
      expect(saved.amount).toBe(5000);
    });
  });

  describe('findById', () => {
    it('should find a saved transaction', async () => {
      const tx = new Transaction();
      tx.id = 'TRX-002';
      tx.phoneNumber = '661234567';
      tx.amount = 2000;
      tx.operator = Operator.MTN;
      tx.reference = 'REF-002';
      tx.fees = 24;
      tx.status = TransactionStatus.PENDING;
      tx.metadata = {};
      tx.createdAt = new Date();

      await repository.save(tx);
      const found = await repository.findById('TRX-002');

      expect(found).not.toBeNull();
      expect(found!.id).toBe('TRX-002');
    });

    it('should return null for non-existent transaction', async () => {
      const result = await repository.findById('NONEXISTENT');
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all saved transactions', async () => {
      const tx = new Transaction();
      tx.id = 'TRX-003';
      tx.phoneNumber = '651234567';
      tx.amount = 1000;
      tx.operator = Operator.ORANGE;
      tx.reference = 'REF-003';
      tx.fees = 10;
      tx.status = TransactionStatus.SUCCESS;
      tx.metadata = {};
      tx.createdAt = new Date();

      await repository.save(tx);
      const all = await repository.findAll();

      expect(all.length).toBeGreaterThan(0);
    });
  });

  describe('updateStatus', () => {
    it('should update transaction status', async () => {
      const tx = new Transaction();
      tx.id = 'TRX-004';
      tx.phoneNumber = '671234567';
      tx.amount = 5000;
      tx.operator = Operator.ORANGE;
      tx.reference = 'REF-004';
      tx.fees = 50;
      tx.status = TransactionStatus.PENDING;
      tx.metadata = {};
      tx.createdAt = new Date();

      await repository.save(tx);
      const updated = await repository.updateStatus(
        'TRX-004',
        TransactionStatus.SUCCESS,
      );

      expect(updated).not.toBeNull();
      expect(updated!.status).toBe(TransactionStatus.SUCCESS);
      expect(updated!.updatedAt).toBeDefined();
    });

    it('should update status with error message for failed transactions', async () => {
      const tx = new Transaction();
      tx.id = 'TRX-005';
      tx.phoneNumber = '661234567';
      tx.amount = 2000;
      tx.operator = Operator.MTN;
      tx.reference = 'REF-005';
      tx.fees = 24;
      tx.status = TransactionStatus.PENDING;
      tx.metadata = {};
      tx.createdAt = new Date();

      await repository.save(tx);
      const updated = await repository.updateStatus(
        'TRX-005',
        TransactionStatus.FAILED,
        'Solde insuffisant',
      );

      expect(updated!.status).toBe(TransactionStatus.FAILED);
      expect(updated!.errorMessage).toBe('Solde insuffisant');
    });

    it('should return null for non-existent transaction', async () => {
      const result = await repository.updateStatus(
        'NONEXISTENT',
        TransactionStatus.SUCCESS,
      );

      expect(result).toBeNull();
    });
  });
});
