class TransactionResult {
  final String transactionId;
  final String status;
  final String signature;
  final double fees;
  final DateTime createdAt;

  TransactionResult({
    required this.transactionId,
    required this.status,
    required this.signature,
    required this.fees,
    required this.createdAt,
  });

  factory TransactionResult.fromJson(Map<String, dynamic> json) {
    return TransactionResult(
      transactionId: json['transactionId'] as String,
      status: json['status'] as String,
      signature: json['signature'] as String,
      fees: (json['fees'] as num).toDouble(),
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
