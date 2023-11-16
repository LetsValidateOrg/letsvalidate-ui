<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <footer class="bg-primary">
    <div class="container">
      <ul class="text-end mt-3">
        <li><RouterLink to="/governance">Governance</RouterLink></li>
        <li><RouterLink to="/termsofuse">Terms of Use</RouterLink></li>
        <li><RouterLink to="/privacy">Privacy Policy</RouterLink></li>
        <li>
          <a href="mailto:contact@letsvalidate.org" target="_blank">contact@letsvalidate.org</a>
        </li>
      </ul>
    </div>
  </footer>
</template>
