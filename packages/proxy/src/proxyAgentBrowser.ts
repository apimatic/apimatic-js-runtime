import { ProxySettings } from './proxySettings';
import { ProxyAgents } from './proxyAgent';

export function configureProxyAgent(
  _proxySettings: ProxySettings
): ProxyAgents | undefined {
  // tslint:disable-next-line:no-console
  console.warn('Proxy agents are not supported in browser environment');
  return undefined;
}
