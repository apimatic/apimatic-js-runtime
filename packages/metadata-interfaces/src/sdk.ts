import { CoreClient } from './coreClient';
import { EndpointsObject } from './endpointMetadataFromId';

export interface SdkMetadata {
  endpoints: EndpointsObject;
  clientFactory: () => CoreClient;
}
