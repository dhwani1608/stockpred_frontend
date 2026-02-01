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

    const watchlists = await prisma.watchlist.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(watchlists)
  } catch (error) {
    console.error('Get watchlist error:', error)
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

    const { symbol } = await request.json()

    // Check if already in watchlist
    const existing = await prisma.watchlist.findUnique({
      where: {
        userId_symbol: {
          userId: payload.userId,
          symbol: symbol.toUpperCase(),
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Symbol already in watchlist' },
        { status: 400 }
      )
    }

    const watchlist = await prisma.watchlist.create({
      data: {
        userId: payload.userId,
        symbol: symbol.toUpperCase(),
      },
    })

    return NextResponse.json(watchlist)
  } catch (error) {
    console.error('Add to watchlist error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      )
    }

    await prisma.watchlist.delete({
      where: {
        userId_symbol: {
          userId: payload.userId,
          symbol: symbol.toUpperCase(),
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove from watchlist error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
