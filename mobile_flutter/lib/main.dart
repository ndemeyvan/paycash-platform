import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';

import 'core/di/injection_container.dart';
import 'core/theme/app_colors.dart';
import 'features/payment/presentation/bloc/payment_bloc.dart';
import 'features/payment/presentation/screens/fee_summary_screen.dart';
import 'features/payment/presentation/screens/payment_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await init();

  runApp(const PayCashApp());
}

class PayCashApp extends StatelessWidget {
  const PayCashApp({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<PaymentBloc>(),
      child: MaterialApp(
        title: 'PayCash',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          brightness: Brightness.dark,
          useMaterial3: true,
          scaffoldBackgroundColor: AppColors.background,
          colorScheme: const ColorScheme.dark(
            primary: AppColors.primary,
            secondary: AppColors.secondary,
            surface: AppColors.surface,
            error: AppColors.error,
            onPrimary: AppColors.onPrimary,
            onSecondary: AppColors.onPrimary,
            onSurface: AppColors.textPrimary,
            onError: AppColors.white,
          ),
          appBarTheme: AppBarTheme(
            backgroundColor: Colors.transparent,
            elevation: 0,
            centerTitle: true,
            titleTextStyle: GoogleFonts.ibmPlexSans(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
            iconTheme: const IconThemeData(color: AppColors.textMuted),
          ),
          textTheme: GoogleFonts.ibmPlexSansTextTheme(
            ThemeData.dark().textTheme,
          ).copyWith(
            headlineLarge: const TextStyle(color: AppColors.textPrimary),
            headlineMedium: const TextStyle(color: AppColors.textPrimary),
            titleLarge: const TextStyle(color: AppColors.textPrimary),
            bodyLarge: const TextStyle(color: AppColors.textBody),
            bodyMedium: const TextStyle(color: AppColors.textMuted),
          ),
        ),
        initialRoute: '/',
        onGenerateRoute: (settings) {
          switch (settings.name) {
            case FeeSummaryScreen.route:
              return MaterialPageRoute(
                builder: (_) => const FeeSummaryScreen(),
              );
            case '/':
            default:
              return MaterialPageRoute(
                builder: (_) => const PaymentScreen(),
              );
          }
        },
      ),
    );
  }
}
