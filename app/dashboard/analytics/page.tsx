'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatPercentage } from '@/lib/utils'

interface Prediction {
  id: string
  symbol: string
  prediction: 'UP' | 'DOWN'
  confidence: number
  signal: 'BUY' | 'SELL' | 'NO_TRADE'
  date: string
}

export default function AnalyticsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPredictions()
  }, [])

  const fetchPredictions = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/predictions', {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setPredictions(data)
      }
    } catch (error) {
      console.error('Failed to fetch predictions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get unique symbols
  const symbols = ['ALL', ...Array.from(new Set(predictions.map(p => p.symbol))).sort()]

  // Filter predictions based on selected symbol
  const filteredPredictions = selectedSymbol === 'ALL'
    ? predictions
    : predictions.filter(p => p.symbol === selectedSymbol)

  // Confidence over time data
  const confidenceOverTime = filteredPredictions
    .slice(-20)
    .map((pred, index) => ({
      index: index + 1,
      confidence: pred.confidence * 100,
      date: new Date(pred.date).toLocaleDateString(),
      symbol: pred.symbol,
    }))

  // Signal distribution data
  const signalCounts = {
    BUY: filteredPredictions.filter(p => p.signal === 'BUY').length,
    SELL: filteredPredictions.filter(p => p.signal === 'SELL').length,
    NO_TRADE: filteredPredictions.filter(p => p.signal === 'NO_TRADE').length,
  }

  const signalData = [
    { name: 'BUY', value: signalCounts.BUY, color: 'hsl(142, 76%, 36%)' },
    { name: 'SELL', value: signalCounts.SELL, color: 'hsl(0, 84%, 60%)' },
    { name: 'NO_TRADE', value: signalCounts.NO_TRADE, color: 'hsl(38, 92%, 50%)' },
  ]

  // Direction distribution
  const directionCounts = {
    UP: filteredPredictions.filter(p => p.prediction === 'UP').length,
    DOWN: filteredPredictions.filter(p => p.prediction === 'DOWN').length,
  }

  const directionData = [
    { name: 'UP', count: directionCounts.UP },
    { name: 'DOWN', count: directionCounts.DOWN },
  ]

  // Confidence distribution by signal
  const confidenceBySignal = [
    {
      signal: 'BUY',
      avgConfidence: signalCounts.BUY > 0
        ? filteredPredictions.filter(p => p.signal === 'BUY').reduce((sum, p) => sum + p.confidence, 0) / signalCounts.BUY * 100
        : 0,
    },
    {
      signal: 'SELL',
      avgConfidence: signalCounts.SELL > 0
        ? filteredPredictions.filter(p => p.signal === 'SELL').reduce((sum, p) => sum + p.confidence, 0) / signalCounts.SELL * 100
        : 0,
    },
    {
      signal: 'NO_TRADE',
      avgConfidence: signalCounts.NO_TRADE > 0
        ? filteredPredictions.filter(p => p.signal === 'NO_TRADE').reduce((sum, p) => sum + p.confidence, 0) / signalCounts.NO_TRADE * 100
        : 0,
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (predictions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Analytics</h1>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-lg font-medium text-muted-foreground">
              No predictions yet
            </p>
            <p className="text-sm text-muted-foreground">
              Make some predictions to see analytics
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Visualize your prediction trends and patterns
          </p>
        </div>
        <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select symbol" />
          </SelectTrigger>
          <SelectContent>
            {symbols.map(symbol => (
              <SelectItem key={symbol} value={symbol}>
                {symbol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Predictions</CardDescription>
            <CardTitle className="text-3xl">{filteredPredictions.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average Confidence</CardDescription>
            <CardTitle className="text-3xl">
              {filteredPredictions.length > 0
                ? formatPercentage(
                    filteredPredictions.reduce((sum, p) => sum + p.confidence, 0) /
                      filteredPredictions.length
                  )
                : '0%'}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Most Common Signal</CardDescription>
            <CardTitle className="text-3xl">
              {Object.entries(signalCounts).reduce((a, b) => (b[1] > a[1] ? b : a))[0]}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Confidence Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Confidence Over Time</CardTitle>
          <CardDescription>
            Track prediction confidence trends (last 20 predictions)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={confidenceOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="index" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-bold">{data.symbol}</p>
                        <p className="text-sm text-muted-foreground">{data.date}</p>
                        <p className="text-sm">
                          Confidence: <strong>{data.confidence.toFixed(2)}%</strong>
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line
                type="monotone"
                dataKey="confidence"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Signal Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Signal Distribution</CardTitle>
            <CardDescription>Breakdown of trading signals</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={signalData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {signalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Direction Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Direction Distribution</CardTitle>
            <CardDescription>UP vs DOWN predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={directionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Confidence by Signal */}
      <Card>
        <CardHeader>
          <CardTitle>Average Confidence by Signal</CardTitle>
          <CardDescription>
            Compare confidence levels across different signals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={confidenceBySignal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="signal" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                formatter={(value: number) => `${value.toFixed(2)}%`}
              />
              <Bar dataKey="avgConfidence" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
