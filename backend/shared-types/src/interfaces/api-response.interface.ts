export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta: {
    timestamp: string;
    requestId: string;
    path?: string;
  };
}
