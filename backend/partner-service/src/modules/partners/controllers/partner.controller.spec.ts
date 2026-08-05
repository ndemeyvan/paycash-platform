import { PartnerController } from './partner.controller.js';
import { PartnerService } from '../services/partner.service.js';
import { Test, TestingModule } from '@nestjs/testing';
import { Operator } from '../../../types/index.js';

describe('PartnerController', () => {
  let controller: PartnerController;

  const mockPartnerService = {
    verifyAccount: jest.fn(),
    getPartnerInfo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartnerController],
      providers: [{ provide: PartnerService, useValue: mockPartnerService }],
    }).compile();

    controller = module.get<PartnerController>(PartnerController);
    jest.clearAllMocks();
  });

  describe('verifyAccount', () => {
    it('should return verification result', async () => {
      const mockResult = {
        phoneNumber: '671234567',
        operator: Operator.ORANGE,
        isValid: true,
        message: 'Compte valide',
      };

      mockPartnerService.verifyAccount.mockResolvedValue(mockResult);

      const result = await controller.verifyAccount({
        phoneNumber: '671234567',
        operator: Operator.ORANGE,
      });

      expect(result).toEqual(mockResult);
      expect(mockPartnerService.verifyAccount).toHaveBeenCalledWith(
        '671234567',
        Operator.ORANGE,
      );
    });
  });

  describe('getPartnerInfo', () => {
    it('should return partner information', async () => {
      const mockInfo = {
        id: 'orange-cm',
        name: 'Orange Money Cameroon',
        operator: Operator.ORANGE,
        apiUrl: 'https://api.orange.cm/money/v1',
        isActive: true,
      };

      mockPartnerService.getPartnerInfo.mockResolvedValue(mockInfo);

      const result = await controller.getPartnerInfo(Operator.ORANGE);

      expect(result).toEqual(mockInfo);
      expect(mockPartnerService.getPartnerInfo).toHaveBeenCalledWith(
        Operator.ORANGE,
      );
    });
  });
});
