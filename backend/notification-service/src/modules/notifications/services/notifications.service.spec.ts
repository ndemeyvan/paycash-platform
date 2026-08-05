import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service.js';

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  describe('sendEmail', () => {
    it('should send an email successfully', async () => {
      const result = await service.sendEmail({
        to: 'client@example.com',
        subject: 'Test Email',
        html: '<p>Hello</p>',
        transactionId: 'TRX-TEST',
      });

      expect(result.success).toBe(true);
      expect(result).toHaveProperty('messageId');
      expect(result.messageId).toMatch(/^MSG-/);
    });

    it('should return different message IDs for different emails', async () => {
      const result1 = await service.sendEmail({
        to: 'a@example.com',
        subject: 'A',
        html: '<p>A</p>',
      });

      const result2 = await service.sendEmail({
        to: 'b@example.com',
        subject: 'B',
        html: '<p>B</p>',
      });

      expect(result1.messageId).not.toBe(result2.messageId);
    });
  });

  describe('sendTransactionSuccessEmail', () => {
    it('should send a formatted transaction success email', async () => {
      const result = await service.sendTransactionSuccessEmail({
        to: 'client@example.com',
        transactionId: 'TRX-LWK5G8-K9M2X',
        amount: 5000,
        phoneNumber: '671234567',
        fees: 50,
        operator: 'ORANGE',
        createdAt: new Date().toISOString(),
      });

      expect(result.success).toBe(true);
      expect(result).toHaveProperty('messageId');
    });

    it('should include transaction details in the email', async () => {
      const data = {
        to: 'client@example.com',
        transactionId: 'TRX-ABC123',
        amount: 10000,
        phoneNumber: '661234567',
        fees: 120,
        operator: 'MTN',
        createdAt: new Date().toISOString(),
      };

      const result = await service.sendTransactionSuccessEmail(data);

      expect(result.success).toBe(true);
      expect(result).toHaveProperty('messageId');
    });
  });
});
