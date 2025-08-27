/**
 * Select Components
 * Industry-standard select components with proper dropdown functionality
 */
import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "lucide-react"

export interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  placeholder?: string
  disabled?: boolean
  className?: string
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ value, onValueChange, children, placeholder, disabled = false, className }) => {
    const [isOpen, setIsOpen] = useState(false)
    const selectRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsOpen(false)
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
      
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        document.removeEventListener("keydown", handleEscape)
      }
    }, [])

    const handleSelect = (selectedValue: string) => {
      onValueChange?.(selectedValue)
      setIsOpen(false)
    }

    return (
      <div ref={selectRef} className={cn("relative", className)}>
        <SelectTrigger
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <SelectValue placeholder={placeholder} value={value} />
          <ChevronDown 
            className={cn(
              "h-4 w-4 opacity-50 transition-transform duration-200",
              isOpen && "rotate-180"
            )} 
          />
        </SelectTrigger>
        {isOpen && (
          <SelectContent>
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                  onSelect: handleSelect,
                  //@ts-ignore
                  isSelected: child?.props.value === value,
                  ...child.props as any
                })
              }
              return child
            })}
          </SelectContent>
        )}
      </div>
    )
  }
)

Select.displayName = "Select"

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-accent hover:text-accent-foreground transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)

SelectTrigger.displayName = "SelectTrigger"

export interface SelectValueProps {
  placeholder?: string
  value?: string
}

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder, value }) => (
  <span className={cn(
    "block truncate",
    value ? "text-foreground" : "text-muted-foreground"
  )}>
    {value || placeholder}
  </span>
)

export interface SelectContentProps {
  children: React.ReactNode
}

export const SelectContent: React.FC<SelectContentProps> = ({ children }) => (
  <div className="absolute top-full z-50 w-full mt-1 bg-popover border border-input rounded-md shadow-lg max-h-80 overflow-hidden">
    <div className="max-h-80 overflow-y-auto py-1">
      {children}
    </div>
  </div>
)

export interface SelectItemProps {
  value: string
  children: React.ReactNode
  onSelect?: (value: string) => void
  isSelected?: boolean
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, children, onSelect, isSelected = false }) => (
  <div
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors",
      isSelected && "bg-accent text-accent-foreground"
    )}
    onClick={() => onSelect?.(value)}
    role="option"
    aria-selected={isSelected}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {isSelected && <Check className="h-4 w-4" />}
    </span>
    {children}
  </div>
)
