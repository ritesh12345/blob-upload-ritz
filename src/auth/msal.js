import { PublicClientApplication } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: "<YOUR-SPA-CLIENT-ID>",
    authority: "https://login.microsoftonline.com/<TENANT-ID>",
    redirectUri: "http://localhost:5173/"
  },
  cache: {
    cacheLocation: "localStorage"
  }
};

export const msalInstance = new PublicClientApplication(msalConfig);
