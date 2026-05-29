export function renderMarkdown(text: string): string {
  const lines = text.split('\n')
  const blocks: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Headings
    if (line.startsWith('### ')) {
      blocks.push(`<h3>${escape(line.slice(4))}</h3>`)
      i++
      continue
    }
    if (line.startsWith('## ')) {
      blocks.push(`<h2>${escape(line.slice(3))}</h2>`)
      i++
      continue
    }
    if (line.startsWith('# ')) {
      blocks.push(`<h1>${escape(line.slice(2))}</h1>`)
      i++
      continue
    }

    // Unordered list
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(`<li>${inline(escape(lines[i].slice(2)))}</li>`)
        i++
      }
      blocks.push(`<ul>${items.join('')}</ul>`)
      continue
    }

    // Blank line
    if (line.trim() === '') {
      i++
      continue
    }

    // Paragraph — collect consecutive non-empty, non-special lines
    const para: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('- ') &&
      !lines[i].startsWith('* ')
    ) {
      para.push(inline(escape(lines[i])))
      i++
    }
    if (para.length > 0) {
      blocks.push(`<p>${para.join('<br/>')}</p>`)
    }
  }

  return blocks.join('\n')
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function inline(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
}
