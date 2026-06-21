export type DailyScanPoint = {
  date: string
  label: string
  scans: number
}

export type BreakdownPoint = {
  name: string
  scans: number
  fill: string
}

export type TopQRCodePoint = {
  id: string
  name: string
  type: string
  scans: number
}

export type QRAnalyticsData = {
  summary: {
    totalQRCodes: number
    dynamicQRCodes: number
    totalScans: number
    scansLast30Days: number
    scansToday: number
  }
  dailyScans: DailyScanPoint[]
  topQRCodes: TopQRCodePoint[]
  deviceTypes: BreakdownPoint[]
  browsers: BreakdownPoint[]
  operatingSystems: BreakdownPoint[]
}
