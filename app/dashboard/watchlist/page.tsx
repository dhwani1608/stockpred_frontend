'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Star, X, Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { formatPercentage, getSignalBadgeColor } from '@/lib/utils'

interface WatchlistItem {
  id: string
  symbol: string
  createdAt: string
}

interface Prediction {
  symbol: string
  direction: 'UP' | 'DOWN'
  confidence: number
  signal: 'BUY' | 'SELL' | 'NO_TRADE'
  timestamp: string
}

export default function WatchlistPage() {
  const { toast } = useToast()
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [predictions, setPredictions] = useState<Map<string, Prediction>>(new Map())
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchWatchlist()
  }, [])

  const fetchWatchlist = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/watchlist', {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setWatchlist(data)
      }
    } catch (error) {
      console.error('Failed to fetch watchlist:', error)
    }
  }

  const addToWatchlist = async () => {
    if (!inputValue.trim()) return

    const symbol = inputValue.toUpperCase().trim()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ symbol }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add symbol')
      }

      await fetchWatchlist()
      setInputValue('')
      toast({
        title: 'Success',
        description: `${symbol} added to watchlist`,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const removeFromWatchlist = async (symbol: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/watchlist?symbol=${symbol}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (!response.ok) throw new Error('Failed to remove symbol')

      await fetchWatchlist()
      toast({
        title: 'Success',
        description: `${symbol} removed from watchlist`,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const getPredictions = async () => {
    if (watchlist.length === 0) {
      toast({
        title: 'Info',
        description: 'Add symbols to watchlist first',
      })
      return
    }

    setLoading(true)
    try {
      const symbols = watchlist.map(w => w.symbol)
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      
      const response = await fetch(`${backendUrl}/predict/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols }),
      })

      if (!response.ok) throw new Error('Failed to get predictions')

      const data: Prediction[] = await response.json()
      const predMap = new Map<string, Prediction>(data.map((p) => [p.symbol, p]))
      setPredictions(predMap)

      // Save predictions
      const token = localStorage.getItem('token')
      for (const pred of data) {
        await fetch('/api/predictions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            symbol: pred.symbol,
            prediction: pred.direction,
            confidence: pred.confidence,
            signal: pred.signal,
          }),
        })
      }

      toast({
        title: 'Success',
        description: `Updated predictions for ${data.length} symbols`,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
          <p className="text-muted-foreground mt-2">
            Track your favorite stocks
          </p>
        </div>
        <Button onClick={getPredictions} disabled={loading || watchlist.length === 0}>
          {loading ? 'Updating...' : 'Update All Predictions'}
        </Button>
      </div>

      {/* Add Symbol Card */}
      <Card>
        <CardHeader>
          <CardTitle>Add to Watchlist</CardTitle>
          <CardDescription>Enter a stock symbol to track</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter symbol (e.g., AAPL)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && addToWatchlist()}
            />
            <Button onClick={addToWatchlist} disabled={loading}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Watchlist */}
      {watchlist.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Star className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Your watchlist is empty
            </p>
            <p className="text-sm text-muted-foreground">
              Add symbols to start tracking
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {watchlist.map((item) => {
            const prediction = predictions.get(item.symbol)
            return (
              <Card key={item.id} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => removeFromWatchlist(item.symbol)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-primary text-primary" />
                    {item.symbol}
                  </CardTitle>
                  <CardDescription>
                    Added {new Date(item.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                {prediction && (
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Direction</span>
                      <div className="flex items-center gap-2">
                        {prediction.direction === 'UP' ? (
                          <TrendingUp className="h-4 w-4 text-success" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-danger" />
                        )}
                        <span className={`font-medium ${
                          prediction.direction === 'UP' ? 'text-success' : 'text-danger'
                        }`}>
                          {prediction.direction}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Confidence</span>
                      <span className="font-medium">
                        {formatPercentage(prediction.confidence)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Signal</span>
                      <Badge className={getSignalBadgeColor(prediction.signal)}>
                        {prediction.signal}
                      </Badge>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
