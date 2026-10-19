export interface ApiErrorDetail {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
