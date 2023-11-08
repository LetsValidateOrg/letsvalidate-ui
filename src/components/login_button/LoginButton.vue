<template>
  <div v-if="loggedIn" class="ms-4">
    <a class="btn my-2 btn-primary" :href="cognitoUrl">Sign Out</a>
  </div>
  <div v-else class="ms-4 small text-center">
    <a class="btn my-0 btn-primary" :href="cognitoUrl">Sign In</a>
    <br />
    <span>Or </span><a :href="cognitoUrl">Sign Up</a>
  </div>
</template>

<script lang="ts">
import { hostedLoginUrls } from "@/models/HostedUrls";
const cognitoHostedLoginUrl = hostedLoginUrls[
  window.location.hostname
] as string;
export default {
  props: {
    loggedIn: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      cognitoUrl: cognitoHostedLoginUrl,
    };
  },
};
</script>
