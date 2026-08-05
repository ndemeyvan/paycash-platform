import 'dart:math';

import 'package:dio/dio.dart';

import '../models/fee_calculation.dart';
import '../models/transaction_result.dart';

class PaymentService {
  final Dio _dio;

  PaymentService({required Dio dio}) : _dio = dio;

  Future<FeeCalculation> calculateFees({required double amount}) async {
    try {
      final response = await _dio.post(
        '/fees/fees/calculate',
        data: {
          'amount': amount,
          'operator': 'ORANGE',
          'transactionType': 'P2P',
          'userPaysFees': true,
        },
      );
      return FeeCalculation.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw Exception(_extractMessage(e));
    }
  }

  Future<TransactionResult> initiateTransaction({
    required String phoneNumber,
    required double amount,
  }) async {
    try {
      final response = await _dio.post(
        '/transactions/transactions/initiate',
        data: {
          'phoneNumber': phoneNumber,
          'amount': amount,
          'reference': _generateReference(),
          'email': 'client.test@example.com',
          'metadata': {'device': 'mobile_flutter'},
        },
      );
      return TransactionResult.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw Exception(_extractMessage(e));
    }
  }

  String _extractMessage(DioException e) {
    if (e.response?.data != null && e.response!.data is Map) {
      final message = (e.response!.data as Map)['message'];
      if (message is String && message.isNotEmpty) return message;
    }
    return 'Erreur de connexion au serveur';
  }

  String _generateReference() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    final random = Random();
    final code = List.generate(
      8,
      (_) => chars[random.nextInt(chars.length)],
    ).join();
    return 'PAY-$code';
  }
}
