<template>
  <main class="home container">
    <div class="row">
      <div class="col">
        <h1>Automated Website Certificate Validation</h1>
        <br />
        <h3>Maintain trust between your business and customers</h3>
        <p>
          When a site certificate is invalid, users will be warned that the site
          is no longer safe to visit.
        </p>
        <p>
          Let's Validate is a <span class="text-secondary" data-toggle="tooltip" data-placement="top" title="Free as in beer">free</span>, cloud-based online service (SaaS) that
          provides automated, daily monitoring of website certificate validity.
          Let's Validate alerts you to expired, soon-to-expire, and invalid site
          certificates.
        </p>
      </div>
    </div>
    <div class="row">
      <div class="home-cta">
        <a :href="cognitoUrl" class="btn my-0 btn-primary">
          Get Started Today
        </a>
      </div>
    </div>
    <div class="row my-2">
      <div class="col-7 mt-4">
        <h3>Never get caught with an invalid website certificate again</h3>
        <p>
          Let's Validate alerts you to expired, soon-to-expire, and invalid site
          certificates. Valid certificates show as [valid state]. Certificates
          that require attention show as [invalid state].
        </p>
        <br />
        <h3>Get Notified before your certificate expires</h3>
        <p>
          Let's Validate will <span class="text-secondary" data-toggle="tooltip" data-placement="top" title="Via Email">warn you</span> with increasing frequency as a
          certificate reaches certain milestones:
        </p>
        <ul>
          <li>30 days until expiration - weekly</li>
          <li>7 days or less until expiration - daily</li>
        </ul>
      </div>
      <div class="col-5">
        <img src="../assets/work-risk-free.svg" />
      </div>
    </div>
  </main>
</template>
<script lang="ts">
declare var bootstrap: any;
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})

import { hostedLoginUrls } from "@/models/HostedUrls";
const cognitoHostedLoginUrl = hostedLoginUrls[
  window.location.hostname
] as string;
export default {
  props: {
    loggedIn: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      cognitoUrl: cognitoHostedLoginUrl,
    };
  },
};
</script>