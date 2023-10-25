export interface MonitoredCertificate {
  url: string
  cert_expires: string
  cert_issuer_org: string
  last_checked: string
  monitor_id: string
  alert_muted: boolean
}

export interface MonitoredCertificateResponse {
  metadata: {
    authoritative_data: boolean
    browser_cached_state: boolean
    data_timestamp: Date
  }
  monitors: MonitoredCertificate[]
}
