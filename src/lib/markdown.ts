import { marked } from 'marked';

// Configure marked options for GitHub Flavored Markdown
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Convert markdown to HTML
 */
export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown) as string;
}

/**
 * Extract excerpt from markdown (first paragraph)
 */
export function extractExcerpt(markdown: string, maxLength = 160): string {
  // Remove markdown syntax for excerpt
  const plainText = markdown
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
    .replace(/`(.+?)`/g, '$1') // Remove inline code
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  // Get first sentence or maxLength characters
  const excerpt = plainText.substring(0, maxLength);
  return excerpt.length < plainText.length ? excerpt + '...' : excerpt;
}

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Estimate reading time
 */
export function estimateReadingTime(markdown: string): number {
  const wordsPerMinute = 200;
  const words = markdown.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}
