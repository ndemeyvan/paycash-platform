import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';

import 'payment_event.dart';
import 'payment_state.dart';
import '../../data/repositories/payment_repository.dart';

export 'payment_event.dart';
export 'payment_state.dart';

class PaymentBloc extends Bloc<PaymentEvent, PaymentState> {
  final PaymentRepository _paymentRepository;

  PaymentBloc({required PaymentRepository paymentRepository})
      : _paymentRepository = paymentRepository,
        super(PaymentInitial()) {
    on<CalculateFees>(_onCalculateFees);
    on<InitiateTransaction>(_onInitiateTransaction);
  }

  Future<void> _onCalculateFees(
    CalculateFees event,
    Emitter<PaymentState> emit,
  ) async {
    emit(PaymentLoading());

    try {
      final amount = double.parse(event.amount);
      final fees = await _paymentRepository.calculateFees(amount: amount);
      emit(FeesCalculated(
        fees: fees,
        phoneNumber: event.phoneNumber,
        amount: amount,
      ));
    } catch (e) {
      emit(PaymentError('Erreur lors du calcul des frais. Veuillez reessayer.'));
    }
  }

  Future<void> _onInitiateTransaction(
    InitiateTransaction event,
    Emitter<PaymentState> emit,
  ) async {
    emit(PaymentLoading());

    try {
      final amount = double.parse(event.amount);
      final result = await _paymentRepository.initiateTransaction(
        phoneNumber: event.phoneNumber,
        amount: amount,
      );
      emit(PaymentSuccess(result));
    } catch (e) {
      emit(PaymentError('Erreur lors du paiement. Veuillez reessayer.'));
    }
  }
}
