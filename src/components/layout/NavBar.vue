<script setup lang="ts">
import { RouterLink } from 'vue-router'
// This no worky
import { LoginButton } from '../../components/login_button/LoginButton.vue'
import { AuthService } from '@/services/AuthService'

const loggedIn = AuthService.authStatusLoggedIn()
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
        <!-- Should be in a component but was giving me issues -->
        <div v-if="loggedIn" class="ms-4">
            <button class="btn my-2 btn-primary" type="submit">Sign Out</button>
        </div>
        <div v-else class="ms-4 small text-center">
            <button class="btn my-0 btn-primary" type="submit">Sign In</button>
            <br>
            <span>Or </span><RouterLink to="/sign_up">Sign Up</RouterLink>
        </div>
        <!-- End Component -->
      </div>
    </div>
  </nav>
</template>
