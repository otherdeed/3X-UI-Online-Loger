import type { LogEntry } from '~/types'

export const parseLogLine = (line: string): LogEntry | null => {
  if (!line || typeof line !== 'string') return null
  const mainRegex = /^([\d/:.\s]+)\sfrom\s([\d.]+):(\d+)\s(\w+)\s(\w+):([\w.-]+:\d+|[\w.-]+)\s\[(.*?)\](?:\semail:\s(\w+))?/
  const match = line.match(mainRegex)
  if (match) {
    const [, fullTimestamp = '', sourceIp = '', sourcePort = '', action = '', protocol = '', destination = '', metadata = '', email] = match
    const timeOnly = (fullTimestamp.trim().split(' ')[1] || '').split('.')[0]
    return { timestamp: timeOnly || '', sourceIp, sourcePort, action, protocol, destination, metadata, email, isSystem: false }
  }
  if (line.includes('127.0.0.1')) {
    const parts = line.split(' from')
    const fullTimestamp = parts[0] || ''
    const timeOnly = (fullTimestamp.trim().split(' ')[1] || '').split('.')[0]
    return { timestamp: timeOnly || '', sourceIp: '127.0.0.1', sourcePort: '', action: 'accepted', protocol: 'tcp', destination: 'local', metadata: 'system', isSystem: true }
  }
  return null
}
