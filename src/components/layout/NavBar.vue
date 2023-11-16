<script setup lang="ts">
import { RouterLink } from "vue-router";
import { AuthService } from "@/services/AuthService";
import LoginButton from "@/components/login_button/LoginButton.vue";

const userLoggedIn = AuthService.authStatusLoggedIn();
</script>

<template>
  <nav class="navbar navbar-expand-lg mb-4">
    <div class="container">
      <a class="navbar-brand" href="/">
        <img src="../../assets/horizonallogo.svg" width="250" />
      </a>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav ms-auto">
          <li v-if="!userLoggedIn" class="nav-item mx-2">
            <RouterLink class="nav-link" to="/">Home</RouterLink>
          </li>
          <li v-if="userLoggedIn" class="nav-item mx-2">
            <RouterLink class="nav-link" to="/dashboard">Dashboard</RouterLink>
          </li>
          <li class="nav-item mx-2">
            <RouterLink class="nav-link" to="/about">About</RouterLink>
          </li>
          <li class="nav-item mx-2">
            <RouterLink class="nav-link" to="/people">People</RouterLink>
          </li>
          <li class="nav-item mx-2">
            <RouterLink class="nav-link" to="/history">History</RouterLink>
          </li>
        </ul>
        <LoginButton :loggedIn="userLoggedIn" />
      </div>
    </div>
  </nav>
</template>
