<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <footer class="bg-primary">
    <div class="container">
      <ul class="text-end mt-3">
        <li><RouterLink to="/people">People</RouterLink></li>
        <li><RouterLink to="/governance">Governance</RouterLink></li>
        <li><RouterLink to="/history">History</RouterLink></li>
        <li>
          <a href="mailto:contact@letsvalidate.org" target="_blank"
            >contact@letsvalidate.org</a
          >
        </li>
      </ul>
    </div>
  </footer>
</template>
