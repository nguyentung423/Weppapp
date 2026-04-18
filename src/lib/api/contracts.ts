export type ApiMeta = {
  requestId: string;
  timestamp: string;
};

export type ApiErrorShape = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta: ApiMeta;
};

export type ApiFailure = {
  success: false;
  error: ApiErrorShape;
  meta: ApiMeta;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
