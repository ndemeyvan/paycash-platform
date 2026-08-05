import { Test, TestingModule } from '@nestjs/testing';
import { PartnerService } from './partner.service.js';
import { Operator } from '../../../types/index.js';

describe('PartnerService', () => {
  let service: PartnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PartnerService],
    }).compile();

    service = module.get<PartnerService>(PartnerService);
  });

  describe('verifyAccount', () => {
    it('should return verification result for Orange', async () => {
      const result = await service.verifyAccount('671234567', Operator.ORANGE);

      expect(result).toHaveProperty('phoneNumber', '671234567');
      expect(result).toHaveProperty('operator', Operator.ORANGE);
      expect(result).toHaveProperty('isValid');
      expect(typeof result.isValid).toBe('boolean');
      expect(result).toHaveProperty('message');
    });

    it('should return verification result for MTN', async () => {
      const result = await service.verifyAccount('661234567', Operator.MTN);

      expect(result).toHaveProperty('phoneNumber', '661234567');
      expect(result).toHaveProperty('operator', Operator.MTN);
      expect(result).toHaveProperty('isValid');
    });

    it('should handle different phone numbers', async () => {
      const results = await Promise.all([
        service.verifyAccount('651234567', Operator.ORANGE),
        service.verifyAccount('681234567', Operator.MTN),
        service.verifyAccount('691234567', Operator.ORANGE),
      ]);

      results.forEach((result) => {
        expect(result).toHaveProperty('phoneNumber');
        expect(result).toHaveProperty('operator');
        expect(result).toHaveProperty('isValid');
      });
    });
  });

  describe('getPartnerInfo', () => {
    it('should return Orange partner info', async () => {
      const result = await service.getPartnerInfo(Operator.ORANGE);

      expect(result).not.toBeNull();
      expect(result).toHaveProperty('id', 'orange-cm');
      expect(result).toHaveProperty('name', 'Orange Money Cameroon');
      expect(result).toHaveProperty('isActive', true);
    });

    it('should return MTN partner info', async () => {
      const result = await service.getPartnerInfo(Operator.MTN);

      expect(result).not.toBeNull();
      expect(result).toHaveProperty('id', 'mtn-cm');
      expect(result).toHaveProperty('name', 'MTN Mobile Money Cameroon');
      expect(result).toHaveProperty('isActive', true);
    });

    it('should return null for unknown operator', async () => {
      const result = await service.getPartnerInfo('UNKNOWN' as Operator);

      expect(result).toBeNull();
    });
  });
});
