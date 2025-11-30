export function generateShareUrl(query: string, results?: any[]): string {
  const params = new URLSearchParams();
  params.set('q', query);
  
  if (results && results.length > 0) {
    // Include top 3 video IDs for context
    const videoIds = results.slice(0, 3).map(r => r.videoId).join(',');
    params.set('videos', videoIds);
  }
  
  return `${window.location.origin}?${params.toString()}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

export function shareNative(url: string, title: string) {
  if (navigator.share) {
    navigator.share({
      title: title,
      url: url,
    }).catch(() => {
      // Fallback to copy
      copyToClipboard(url);
    });
  } else {
    copyToClipboard(url);
  }
}