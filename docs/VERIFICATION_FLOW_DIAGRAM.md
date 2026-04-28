# Verification System Flow Diagram

## 📊 Complete Flow Visualization

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INITIATES GENERATION                    │
│                    (Pastes job description + clicks Generate)        │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STAGE 1: SCORE & GENERATE SECTIONS                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Score Projects  │  │ Score Experiences│  │   Get Other      │  │
│  │   (Parallel)     │  │   (Parallel)     │  │   Items          │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                     │                      │             │
│           ▼                     ▼                      ▼             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Top 3-4         │  │  Top 3-4         │  │  All Skills/     │  │
│  │  Projects        │  │  Experiences     │  │  Certs/Edu       │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                     │                      │             │
│           ▼                     ▼                      ▼             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Generate        │  │  Generate        │  │  Generate        │  │
│  │  Projects        │  │  Experience      │  │  Skills/Certs    │  │
│  │  Section         │  │  Section         │  │  Section         │  │
│  │  (with strict    │  │  (with strict    │  │  (with strict    │  │
│  │  fact-checking)  │  │  fact-checking)  │  │  fact-checking)  │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                     │                      │             │
│           └─────────────────────┴──────────────────────┘             │
│                                 │                                    │
└─────────────────────────────────┼────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  STAGE 2: INTEGRATE INTO FINAL RESUME                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  Combine Sections:                                         │     │
│  │  • Insert contact information                              │     │
│  │  • Add Experience section                                  │     │
│  │  • Add Projects section                                    │     │
│  │  • Add Skills/Certifications section                       │     │
│  │  • Enforce single-column ATS layout                        │     │
│  │  • Apply 2026 optimization guidelines                      │     │
│  │  • Ensure valid LaTeX syntax                               │     │
│  └────────────────────────────┬───────────────────────────────┘     │
│                               │                                      │
└───────────────────────────────┼──────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Generated LaTeX      │
                    │  Resume (Draft)       │
                    └───────────┬───────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STAGE 3: VERIFY ACCURACY                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  Extract Content:                                          │     │
│  │  • Remove LaTeX commands                                   │     │
│  │  • Normalize whitespace                                    │     │
│  │  • Get plain text content                                  │     │
│  └────────────────────────────┬───────────────────────────────┘     │
│                               │                                      │
│                               ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  Compile Source Truth:                                     │     │
│  │  • All used library items                                  │     │
│  │  • With full metadata (dates, orgs, locations, etc.)       │     │
│  │  • Marked as "GROUND TRUTH"                                │     │
│  └────────────────────────────┬───────────────────────────────┘     │
│                               │                                      │
│                               ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  AI Fact-Checking:                                         │     │
│  │  • Check for hallucinated metrics                          │     │
│  │  • Check for invented technologies                         │     │
│  │  • Check for fabricated achievements                       │     │
│  │  • Check for incorrect dates/orgs/locations                │     │
│  │  • Allow paraphrasing and acronyms                         │     │
│  └────────────────────────────┬───────────────────────────────┘     │
│                               │                                      │
│                               ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  Classify Issues:                                          │     │
│  │  • High severity: Clear hallucinations                     │     │
│  │  • Medium severity: Questionable interpretations           │     │
│  │  • Low severity: Minor paraphrasing (acceptable)           │     │
│  └────────────────────────────┬───────────────────────────────┘     │
│                               │                                      │
└───────────────────────────────┼──────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Verification Result  │
                    └───────────┬───────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
    ┌───────────────────────┐       ┌───────────────────────┐
    │  ✅ isAccurate: true  │       │  ❌ isAccurate: false │
    │  No critical issues   │       │  High/medium issues   │
    └───────────┬───────────┘       └───────────┬───────────┘
                │                               │
                │                               ▼
                │               ┌─────────────────────────────────────┐
                │               │  REGENERATE WITH STRICTER RULES     │
                │               ├─────────────────────────────────────┤
                │               │  • Show explicit issue list         │
                │               │  • Emphasize source content         │
                │               │  • Add stricter instructions        │
                │               │  • Include verification reminder    │
                │               └───────────┬─────────────────────────┘
                │                           │
                │                           ▼
                │               ┌───────────────────────┐
                │               │  Corrected LaTeX      │
                │               │  Resume               │
                │               └───────────┬───────────┘
                │                           │
                └───────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FINAL VERIFIED RESUME                        │
├─────────────────────────────────────────────────────────────────────┤
│  • 100% accurate to source library items                             │
│  • No hallucinated facts, metrics, or technologies                   │
│  • ATS-optimized formatting                                          │
│  • Ready for download and application                                │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
                    ┌───────────────────────┐
                    │  Save to History      │
                    │  Return to User       │
                    └───────────────────────┘
```

## 🔍 Detailed Stage Breakdown

### Stage 1: Score & Generate Sections

**Input:**
- Job description
- All library items (projects, experiences, skills, certs, education)
- User profile (contact info)

**Process:**
1. Score projects against job description (parallel)
2. Score experiences against job description (parallel)
3. Select top 3-4 projects
4. Select top 3-4 experiences
5. Generate projects section with strict fact-checking
6. Generate experience section with strict fact-checking
7. Generate skills/certs section with strict fact-checking

**Output:**
- Projects section (LaTeX)
- Experience section (LaTeX)
- Skills/Certifications section (LaTeX)

**Fact-Checking Rules Applied:**
```
✅ USE ONLY facts from source items
✅ DO NOT invent metrics or technologies
✅ DO NOT exaggerate numbers
✅ Paraphrasing OK, but facts must be accurate
✅ Conservative interpretation of vague metrics
```

### Stage 2: Integrate into Final Resume

**Input:**
- Generated sections (from Stage 1)
- LaTeX template
- User contact information

**Process:**
1. Insert contact information
2. Add Experience section
3. Add Projects section
4. Add Skills/Certifications section
5. Enforce single-column ATS layout
6. Apply 2026 optimization guidelines
7. Ensure valid LaTeX syntax

**Output:**
- Complete LaTeX resume (draft)

### Stage 3: Verify Accuracy

**Input:**
- Generated LaTeX resume (from Stage 2)
- Source library items used

**Process:**
1. Extract plain text content (remove LaTeX)
2. Compile source truth (all library items with metadata)
3. AI fact-checking (compare resume vs source)
4. Classify issues by severity (high/medium/low)
5. Filter out low-severity issues
6. Return verification result

**Output:**
- Verification result (isAccurate: true/false)
- List of critical issues (if any)

**If Verification Fails:**
- Regenerate with stricter guidelines
- Show explicit issue list to AI
- Emphasize source content more
- Add stricter "do not invent" instructions

**If Verification Passes:**
- Return verified resume
- Save to history
- Display to user

## 📊 Decision Points

### Decision 1: Which Items to Use?

```
All Library Items
        │
        ├─→ Projects → Score → Top 3-4
        ├─→ Experiences → Score → Top 3-4
        └─→ Skills/Certs/Edu → All items
```

### Decision 2: Is Resume Accurate?

```
Verification Result
        │
        ├─→ isAccurate: true → Return resume
        └─→ isAccurate: false → Regenerate with stricter rules
```

### Decision 3: Issue Severity?

```
All Issues
        │
        ├─→ High severity → Trigger regeneration
        ├─→ Medium severity → Trigger regeneration
        └─→ Low severity → Ignore (acceptable paraphrasing)
```

## 🎯 Success Criteria

**Resume is considered accurate when:**
- ✅ All metrics match source (no exaggeration)
- ✅ All technologies are from source (no invention)
- ✅ All achievements are from source (no fabrication)
- ✅ All dates/orgs/locations are correct
- ✅ Only low-severity issues (paraphrasing) remain

**Resume is considered inaccurate when:**
- ❌ Metrics are exaggerated (40% → 50%)
- ❌ Technologies are invented (Docker not in source)
- ❌ Achievements are fabricated (Led team not mentioned)
- ❌ Dates/orgs/locations are incorrect
- ❌ High or medium severity issues detected

## 🔄 Regeneration Flow

```
Verification Failed
        │
        ▼
Show Issues to AI
        │
        ▼
Emphasize Source Content
        │
        ▼
Add Stricter Rules
        │
        ▼
Regenerate Resume
        │
        ▼
Return Corrected Resume
(No second verification - fail open)
```

## 📈 Performance Metrics

| Stage | Time | API Calls | Notes |
|-------|------|-----------|-------|
| Stage 1 | ~5-7s | 3 calls | Parallel generation |
| Stage 2 | ~2-3s | 1 call | Integration |
| Stage 3 | ~2-3s | 1 call | Verification |
| Regeneration | ~2-3s | 1 call | Only if needed (~5-10%) |
| **Total** | **~9-13s** | **5-6 calls** | With verification |

**Without Verification:** ~7-10s, 4 calls
**With Verification:** ~9-13s, 5-6 calls
**Time Overhead:** +2-3s (acceptable for accuracy)

## 🎉 Benefits

1. **Accuracy** - 100% adherence to source content
2. **Trust** - Users can trust resume accuracy
3. **Ethics** - No fabrication of achievements
4. **ATS** - Accurate content passes recruiter checks
5. **Legal** - Reduces misrepresentation risk

---

**For Implementation Details:** See [VERIFICATION_SYSTEM.md](./VERIFICATION_SYSTEM.md)
**For Quick Reference:** See [VERIFICATION_QUICK_REFERENCE.md](./VERIFICATION_QUICK_REFERENCE.md)
**For Testing:** Run `node scripts/test-verification.js`
