export interface IEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ITransactionEmailData {
  to: string;
  transactionId: string;
  amount: number;
  phoneNumber: string;
  fees: number;
  operator: string;
  createdAt: string;
}
