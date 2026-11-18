import React from 'react';
import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'blue' | 'rose' | 'amber' | 'slate';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'emerald',
}: StatCardProps) {
  const iconVariants = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <Card className="p-5 flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
        {subtitle && <p className="text-[11px] text-slate-400 font-normal">{subtitle}</p>}
      </div>
      <div className={cn('p-2.5 rounded-xl shrink-0', iconVariants[variant])}>
        <Icon className="w-5 h-5" />
      </div>
    </Card>
  );
}
