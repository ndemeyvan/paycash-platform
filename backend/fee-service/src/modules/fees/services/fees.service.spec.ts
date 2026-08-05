import { Test, TestingModule } from '@nestjs/testing';
import { FeesService } from './fees.service.js';
import {
  Operator,
  TransactionType,
  roundToTwo,
  FEE_TAX_RATE,
} from '../../../types/index.js';
import { BadRequestException } from '@nestjs/common';

describe('FeesService', () => {
  let service: FeesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeesService],
    }).compile();

    service = module.get<FeesService>(FeesService);
  });

  describe('calculate', () => {
    describe('Orange fees', () => {
      it('should calculate fees for amount <= 5000 XAF (1% rate)', async () => {
        const result = await service.calculate(
          5000,
          Operator.ORANGE,
          TransactionType.P2P,
          true,
        );

        expect(result.total).toBe(51);
        expect(result.baseFee).toBe(50);
        expect(result.tax).toBe(1);
        expect(result.rate).toBe(0.01);
        expect(result.grossAmount).toBe(5000);
        expect(result.netAmount).toBe(4949);
      });

      it('should calculate fees for amount between 5001-50000 XAF (0.5% rate)', async () => {
        const result = await service.calculate(
          10000,
          Operator.ORANGE,
          TransactionType.P2P,
          true,
        );

        const expectedBaseFee = roundToTwo(50 + (10000 - 5000) * 0.005);
        const expectedTax = roundToTwo(expectedBaseFee * FEE_TAX_RATE);
        const expectedTotal = roundToTwo(expectedBaseFee + expectedTax);

        expect(result.total).toBe(expectedTotal);
        expect(result.rate).toBe(0.005);
      });

      it('should calculate fees for amount > 50000 XAF (0.3% rate)', async () => {
        const result = await service.calculate(
          100000,
          Operator.ORANGE,
          TransactionType.P2P,
          true,
        );

        const expectedBaseFee = roundToTwo(275 + (100000 - 50000) * 0.003);
        const expectedTax = roundToTwo(expectedBaseFee * FEE_TAX_RATE);
        const expectedTotal = roundToTwo(expectedBaseFee + expectedTax);

        expect(result.total).toBe(expectedTotal);
        expect(result.rate).toBe(0.003);
      });
    });

    describe('MTN fees', () => {
      it('should calculate fees for amount <= 5000 XAF (1.2% rate)', async () => {
        const result = await service.calculate(
          5000,
          Operator.MTN,
          TransactionType.P2P,
          true,
        );

        expect(result.baseFee).toBe(60);
        expect(result.rate).toBe(0.012);
      });

      it('should calculate fees for amount between 5001-50000 XAF (0.6% rate)', async () => {
        const result = await service.calculate(
          30000,
          Operator.MTN,
          TransactionType.P2P,
          true,
        );

        const expectedBaseFee = roundToTwo(60 + (30000 - 5000) * 0.006);
        expect(result.baseFee).toBe(expectedBaseFee);
        expect(result.rate).toBe(0.006);
      });

      it('should calculate fees for amount > 50000 XAF (0.4% rate)', async () => {
        const result = await service.calculate(
          75000,
          Operator.MTN,
          TransactionType.P2P,
          true,
        );

        const expectedBaseFee = roundToTwo(330 + (75000 - 50000) * 0.004);
        expect(result.baseFee).toBe(expectedBaseFee);
        expect(result.rate).toBe(0.004);
      });
    });

    describe('userPaysFees option', () => {
      it('should deduct fees from amount when userPaysFees is true', async () => {
        const result = await service.calculate(
          5000,
          Operator.ORANGE,
          TransactionType.P2P,
          true,
        );

        expect(result.netAmount).toBeLessThan(result.grossAmount);
        expect(result.netAmount).toBe(4949);
      });

      it('should not deduct fees when userPaysFees is false', async () => {
        const result = await service.calculate(
          5000,
          Operator.ORANGE,
          TransactionType.P2P,
          false,
        );

        expect(result.netAmount).toBe(result.grossAmount);
        expect(result.netAmount).toBe(5000);
      });
    });

    describe('error cases', () => {
      it('should throw BadRequestException for unsupported operator', async () => {
        await expect(
          service.calculate(
            5000,
            'UNSUPPORTED' as Operator,
            TransactionType.P2P,
            true,
          ),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('boundary values', () => {
      it('should handle minimum amount (100 XAF)', async () => {
        const result = await service.calculate(
          100,
          Operator.ORANGE,
          TransactionType.P2P,
          true,
        );

        expect(result.total).toBeGreaterThan(0);
        expect(result.baseFee).toBe(1);
      });

      it('should handle maximum amount (1,000,000 XAF)', async () => {
        const result = await service.calculate(
          1000000,
          Operator.ORANGE,
          TransactionType.P2P,
          true,
        );

        const expectedBaseFee = roundToTwo(275 + (1000000 - 50000) * 0.003);
        expect(result.baseFee).toBe(expectedBaseFee);
      });
    });
  });
});
