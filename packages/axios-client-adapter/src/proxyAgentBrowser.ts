import { AxiosRequestConfig } from 'axios';
import { ProxySettings } from './httpClient';

export function configureProxyAgent(
  _axiosRequest: AxiosRequestConfig,
  _targetUrl: string,
  _proxySettings: ProxySettings
): void {
  // tslint:disable-next-line:no-console
  console.warn('Proxy settings are ignored in the browser environment.');
}
