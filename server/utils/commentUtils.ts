// Simple bad words list (expand as needed)
const BAD_WORDS = ['badword1', 'badword2', 'badword3'];

export function filterBadWords(content: string): string {
  let filtered = content;
  BAD_WORDS.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '****');
  });
  return filtered;
}

export function containsURL(content: string): boolean {
  // Simple URL regex
  const urlRegex = /(https?:\/\/|www\.)[\w\-]+(\.[\w\-]+)+\S*/gi;
  return urlRegex.test(content);
} 