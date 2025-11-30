<template>
  <div class="upload">
    <h2>Azure Large File Upload</h2>

    <button v-if="!loggedIn" @click="login">Login with Azure Entra ID</button>

    <div v-if="loggedIn">
      <input type="file" @change="selectFile" />
      <p v-if="progress">Progress: {{ progress }}%</p>
    </div>
  </div>
</template>

<script>
import { msalInstance } from "../auth/msal";
import { BlockBlobClient } from "@azure/storage-blob";
import { getUserDelegationSas } from "../services/blob";

export default {
  data() {
    return {
      file: null,
      progress: 0,
      loggedIn: false
    };
  },

  mounted() {
    this.loggedIn = msalInstance.getAllAccounts().length > 0;
  },

  methods: {
    async login() {
      await msalInstance.loginPopup({
        scopes: [
          "User.Read",
          "https://storage.azure.com/.default"
        ]
      });
      this.loggedIn = true;
    },

    selectFile(e) {
      this.file = e.target.files[0];
      this.uploadLargeFile();
    },

    async uploadLargeFile() {
      const blobName = this.file.name;

      const { sas, storageAccountName, containerName } =
        await getUserDelegationSas(blobName);

      const sasUrl =
        `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blobName}?${sas}`;

      const blobClient = new BlockBlobClient(sasUrl);

      await blobClient.uploadBrowserData(this.file, {
        blockSize: 10 * 1024 * 1024, // 10MB chunks
        concurrency: 5,
        onProgress: (ev) => {
          this.progress = ((ev.loadedBytes / this.file.size) * 100).toFixed(2);
        }
      });

      alert("Upload completed!");
    }
  }
};
</script>
