/**
 * Progress Component
 * A reusable progress bar component
 */
import React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    return (
      <div
        ref={ref}
        className={cn("w-full bg-secondary rounded-full", className)}
        {...props}
      >
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }
)

Progress.displayName = "Progress"
