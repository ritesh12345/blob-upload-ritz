import {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions
} from "@azure/storage-blob";
import { msalInstance } from "../auth/msal";
import { getKeyVaultSecret } from "./keyvault";

export async function getUserDelegationSas(blobName) {
  // 1. Get authenticated user
  const account = msalInstance.getAllAccounts()[0];

  // 2. Acquire AAD token for Azure Storage
  const tokenResponse = await msalInstance.acquireTokenSilent({
    scopes: ["https://storage.azure.com/.default"],
    account
  });

  // 3. Pull secrets from Key Vault
  const storageAccountName = await getKeyVaultSecret("storage-account-name");
  const containerName = await getKeyVaultSecret("container-name");

  // 4. Connect to blob service using AAD token
  const blobServiceClient = new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net`,
    {
      getToken: () => ({
        token: tokenResponse.accessToken,
        expiresOnTimestamp: tokenResponse.expiresOn.getTime()
      })
    }
  );

  // 5. Request User Delegation Key
  const delegatedKey = await blobServiceClient.getUserDelegationKey(
    new Date(),
    new Date(Date.now() + 60 * 60 * 1000)
  );

  // 6. Create SAS token (1 hour)
  const sas = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("cw"), // create + write
      expiresOn: new Date(Date.now() + 3600 * 1000)
    },
    delegatedKey,
    storageAccountName
  ).toString();

  return {
    sas,
    containerName,
    storageAccountName
  };
}
