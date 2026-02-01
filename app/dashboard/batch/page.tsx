'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { TrendingUp, TrendingDown, X } from 'lucide-react'
import { formatPercentage, getSignalBadgeColor } from '@/lib/utils'

interface Prediction {
  symbol: string
  direction: 'UP' | 'DOWN'
  confidence: number
  signal: 'BUY' | 'SELL' | 'NO_TRADE'
  timestamp: string
}

export default function BatchPredictPage() {
  const { toast } = useToast()
  const [symbols, setSymbols] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [sortBy, setSortBy] = useState<'symbol' | 'confidence' | 'signal'>('confidence')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const addSymbol = () => {
    if (!inputValue.trim()) return
    
    const symbol = inputValue.toUpperCase().trim()
    if (symbols.includes(symbol)) {
      toast({
        title: 'Duplicate',
        description: 'Symbol already added',
        variant: 'destructive',
      })
      return
    }

    setSymbols([...symbols, symbol])
    setInputValue('')
  }

  const removeSymbol = (symbol: string) => {
    setSymbols(symbols.filter(s => s !== symbol))
  }

  const handleBatchPredict = async () => {
    if (symbols.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one symbol',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      const response = await fetch(`${backendUrl}/predict/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols }),
      })

      if (!response.ok) {
        throw new Error('Batch prediction failed')
      }

      const data = await response.json()
      setPredictions(data)

      // Save predictions to database (map backend response to database schema)
      const token = localStorage.getItem('token')
      for (const pred of data) {
        if (!pred.error) {  // Skip failed predictions
          await fetch('/api/predictions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              symbol: pred.symbol,
              prediction: pred.direction,  // Backend uses 'direction', DB uses 'prediction'
              confidence: pred.confidence,
              signal: pred.signal,
            }),
          })
        }
      }

      toast({
        title: 'Success',
        description: `Generated predictions for ${data.filter((p: any) => !p.error).length} symbols`,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate predictions',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const sortedPredictions = [...predictions].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'symbol':
        comparison = a.symbol.localeCompare(b.symbol)
        break
      case 'confidence':
        comparison = a.confidence - b.confidence
        break
      case 'signal':
        const signalOrder = { 'BUY': 3, 'NO_TRADE': 2, 'SELL': 1 }
        comparison = signalOrder[a.signal] - signalOrder[b.signal]
        break
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Batch Prediction</h1>
        <p className="text-muted-foreground mt-2">
          Get predictions for multiple stocks at once
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add Symbols</CardTitle>
          <CardDescription>
            Enter stock symbols one at a time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Enter symbol (e.g., AAPL)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && addSymbol()}
            />
            <Button onClick={addSymbol}>Add</Button>
          </div>

          {symbols.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {symbols.map((symbol) => (
                <Badge key={symbol} variant="secondary" className="text-sm px-3 py-1">
                  {symbol}
                  <button
                    onClick={() => removeSymbol(symbol)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <Button
            onClick={handleBatchPredict}
            disabled={loading || symbols.length === 0}
            size="lg"
            className="w-full"
          >
            {loading ? 'Analyzing...' : `Predict ${symbols.length} Symbols`}
          </Button>
        </CardContent>
      </Card>

      {/* Results Table */}
      {predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Predictions</CardTitle>
            <CardDescription>
              Click column headers to sort
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th
                      className="text-left p-3 cursor-pointer hover:bg-muted"
                      onClick={() => toggleSort('symbol')}
                    >
                      Symbol {sortBy === 'symbol' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left p-3">Direction</th>
                    <th
                      className="text-left p-3 cursor-pointer hover:bg-muted"
                      onClick={() => toggleSort('confidence')}
                    >
                      Confidence {sortBy === 'confidence' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="text-left p-3 cursor-pointer hover:bg-muted"
                      onClick={() => toggleSort('signal')}
                    >
                      Signal {sortBy === 'signal' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPredictions.map((pred) => (
                    <tr key={pred.symbol} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-bold">{pred.symbol}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {pred.direction === 'UP' ? (
                            <TrendingUp className="h-5 w-5 text-success" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-danger" />
                          )}
                          <span className={pred.direction === 'UP' ? 'text-success' : 'text-danger'}>
                            {pred.direction}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 max-w-[200px] bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                pred.direction === 'UP' ? 'bg-success' : 'bg-danger'
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}
