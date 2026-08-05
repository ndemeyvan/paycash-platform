import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import {
  Operator,
  TransactionType,
  FEE_TAX_RATE,
  roundToTwo,
  type IFeeResponse,
} from '../../../types/index.js';

interface FeeBracket {
  maxAmount: number;
  rate: number;
  flatFee: number;
  baseAmount: number;
}

@Injectable()
export class FeesService {
  private readonly logger = new Logger(FeesService.name);

  private readonly orangeFeeBrackets: FeeBracket[] = [
    { maxAmount: 5000, rate: 0.01, flatFee: 0, baseAmount: 0 },
    { maxAmount: 50000, rate: 0.005, flatFee: 50, baseAmount: 5000 },
    { maxAmount: Infinity, rate: 0.003, flatFee: 275, baseAmount: 50000 },
  ];

  private readonly mtnFeeBrackets: FeeBracket[] = [
    { maxAmount: 5000, rate: 0.012, flatFee: 0, baseAmount: 0 },
    { maxAmount: 50000, rate: 0.006, flatFee: 60, baseAmount: 5000 },
    { maxAmount: Infinity, rate: 0.004, flatFee: 330, baseAmount: 50000 },
  ];

  async calculate(
    amount: number,
    operator: Operator,
    transactionType: TransactionType,
    userPaysFees: boolean,
  ): Promise<IFeeResponse> {
    this.logger.log(
      `Calculating fees: ${amount} XAF, ${operator}, ${transactionType}`,
    );

    const brackets =
      operator === Operator.ORANGE
        ? this.orangeFeeBrackets
        : operator === Operator.MTN
          ? this.mtnFeeBrackets
          : null;

    if (!brackets) {
      throw new BadRequestException(`Opérateur non supporté: ${operator}`);
    }

    const bracket = brackets.find((b) => amount <= b.maxAmount);
    if (!bracket) {
      throw new BadRequestException(
        `Montant hors plage pour ${operator}: ${amount} XAF`,
      );
    }

    const baseFee = roundToTwo(
      bracket.flatFee + (amount - bracket.baseAmount) * bracket.rate,
    );
    const tax = roundToTwo(baseFee * FEE_TAX_RATE);
    const total = roundToTwo(baseFee + tax);
    const netAmount = userPaysFees ? roundToTwo(amount - total) : amount;

    this.logger.debug(
      `Fees: total=${total}, base=${baseFee}, tax=${tax}, net=${netAmount}`,
    );

    await Promise.resolve();

    return {
      total,
      baseFee,
      tax,
      rate: bracket.rate,
      transactionType,
      grossAmount: amount,
      netAmount,
    };
  }
}
