import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`
}

export function getSignalColor(signal: string): string {
  switch (signal) {
    case 'BUY':
      return 'text-success'
    case 'SELL':
      return 'text-danger'
    case 'NO_TRADE':
      return 'text-warning'
    default:
      return 'text-muted-foreground'
  }
}

export function getSignalBadgeColor(signal: string): string {
  switch (signal) {
    case 'BUY':
      return 'bg-success/10 text-success border-success/20'
    case 'SELL':
      return 'bg-danger/10 text-danger border-danger/20'
    case 'NO_TRADE':
      return 'bg-warning/10 text-warning border-warning/20'
    default:
      return 'bg-muted text-muted-foreground'
  }
}
