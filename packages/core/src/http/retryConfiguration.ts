import { getHeader } from './httpHeaders';
import { HttpMethod } from './httpRequest';

export interface RetryConfiguration {
  maxNumberOfRetries: number;
  retryOnTimeout: boolean;
  retryInterval: number;
  maximumRetryWaitTime: number;
  backoffFactor: number;
  httpStatusCodesToRetry: number[];
  httpMethodsToRetry: string[];
}

export function getRetryWaitTime(
  retryConfig: RetryConfiguration,
  method: HttpMethod,
  allowed_wait_time: number,
  retryCount: number,
  httpCode?: number,
  headers?: Record<string, string>,
  timeoutError?: Error
) {
  let retryWaitTime = 0.0;
  let retry = false;
  let retryAfter = 0;
  if (
    retryConfig.httpMethodsToRetry.includes(method) &&
    retryCount < retryConfig.maxNumberOfRetries
  ) {
    if (timeoutError) {
      retry = retryConfig.retryOnTimeout;
    } else if (
      typeof headers !== 'undefined' &&
      typeof httpCode !== 'undefined'
    ) {
      const retryAfterValue = getHeader(headers, 'retry-after');
      if (retryAfterValue !== null) {
        retryAfter = getRetryAfter(retryAfterValue);
      }
      retry =
        retryAfterValue != null ||
        retryConfig.httpStatusCodesToRetry.includes(httpCode);
    }

    if (retry) {
      const noise = +(Math.random() / 100).toFixed(3);
      let waitTime =
        retryConfig.retryInterval *
          Math.pow(retryConfig.backoffFactor, retryCount) +
        noise;
      waitTime = Math.max(waitTime, retryAfter!);
      if (waitTime <= allowed_wait_time) {
        retryWaitTime = waitTime;
      }
    }
  }
  return retryWaitTime;
}

function getRetryAfter(retryAfter: string) {
  return isNaN(+retryAfter)
    ? (new Date(retryAfter).getTime() - Date.now()) / 1000
    : +retryAfter;
}
