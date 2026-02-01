'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Filter } from 'lucide-react'
import { formatPercentage, formatDateTime, getSignalBadgeColor } from '@/lib/utils'

interface Prediction {
  id: string
  symbol: string
  prediction: 'UP' | 'DOWN'
  confidence: number
  signal: 'BUY' | 'SELL' | 'NO_TRADE'
  date: string
  createdAt: string
}

export default function HistoryPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [filteredPredictions, setFilteredPredictions] = useState<Prediction[]>([])
  const [symbolFilter, setSymbolFilter] = useState('')
  const [signalFilter, setSignalFilter] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  useEffect(() => {
    filterPredictions()
  }, [predictions, symbolFilter, signalFilter])

  const fetchHistory = async () => {
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
      console.error('Failed to fetch history:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPredictions = () => {
    let filtered = predictions

    if (symbolFilter) {
      filtered = filtered.filter(p => 
        p.symbol.toLowerCase().includes(symbolFilter.toLowerCase())
      )
    }

    if (signalFilter !== 'ALL') {
      filtered = filtered.filter(p => p.signal === signalFilter)
    }

    setFilteredPredictions(filtered)
  }

  const stats = {
    total: predictions.length,
    buy: predictions.filter(p => p.signal === 'BUY').length,
    sell: predictions.filter(p => p.signal === 'SELL').length,
    noTrade: predictions.filter(p => p.signal === 'NO_TRADE').length,
    avgConfidence: predictions.length > 0
      ? predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
      : 0,
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Prediction History</h1>
        <p className="text-muted-foreground mt-2">
          View and filter your past predictions
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Predictions</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Buy Signals</CardDescription>
            <CardTitle className="text-3xl text-success">{stats.buy}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Sell Signals</CardDescription>
            <CardTitle className="text-3xl text-danger">{stats.sell}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Confidence</CardDescription>
            <CardTitle className="text-3xl">
              {formatPercentage(stats.avgConfidence)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Filter by symbol..."
                value={symbolFilter}
                onChange={(e) => setSymbolFilter(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {['ALL', 'BUY', 'SELL', 'NO_TRADE'].map((signal) => (
                <Button
                  key={signal}
                  variant={signalFilter === signal ? 'default' : 'outline'}
                  onClick={() => setSignalFilter(signal)}
                  size="sm"
                >
                  {signal}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Predictions ({filteredPredictions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : filteredPredictions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No predictions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Symbol</th>
                    <th className="text-left p-3">Direction</th>
                    <th className="text-left p-3">Confidence</th>
                    <th className="text-left p-3">Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPredictions.map((pred) => (
                    <tr key={pred.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm text-muted-foreground">
                        {formatDateTime(pred.date)}
                      </td>
                      <td className="p-3 font-bold">{pred.symbol}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {pred.prediction === 'UP' ? (
                            <TrendingUp className="h-5 w-5 text-success" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-danger" />
                          )}
                          <span className={pred.prediction === 'UP' ? 'text-success' : 'text-danger'}>
                            {pred.prediction}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 max-w-[150px] bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                pred.prediction === 'UP' ? 'bg-success' : 'bg-danger'
                              }`}
                              style={{ width: formatPercentage(pred.confidence) }}
                            />
                          </div>
                          <span className="font-medium min-w-[60px]">
                            {formatPercentage(pred.confidence)}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={getSignalBadgeColor(pred.signal)}>
                          {pred.signal}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
