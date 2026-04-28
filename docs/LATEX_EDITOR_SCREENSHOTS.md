# LaTeX Editor Visual Guide

## 🎨 Editor Modes Overview

### 1. Editor Mode
```
┌─────────────────────────────────────────────────────────────┐
│ [Editor] [Split View] [Preview] [Sources]    [Copy] [.TEX] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  \documentclass[letterpaper,11pt]{article}                   │
│                                                               │
│  \begin{document}                                             │
│                                                               │
│  \begin{center}                                               │
│      \textbf{\Huge \scshape John Doe} \\ \vspace{1pt}       │
│      \small 123-456-7890 $|$ john@email.com                  │
│  \end{center}                                                 │
│                                                               │
│  \section{Experience}                                         │
│  \resumeSubHeadingListStart                                   │
│      \resumeSubheading                                        │
│        {Senior Software Engineer}{Jan 2020 -- Present}       │
│        {Tech Company}{San Francisco, CA}                     │
│      \resumeItemListStart                                     │
│        \resumeItem{Led development of...}                     │
│        \resumeItem{Architected scalable...}                   │
│      \resumeItemListEnd                                       │
│  \resumeSubHeadingListEnd                                     │
│                                                               │
│  \end{document}                                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Full-screen LaTeX editing
- Monospace font with syntax highlighting
- Maximum space for code
- Best for extensive edits

---

### 2. Split View Mode
```
┌─────────────────────────────────────────────────────────────┐
│ [Editor] [Split View] [Preview] [Sources]    [Copy] [.TEX] │
├──────────────────────────────┬──────────────────────────────┤
│ EDITOR                       │ PREVIEW                      │
├──────────────────────────────┼──────────────────────────────┤
│                              │                              │
│ \documentclass[...]{article} │      JOHN DOE                │
│                              │  123-456-7890 | john@email   │
│ \begin{document}             │                              │
│                              │  ─────────────────────────   │
│ \begin{center}               │  EXPERIENCE                  │
│   \textbf{\Huge John Doe}    │  ─────────────────────────   │
│   \small 123-456-7890        │                              │
│ \end{center}                 │  Senior Software Engineer    │
│                              │  Jan 2020 - Present          │
│ \section{Experience}         │  Tech Company                │
│ \resumeSubHeadingListStart   │  San Francisco, CA           │
│   \resumeSubheading          │                              │
│     {Senior Software...}     │  • Led development of...     │
│     {Jan 2020 -- Present}    │  • Architected scalable...   │
│     {Tech Company}{SF, CA}   │                              │
│   \resumeItemListStart       │                              │
│     \resumeItem{Led...}      │                              │
│     \resumeItem{Arch...}     │                              │
│   \resumeItemListEnd         │                              │
│ \resumeSubHeadingListEnd     │                              │
│                              │                              │
└──────────────────────────────┴──────────────────────────────┘
```

**Features:**
- Side-by-side editor and preview
- Auto-updates preview (1s delay)
- See changes immediately
- Best for iterative editing

---

### 3. Preview Mode
```
┌─────────────────────────────────────────────────────────────┐
│ [Editor] [Split View] [Preview] [Sources]  [Update] [.HTML]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│                         JOHN DOE                              │
│            123-456-7890 | john@email.com                      │
│         linkedin.com/in/john | github.com/john                │
│                                                               │
│  ─────────────────────────────────────────────────────────   │
│  EXPERIENCE                                                   │
│  ─────────────────────────────────────────────────────────   │
│                                                               │
│  Senior Software Engineer                Jan 2020 - Present   │
│  Tech Company                            San Francisco, CA    │
│                                                               │
│  • Led development of microservices architecture serving      │
│    100K+ users, reducing latency by 40%                       │
│  • Architected scalable CI/CD pipeline using Docker and       │
│    Kubernetes, improving deployment speed by 3x               │
│  • Mentored team of 5 junior engineers on best practices      │
│                                                               │
│  ─────────────────────────────────────────────────────────   │
│  PROJECTS                                                     │
│  ─────────────────────────────────────────────────────────   │
│                                                               │
│  E-Commerce Platform | React, Node.js, PostgreSQL            │
│                                                               │
│  • Built full-stack web application with 50K+ active users    │
│  • Implemented real-time inventory management system          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Full-screen rendered preview
- Professional resume layout
- Manual update button
- Best for final review

---

### 4. Sources Mode
```
┌─────────────────────────────────────────────────────────────┐
│ [Editor] [Split View] [Preview] [Sources]    [Copy] [.TEX] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Senior Software Engineer at Tech Company            │    │
│  │ [react] [node.js] [docker] [kubernetes]            │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ Led development of microservices architecture...    │    │
│  │ Architected scalable CI/CD pipeline...              │    │
│  │ Mentored team of 5 junior engineers...              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ E-Commerce Platform                                 │    │
│  │ [react] [node.js] [postgresql] [aws]               │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ Built full-stack web application with 50K+ users    │    │
│  │ Implemented real-time inventory management...       │    │
│  │ Integrated payment processing with Stripe...        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Machine Learning Model Deployment                   │    │
│  │ [python] [tensorflow] [docker] [aws]               │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ Deployed ML models to production serving 10K+...    │    │
│  │ Optimized inference time by 60% using...            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- View library items used
- See source content
- Verify accuracy
- Best for checking sources

---

## 🔄 Workflow Examples

### Quick Edit Workflow
```
1. Generate Resume
   ↓
2. Switch to Split View
   ↓
3. Edit LaTeX (left panel)
   ↓
4. See Preview Update (right panel)
   ↓
5. Download .TEX or .HTML
```

### Major Revision Workflow
```
1. Generate Resume
   ↓
2. Switch to Editor Mode
   ↓
3. Make Extensive Changes
   ↓
4. Switch to Preview Mode
   ↓
5. Review Full Layout
   ↓
6. Download .TEX or .HTML
```

### Verification Workflow
```
1. Generate Resume
   ↓
2. Switch to Sources Mode
   ↓
3. Verify Content Accuracy
   ↓
4. Switch to Editor Mode
   ↓
5. Make Corrections if Needed
   ↓
6. Switch to Preview Mode
   ↓
7. Final Review
   ↓
8. Download
```

---

## 🎯 Tab Navigation

```
┌─────────────────────────────────────────────────────────────┐
│ Tab Bar                                                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [📝 Editor] [⚡ Split View] [👁 Preview] [📚 Sources (3)]   │
│     ▔▔▔▔▔▔                                                   │
│   Active Tab                                                  │
│                                                               │
│  Action Buttons:                                              │
│  [🔄 Update] [📋 Copy] [⬇ .TEX] [⬇ .HTML]                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Tab Indicators:**
- **Active Tab** - White text, white underline, light background
- **Inactive Tab** - Gray text, no underline, no background
- **Sources Badge** - Shows count of library items used

**Action Buttons:**
- **Update** - Visible only in Preview mode
- **Copy** - Always visible, copies LaTeX to clipboard
- **.TEX** - Always visible, downloads LaTeX source
- **.HTML** - Visible in Preview and Split View modes

---

## 💡 Visual Cues

### Editor State
```
┌─────────────────────────────────────────────────────────────┐
│ Normal State                                                  │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ \documentclass[letterpaper,11pt]{article}             │   │
│ │                                                         │   │
│ │ Border: rgba(255,255,255,.1)                           │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ Focused State                                                 │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ \documentclass[letterpaper,11pt]{article}█            │   │
│ │                                                         │   │
│ │ Border: rgba(255,255,255,.2) (brighter)               │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Preview Update Indicator
```
Split View Mode:

Typing...
┌──────────────────┬──────────────────┐
│ \resumeItem{...█ │ [Previous        │
│                  │  Preview]        │
└──────────────────┴──────────────────┘

After 1 second:
┌──────────────────┬──────────────────┐
│ \resumeItem{...} │ [Updated         │
│                  │  Preview!]       │
└──────────────────┴──────────────────┘
```

### Button States
```
Normal:     [📋 Copy]
Hover:      [📋 Copy]  (lighter background)
Clicked:    [✓ Copied!] (success state, 2 seconds)
```

---

## 📱 Responsive Layout

### Desktop (>1024px)
```
┌─────────────────────────────────────────────────────────────┐
│ Split View: Side-by-side                                     │
├──────────────────────────────┬──────────────────────────────┤
│ Editor (50%)                 │ Preview (50%)                │
└──────────────────────────────┴──────────────────────────────┘
```

### Tablet/Mobile (<1024px)
```
┌─────────────────────────────────────────────────────────────┐
│ Split View: Stacked                                          │
├─────────────────────────────────────────────────────────────┤
│ Editor (100%)                                                │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ Preview (100%)                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Scheme

### Editor
- **Background:** `#0e0e11` (dark gray)
- **Text:** `#e4e4e7` (light gray)
- **Border:** `rgba(255,255,255,.1)` (subtle white)
- **Border (focused):** `rgba(255,255,255,.2)` (brighter)
- **Selection:** `rgba(139,92,246,.3)` (purple)

### Preview
- **Background:** `#ffffff` (white)
- **Text:** `#000000` (black)
- **Headers:** Bold, small-caps
- **Links:** Underlined, black

### Tabs
- **Active:** White text, white underline
- **Inactive:** Gray text (`#71717a`)
- **Hover:** Lighter gray

---

**Last Updated:** 2026-04-28
**Version:** 3.1 (LaTeX Editor)
**Status:** Production Ready

**Related Documentation:**
- [LATEX_EDITOR_GUIDE.md](./LATEX_EDITOR_GUIDE.md) - Complete editor guide
- [README.md](../README.md) - Main documentation
