/**
 * Converts a date string from the backend (UTC) to local time
 * Returns a simple one-line format: "Nov 30, 2025, 1:02 AM"
 */
export function formatLocalDate(dateString: string): string {
  // If the date string doesn't end with 'Z' or have timezone info, treat it as UTC
  let date: Date;
  
  // Check if it's already a valid ISO string with timezone
  if (dateString.includes('T') && (dateString.endsWith('Z') || dateString.match(/[+-]\d{2}:\d{2}$/))) {
    // Has proper timezone info
    date = new Date(dateString);
  } else if (dateString.includes('T') && !dateString.includes('Z') && !dateString.match(/[+-]\d{2}:\d{2}$/)) {
    // ISO format but no timezone - assume UTC
    date = new Date(dateString + 'Z');
  } else {
    // Try parsing as-is first
    date = new Date(dateString);
    // If that doesn't work or gives invalid date, try appending Z
    if (isNaN(date.getTime())) {
      date = new Date(dateString + 'Z');
    }
  }
  
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

/**
 * Converts a date string to local date only (no time)
 */
export function formatLocalDateOnly(dateString: string): string {
  let date: Date;
  
  if (dateString.endsWith('Z')) {
    date = new Date(dateString);
  } else if (dateString.includes('+') || dateString.includes('-') && dateString.match(/[+-]\d{2}:\d{2}$/)) {
    date = new Date(dateString);
  } else {
    date = new Date(dateString + 'Z');
  }
  
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

