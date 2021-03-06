import { GraphQLClient } from 'graphql-request';
import { ResourceGroupInput } from './types';

const UploadResourceGroupMutation = `
mutation UploadResources($resourceGroup: ResourceGroupInput!) {
    result: updateResourceGroup(input: $resourceGroup) {
        success
    }
}`;

const ValidateResourceGroupQuery = `
query ValidateResources($resourceGroup: ResourceGroupInput!) {
    result: validateResourceGroup(input: $resourceGroup) {
        success
    }
}`;
export async function uploadResourceGroup(
  rg: ResourceGroupInput,
  options: {
    registryUrl: string;
    dryRun?: boolean;
    authorizationHeader?: string;
  }
) {
  const clientOptions = { timeout: 10000, headers: {} as { [name: string]: string } };
  if (typeof options.authorizationHeader !== 'undefined') {
    clientOptions.headers['Authorization'] = options.authorizationHeader;
  }
  const registryClient = new GraphQLClient(options.registryUrl, clientOptions);

  const query = options.dryRun ? ValidateResourceGroupQuery : UploadResourceGroupMutation;

  try {
    const data = await registryClient.request<{ result: boolean }>(query, { resourceGroup: rg });
    console.log(data.result);
  } catch (err) {
    console.log('FAILURE');
    throw err;
  }
}

export * from './types';
