abstract class PaymentEvent {}

class CalculateFees extends PaymentEvent {
  final String phoneNumber;
  final String amount;

  CalculateFees({required this.phoneNumber, required this.amount});
}

class InitiateTransaction extends PaymentEvent {
  final String phoneNumber;
  final String amount;

  InitiateTransaction({required this.phoneNumber, required this.amount});
}
