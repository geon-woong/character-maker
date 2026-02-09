'use client';

import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
}

export function Card({ className, selected, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border-2 bg-white p-4 transition-all duration-150',
        selected
          ? 'border-indigo-500 ring-2 ring-indigo-200 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm',
        'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
