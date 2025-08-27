/**
 * Utility Functions
 * Common utility functions used across the application
 */
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges multiple class names and Tailwind CSS classes efficiently
 * @param inputs - Class names to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
