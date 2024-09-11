"use client"

import { useEffect, useState, useRef, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type DataPoint = {
  time: string
  price: number
  buys: number
  sells: number
}

function generateRandomData(time: Date): DataPoint {
  return {
    time: time.toLocaleTimeString(),
    price: 130 + Math.random() * 10,
    buys: Math.random() * 50,
    sells: Math.random() * 50
  }
}

export function LivePriceChart() {
  const [data, setData] = useState<DataPoint[]>([])
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 60 })
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const chartRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const addDataPoint = useCallback((newTime: Date) => {
    const newDataPoint = generateRandomData(newTime)
    setData(prevData => [...prevData, newDataPoint])
    setVisibleRange(prevRange => ({
      start: prevRange.start + 1,
      end: prevRange.end + 1
    }))
  }, [])

  useEffect(() => {
    // Generate initial data
    const initialTime = new Date(currentTime.getTime() - 1000 * 60 * 10) // Start 10 minutes ago
    const initialData = Array.from({ length: 60 }, (_, i) => 
      generateRandomData(new Date(initialTime.getTime() + i * 10000))
    )
    setData(initialData)

    // Simulate updates every 10 seconds
    const interval = setInterval(() => {
      setCurrentTime(prevTime => {
        const newTime = new Date(prevTime.getTime() + 10000) // Add 10 seconds
        addDataPoint(newTime)
        return newTime
      })
    }, 10000)

    return () => clearInterval(interval)
  }, [addDataPoint])

  const formatXAxis = (tickItem: string) => {
    return tickItem.split(':').slice(0, 2).join(':')
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    setStartX(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return

    const dx = e.clientX - startX
    const scrollAmount = Math.round(dx / 10)

    setVisibleRange(prevRange => {
      const newStart = Math.max(0, Math.min(data.length - 60, prevRange.start - scrollAmount))
      return {
        start: newStart,
        end: newStart + 60
      }
    })

    setStartX(e.clientX)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const visibleData = data.slice(visibleRange.start, visibleRange.end)

  return (
    <div 
      className="w-full h-[500px] bg-gray-900 p-4 select-none cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      ref={containerRef}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={visibleData}
          ref={chartRef}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis 
            dataKey="time" 
            stroke="#888" 
            tick={{ fill: '#888' }} 
            tickFormatter={formatXAxis}
            minTickGap={50}
          />
          <YAxis 
            stroke="#888" 
            tick={{ fill: '#888' }} 
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#333', border: 'none' }} 
            labelStyle={{ color: '#888' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#00ff00" 
            dot={false} 
            strokeWidth={2}
            name="Price"
            isAnimationActive={false}
          />
          <Line 
            type="monotone" 
            dataKey="buys" 
            stroke="#0000ff" 
            dot={false} 
            strokeWidth={2}
            name="Buys"
            isAnimationActive={false}
          />
          <Line 
            type="monotone" 
            dataKey="sells" 
            stroke="#ffff00" 
            dot={false} 
            strokeWidth={2}
            name="Sells"
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}