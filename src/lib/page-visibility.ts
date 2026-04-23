function createEmojiFavicon(emoji: string) {
  return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${emoji}</text></svg>`;
}

export function setFaviconEmoji(emoji: string) {
  const existingLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
  const link = existingLink || document.createElement('link');

  link.type = 'image/svg+xml';
  link.rel = 'icon';
  link.href = createEmojiFavicon(emoji);

  if (!existingLink) {
    document.head.appendChild(link);
  }
}

export function initPageVisibilityFeedback() {
  const originalTitle = document.title;

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      document.title = "Where'd you go?";
      setFaviconEmoji('🤔');
      return;
    }

    document.title = originalTitle;
    setFaviconEmoji('👋');
  });
}
