import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency in GBP
 */
export const formatCurrency = (value: number | string | undefined | null): string => {
  // Handle undefined, null or NaN values
  if (value === undefined || value === null || (typeof value === 'number' && isNaN(value))) {
    console.warn('Received invalid value for currency formatting:', value);
    return '£0'; // Return a default value
  }
  
  // Convert string values to numbers if needed
  let numericValue: number;
  
  if (typeof value === 'string') {
    // Remove any currency symbols, commas, and spaces
    const cleanedValue = value.replace(/[£$€,\s]/g, '');
    numericValue = parseFloat(cleanedValue);
    
    // Check if parsing was successful
    if (isNaN(numericValue)) {
      console.warn(`Failed to parse currency string: "${value}" → "${cleanedValue}" → NaN`);
      return '£0';
    }
  } else {
    numericValue = value;
  }
  
  // Format the number using the GB locale and GBP currency
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(numericValue);
};

// Add any other utility functions you need
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatNumber(number: number): string {
  return new Intl.NumberFormat('en-GB').format(number);
}
