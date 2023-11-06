<template>
  <modal :show="showModal" @close="closeModal">
    <template v-slot:body>
      <div class="row d-flex w-100 justify-content-space-between">
        <div class="col">
          <label for="url">Hostname/IP Address:</label>
        </div>
        <div class="col">
          <input v-model="url" class="form-control" type="text" id="url" />
        </div>
      </div>

      <div class="row d-flex w-100 justify-content-space-between mt-4">
        <div class="col">
          <label for="port">Port:</label>
        </div>
        <div class="col">
          <input
            v-model="port"
            class="form-control"
            id="port"
            type="number"
            maxlength="5"
          />
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <button :disabled="isDisabled" @click="addCert" class="btn btn-primary">
        Add Certificate
      </button>
    </template>
  </modal>

  <div class="row mt-4">
    <div class="col">
      <div class="input-group">
        <div class="form-outline w-75">
          <input
            type="text"
            id="search"
            placeholder="search"
            v-model="filter"
            class="form-control"
          />
        </div>
        <button id="search-button" type="button" class="btn btn-primary">
          <i class="bi bi-search"></i>
        </button>
      </div>
    </div>
    <div class="col d-flex justify-content-end">
      <button type="button" class="btn btn-primary" @click="openModal">
        <i class="bi bi-plus"></i> Add Site
      </button>
    </div>
  </div>
  <table class="table table-bordered mt-4">
    <thead>
      <tr>
        <th>URL</th>
        <th>
          Cert Expiration
          <i
            class="bi"
            :class="{
              'bi-arrow-up': col === 'cert_expires' && asc,
              'bi-arrow-down':
                (col === 'cert_expires' && !asc) || col !== 'cert_expires',
            }"
            aria-label="Sort Icon"
            @click="sortCol('cert_expires')"
          ></i>
        </th>
        <th>
          Last Expiration Check
          <i
            class="bi"
            :class="{
              'bi-arrow-up': col === 'last_checked' && asc,
              'bi-arrow-down':
                (col === 'last_checked' && !asc) || col !== 'last_checked',
            }"
            aria-label="Sort Icon"
            @click="sortCol('last_checked')"
          ></i>
        </th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in sortedCols" :key="`cert-id-${row.monitor_id}`">
        <td v-html="highlightMatches(row.url)"></td>
        <td>{{ new Date(row.tls_certificate.cert_expires).toDateString() }}</td>
        <td>{{ new Date(row.tls_certificate.last_checked).toDateString() }}</td>
        <td>
          <button class="btn btn-secondary" @click="removeCert(row.monitor_id)">
            x
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import Modal from "@/components/modal/Modal.vue";
import { MonitorService } from "@/services/MonitorService";
import type {
  MonitoredCertificateResponse,
  MonitoredCertificate,
} from "@/models/MonitorCertificates";

export default {
  components: {
    Modal,
  },
  data() {
    return {
      showModal: false,
      filter: "",
      url: "",
      col: "",
      asc: false,
      port: 443,
      monitored_response: {} as MonitoredCertificateResponse,
    };
  },
  computed: {
    isDisabled() {
      const isValidURL = this.url.length > 1 && this.url.includes(".");
      return !isValidURL || !this.port;
    },

    sortedCols() {
      let rows = this.monitored_response.monitors;
      if (this.filter.length) {
        rows = this.getFiltered();
      }
      if (!this.col.length) {
        return rows;
      }
      return rows.sort((a: MonitoredCertificate, b: MonitoredCertificate) => {
        return this.asc
          ? new Date(a.tls_certificate[this.col]).getTime() -
              new Date(b.tls_certificate[this.col]).getTime()
          : new Date(b.tls_certificate[this.col]).getTime() -
              new Date(a.tls_certificate[this.col]).getTime();
      });
    },
  },
  methods: {
    async addCert() {
      const certs = await MonitorService.addNewMonitorUrl(this.url, this.port);
      this.url = "";
      if (certs !== null) {
        this.monitored_response = certs;

        this.showModal = false;
      }
    },
    async removeCert(monitor_id: string) {
      const certs = await MonitorService.removeMonitor(monitor_id);
      if (certs !== null) {
        this.monitored_response = certs;
      }
    },
    sortCol(col: string) {
      this.asc = this.col === col && !this.asc;
      this.col = col;
    },
    getFiltered() {
      return this.monitored_response.monitors.filter(
        (row: MonitoredCertificate) => {
          const url = row.url.toLowerCase();
          return url.includes(this.filter);
        },
      );
    },
    highlightMatches(text: string) {
      if (!text) return;
      const matchExists = text
        .toLowerCase()
        .includes(this.filter.toLowerCase());
      if (!matchExists || !this.filter) return text;

      const re = new RegExp(this.filter, "ig");
      return text.replace(re, (matchedText) => `<mark>${matchedText}</mark>`);
    },
    closeModal() {
      this.showModal = false;
    },
    openModal() {
      this.showModal = true;
    },
  },
  async mounted() {
    const certs = await MonitorService.getMonitoredCerts();
    this.monitored_response = certs;
  },
};
</script>

<style>
mark,
.mark {
  padding: 0;
}
</style>
