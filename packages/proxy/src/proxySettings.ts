export interface ProxySettings {
  address: string;
  port?: number;
  auth?: {
    username: string;
    password: string;
  };
}
