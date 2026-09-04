import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge CSS class names with Tailwind CSS conflict resolution.
 * Combines clsx for conditional classes and tailwind-merge for proper Tailwind class merging.
 *
 * @param inputs - Variable number of class values (strings, objects, arrays, etc.)
 * @returns Merged and deduplicated class name string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
