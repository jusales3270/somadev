import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'cyan' | 'purple' | 'green' | 'orange' | 'red' | 'blue' | 'yellow';
  delay?: number;
}

const colorMap = {
  cyan: {
    bg: 'bg-soma-cyan/10',
    border: 'border-soma-cyan/20',
    text: 'text-soma-cyan',
    glow: 'shadow-soma-cyan/20',
  },
  purple: {
    bg: 'bg-soma-purple/10',
    border: 'border-soma-purple/20',
    text: 'text-soma-purple',
    glow: 'shadow-soma-purple/20',
  },
  green: {
    bg: 'bg-soma-green/10',
    border: 'border-soma-green/20',
    text: 'text-soma-green',
    glow: 'shadow-soma-green/20',
  },
  orange: {
    bg: 'bg-soma-orange/10',
    border: 'border-soma-orange/20',
    text: 'text-soma-orange',
    glow: 'shadow-soma-orange/20',
  },
  red: {
    bg: 'bg-soma-red/10',
    border: 'border-soma-red/20',
    text: 'text-soma-red',
    glow: 'shadow-soma-red/20',
  },
  blue: {
    bg: 'bg-soma-blue/10',
    border: 'border-soma-blue/20',
    text: 'text-soma-blue',
    glow: 'shadow-soma-blue/20',
  },
  yellow: {
    bg: 'bg-soma-yellow/10',
    border: 'border-soma-yellow/20',
    text: 'text-soma-yellow',
    glow: 'shadow-soma-yellow/20',
  },
};

export function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  color,
  delay = 0 
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        "relative overflow-hidden rounded-xl p-6",
        "bg-card border",
        colors.border,
        "transition-all duration-300",
        "hover:shadow-lg",
        colors.glow
      )}
    >
      {/* Background Gradient */}
      <div className={cn(
        "absolute inset-0 opacity-50",
        colors.bg
      )} />
      
      {/* Glow Effect */}
      <div className={cn(
        "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30",
        colors.bg.replace('/10', '')
      )} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "p-3 rounded-lg",
            colors.bg
          )}>
            <Icon className={cn("w-5 h-5", colors.text)} />
          </div>
          
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend.isPositive ? "text-soma-green" : "text-soma-red"
            )}>
              <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">
            {title}
          </h3>
          <p className={cn(
            "text-3xl font-bold tracking-tight",
            colors.text
          )}>
            {value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
