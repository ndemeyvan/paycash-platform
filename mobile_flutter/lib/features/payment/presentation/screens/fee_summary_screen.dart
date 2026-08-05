import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/format.dart';
import '../../data/models/fee_calculation.dart';
import '../bloc/payment_bloc.dart';

class FeeSummaryScreen extends StatefulWidget {
  const FeeSummaryScreen({super.key});

  static const route = '/fee-summary';

  @override
  State<FeeSummaryScreen> createState() => _FeeSummaryScreenState();
}

class _FeeSummaryScreenState extends State<FeeSummaryScreen> {
  late FeeCalculation _fees;
  late String _phoneNumber;
  late double _amount;

  @override
  void initState() {
    super.initState();
    final state = context.read<PaymentBloc>().state;
    if (state is FeesCalculated) {
      _fees = state.fees;
      _phoneNumber = state.phoneNumber;
      _amount = state.amount;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        title: Text(
          'Resume de la transaction',
          style: GoogleFonts.ibmPlexSans(
            fontWeight: FontWeight.w600,
            fontSize: 18,
            color: AppColors.textPrimary,
          ),
        ),
      ),
      body: BlocConsumer<PaymentBloc, PaymentState>(
        listener: _handleBlocState,
        builder: (context, state) {
          final isLoading = state is PaymentLoading;
          return SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 8),
                  _buildHeader(),
                  const SizedBox(height: 24),
                  _buildSummaryCard(context),
                  const SizedBox(height: 16),
                  _buildConfirmButton(context, isLoading),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        Container(
          width: 64,
          height: 64,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: const LinearGradient(
              colors: [AppColors.primary, AppColors.secondary],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.3),
                blurRadius: 24,
                spreadRadius: 2,
              ),
            ],
          ),
          child: const Icon(Icons.receipt_long, color: AppColors.onPrimary, size: 30),
        ),
        const SizedBox(height: 16),
        Text(
          'Verifiez avant de payer',
          style: GoogleFonts.ibmPlexSans(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          '+237 ${_formatPhone(_phoneNumber)}',
          style: GoogleFonts.ibmPlexSans(
            fontSize: 14,
            fontWeight: FontWeight.w400,
            color: AppColors.textMuted,
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryCard(BuildContext context) {
    final totalCost = _amount + _fees.total;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surface.withValues(alpha: 0.7),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 30,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          _summaryRow('Montant du transfert', '${formatAmount(_amount)} FCFA'),
          const SizedBox(height: 14),
          _summaryRow(
            'Frais de base',
            '+ ${formatAmount(_fees.baseFee)} FCFA',
          ),
          const SizedBox(height: 14),
          _summaryRow('Taxe', '+ ${formatAmount(_fees.tax)} FCFA'),
          const SizedBox(height: 14),
          _summaryRow('Taux', formatPercent(_fees.rate)),
          const Divider(
            color: AppColors.border,
            height: 32,
          ),
          _summaryRow(
            'Total des frais',
            '${formatAmount(_fees.total)} FCFA',
            isHighlighted: true,
          ),
          const SizedBox(height: 8),
          _summaryRow(
            'Total a debiter',
            '${formatAmount(totalCost)} FCFA',
            isTotal: true,
          ),
          const SizedBox(height: 4),
          Text(
            'Frais inclus',
            style: GoogleFonts.ibmPlexSans(
              fontSize: 12,
              fontWeight: FontWeight.w400,
              color: AppColors.textSubtle,
            ),
          ),
        ],
      ),
    );
  }

  Widget _summaryRow(
    String label,
    String value, {
    bool isHighlighted = false,
    bool isTotal = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.ibmPlexSans(
            fontSize: isTotal ? 15 : 14,
            fontWeight: isTotal ? FontWeight.w600 : FontWeight.w400,
            color: isHighlighted || isTotal
                ? AppColors.primary
                : AppColors.textMuted,
          ),
        ),
        Text(
          value,
          style: GoogleFonts.ibmPlexSans(
            fontSize: isTotal ? 20 : 14,
            fontWeight: isTotal ? FontWeight.w700 : FontWeight.w600,
            color: isHighlighted || isTotal
                ? AppColors.primary
                : AppColors.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildConfirmButton(BuildContext context, bool isLoading) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      height: 56,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: LinearGradient(
          colors: isLoading
              ? [AppColors.border, AppColors.surfaceGradient]
              : [AppColors.primary, AppColors.primaryDark],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: isLoading
            ? []
            : [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.35),
                  blurRadius: 20,
                  spreadRadius: 1,
                  offset: const Offset(0, 6),
                ),
              ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: isLoading ? null : () => _handleConfirm(context),
          child: Center(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              child: isLoading
                  ? const SizedBox(
                      key: ValueKey('loading'),
                      height: 28,
                      width: 28,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        valueColor:
                            AlwaysStoppedAnimation<Color>(AppColors.onPrimary),
                      ),
                    )
                  : Row(
                      key: const ValueKey('idle'),
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Confirmer le paiement',
                          style: GoogleFonts.ibmPlexSans(
                            fontSize: 17,
                            fontWeight: FontWeight.w700,
                            color: AppColors.onPrimary,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Icon(
                          Icons.lock_outline,
                          color: AppColors.onPrimary,
                          size: 20,
                        ),
                      ],
                    ),
            ),
          ),
        ),
      ),
    );
  }

  void _handleConfirm(BuildContext context) {
    context.read<PaymentBloc>().add(
          InitiateTransaction(
            phoneNumber: _phoneNumber,
            amount: _amount.toStringAsFixed(0),
          ),
        );
  }

  void _handleBlocState(BuildContext context, PaymentState state) {
    if (state is PaymentSuccess) {
      _showSuccessDialog(context, state.transaction.transactionId,
          state.transaction.status, state.transaction.fees);
    }
    if (state is PaymentError) {
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.error_outline, color: AppColors.white, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    state.message,
                    style: GoogleFonts.ibmPlexSans(
                      fontSize: 14,
                      color: AppColors.white,
                    ),
                  ),
                ),
              ],
            ),
            backgroundColor: AppColors.errorBackground,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12)),
            margin: EdgeInsets.only(
              left: 16,
              right: 16,
              bottom: MediaQuery.of(context).size.height - 120,
            ),
            duration: const Duration(seconds: 4),
          ),
        );
    }
  }

  void _showSuccessDialog(
    BuildContext context,
    String transactionId,
    String status,
    double fees,
  ) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => Dialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 36),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: const LinearGradient(
                    colors: [AppColors.success, AppColors.successDark],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.success.withValues(alpha: 0.3),
                      blurRadius: 20,
                    ),
                  ],
                ),
                child: const Icon(Icons.check, color: AppColors.white, size: 36),
              ),
              const SizedBox(height: 24),
              Text(
                'Transaction initiee',
                style: GoogleFonts.ibmPlexSans(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                status,
                style: GoogleFonts.ibmPlexSans(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 20),
              _detailRow('Transaction', transactionId),
              const SizedBox(height: 10),
              _detailRow('Frais', '${formatAmount(fees)} FCFA'),
              const SizedBox(height: 28),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                    Navigator.of(context)
                        .popUntil((route) => route.isFirst);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.border,
                    foregroundColor: AppColors.textPrimary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    'Fermer',
                    style: GoogleFonts.ibmPlexSans(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.ibmPlexSans(
            fontSize: 13,
            fontWeight: FontWeight.w400,
            color: AppColors.textSubtle,
          ),
        ),
        Text(
          value,
          style: GoogleFonts.ibmPlexSans(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }

  String _formatPhone(String phone) {
    final buffer = StringBuffer();
    for (var i = 0; i < phone.length; i++) {
      if (i > 0 && i % 2 == 0) buffer.write(' ');
      buffer.write(phone[i]);
    }
    return buffer.toString();
  }
}
