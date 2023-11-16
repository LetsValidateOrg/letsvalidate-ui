<template>
  <div v-if="loggedIn" class="ms-4">
    <button class="btn my-2 btn-primary" @click="signOut">Sign Out</button>
  </div>
  <div v-else class="ms-4 small text-center">
    <button class="btn my-0 btn-primary" @click="signOut">Sign Up</button>
    <br />
    <span>Or </span><a @click="signOut">Sign In</a>
  </div>
</template>

<script lang="ts">
import { AuthService } from '@/services/AuthService';
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
    }
  }
};
</script>
