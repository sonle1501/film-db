export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function getMoviePosterUrl(imageUrl?: string | null) {
  if (!imageUrl) {
    return "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?auto=format&fit=crop&w=800&q=80";
  }
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  return `${baseUrl}${imageUrl}`;
}

