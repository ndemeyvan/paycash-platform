import '../models/fee_calculation.dart';
import '../models/transaction_result.dart';
import '../services/payment_service.dart';

class PaymentRepository {
  final PaymentService _paymentService;

  PaymentRepository({required PaymentService paymentService})
      : _paymentService = paymentService;

  Future<FeeCalculation> calculateFees({required double amount}) {
    return _paymentService.calculateFees(amount: amount);
  }

  Future<TransactionResult> initiateTransaction({
    required String phoneNumber,
    required double amount,
  }) {
    return _paymentService.initiateTransaction(
      phoneNumber: phoneNumber,
      amount: amount,
    );
  }
}
