import { Operator } from '../../../types/index.js';

export interface IPartnerVerifyRequest {
  phoneNumber: string;
  operator: Operator;
}

export interface IPartnerVerifyResponse {
  phoneNumber: string;
  operator: Operator;
  isValid: boolean;
  message: string;
}
