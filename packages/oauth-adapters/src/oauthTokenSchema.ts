import { Schema, bigint, optional, string } from '@apimatic/schema';

type OauthTokenSchema = {
  accessToken: ['access_token', Schema<string, string>];
  tokenType: ['token_type', Schema<string, string>];
  expiresIn: ['expires_in', Schema<bigint | undefined, bigint | undefined>];
  scope: ['scope', Schema<string | undefined, string | undefined>];
  expiry: ['expiry', Schema<bigint | undefined, bigint | undefined>];
  refreshToken: [
    'refresh_token',
    Schema<string | undefined, string | undefined>
  ];
};

export const oauthTokenSchemObject: OauthTokenSchema = {
  accessToken: ['access_token', string()],
  tokenType: ['token_type', string()],
  expiresIn: ['expires_in', optional(bigint())],
  scope: ['scope', optional(string())],
  expiry: ['expiry', optional(bigint())],
  refreshToken: ['refresh_token', optional(string())],
};
