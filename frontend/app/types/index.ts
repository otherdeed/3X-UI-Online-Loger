export interface LogEntry {
  timestamp: string
  sourceIp: string
  sourcePort: string
  action: string
  protocol: string
  destination: string
  metadata: string
  email?: string
  isSystem: boolean
}
