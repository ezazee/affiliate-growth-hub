import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent';
  delay?: number;
}

export function StatCard({ title, value, icon: Icon, trend, variant = 'default', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "relative overflow-hidden rounded-xl p-6 shadow-card transition-all duration-300 hover:shadow-card-hover",
        variant === 'primary' && "gradient-primary text-primary-foreground",
        variant === 'accent' && "bg-accent text-accent-foreground",
        variant === 'default' && "bg-card text-card-foreground"
      )}
    >
      {/* Background Pattern */}
      <div className={cn(
        "absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10",
        variant === 'default' ? "bg-primary" : "bg-primary-foreground"
      )} />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            variant === 'default' 
              ? "bg-primary/10 text-primary" 
              : "bg-primary-foreground/20 text-primary-foreground"
          )}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <span className={cn(
              "text-sm font-medium px-2 py-1 rounded-full",
              trend.isPositive 
                ? "bg-success/20 text-success" 
                : "bg-destructive/20 text-destructive"
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
        
        <h3 className={cn(
          "text-sm font-medium mb-1",
          variant === 'default' ? "text-muted-foreground" : "text-primary-foreground/80"
        )}>
          {title}
        </h3>
        <p className="text-3xl font-display font-bold">{value}</p>
      </div>
    </motion.div>
  );
}
