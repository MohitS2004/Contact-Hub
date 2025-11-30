export function formatLocalDate(dateString: string): string {
  let date: Date;

  if (
    dateString.includes('T') &&
    (dateString.endsWith('Z') || dateString.match(/[+-]\d{2}:\d{2}$/))
  ) {
    date = new Date(dateString);
  } else if (
    dateString.includes('T') &&
    !dateString.includes('Z') &&
    !dateString.match(/[+-]\d{2}:\d{2}$/)
  ) {
    date = new Date(dateString + 'Z');
  } else {
    date = new Date(dateString);
    if (isNaN(date.getTime())) {
      date = new Date(dateString + 'Z');
    }
  }

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatLocalDateOnly(dateString: string): string {
  let date: Date;

  if (dateString.endsWith('Z')) {
    date = new Date(dateString);
  } else if (
    (dateString.includes('+') || dateString.includes('-')) &&
    dateString.match(/[+-]\d{2}:\d{2}$/)
  ) {
    date = new Date(dateString);
  } else {
    date = new Date(dateString + 'Z');
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

