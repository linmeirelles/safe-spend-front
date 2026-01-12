import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react';
import { Button } from './button';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  variant?: 'default' | 'success' | 'destructive';
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = 'vs último mês',
  icon,
  variant = 'default',
  className,
}: StatCardProps) {
  const isPositive = change && change >= 0;

  return (
    <Card className={cn('shadow-card hover:shadow-card-hover transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p
              className={cn(
                'text-2xl font-bold',
                variant === 'success' && 'text-success',
                variant === 'destructive' && 'text-destructive'
              )}
            >
              {value}
            </p>
            {change !== undefined && (
              <div className="flex items-center gap-1 text-sm">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span className={cn(isPositive ? 'text-success' : 'text-destructive')}>
                  {isPositive ? '+' : ''}
                  {change}%
                </span>
                <span className="text-muted-foreground">{changeLabel}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                {icon}
              </div>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
