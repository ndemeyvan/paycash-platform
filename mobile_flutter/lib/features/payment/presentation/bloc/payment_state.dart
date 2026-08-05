import '../../data/models/fee_calculation.dart';
import '../../data/models/transaction_result.dart';

abstract class PaymentState {}

class PaymentInitial extends PaymentState {}

class PaymentLoading extends PaymentState {}

class FeesCalculated extends PaymentState {
  final FeeCalculation fees;
  final String phoneNumber;
  final double amount;

  FeesCalculated({
    required this.fees,
    required this.phoneNumber,
    required this.amount,
  });
}

class PaymentSuccess extends PaymentState {
  final TransactionResult transaction;

  PaymentSuccess(this.transaction);
}

class PaymentError extends PaymentState {
  final String message;

  PaymentError(this.message);
}
