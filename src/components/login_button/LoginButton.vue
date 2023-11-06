<template>
  <div v-if="loggedIn" class="ms-4">
    <button class="btn my-2 btn-primary" type="submit">Sign Out</button>
  </div>
  <div v-else class="ms-4 small text-center">
    <button class="btn my-0 btn-primary" type="submit">Sign In</button>
    <br />
    <span>Or </span><RouterLink to="/sign_up">Sign Up</RouterLink>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    loggedIn: Boolean,
  },
};
</script>
