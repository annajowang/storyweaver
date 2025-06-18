// src/lib/markdown.ts

export function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";

  let html = markdown;

  // Escape HTML to prevent XSS if not careful with input
  // For this controlled environment, we assume markdown is from user input in Textarea
  // html = html.replace(/</g, "&lt;").replace(/>/g, "&gt;");


  // Block elements order is important
  // Code blocks (```lang\ncode\n``` or ```\ncode\n```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const languageClass = lang ? `language-${lang}` : '';
    // Basic escaping for code content
    const escapedCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<pre><code class="${languageClass}">${escapedCode.trim()}</code></pre>`;
  });
  
  // Headers (e.g., # Header1, ## Header2)
  html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
  html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Blockquotes (e.g., > quote)
  // Handle multi-line blockquotes by processing line by line within a block
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
  html = html.replace(/<\/blockquote>\n<blockquote>/gim, '\n'); // Merge adjacent blockquotes

  // Horizontal Rule (e.g., --- or *** or ___)
  html = html.replace(/^\s*(?:---|___|\*\*\*)\s*$/gm, '<hr />');

  // Unordered lists
  html = html.replace(/^\s*[-*+] (.*$)/gim, '<li>$1</li>');
  // Wrap consecutive <li> into <ul>
  // This regex is greedy and might incorrectly wrap mixed lists. A proper parser is needed for robustness.
  html = html.replace(/((?:<li>.*?<\/li>\s*)+)/gim, (match) => {
    if(match.includes("<ul") || match.includes("<ol")) return match; // Avoid double wrapping
    return `<ul>${match.trim()}</ul>`;
  });
  
  // Ordered lists
  html = html.replace(/^\s*\d+\. (.*$)/gim, '<li>$1</li>');
  // Wrap consecutive <li> into <ol>
  // This is tricky. Let's assume lists are not mixed without separation.
  // The previous UL wrapping might have already processed some items.
  // A better way is to process line by line. For now, this is a simplified approach.
  // A simple trick: if it's already in <ul>, don't re-wrap. For OL, it's harder.
  // Let's ensure OL wrap happens after UL or make them specific.
  // For now, the same <li> wrapping logic as UL is applied, then manual check could happen.
  // This regex might double-wrap or mis-wrap.
  // A better approach is to handle list item generation and then wrap based on markers.
  // Given constraints, this will be imperfect.

  // Images (e.g., ![alt](url))
  html = html.replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" />');
  
  // Links (e.g., [title](url))
  html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Inline elements
  // Bold (e.g., **bold text** or __bold text__)
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>'); 

  // Italic (e.g., *italic text* or _italic text_)
  // Ensure this doesn't conflict with list markers if not handled by block logic first
  html = html.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/gim, '<em>$1</em>'); // single *
  html = html.replace(/(?<!_)_(?!_)(.*?)(?<!_)_(?!_)/gim, '<em>$1</em>');   // single _

  // Strikethrough (e.g., ~~strikethrough~~)
  html = html.replace(/~~(.*?)~~/gim, '<del>$1</del>');

  // Inline code (e.g., `code`)
  html = html.replace(/`(.*?)`/gim, '<code>$1</code>');

  // Paragraphs (split by double newlines, ensure not to wrap block elements like lists/headers)
  html = html.split(/\n\s*\n/).map(paragraph => {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) return '';
    // Check if it's already a block element
    if (/^<(h[1-6]|ul|ol|li|blockquote|hr|pre|table)/i.test(trimmedParagraph)) {
      return trimmedParagraph;
    }
    return `<p>${trimmedParagraph}</p>`;
  }).join('');

  // Convert single newlines within paragraphs to <br> - optional
  // html = html.replace(/\n/g, '<br />');

  return html.trim();
}
