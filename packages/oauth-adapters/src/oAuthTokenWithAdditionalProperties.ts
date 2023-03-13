import { expandoObject, Schema } from '@apimatic/schema';
import { OAuthToken } from './oAuthToken';
import { oauthTokenSchemObject } from './oauthTokenSchema';

/** OAuth 2 Authorization endpoint response */
export interface OAuthTokenWithAdditionalProperties extends OAuthToken {
  [key: string]: unknown;
}

export const oAuthTokenSchema: Schema<OAuthToken> = expandoObject(
  oauthTokenSchemObject
);
