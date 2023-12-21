import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { AuthService,  CognitoHostedLoginUrl} from "../services/AuthService";

// Redirect users to cognito url if it's a guarded url and they aren't logged in
function getAuthStatus() {
  if (!AuthService.authStatusLoggedIn()) {
    window.location.href = CognitoHostedLoginUrl;
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
      beforeEnter:() => getAuthStatus()
    },
    {
      path: "/about",
      name: "about",
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
// remove the params
router.afterEach(to => {
  history.pushState({}, null, to.path);
})
export default router;
