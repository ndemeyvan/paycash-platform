import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../bloc/payment_bloc.dart';
import 'fee_summary_screen.dart';

class PaymentScreen extends StatefulWidget {
  const PaymentScreen({super.key});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();
  final _amountController = TextEditingController();

  String? _phoneError;
  String? _amountError;

  @override
  void dispose() {
    _phoneController.dispose();
    _amountController.dispose();
    super.dispose();
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
          'PayCash',
          style: GoogleFonts.ibmPlexSans(
            fontWeight: FontWeight.w700,
            fontSize: 22,
            color: AppColors.textPrimary,
          ),
        ),
        automaticallyImplyLeading: false,
      ),
      body: BlocConsumer<PaymentBloc, PaymentState>(
        listener: _handleBlocState,
        builder: (context, state) {
          return SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 12),
                    _buildHeader(),
                    const SizedBox(height: 28),
                    _buildSecurityBadge(),
                    const SizedBox(height: 24),
                    _buildPaymentCard(context),
                    const SizedBox(height: 16),
                    _buildPayButton(context, state),
                  ],
                ),
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
          child: const Icon(Icons.send_rounded, color: AppColors.onPrimary, size: 30),
        ),
        const SizedBox(height: 20),
        Text(
          'Envoyer de l\'argent',
          style: GoogleFonts.ibmPlexSans(
            fontSize: 24,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Transfert instantane et securise',
          style: GoogleFonts.ibmPlexSans(
            fontSize: 14,
            fontWeight: FontWeight.w400,
            color: AppColors.textSubtle,
          ),
        ),
      ],
    );
  }

  Widget _buildSecurityBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.surface.withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.lock_outline, color: AppColors.success, size: 16),
          const SizedBox(width: 8),
          Text(
            'Transaction securisee',
            style: GoogleFonts.ibmPlexSans(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: AppColors.success,
            ),
          ),
          const SizedBox(width: 12),
          const Icon(Icons.verified_user, color: AppColors.success, size: 16),
          const SizedBox(width: 8),
          Text(
            'Chiffree de bout en bout',
            style: GoogleFonts.ibmPlexSans(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: AppColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentCard(BuildContext context) {
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Destinataire',
            style: GoogleFonts.ibmPlexSans(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: AppColors.textSubtle,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 10),
          _buildPhoneField(),
          const SizedBox(height: 22),
          Text(
            'Montant',
            style: GoogleFonts.ibmPlexSans(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: AppColors.textSubtle,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 10),
          _buildAmountField(),
        ],
      ),
    );
  }

  Widget _buildPhoneField() {
    return TextFormField(
      key: const Key('phoneNumberField'),
      controller: _phoneController,
      keyboardType: TextInputType.phone,
      maxLength: 9,
      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
      style: GoogleFonts.ibmPlexSans(
        fontSize: 18,
        fontWeight: FontWeight.w500,
        color: AppColors.textPrimary,
      ),
      cursorColor: AppColors.primary,
      decoration: _inputDecoration(
        label: 'Numero de telephone',
        hint: '6 12 34 56 78',
        prefixIcon: Center(
          widthFactor: 1,
          child: Padding(
            padding: const EdgeInsets.only(left: 14),
            child: Text(
              '+237',
              style: GoogleFonts.ibmPlexSans(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.textSubtle,
              ),
            ),
          ),
        ),
        prefixIconIsWidget: true,
        errorText: _phoneError,
      ),
      onChanged: (_) {
        if (_phoneError != null) {
          setState(() => _phoneError = null);
        }
      },
      onFieldSubmitted: (_) => FocusScope.of(context).nextFocus(),
    );
  }

  Widget _buildAmountField() {
    return TextFormField(
      key: const Key('amountField'),
      controller: _amountController,
      keyboardType: TextInputType.number,
      inputFormatters: [
        FilteringTextInputFormatter.digitsOnly,
        _AmountFormatter(),
      ],
      style: GoogleFonts.ibmPlexSans(
        fontSize: 28,
        fontWeight: FontWeight.w600,
        color: AppColors.primary,
      ),
      textAlign: TextAlign.center,
      cursorColor: AppColors.primary,
      decoration: _inputDecoration(
        label: 'Montant du transfert',
        hint: '0',
        suffixText: 'FCFA',
        errorText: _amountError,
      ),
      onChanged: (_) {
        if (_amountError != null) {
          setState(() => _amountError = null);
        }
      },
      onFieldSubmitted: (_) => _handleSubmit(context),
    );
  }

  InputDecoration _inputDecoration({
    required String label,
    required String hint,
    Widget? prefixIcon,
    bool prefixIconIsWidget = false,
    String? suffixText,
    String? errorText,
  }) {
    return InputDecoration(
      labelText: label,
      hintText: hint,
      suffixText: suffixText,
      prefixIcon: prefixIconIsWidget
          ? prefixIcon
          : (prefixIcon != null
              ? Padding(
                  padding: const EdgeInsets.only(left: 14, right: 8),
                  child: prefixIcon,
                )
              : null),
      errorText: errorText,
      filled: true,
      fillColor: AppColors.onPrimary,
      counterText: '',
      labelStyle: GoogleFonts.ibmPlexSans(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        color: AppColors.textSubtle,
      ),
      hintStyle: GoogleFonts.ibmPlexSans(
        fontSize: 18,
        fontWeight: FontWeight.w400,
        color: AppColors.border,
      ),
      suffixStyle: GoogleFonts.ibmPlexSans(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: AppColors.textSubtle,
      ),
      errorStyle: GoogleFonts.ibmPlexSans(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        color: AppColors.error,
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.primary, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.error),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.error, width: 2),
      ),
    );
  }

  Widget _buildPayButton(BuildContext context, PaymentState state) {
    final isLoading = state is PaymentLoading;

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
          onTap: isLoading ? null : () => _handleSubmit(context),
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
                          'Payer',
                          style: GoogleFonts.ibmPlexSans(
                            fontSize: 17,
                            fontWeight: FontWeight.w700,
                            color: AppColors.onPrimary,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Icon(
                          Icons.arrow_forward_rounded,
                          color: AppColors.onPrimary,
                          size: 22,
                        ),
                      ],
                    ),
            ),
          ),
        ),
      ),
    );
  }

  void _handleSubmit(BuildContext context) {
    final phoneNumber = _phoneController.text.trim();
    final amount = _amountController.text.replaceAll(RegExp(r'[^\d]'), '');

    setState(() {
      _phoneError = _validatePhoneNumber(phoneNumber);
      _amountError = _validateAmount(amount);
    });

    if (_phoneError != null || _amountError != null) return;

    context.read<PaymentBloc>().add(
          CalculateFees(phoneNumber: phoneNumber, amount: amount),
        );
  }

  String? _validatePhoneNumber(String value) {
    if (value.isEmpty) return 'Le numero est requis';
    final regex = RegExp(r'^6[0-9]{8}$');
    if (!regex.hasMatch(value)) return 'Format invalide (ex: 612345678)';
    return null;
  }

  String? _validateAmount(String value) {
    if (value.isEmpty) return 'Le montant est requis';
    final amount = double.tryParse(value);
    if (amount == null) return 'Montant invalide';
    if (amount < 100) return 'Montant minimum : 100 FCFA';
    if (amount > 5000000) return 'Montant maximum : 5 000 000 FCFA';
    return null;
  }

  void _handleBlocState(BuildContext context, PaymentState state) {
    if (state is FeesCalculated) {
      Navigator.of(context).pushNamed(FeeSummaryScreen.route);
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
}

class _AmountFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final digits = newValue.text.replaceAll(RegExp(r'[^\d]'), '');
    if (digits.isEmpty) {
      return newValue.copyWith(
        text: '',
        selection: const TextSelection.collapsed(offset: 0),
      );
    }

    final buffer = StringBuffer();
    final length = digits.length;
    for (var i = 0; i < length; i++) {
      if (i > 0 && (length - i) % 3 == 0) {
        buffer.write(' ');
      }
      buffer.write(digits[i]);
    }
    final formatted = buffer.toString();

    final offsetDelta = formatted.length - oldValue.text.length;
    final newOffset = newValue.selection.baseOffset + offsetDelta;

    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(
        offset: newOffset.clamp(0, formatted.length),
      ),
    );
  }
}
