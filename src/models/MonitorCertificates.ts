export interface TLSCertificate {
  cert_expires: string;
  cert_issued: string;
  cert_issuer_org: string;
  last_checked: string;
}

export interface NotificationInfo {
  last_notification: Date | null;
  next_notification: Date | null;
  notification_muted: boolean;
}

export interface MonitoredCertificate {
  url: string;
  monitor_id: string;
  tls_certificate: TLSCertificate;
  notification_info: NotificationInfo;
}

export interface MonitoredCertificateResponse {
  metadata: {
    authoritative_data: boolean;
    browser_cached_state: boolean;
    data_timestamp: Date;
  };
  monitors: MonitoredCertificate[];
}
