import { HttpResponse } from '@apimatic/core-interfaces';
import { getHeader } from '@apimatic/http-headers';
import { detect } from 'detect-browser';
import warning from 'tiny-warning';
import Ptr, { EvalError } from '@json-schema-spec/json-pointer';

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

/**
 * Replace the templated placeholders in error with the platform
 * related information.
 * @param message message value to be updated
 * @returns Updated message value
 */
export function updateErrorMessage(
  message: string,
  response: HttpResponse
): string {
  const placeholders = message.match(/\{\$.*?\}/g);
  const statusCodePlaceholder = placeholders?.includes('{$statusCode}');
  const headerPlaceholders = placeholders?.filter((value) =>
    value.startsWith('{$response.header')
  );
  const bodyPlaceholders = placeholders?.filter((value) =>
    value.startsWith('{$response.body')
  );
  if (statusCodePlaceholder) {
    message = message.replace('{$statusCode}', response.statusCode.toString());
  }
  if (headerPlaceholders) {
    headerPlaceholders.forEach((element) => {
      const headerName = element.split('.').pop()?.slice(0, -1);
      if (typeof headerName !== 'undefined') {
        const value = getHeader(response.headers, headerName) ?? '';
        message = message.replace(element, value);
      }
    });
  }
  if (typeof response.body === 'string') {
    const parsed = JSON.parse(response.body);
    bodyPlaceholders?.forEach((element) => {
      if (element.includes('#')) {
        const nodePointer = element?.split('#').pop()?.slice(0, -1);
        try {
          if (nodePointer) {
            const value = Ptr.parse(nodePointer).eval(parsed);
            message = message.replace(element, JSON.stringify(value));
          }
        } catch (err) {
          if (err instanceof EvalError) {
            message = message.replace(element, '');
          }
        }
      } else {
        message = message.replace(element, JSON.stringify(parsed));
      }
    });
  }
  return message;
}
