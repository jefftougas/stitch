import { print } from 'graphql';
import { GraphQLClient } from 'graphql-request';
import { gql } from 'apollo-server-core';
import {
  createSchemaMutation,
  CreatePolicyMutationResponse,
  createPolicyMutation,
  UpdateSchemasMutationResponse,
} from '../../helpers/registry-request-builder';
import { sleep } from '../../helpers/utility';
import GraphQLErrorSerializer from '../../utils/graphql-error-serializer';
import { policies, schema } from './auth-object-directive.schema';

describe('Authorization - Policy directive on Object', () => {
  let gatewayClient: GraphQLClient;
  let registryClient: GraphQLClient;

  beforeAll(() => {
    gatewayClient = new GraphQLClient('http://localhost:8080/graphql');
    registryClient = new GraphQLClient('http://localhost:8090/graphql');

    expect.addSnapshotSerializer(GraphQLErrorSerializer);
  });

  test('Setup policies', async () => {
    const policyResponse: CreatePolicyMutationResponse = await registryClient.request(createPolicyMutation, {
      policies,
    });
    expect(policyResponse.updatePolicies.success).toBeTruthy();

    const schemaResponse: UpdateSchemasMutationResponse = await registryClient.request(createSchemaMutation, {
      schema,
    });
    expect(schemaResponse.updateSchemas.success).toBeTruthy();

    // Wait for gateway to update before next tests
    await sleep(500);
  });

  test('OK for query field without policy of object with allowed policy', async () => {
    const response = await gatewayClient.request(
      print(gql`
        query {
          foo {
            bar
          }
        }
      `)
    );
    expect(response).toMatchSnapshot();
  });

  test('Error for query field with deny policy of object with allowed policy', async () => {
    let response;
    try {
      response = await gatewayClient.request(
        print(gql`
          query {
            foo {
              baz
            }
          }
        `)
      );
    } catch (e) {
      response = e.response;
    }
    expect(response).toMatchSnapshot();
  });

  test('Error for query field without policy of object with deny policy', async () => {
    let response;
    try {
      response = await gatewayClient.request(
        print(gql`
          query {
            foo2 {
              bar2
            }
          }
        `)
      );
    } catch (e) {
      response = e.response;
    }
    expect(response).toMatchSnapshot();
  });
});
