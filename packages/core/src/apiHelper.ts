import { detect } from 'detect-browser';
import warning from 'tiny-warning';

/**
 * Validates the protocol and removes duplicate forward slashes
 *
 * @param url URL to clean
 * @returns Sanitized URL
 */
export function sanitizeUrl(url: string): string {
  // ensure that the urls are absolute
  const protocolRegex = /^https?:\/\/[^/]+/;
  const match = url.match(protocolRegex);
  if (match === null) {
    throw new Error(`Invalid URL format: ${url}`);
  }

  // remove redundant double-forward slashes
  const protocol = match[0];
  const queryUrl = url.substring(protocol.length).replace(/\/\/+/g, '/');
  return protocol + queryUrl;
}

/**
 * Create warning for deprecated method usage.
 *
 * This is called once per deprecated method. If this method is called again
 * with the same arguments, no warning is generated.
 *
 * @param methodName Method name for deprecated method
 * @param notice Optional message for deprecation
 */
export function deprecated(methodName: string, notice?: string): void {
  let message = `Method ${methodName} is deprecated.`;
  if (notice) {
    message += ` ${notice}`;
  }

  if (process.env.NODE_ENV !== 'production') {
    warning(false, message);
  }
}

/**
 * Replace the templated placeholders in user-agent with the platform
 * related information.
 * @param userAgent User-agent value to be updated
 * @returns Updated user-agent value
 */
export function updateUserAgent(
  userAgent: string,
  apiVersion?: string,
  detail?: string
): string {
  let updatedAgent = userAgent;
  const result = detect();
  if (result) {
    updatedAgent = updatedAgent.replace('{engine}', result.name);
  }
  if (result?.version) {
    updatedAgent = updatedAgent.replace('{engine-version}', result.version);
  }
  if (result?.os) {
    updatedAgent = updatedAgent.replace('{os-info}', result.os);
  }
  if (typeof apiVersion !== 'undefined') {
    updatedAgent = updatedAgent.replace('{api-version}', apiVersion);
  }
  if (typeof detail !== 'undefined') {
    assertUserAgentDetail(detail);
    updatedAgent = updatedAgent.replace('{detail}', encodeURIComponent(detail));
  }
  return updatedAgent;
}

function assertUserAgentDetail(detail: string) {
  if (detail.length > 128) {
    throw new Error('userAgentDetail length exceeds 128 characters limit');
  }
}
