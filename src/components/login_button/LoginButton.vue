<template>
  <div v-if="loggedIn" class="ms-4">
    <button class="btn my-2 btn-primary" @click="signOut">Sign Out</button>
  </div>
  <div v-else class="ms-4 small text-center">
    <button class="btn my-0 btn-primary" @click="signIn">Sign Up</button>
    <br />
    <span style="cursor: pointer;">Or </span><a @click="signIn" style="cursor: pointer;">Sign In</a>
  </div>
</template>

<script lang="ts">
import { AuthService, CognitoHostedLoginUrl } from '@/services/AuthService';
export default {
  props: {
    loggedIn: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    signOut () {
      AuthService.signOut()
    },
    signIn () {
      window.location.href = CognitoHostedLoginUrl;
    }
  }
};
</script>
