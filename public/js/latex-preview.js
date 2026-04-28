// ── LaTeX Resume Preview ─────────────────────────────────────────
// Parses Jake-style LaTeX resumes and renders them as styled HTML.
// Supports the common resume template commands used by ResumeForge.

const LatexPreview = (() => {

  // ── Inline LaTeX → HTML ────────────────────────────────────────
  function _inline(text) {
    if (!text) return '';
    
    // Process nested commands recursively
    let result = text;
    
    // Handle \textbf with proper nesting
    let changed = true;
    while (changed) {
      changed = false;
      result = result.replace(/\\textbf\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, (match, content) => {
        changed = true;
        return '<strong>' + content + '</strong>';
      });
    }
    
    // Handle other formatting
    result = result
      .replace(/\\textit\{([^}]*)\}/g, '<em>$1</em>')
      .replace(/\\emph\{([^}]*)\}/g, '<em>$1</em>')
      .replace(/\\underline\{([^}]*)\}/g, '<u>$1</u>')
      .replace(/\\textasciitilde/g, '~')
      .replace(/\\scshape\b/g, '')
      .replace(/\\Huge\b/g, '')
      .replace(/\\Large\b/g, '')
      .replace(/\\large\b/g, '')
      .replace(/\\small\b/g, '')
      .replace(/\\tiny\b/g, '')
      .replace(/\\normalsize\b/g, '')
      .replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, '<a href="$1" target="_blank">$2</a>')
      .replace(/\\url\{([^}]*)\}/g, '<a href="$1" target="_blank">$1</a>')
      .replace(/\$\|?\s*\$/g, ' | ')
      .replace(/\$([^$]+)\$/g, '$1')
      .replace(/\\vspace\{[^}]*\}/g, '')
      .replace(/\\hspace\{[^}]*\}/g, ' ')
      .replace(/\\quad/g, '  ')
      .replace(/\\,/g, ' ')
      .replace(/\\\\/g, '<br>')
      .replace(/\\&/g, '&')
      .replace(/~~/g, ' ')
      .replace(/~/g, ' ');
    
    // Remove remaining simple braces
    result = result.replace(/\{([^{}]*)\}/g, '$1');
    
    return result.trim();
  }

  // ── Extract argument from \cmd{...} ───────────────────────────
  function _arg(text, start) {
    let depth = 0, i = start, result = '';
    while (i < text.length) {
      if (text[i] === '{') { if (depth++ > 0) result += '{'; }
      else if (text[i] === '}') { if (--depth === 0) return { val: result, end: i + 1 }; else result += '}'; }
      else result += text[i];
      i++;
    }
    return { val: result, end: i };
  }

  // ── Extract N brace arguments ──────────────────────────────────
  function _args(text, start, n) {
    const results = [];
    let pos = start;
    for (let i = 0; i < n; i++) {
      // skip whitespace
      while (pos < text.length && /\s/.test(text[pos])) pos++;
      if (text[pos] === '{') {
        const r = _arg(text, pos + 1);
        results.push(r.val);
        pos = r.end;
      } else {
        results.push('');
      }
    }
    return { args: results, end: pos };
  }

  // ── Parse heading block ────────────────────────────────────────
  function _parseHeading(body) {
    // Extract \textbf{\Huge \scshape Name}
    const nameMatch = body.match(/\\textbf\{\\Huge\s*\\scshape\s*([^}]+)\}/) ||
                      body.match(/\\textbf\{\\Huge\s*([^}]+)\}/) ||
                      body.match(/\\Huge\s*\\scshape\s*([^\\\n]+)/);
    const name = nameMatch ? nameMatch[1].trim() : '';

    // Extract contact items separated by $|$ or \\
    const lines = body.split(/\\\\\s*|\$\s*\|\s*\$/).map(l => l.trim()).filter(Boolean);
    const contacts = [];
    for (const line of lines) {
      if (!line || line.includes('\\Huge') || line.includes('\\scshape')) continue;
      // href links
      const hrefMatch = line.match(/\\href\{([^}]+)\}\{\\underline\{([^}]+)\}\}/) ||
                        line.match(/\\href\{([^}]+)\}\{([^}]+)\}/);
      if (hrefMatch) {
        contacts.push(`<a href="${hrefMatch[1]}" target="_blank">${_inline(hrefMatch[2])}</a>`);
      } else {
        const cleaned = _inline(line);
        if (cleaned) contacts.push(cleaned);
      }
    }

    return `
      <div class="resume-header">
        <div class="resume-name">${_inline(name)}</div>
        <div class="resume-contact">${contacts.join(' <span class="sep">|</span> ')}</div>
      </div>`;
  }

  // ── Parse \resumeSubheading{A}{B}{C}{D} ───────────────────────
  function _parseSubheading(text, pos) {
    const r = _args(text, pos, 4);
    const [a, b, c, d] = r.args.map(_inline);
    return {
      html: `<div class="subheading">
        <div class="subheading-row">
          <span class="subheading-title">${a}</span>
          <span class="subheading-date">${b}</span>
        </div>
        <div class="subheading-row">
          <span class="subheading-sub">${c}</span>
          <span class="subheading-date">${d}</span>
        </div>
      </div>`,
      end: r.end
    };
  }

  // ── Parse \resumeProjectHeading{A}{B} ─────────────────────────
  function _parseProjectHeading(text, pos) {
    const r = _args(text, pos, 2);
    const [a, b] = r.args.map(_inline);
    return {
      html: `<div class="subheading">
        <div class="subheading-row">
          <span class="subheading-title">${a}</span>
          <span class="subheading-date">${b}</span>
        </div>
      </div>`,
      end: r.end
    };
  }

  // ── Parse \resumeItem{text} ────────────────────────────────────
  function _parseItem(text, pos) {
    const r = _arg(text, pos);
    return { html: `<li>${_inline(r.val)}</li>`, end: r.end };
  }

  // ── Main parser ────────────────────────────────────────────────
  function parse(latex) {
    // Extract \begin{document}...\end{document}
    const docMatch = latex.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
    const body = docMatch ? docMatch[1] : latex;

    let html = '';
    let i = 0;

    // Extract center block (heading)
    const centerMatch = body.match(/\\begin\{center\}([\s\S]*?)\\end\{center\}/);
    if (centerMatch) {
      html += _parseHeading(centerMatch[1]);
    }

    // Now parse sections
    const sectionRe = /\\section\{([^}]+)\}/g;
    let sectionMatch;
    const sections = [];
    while ((sectionMatch = sectionRe.exec(body)) !== null) {
      sections.push({ title: sectionMatch[1], start: sectionMatch.index + sectionMatch[0].length });
    }

    for (let si = 0; si < sections.length; si++) {
      const sec = sections[si];
      const end = si + 1 < sections.length ? sections[si + 1].start - sections[si + 1].title.length - 10 : body.length;
      const secBody = body.slice(sec.start, end);

      html += `<div class="resume-section">
        <div class="section-title">${_inline(sec.title)}</div>
        <div class="section-body">`;

      // Parse section body
      html += _parseSectionBody(secBody);

      html += `</div></div>`;
    }

    return html;
  }

  function _parseSectionBody(text) {
    let html = '';
    let i = 0;
    let inItemList = false;
    let inSubList = false;

    const closeItemList = () => {
      if (inItemList) { html += '</ul>'; inItemList = false; }
    };
    const closeSubList = () => {
      if (inSubList) { html += '</div>'; inSubList = false; }
    };

    while (i < text.length) {
      // Skip comments
      if (text[i] === '%') {
        while (i < text.length && text[i] !== '\n') i++;
        continue;
      }

      if (text[i] !== '\\') { i++; continue; }

      // Look for command
      const cmdMatch = text.slice(i).match(/^\\([a-zA-Z*]+)/);
      if (!cmdMatch) { i++; continue; }

      const cmd = cmdMatch[1];
      const cmdEnd = i + cmdMatch[0].length;

      if (cmd === 'resumeSubHeadingListStart') {
        closeItemList();
        if (!inSubList) { html += '<div class="sub-list">'; inSubList = true; }
        i = cmdEnd; continue;
      }
      if (cmd === 'resumeSubHeadingListEnd') {
        closeItemList();
        closeSubList();
        i = cmdEnd; continue;
      }
      if (cmd === 'resumeItemListStart') {
        closeItemList();
        html += '<ul class="item-list">'; inItemList = true;
        i = cmdEnd; continue;
      }
      if (cmd === 'resumeItemListEnd') {
        closeItemList();
        i = cmdEnd; continue;
      }
      if (cmd === 'resumeSubheading') {
        closeItemList();
        const r = _parseSubheading(text, cmdEnd);
        html += r.html; i = r.end; continue;
      }
      if (cmd === 'resumeSubSubheading') {
        closeItemList();
        const r = _args(text, cmdEnd, 2);
        const [a, b] = r.args.map(_inline);
        html += `<div class="subheading-row sub-sub"><span class="subheading-sub">${a}</span><span class="subheading-date">${b}</span></div>`;
        i = r.end; continue;
      }
      if (cmd === 'resumeProjectHeading') {
        closeItemList();
        const r = _parseProjectHeading(text, cmdEnd);
        html += r.html; i = r.end; continue;
      }
      if (cmd === 'resumeItem' || cmd === 'resumeSubItem') {
        if (!inItemList) { html += '<ul class="item-list">'; inItemList = true; }
        const r = _parseItem(text, cmdEnd);
        html += r.html; i = r.end; continue;
      }
      if (cmd === 'item') {
        if (!inItemList) { html += '<ul class="item-list">'; inItemList = true; }
        // grab rest of line as item text - handle nested braces properly
        let j = cmdEnd;
        let braceDepth = 0;
        let itemContent = '';
        
        // Skip whitespace after \item
        while (j < text.length && /\s/.test(text[j])) j++;
        
        // Collect content until we hit another \item or \end
        while (j < text.length) {
          if (text[j] === '{') {
            braceDepth++;
            itemContent += text[j];
          } else if (text[j] === '}') {
            braceDepth--;
            itemContent += text[j];
          } else if (braceDepth === 0) {
            // Check if we're at the start of a new command
            if (text.slice(j).startsWith('\\item') || text.slice(j).startsWith('\\end')) {
              break;
            }
            itemContent += text[j];
          } else {
            itemContent += text[j];
          }
          j++;
        }
        
        itemContent = itemContent.trim();
        if (itemContent) {
          html += `<li>${_inline(itemContent)}</li>`;
        }
        i = j; 
        continue;
      }
      // begin/end itemize
      if (cmd === 'begin') {
        const r = _arg(text, cmdEnd + 1);
        if (r.val === 'itemize') { 
          // Check for optional parameters like [leftmargin=...]
          let skipPos = r.end;
          while (skipPos < text.length && /\s/.test(text[skipPos])) skipPos++;
          if (text[skipPos] === '[') {
            // Skip optional parameters
            let bracketDepth = 1;
            skipPos++;
            while (skipPos < text.length && bracketDepth > 0) {
              if (text[skipPos] === '[') bracketDepth++;
              else if (text[skipPos] === ']') bracketDepth--;
              skipPos++;
            }
            i = skipPos;
          } else {
            i = r.end;
          }
          html += '<ul class="item-list">'; 
          inItemList = true;
          continue;
        }
        i = r.end; continue;
      }
      if (cmd === 'end') {
        const r = _arg(text, cmdEnd + 1);
        if (r.val === 'itemize') closeItemList();
        i = r.end; continue;
      }
      // Handle \small command
      if (cmd === 'small') {
        i = cmdEnd; continue;
      }
      // Handle \textbf with nested content
      if (cmd === 'textbf') {
        const r = _arg(text, cmdEnd + 1);
        html += `<strong>${_inline(r.val)}</strong>`;
        i = r.end; continue;
      }

      i = cmdEnd;
    }

    closeItemList();
    closeSubList();
    return html;
  }

  // ── CSS for the rendered resume ────────────────────────────────
  const CSS = `
    .latex-resume {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      color: #000;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.5in 0.75in;
      background: #fff;
      line-height: 1.3;
    }
    .resume-header { text-align: center; margin-bottom: 10px; }
    .resume-name { font-size: 22pt; font-weight: bold; font-variant: small-caps; letter-spacing: 0.5px; }
    .resume-contact { font-size: 9pt; margin-top: 4px; color: #333; }
    .resume-contact .sep { margin: 0 4px; color: #666; }
    .resume-contact a { color: #000; text-decoration: underline; }
    .resume-section { margin-bottom: 10px; }
    .section-title {
      font-size: 11pt;
      font-weight: bold;
      font-variant: small-caps;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #000;
      padding-bottom: 2px;
      margin-bottom: 6px;
    }
    .section-body { padding-left: 2px; }
    .sub-list { display: flex; flex-direction: column; gap: 6px; }
    .subheading { margin-bottom: 2px; }
    .subheading-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .subheading-title { font-weight: bold; font-size: 10.5pt; }
    .subheading-sub { font-style: italic; font-size: 9.5pt; }
    .subheading-date { font-style: italic; font-size: 9.5pt; white-space: nowrap; margin-left: 8px; }
    .sub-sub { margin-top: 1px; }
    .item-list {
      margin: 2px 0 4px 0;
      padding-left: 18px;
      list-style-type: disc;
    }
    .item-list li {
      font-size: 9.5pt;
      margin-bottom: 1px;
      line-height: 1.35;
    }
    .item-list li strong { font-weight: bold; }
    .item-list li br { display: block; margin: 2px 0; }
    a { color: #000; }
  `;

  // ── Render into a container element ───────────────────────────
  function render(latex, container) {
    const html = parse(latex);
    container.innerHTML = html;
    // Inject scoped styles if not already present
    if (!document.getElementById('latex-preview-styles')) {
      const style = document.createElement('style');
      style.id = 'latex-preview-styles';
      style.textContent = CSS;
      document.head.appendChild(style);
    }
  }

  // ── Build a standalone downloadable HTML file ─────────────────
  function buildHtml(latex, title) {
    const body = parse(latex);
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Resume'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f5f5f5; }
    @media print { body { background: #fff; } .latex-resume { padding: 0; } }
    ${CSS}
  </style>
</head>
<body>
  <div class="latex-resume">${body}</div>
</body>
</html>`;
  }

  return { render, buildHtml, parse };
})();
