class FeeCalculation {
  final double total;
  final double baseFee;
  final double tax;
  final double rate;
  final String transactionType;
  final double grossAmount;
  final double netAmount;

  FeeCalculation({
    required this.total,
    required this.baseFee,
    required this.tax,
    required this.rate,
    required this.transactionType,
    required this.grossAmount,
    required this.netAmount,
  });

  factory FeeCalculation.fromJson(Map<String, dynamic> json) {
    return FeeCalculation(
      total: (json['total'] as num).toDouble(),
      baseFee: (json['baseFee'] as num).toDouble(),
      tax: (json['tax'] as num).toDouble(),
      rate: (json['rate'] as num).toDouble(),
      transactionType: json['transactionType'] as String,
      grossAmount: (json['grossAmount'] as num).toDouble(),
      netAmount: (json['netAmount'] as num).toDouble(),
    );
  }
}
