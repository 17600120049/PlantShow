export function resolveMediaUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') {
    return '';
  }
  if (/^https?:\/\//.test(url)) {
    return url;
  }
  if (/^wxfile:/.test(url) || /^http:\/\/tmp/.test(url)) {
    return '';
  }
  return url.startsWith('/') ? url : `/${url}`;
}

export function isDisplayableMediaUrl(url?: string | null): boolean {
  const resolved = resolveMediaUrl(url);
  if (!resolved) {
    return false;
  }
  return /^https?:\/\//.test(resolved) || resolved.startsWith('/api/uploads/');
}

export function getDisplayablePhotos(photos?: string[] | null): string[] {
  return (photos || []).map(resolveMediaUrl).filter(isDisplayableMediaUrl);
}
