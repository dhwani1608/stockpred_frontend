'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { TrendingUp, TrendingDown, ArrowRight, Search } from 'lucide-react'
import { formatPercentage, getSignalBadgeColor } from '@/lib/utils'

interface Prediction {
  symbol: string
  direction: 'UP' | 'DOWN'
  confidence: number
  signal: 'BUY' | 'SELL' | 'NO_TRADE'
  timestamp: string
}

export default function DashboardPage() {
  const { toast } = useToast()
  const [symbol, setSymbol] = useState('')
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState<Prediction | null>(null)

  const handlePredict = async () => {
    if (!symbol.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a stock symbol',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      // Call backend API
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      const response = await fetch(`${backendUrl}/predict/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: symbol.toUpperCase() }),
      })

      if (!response.ok) {
        throw new Error('Prediction failed')
      }

      const data = await response.json()
      setPrediction(data)

      // Save to database (map backend response to database schema)
      const token = localStorage.getItem('token')
      await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: data.symbol,
          prediction: data.direction,  // Backend uses 'direction', DB uses 'prediction'
          confidence: data.confidence,
          signal: data.signal,
        }),
      })

      toast({
        title: 'Success',
        description: `Prediction generated for ${symbol.toUpperCase()}`,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate prediction',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stock Prediction Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Get AI-powered predictions for any stock symbol
        </p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Stock Symbol</CardTitle>
          <CardDescription>
            Enter any stock ticker (e.g., AAPL, GOOGL, TSLA)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter stock symbol (e.g., AAPL)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handlePredict()}
              className="text-lg"
            />
            <Button onClick={handlePredict} disabled={loading} size="lg">
              {loading ? (
                'Analyzing...'
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Predict
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {loading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      )}

      {!loading && prediction && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Prediction Card */}
          <Card className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-2 ${
              prediction.direction === 'UP' ? 'bg-success' : 'bg-danger'
            }`} />
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{prediction.symbol}</span>
                {prediction.direction === 'UP' ? (
                  <TrendingUp className="h-8 w-8 text-success" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-danger" />
                )}
              </CardTitle>
              <CardDescription>5-Day Price Direction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Direction</p>
                  <p className={`text-3xl font-bold ${
                    prediction.direction === 'UP' ? 'text-success' : 'text-danger'
                  }`}>
                    {prediction.direction}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Confidence</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-muted rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          prediction.direction === 'UP' ? 'bg-success' : 'bg-danger'
                        }`}
                        style={{ width: formatPercentage(prediction.confidence) }}
                      />
                    </div>
                    <span className="text-xl font-bold">
                      {formatPercentage(prediction.confidence)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signal Card */}
          <Card>
            <CardHeader>
              <CardTitle>Trading Signal</CardTitle>
              <CardDescription>Recommended action based on prediction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-center p-8">
                  <Badge className={`text-2xl px-6 py-3 ${getSignalBadgeColor(prediction.signal)}`}>
                    {prediction.signal}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-success" />
                    <div>
                      <strong>BUY:</strong> Confidence {'>'} 55% (Strong uptrend)
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-danger" />
                    <div>
                      <strong>SELL:</strong> Confidence {'<'} 45% (Strong downtrend)
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-warning" />
                    <div>
                      <strong>NO_TRADE:</strong> 45% ≤ Confidence ≤ 55% (Uncertain)
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Timestamp: {new Date(prediction.timestamp).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && !prediction && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Enter a stock symbol to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
