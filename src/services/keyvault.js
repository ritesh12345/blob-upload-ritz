import { SecretClient } from "@azure/keyvault-secrets";
import { InteractiveBrowserCredential } from "@azure/identity";

export async function getKeyVaultSecret(secretName) {
  const credential = new InteractiveBrowserCredential({
    tenantId: "<TENANT-ID>",
    clientId: "<YOUR-SPA-CLIENT-ID>"
  });

  const vaultUrl = `https://<YOUR-KEYVAULT>.vault.azure.net`;

  const client = new SecretClient(vaultUrl, credential);

  const secret = await client.getSecret(secretName);
  return secret.value;
}
