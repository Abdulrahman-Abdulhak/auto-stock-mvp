/**
 * Retrieves the value of a cookie by name from `document.cookie`.
 * Returns the decoded value when present, or `null` if the cookie is not set.
 *
 * @param name - Cookie name to read
 * @returns Decoded cookie value or `null` if not found
 */
export function getCookie(name: string) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

/**
 * Deletes a cookie by name by setting it with `Max-Age=0` and `Path=/`.
 * Uses `SameSite=Lax` to keep deletion behavior consistent across browsers.
 *
 * @param name - Cookie name to delete
 */
export function deleteCookie(name: string) {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}
