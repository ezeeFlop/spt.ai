import { formatDistance, format } from 'date-fns';

export const formatDate = (date: string) => {
  const d = new Date(date);
  return format(d, 'MMM dd, yyyy');
};

export const formatRelativeDate = (date: string) => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};
