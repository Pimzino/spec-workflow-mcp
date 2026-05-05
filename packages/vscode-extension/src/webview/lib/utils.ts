import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr?: string) {
  if (!dateStr) {return 'Never';}
  return new Date(dateStr).toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export function formatDistanceToNow(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {return 'Just now';}
  if (diffInSeconds < 3600) {return `${Math.floor(diffInSeconds / 60)}m ago`;}
  if (diffInSeconds < 86400) {return `${Math.floor(diffInSeconds / 3600)}h ago`;}
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}
