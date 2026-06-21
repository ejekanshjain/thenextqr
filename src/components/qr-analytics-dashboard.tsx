'use client'

import {
  Activity,
  CalendarDays,
  MousePointerClick,
  QrCode,
  ScanLine,
  Smartphone
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis
} from 'recharts'
import type { QRAnalyticsData } from '~/app/(app)/actions/qr-analytics.types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card'
import type { ChartConfig } from '~/components/ui/chart'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '~/components/ui/chart'

type QRAnalyticsDashboardProps = {
  data: QRAnalyticsData
  scope: 'organization' | 'qr-code'
}

const scansChartConfig = {
  scans: {
    label: 'Scans',
    color: 'var(--color-chart-1)'
  }
} satisfies ChartConfig

const breakdownChartConfig = {
  scans: {
    label: 'Scans'
  }
} satisfies ChartConfig

export function QRAnalyticsDashboard({
  data,
  scope
}: QRAnalyticsDashboardProps) {
  const summaryCards =
    scope === 'organization'
      ? [
          {
            label: 'QR codes',
            value: data.summary.totalQRCodes,
            description: `${data.summary.dynamicQRCodes.toLocaleString()} dynamic`,
            icon: QrCode
          },
          {
            label: 'Total scans',
            value: data.summary.totalScans,
            description: 'Across all QR codes',
            icon: ScanLine
          },
          {
            label: 'Last 30 days',
            value: data.summary.scansLast30Days,
            description: 'Tracked scan events',
            icon: CalendarDays
          },
          {
            label: 'Today',
            value: data.summary.scansToday,
            description: 'Scans since midnight',
            icon: Activity
          }
        ]
      : [
          {
            label: 'Total scans',
            value: data.summary.totalScans,
            description: 'Lifetime scans',
            icon: ScanLine
          },
          {
            label: 'Last 30 days',
            value: data.summary.scansLast30Days,
            description: 'Tracked scan events',
            icon: CalendarDays
          },
          {
            label: 'Today',
            value: data.summary.scansToday,
            description: 'Scans since midnight',
            icon: Activity
          },
          {
            label: 'Mode',
            value: data.summary.dynamicQRCodes ? 'Dynamic' : 'Static',
            description: data.summary.dynamicQRCodes
              ? 'Redirect scans are tracked'
              : 'Destination is embedded',
            icon: MousePointerClick
          }
        ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(card => (
          <Card key={card.label} size="sm">
            <CardHeader className="grid-cols-[1fr_auto] items-start">
              <div>
                <CardDescription>{card.label}</CardDescription>
                <CardTitle className="text-2xl">
                  {typeof card.value === 'number'
                    ? card.value.toLocaleString()
                    : card.value}
                </CardTitle>
              </div>
              <div className="bg-primary/10 text-primary grid size-9 place-items-center rounded-lg">
                <card.icon />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Scan trend</CardTitle>
            <CardDescription>
              Daily scans over the last 30 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={scansChartConfig} className="h-72 w-full">
              <AreaChart
                accessibilityLayer
                data={data.dailyScans}
                margin={{ left: 0, right: 12 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="scans"
                  type="natural"
                  fill="var(--color-scans)"
                  fillOpacity={0.16}
                  stroke="var(--color-scans)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <BreakdownChart
          title="Devices"
          description="Top device types in the last 30 days."
          data={data.deviceTypes}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {scope === 'organization' ? (
          <TopQRCodesChart data={data.topQRCodes} />
        ) : null}
        <BreakdownChart
          title="Browsers"
          description="Top browsers in the last 30 days."
          data={data.browsers}
        />
        <BreakdownChart
          title="Operating systems"
          description="Top operating systems in the last 30 days."
          data={data.operatingSystems}
        />
      </div>
    </div>
  )
}

function TopQRCodesChart({ data }: { data: QRAnalyticsData['topQRCodes'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top QR codes</CardTitle>
        <CardDescription>Highest scanned QR codes.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <ChartContainer config={scansChartConfig} className="h-64 w-full">
            <BarChart accessibilityLayer data={data} layout="vertical">
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={96}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="scans" fill="var(--color-scans)" radius={4} />
            </BarChart>
          </ChartContainer>
        ) : (
          <EmptyChart icon={QrCode} label="No QR codes yet" />
        )}
      </CardContent>
    </Card>
  )
}

function BreakdownChart({
  title,
  description,
  data
}: {
  title: string
  description: string
  data: QRAnalyticsData['deviceTypes']
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <ChartContainer config={breakdownChartConfig} className="h-64 w-full">
            <PieChart accessibilityLayer>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="name" />}
              />
              <Pie
                data={data}
                dataKey="scans"
                nameKey="name"
                innerRadius={48}
                outerRadius={82}
                paddingAngle={2}
              >
                {data.map(item => (
                  <Cell key={item.name} fill={item.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        ) : (
          <EmptyChart icon={Smartphone} label="No scan data yet" />
        )}
      </CardContent>
    </Card>
  )
}

function EmptyChart({
  icon: Icon,
  label
}: {
  icon: typeof Smartphone
  label: string
}) {
  return (
    <div className="text-muted-foreground flex h-64 flex-col items-center justify-center gap-2 text-sm">
      <Icon />
      <span>{label}</span>
    </div>
  )
}
