import { bigint, object, optional, Schema, string } from '@apimatic/schema';
import { OAuthToken } from './oAuthToken';

/** OAuth 2 Authorization endpoint response */
export interface OAuthTokenWithAdditionalProperties extends OAuthToken {
  [key: string]: unknown;
}

export const oAuthTokenWithAdditionalPropertiesSchema: Schema<OAuthTokenWithAdditionalProperties> = object(
  {
    accessToken: ['access_token', string()],
    tokenType: ['token_type', string()],
    expiresIn: ['expires_in', optional(bigint())],
    scope: ['scope', optional(string())],
    expiry: ['expiry', optional(bigint())],
    refreshToken: ['refresh_token', optional(string())],
  }
);
