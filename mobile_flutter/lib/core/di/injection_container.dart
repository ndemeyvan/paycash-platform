import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';

import '../../features/payment/data/repositories/payment_repository.dart';
import '../../features/payment/data/services/payment_service.dart';
import '../../features/payment/presentation/bloc/payment_bloc.dart';

final sl = GetIt.instance;

Future<void> init() async {
  _initCore();
  _initPayment();
}

void _initCore() {
  const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:4000/api',
  );

  sl.registerLazySingleton<Dio>(
    () => Dio(BaseOptions(
      baseUrl: apiBaseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization':
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3ODU5MjU1NDgsImV4cCI6MTc4NjAxMTk0OH0.F4AzXuscN9fukAHYl5fihiUMg6FUVNZ1KDPciQOcufs',
      },
    )),
  );
}

void _initPayment() {
  sl.registerLazySingleton<PaymentService>(
    () => PaymentService(dio: sl()),
  );

  sl.registerLazySingleton<PaymentRepository>(
    () => PaymentRepository(paymentService: sl()),
  );

  sl.registerFactory<PaymentBloc>(
    () => PaymentBloc(paymentRepository: sl()),
  );
}
