interface ApiResponseOptions<T> {
  statusCode?: number;
  message: string;
  data?: T;
}

export default class ApiResponse<T = unknown> {
  public readonly success = true;
  public readonly message: string;
  public readonly data?: T;

  constructor({
    message,
    data,
  }: ApiResponseOptions<T>) {
    this.message = message;

    if (data !== undefined) {
      this.data = data;
    }
  }
}
