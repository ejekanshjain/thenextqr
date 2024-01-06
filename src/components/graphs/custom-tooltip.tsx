import { FC } from 'react'

export const CustomTooltip: FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div>
        <p>{payload[0].payload.date}</p>
        <p>Count: {payload[0].value}</p>
      </div>
    )
  }

  return null
}
