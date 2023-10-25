<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>
<template>
  <table id="table_add_new_monitor">
    <tbody>
      <tr>
        <td><strong>Hostname/IP Address</strong>:</td>
        <td><input v-model="url" /></td>
        <td><strong>Port</strong>:</td>
        <td><input v-model="port" maxlength="5" /></td>
        <td>
          <button :disabled="isDisabled" @click="addCert" class="btn btn-primary">
            Monitor TLS Certificate
          </button>
        </td>
      </tr>
    </tbody>
  </table>

  <input type="text" placeholder="Filter by department or employee" v-model="filter" />
  <table class="table table-bordered">
    <thead>
      <tr>
        <th>URL</th>
        <th>
          Cert Expiration
          <i
            class="bi bi-sort-alpha-down"
            aria-label="Sort Icon"
            @click="sortCol('cert_expires')"
          ></i>
        </th>
        <th>
          Last Expiration Check
          <i
            class="bi bi-sort-alpha-down"
            aria-label="Sort Icon"
            @click="sortCol('last_checked')"
          ></i>
        </th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, index) in sortedCols" :key="`cert-id-${index}`">
        <td v-html="highlightMatches(row.url)"></td>
        <td>{{ row.cert_expires }}</td>
        <td>{{ row.last_checked }}</td>
        <td>
          <button class="btn btn-secondary" @click="removeCert(row.monitor_id)">x</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { MonitorService } from '../../services/MonitorService'
import type {
  MonitoredCertificateResponse,
  MonitoredCertificate
} from '../../models/MonitoredCertificates'

export default {
  data() {
    return {
      filter: '',
      url: '',
      col: '',
      asc: false,
      port: 443,
      monitored_response: {} as MonitoredCertificateResponse
    }
  },
  computed: {
    isDisabled() {
      return this.url.length === 0 || !this.port
    },

    sortedCols() {
      let rows = this.monitored_response.monitors
      if (this.filter.length) {
        rows = this.getFiltered()
      }
      if (!this.col.length) {
        return rows
      }
      return rows.sort((a: MonitoredCertificate, b: MonitoredCertificate) => {
        return this.asc
          ? new Date(a[this.col]).getTime() - new Date(b[this.col]).getTime()
          : new Date(b[this.col]).getTime() - new Date(a[this.col]).getTime()
      })
    }
  },
  methods: {
    async addCert() {
      const certs = await MonitorService.addNewMonitorUrl(this.url, this.port)
      if (certs !== null) {
        this.monitored_response = certs
      }
    },
    async removeCert(monitor_id: string) {
      const certs = await MonitorService.removeMonitor(monitor_id)
      if (certs !== null) {
        this.monitored_response = certs
      }
    },
    sortCol(col: string) {
      this.asc = this.col === col && !this.asc
      this.col = col
    },
    getFiltered() {
      return this.monitored_response.monitors.filter((row: MonitoredCertificate) => {
        const url = row.url.toLowerCase()
        return url.includes(this.filter)
      })
    },
    highlightMatches(text: string) {
      if (!text) return
      const matchExists = text.toLowerCase().includes(this.filter.toLowerCase())
      if (!matchExists || !this.filter) return text

      const re = new RegExp(this.filter, 'ig')
      return text.replace(re, (matchedText) => `<mark>${matchedText}</mark>`)
    }
  },
  async mounted() {
    // const certs = await MonitorService.getMonitoredCerts()

    const certs = {
      metadata: {
        authoritative_data: false,
        browser_cached_state: false,
        data_timestamp: new Date()
      },
      monitors: [
        {
          url: 'www.google.com',
          cert_expires: new Date(Date.now() + 24 * 3600 * 1000),
          cert_issuer_org: 'godaddy.org',
          last_checked: new Date(Date.now() - 24 * 3600 * 1000),
          monitor_id: '123abc',
          alert_muted: false
        },
        {
          url: 'www.gizmodo.com',
          cert_expires: new Date(Date.now() + 72 * 3600 * 1000),
          cert_issuer_org: 'godaddy.org',
          last_checked: new Date(),
          monitor_id: 'abc456',
          alert_muted: false
        },
        {
          url: 'www.ksl.com',
          cert_expires: new Date(Date.now() + 365 * 3600 * 1000),
          cert_issuer_org: 'godaddy.org',
          last_checked: new Date(),
          monitor_id: '456def',
          alert_muted: false
        }
      ]
    }
    this.monitored_response = certs
  }
}
</script>
