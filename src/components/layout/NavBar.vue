<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { AuthService } from '@/services/AuthService'
import LoginButton from '@/components/login_button/LoginButton.vue'

const loggedIn = AuthService.authStatusLoggedIn() !== null
</script>

<template>
  <nav class="navbar navbar-expand-lg mb-4">
    <div class="container">
      <a class="navbar-brand" href="#">
        <img src="../../assets/lv-logo.png" width="200" />
      </a>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item mx-2">
            <RouterLink class="nav-link" to="/">Home</RouterLink>
          </li>
          <li v-if="loggedIn" class="nav-item mx-2">
            <RouterLink class="nav-link" to="/dashboard">Dashboard</RouterLink>
          </li>
          <li class="nav-item mx-2">
            <RouterLink class="nav-link" to="/about">About</RouterLink>
          </li>
        </ul>
        <LoginButton loggedIn/>
      </div>
    </div>
  </nav>
</template>
