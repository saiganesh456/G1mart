/**
 * G1mart Indian Standard Time (IST) Date Formatting Utilities
 * Standardizes all date/time representations to Asia/Kolkata (UTC+5:30)
 */

export function formatToIST(
  dateInput?: string | number | Date | null,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateInput) {
    dateInput = new Date();
  }

  const d = typeof dateInput === 'string' || typeof dateInput === 'number' 
    ? new Date(dateInput) 
    : dateInput;

  if (isNaN(d.getTime())) {
    return 'Just now';
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options,
  };

  return d.toLocaleString('en-IN', defaultOptions);
}

export function formatTimeToIST(dateInput?: string | number | Date | null): string {
  if (!dateInput) {
    dateInput = new Date();
  }

  const d = typeof dateInput === 'string' || typeof dateInput === 'number' 
    ? new Date(dateInput) 
    : dateInput;

  if (isNaN(d.getTime())) {
    return 'Just now';
  }

  return d.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}
