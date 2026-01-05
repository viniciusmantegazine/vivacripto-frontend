/**
 * Remove Markdown syntax from text
 * Useful for displaying titles and excerpts without formatting marks
 */
export function stripMarkdown(text: string): string {
  return text
    // Remove headers (###, ##, #)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold (**text** or __text__)
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    // Remove italic (*text* or _text_)
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove links [text](url)
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove inline code `code`
    .replace(/`([^`]+)`/g, '$1')
    // Remove strikethrough ~~text~~
    .replace(/~~(.*?)~~/g, '$1')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Calculate reading time based on word count
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

/**
 * Format date to Brazilian Portuguese
 */
/**
 * Clean text for meta description (Open Graph, Twitter Cards)
 * Removes prefixes, markdown syntax, and limits to 150 characters
 */
export function cleanMetaDescription(text: string): string {
  return text
    // Remove common prefixes like "Título:", "**Título:", etc.
    .replace(/^\*\*?\s*Título\s*:\s*/i, '')
    .replace(/^Título\s*:\s*/i, '')
    // Remove markdown syntax
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim()
    // Limit to 150 characters for meta description
    .substring(0, 150)
    // Add ellipsis if truncated
    + (text.length > 150 ? '...' : '')
}

/**
 * Remove duplicate title from content
 * Removes first paragraph if it contains the title
 */
export function removeDuplicateTitle(content: string, title: string): string {
  const lines = content.split('\n')
  if (lines.length === 0) return content
  
  // Clean the title for comparison
  const cleanTitle = stripMarkdown(title).toLowerCase()
  
  // Check first few lines for duplicate title
  const firstLine = stripMarkdown(lines[0]).toLowerCase()
  
  // If first line contains the title or starts with "Título:"
  if (
    firstLine.includes(cleanTitle) ||
    firstLine.startsWith('título:') ||
    firstLine.match(/^\*\*título:/i)
  ) {
    // Remove first line and return the rest
    return lines.slice(1).join('\n').trim()
  }
  
  return content
}

export function formatDate(dateString: string, format: 'short' | 'long' = 'long'): string {
  const date = new Date(dateString)
  
  if (format === 'short') {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    })
  }
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
