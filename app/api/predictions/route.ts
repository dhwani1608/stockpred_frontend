import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = { userId: payload.userId }
    if (symbol) {
      where.symbol = symbol.toUpperCase()
    }

    const predictions = await prisma.prediction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
    })

    return NextResponse.json(predictions)
  } catch (error) {
    console.error('Get predictions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { symbol, prediction, confidence, signal } = await request.json()

    const newPrediction = await prisma.prediction.create({
      data: {
        userId: payload.userId,
        symbol: symbol.toUpperCase(),
        prediction,
        confidence,
        signal,
      },
    })

    return NextResponse.json(newPrediction)
  } catch (error) {
    console.error('Save prediction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
