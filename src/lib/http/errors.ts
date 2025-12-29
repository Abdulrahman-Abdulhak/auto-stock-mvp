/**
 * Represents an HTTP-level failure that occurred during a request lifecycle.
 *
 * This error type is designed to carry structured information about a failed
 * operation, including a human-readable message, an HTTP status code, and
 * optional diagnostic details.
 *
 * It is intentionally not tied to any specific transport, client, or framework,
 * making it suitable for use across API layers, fetch utilities, and domain logic.
 */
export class HttpError {
  /**
   * Human-readable description of the failure.
   * Intended for logging, debugging, or user-facing messaging depending on context.
   */
  message: string;

  /**
   * Indicates that the operation did not complete successfully.
   * This value is fixed to allow reliable discrimination from success responses.
   */
  success = false as const;

  /**
   * Creates a new HTTP error instance.
   *
   * @param message - Description of what went wrong.
   * @param status - HTTP status code associated with the failure.
   * @param details - Optional contextual data to aid debugging or error handling.
   */
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    this.message = message;
  }
}
