import { AxiosRequestConfig } from 'axios';
import { HttpProxyAgent } from 'http-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { ProxySettings } from './httpClient';

/**
 * Configures proxy agents for the axios request based on the URL protocol.
 */
export function configureProxyAgent(
  axiosRequest: AxiosRequestConfig,
  targetUrl: string,
  proxySettings: ProxySettings
): void {
  const { address, port, auth } = proxySettings;
  const reqUrl = new URL(targetUrl);
  const proxyUrl = new URL(address);

  if (port) {
    proxyUrl.port = port.toString();
  }

  if (auth) {
    proxyUrl.username = auth.username;
    proxyUrl.password = auth.password;
  }

  if (reqUrl.protocol === 'https:') {
    axiosRequest.httpsAgent = new HttpsProxyAgent(proxyUrl.toString());
  } else if (reqUrl.protocol === 'http:') {
    axiosRequest.httpAgent = new HttpProxyAgent(proxyUrl.toString());
  }
}
