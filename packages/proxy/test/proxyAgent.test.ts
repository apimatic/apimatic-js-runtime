import { HttpProxyAgent } from 'http-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { configureProxyAgent } from '../src';

describe('configureProxyAgent', () => {
  it('should return proxyAgents when proxySettings are provided', () => {
    const proxySettings = {
      address: 'http://proxy.example.com',
      port: 8080,
      auth: {
        username: 'user',
        password: 'pass',
      },
    };
    const expectedProxyConfig = {
      protocol: 'http:',
      username: 'user',
      password: 'pass',
      host: 'proxy.example.com:8080',
      port: '8080',
    };
    const proxyAgents = configureProxyAgent(proxySettings);
    expect(proxyAgents?.httpAgent).toBeInstanceOf(HttpProxyAgent);
    expect(proxyAgents?.httpsAgent).toBeInstanceOf(HttpsProxyAgent);
    expect(proxyAgents?.httpsAgent.proxy).toMatchObject(expectedProxyConfig);
    expect(proxyAgents?.httpAgent.proxy).toMatchObject(expectedProxyConfig);
  });

  it('should handle HTTPS proxy address correctly', () => {
    const httpsProxySettings = {
      address: 'https://secure-proxy.example.com',
      port: 8443,
      auth: {
        username: 'user',
        password: 'pass',
      },
    };

    const proxyAgents = configureProxyAgent(httpsProxySettings);
    expect(proxyAgents?.httpAgent.proxy.protocol).toBe('https:');
    expect(proxyAgents?.httpsAgent.proxy.protocol).toBe('https:');
  });

  it('should work without explicit port', () => {
    const noPortSettings = {
      address: 'http://proxy.example.com',
      auth: {
        username: 'user',
        password: 'pass',
      },
    };

    const proxyAgents = configureProxyAgent(noPortSettings);
    expect(proxyAgents?.httpAgent).toBeInstanceOf(HttpProxyAgent);
    expect(proxyAgents?.httpsAgent).toBeInstanceOf(HttpsProxyAgent);
    expect(proxyAgents?.httpAgent.proxy.host).toBe('proxy.example.com');
  });

  it('should work without authentication', () => {
    const noAuthSettings = {
      address: 'http://proxy.example.com',
      port: 8080,
    };

    const proxyAgents = configureProxyAgent(noAuthSettings);

    expect(proxyAgents?.httpAgent).toBeInstanceOf(HttpProxyAgent);
    expect(proxyAgents?.httpsAgent).toBeInstanceOf(HttpsProxyAgent);
    expect(proxyAgents?.httpAgent.proxy.username).toBe('');
    expect(proxyAgents?.httpAgent.proxy.password).toBe('');
  });

  it('should work with minimal settings (address only)', () => {
    const minimalSettings = {
      address: 'http://proxy.example.com',
    };

    const proxyAgents = configureProxyAgent(minimalSettings);

    expect(proxyAgents?.httpAgent).toBeInstanceOf(HttpProxyAgent);
    expect(proxyAgents?.httpsAgent).toBeInstanceOf(HttpsProxyAgent);
  });
});
