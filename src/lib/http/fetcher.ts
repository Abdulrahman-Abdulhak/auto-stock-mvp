import { HttpError } from "./errors";

type Json =
  | Record<string, unknown>
  | unknown[]
  | string
  | number
  | boolean
  | null;

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: Json | FormData;
  token?: string;
  params?: [string, unknown][];
};

type ErrorResponse = {
  success: false;
  message: string;
};

type SuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

/**
 * Executes a network request and returns a typed success response.
 *
 * This utility centralizes request execution and response handling, providing:
 * - A consistent success shape for consumers
 * - A unified error surface via `HttpError`
 * - A single place to evolve request behavior over time
 *
 * Callers are expected to handle both successful results and thrown errors,
 * without relying on transport-specific assumptions.
 *
 * @typeParam T - The expected shape of the successful response payload.
 * @throws {HttpError} When the request fails or the response is invalid.
 */
export async function apiFetch<T>(
  url: string,
  { body, headers, params, token, ...init }: RequestOptions = {}
): Promise<SuccessResponse<T> | HttpError> {
  const isFormData = body instanceof FormData;

  const urlToUse = params?.length
    ? `${url}?${params.map((param) => `${param[0]}=${param[1]}`).join("&")}`
    : url;

  console.log("Fetching:", urlToUse);
  console.log("With headers:", {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(headers ?? {}),
  });
  console.log(
    "With Body:",
    body !== undefined ? (isFormData ? body : JSON.stringify(body)) : undefined
  );
  console.log("With options:", init);

  const res = await fetch(urlToUse, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(headers ?? {}),
    },
    body:
      body !== undefined
        ? isFormData
          ? body
          : JSON.stringify(body)
        : undefined,
    ...init,
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const data = isJson
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    // TODO: continue translations
    return {
      ...new HttpError(
        `Request failed: ${(data as ErrorResponse)?.message ?? res.status}`,
        res.status,
        data
      ),
    };
  }

  console.log("Returned response:", data);

  return data as SuccessResponse<T>;
}
