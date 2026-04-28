# LaTeX Editor Guide

## 📝 Overview

ResumeForge now includes an integrated LaTeX editor with live preview, similar to Overleaf. This allows you to edit your generated resume and see the changes in real-time.

## 🎨 Editor Modes

### 1. Editor Mode
**Full-screen LaTeX editor**
- Edit your LaTeX code with syntax highlighting
- Monospace font for better code readability
- Auto-sync between editor and split view

**When to use:**
- Making extensive edits to the LaTeX code
- Need maximum space for editing
- Prefer to focus on code without distractions

### 2. Split View Mode
**Side-by-side editor and preview**
- Left panel: LaTeX editor
- Right panel: Live preview
- Auto-updates preview as you type (1-second delay)
- Perfect for iterative editing

**When to use:**
- Want to see changes immediately
- Making small tweaks and adjustments
- Need to verify formatting while editing

### 3. Preview Mode
**Full-screen rendered preview**
- See your resume as it will appear
- Clean, professional rendering
- Download as HTML for easy sharing

**When to use:**
- Final review before downloading
- Checking overall layout and formatting
- Sharing preview with others

### 4. Sources Mode
**View library items used**
- See which projects/experiences were included
- Review source content
- Verify accuracy

**When to use:**
- Checking which items were selected
- Verifying content accuracy
- Understanding AI's selection criteria

## 🚀 Quick Start

### Step 1: Generate Resume
1. Paste job description
2. Click "Generate Tailored Resume"
3. Wait for generation to complete

### Step 2: Edit LaTeX
1. Click "Editor" tab (default view)
2. Edit the LaTeX code directly
3. Changes are auto-saved to memory

### Step 3: Preview Changes
1. Click "Split View" tab for live preview
2. Or click "Preview" tab for full-screen preview
3. Preview updates automatically in split view
4. Click "Update" button in preview mode to refresh

### Step 4: Download
1. Click ".TEX" to download LaTeX source
2. Click ".HTML" to download rendered HTML
3. Click "Copy" to copy LaTeX to clipboard

## ✏️ Editing Tips

### Basic LaTeX Commands

**Text Formatting:**
```latex
\textbf{Bold text}
\textit{Italic text}
\underline{Underlined text}
```

**Links:**
```latex
\href{https://example.com}{Link text}
```

**Sections:**
```latex
\section{Section Name}
```

**Resume Items:**
```latex
\resumeSubheading
  {Job Title}{Date Range}
  {Company Name}{Location}

\resumeItem{Bullet point description}
```

### Common Edits

**Change Contact Information:**
```latex
\begin{center}
    \textbf{\Huge \scshape Your Name} \\ \vspace{1pt}
    \small 123-456-7890 $|$ \href{mailto:you@email.com}{\underline{you@email.com}} $|$ 
    \href{https://linkedin.com/in/you}{\underline{linkedin.com/in/you}} $|$
    \href{https://github.com/you}{\underline{github.com/you}}
\end{center}
```

**Add/Remove Bullet Points:**
```latex
\resumeItemListStart
  \resumeItem{First bullet point}
  \resumeItem{Second bullet point}
  \resumeItem{Third bullet point}  % Add or remove lines like this
\resumeItemListEnd
```

**Reorder Sections:**
Move entire `\section{...}` blocks up or down to change order.

**Adjust Spacing:**
```latex
\vspace{-2pt}  % Reduce space
\vspace{2pt}   % Add space
```

## 🔄 Auto-Sync Features

### Editor ↔ Split View Sync
- Changes in main editor automatically sync to split view
- Changes in split view editor automatically sync to main editor
- Both editors always show the same content

### Auto-Update Preview
- Split view preview updates 1 second after you stop typing
- Prevents excessive re-rendering while typing
- Smooth, responsive experience

### Manual Update
- Preview mode has "Update" button
- Click to refresh preview with latest changes
- Useful for final review

## 📥 Download Options

### .TEX File
**LaTeX source code**
- Editable in any LaTeX editor (Overleaf, TeXShop, etc.)
- Compile to PDF using LaTeX compiler
- Full control over formatting

**File naming:** `Resume_JobTitle_2026.tex`

### .HTML File
**Rendered HTML**
- Opens in any web browser
- Print to PDF from browser
- Easy to share via email

**File naming:** `Resume_JobTitle_2026.html`

### Copy to Clipboard
**Quick sharing**
- Copy LaTeX code to clipboard
- Paste into Overleaf or other editors
- Share with collaborators

## 🎯 Best Practices

### 1. Use Split View for Editing
- See changes immediately
- Catch formatting errors quickly
- Iterate faster

### 2. Preview Before Downloading
- Always check full preview
- Verify all sections render correctly
- Check for LaTeX errors

### 3. Save Frequently
- Download .TEX file periodically
- Keep backup copies
- Version control your resumes

### 4. Test Compilation
- If using Overleaf, test compilation there
- Ensure no LaTeX errors
- Verify PDF output

### 5. Keep It Simple
- Stick to standard LaTeX commands
- Avoid complex formatting
- ATS-friendly = simple formatting

## 🐛 Troubleshooting

### Preview Not Updating

**Problem:** Split view preview doesn't update
**Solution:** 
- Wait 1 second after typing
- Check browser console for errors
- Refresh page if needed

### LaTeX Errors in Preview

**Problem:** Preview shows errors or broken formatting
**Solution:**
- Check for unmatched braces `{}`
- Verify all commands are spelled correctly
- Look for missing `\end{...}` tags

### Editor Not Syncing

**Problem:** Main editor and split editor out of sync
**Solution:**
- Click in the editor you want to use
- Type a character to trigger sync
- Refresh page if issue persists

### Download Not Working

**Problem:** .TEX or .HTML download fails
**Solution:**
- Check browser's download settings
- Disable popup blockers
- Try different browser

## 🔍 Advanced Features

### Keyboard Shortcuts

**Editor:**
- `Ctrl+A` / `Cmd+A` - Select all
- `Ctrl+C` / `Cmd+C` - Copy
- `Ctrl+V` / `Cmd+V` - Paste
- `Ctrl+Z` / `Cmd+Z` - Undo
- `Ctrl+Y` / `Cmd+Y` - Redo
- `Tab` - Insert 2 spaces

### Search and Replace

Use browser's built-in search:
- `Ctrl+F` / `Cmd+F` - Find
- `Ctrl+H` / `Cmd+H` - Replace (in some browsers)

### Multi-Line Editing

1. Select multiple lines
2. Edit as needed
3. Changes apply to all selected lines

## 📚 LaTeX Resources

### Learning LaTeX
- [Overleaf Learn LaTeX](https://www.overleaf.com/learn)
- [LaTeX Wikibook](https://en.wikibooks.org/wiki/LaTeX)
- [LaTeX Tutorial](https://www.latex-tutorial.com/)

### Resume Templates
- [Jake's Resume Template](https://github.com/jakegut/resume) (default)
- [Awesome CV](https://github.com/posquit0/Awesome-CV)
- [ModernCV](https://www.ctan.org/pkg/moderncv)

### Online Editors
- [Overleaf](https://www.overleaf.com/) - Online LaTeX editor
- [Papeeria](https://papeeria.com/) - Alternative online editor
- [CoCalc](https://cocalc.com/) - Collaborative LaTeX

## 🎨 Customization

### Change Font Size
```latex
\documentclass[letterpaper,11pt]{article}  % Change 11pt to 10pt or 12pt
```

### Adjust Margins
```latex
\addtolength{\oddsidemargin}{-0.5in}   % Left margin
\addtolength{\evensidemargin}{-0.5in}  % Right margin
\addtolength{\textwidth}{1in}          % Width
\addtolength{\topmargin}{-.5in}        % Top margin
\addtolength{\textheight}{1.0in}       % Height
```

### Change Section Style
```latex
\titleformat{\section}{
  \vspace{-4pt}\scshape\raggedright\large  % Adjust spacing and size
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]
```

## 🚀 Pro Tips

### 1. Use Version Control
- Save different versions with dates
- Keep track of changes
- Easy to revert if needed

### 2. Create Templates
- Save your customized LaTeX as template
- Reuse for different jobs
- Maintain consistent formatting

### 3. Test ATS Compatibility
- Keep single-column layout
- Use simple fonts
- Avoid complex tables
- Test with ATS checkers

### 4. Optimize for Keywords
- Use both acronyms and full forms
- Repeat key skills 2-3 times
- Match job description language

### 5. Keep It Concise
- One page for <10 years experience
- Two pages maximum
- Remove outdated items

## 📊 Editor Features Comparison

| Feature | Editor Mode | Split View | Preview Mode |
|---------|-------------|------------|--------------|
| Edit LaTeX | ✅ Full screen | ✅ Half screen | ❌ Read-only |
| Live Preview | ❌ No | ✅ Auto-update | ✅ Manual update |
| Best For | Extensive edits | Iterative changes | Final review |
| Screen Space | Maximum | Balanced | Maximum preview |
| Update Speed | N/A | 1s delay | Manual |

## 🎯 Workflow Recommendations

### For Quick Edits
1. Generate resume
2. Switch to Split View
3. Make small changes
4. See updates immediately
5. Download when done

### For Major Revisions
1. Generate resume
2. Switch to Editor mode
3. Make extensive changes
4. Switch to Preview mode
5. Review full layout
6. Download when satisfied

### For Final Review
1. Complete all edits
2. Switch to Preview mode
3. Review entire resume
4. Check all sections
5. Download .HTML for sharing
6. Download .TEX for archiving

---

**Last Updated:** 2026-04-28
**Version:** 3.1 (LaTeX Editor)
**Status:** Production Ready

**Related Documentation:**
- [README.md](../README.md) - Main documentation
- [ATS_OPTIMIZATION_GUIDE.md](./ATS_OPTIMIZATION_GUIDE.md) - ATS strategies
- [VERIFICATION_SYSTEM.md](./VERIFICATION_SYSTEM.md) - Verification details
