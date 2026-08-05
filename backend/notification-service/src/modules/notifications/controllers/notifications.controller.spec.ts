import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from '../services/notifications.service.js';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  const mockNotificationsService = {
    sendEmail: jest.fn(),
    sendTransactionSuccessEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should call sendEmail on service', async () => {
      const mockResult = { success: true, messageId: 'MSG-123' };
      mockNotificationsService.sendEmail.mockResolvedValue(mockResult);

      const result = await controller.sendEmail({
        to: 'client@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        transactionId: 'TRX-001',
      });

      expect(result).toEqual(mockResult);
      expect(mockNotificationsService.sendEmail).toHaveBeenCalledWith({
        to: 'client@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        transactionId: 'TRX-001',
      });
    });
  });

  describe('sendTransactionSuccessEmail', () => {
    it('should call sendTransactionSuccessEmail on service', async () => {
      const mockResult = { success: true, messageId: 'MSG-456' };
      mockNotificationsService.sendTransactionSuccessEmail.mockResolvedValue(
        mockResult,
      );

      const dto = {
        to: 'client@example.com',
        transactionId: 'TRX-LWK5G8-K9M2X',
        amount: 5000,
        phoneNumber: '671234567',
        fees: 50,
        operator: 'ORANGE',
        createdAt: new Date().toISOString(),
      };

      const result = await controller.sendTransactionSuccessEmail(dto);

      expect(result).toEqual(mockResult);
      expect(
        mockNotificationsService.sendTransactionSuccessEmail,
      ).toHaveBeenCalledWith({
        to: dto.to,
        transactionId: dto.transactionId,
        amount: dto.amount,
        phoneNumber: dto.phoneNumber,
        fees: dto.fees,
        operator: dto.operator,
        createdAt: dto.createdAt,
      });
    });
  });
});
