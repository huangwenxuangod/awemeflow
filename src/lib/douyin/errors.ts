export class DouyinError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'DouyinError';
  }
}

export function toDouyinError(error: unknown): DouyinError {
  if (error instanceof DouyinError) {
    return error;
  }

  if (error instanceof DOMException && error.name === 'TimeoutError') {
    return new DouyinError(504, '请求抖音超时，请稍后重试', 'UPSTREAM_TIMEOUT');
  }

  return new DouyinError(
    502,
    error instanceof Error ? error.message : '抖音解析服务异常',
    'UPSTREAM_ERROR'
  );
}
