import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { AuthService } from "../services/AuthService";
import { hostedLoginUrls } from "../models/HostedUrls";

// Redirect users to cognito url if it's a guarded url and they aren't logged in
function getAuthStatus() {
  const cognitoHostedLoginUrl = hostedLoginUrls[
    window.location.hostname
  ] as string;
  if (!AuthService.authStatusLoggedIn()) {
    window.location.href = cognitoHostedLoginUrl;
    return false;
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("../views/DashboardView.vue"),
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/governance",
      name: "governance",
      component: () => import("../views/GovernanceView.vue"),
    },
    {
      path: "/people",
      name: "people",
      component: () => import("../views/PeopleView.vue"),
    },
    {
      path: "/history",
      name: "history",
      component: () => import("../views/HistoryView.vue"),
    },
    {
      path: "/termsofuse",
      name: "termsofuse",
      component: () => import("../views/Terms.vue"),
    },
    {
      path: "/privacy",
      name: "privacy",
      component: () => import("../views/Privacy.vue"),
    },
  ],
});
export default router;
