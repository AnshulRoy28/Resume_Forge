# Resume Verification System

## Overview

ResumeForge implements a three-stage generation process with built-in fact-checking to ensure all resume content strictly adheres to the library items without hallucinating facts, metrics, or technologies.

## Problem Statement

AI models can sometimes "hallucinate" or invent facts that sound plausible but aren't true:
- Exaggerating metrics (source says "40%" → AI writes "50%")
- Inventing technologies not mentioned in source
- Fabricating achievements or responsibilities
- Creating incorrect dates, organizations, or locations

This is unacceptable for resumes where accuracy is critical for both ethical and practical reasons.

## Solution: Three-Stage Generation with Verification

### Stage 1: Score and Generate Sections

Generate tailored sections from library items with strict fact-checking instructions:

```javascript
// Each section prompt includes:
**STRICT FACT-CHECKING (CRITICAL):**
13. USE ONLY facts, numbers, and technologies from the provided content below
14. DO NOT invent metrics, achievements, or technologies not in the source
15. DO NOT exaggerate numbers (if source says 40%, don't say 50%)
16. Paraphrasing is OK, but facts must be accurate to source
17. If a metric is vague (e.g., "many users"), you may reasonably interpret it 
    (e.g., "1000+ users") but stay conservative
```

**Sections Generated:**
1. Projects section (top 3-4 most relevant)
2. Experience section (top 3-4 most relevant)
3. Skills/Certifications section (all items, categorized)

### Stage 2: Integration

Combine pre-generated sections into final LaTeX resume with contact information and ATS-friendly formatting.

### Stage 3: Verification

Verify the generated resume against source library items to catch any hallucinations:

```javascript
const verificationResult = await verifyResumeAccuracy(generatedLatex, usedItems, ai);

if (!verificationResult.isAccurate) {
  // Regenerate with stricter guidelines
  return await regenerateWithStricterGuidelines(...);
}
```

## Verification Process

### Step 1: Extract Content

Remove LaTeX formatting to get plain text content for easier verification:

```javascript
const contentOnly = generatedLatex
  .replace(/\\[a-zA-Z]+(\{[^}]*\}|\[[^\]]*\])?/g, ' ') // Remove LaTeX commands
  .replace(/[{}]/g, ' ') // Remove braces
  .replace(/\s+/g, ' ') // Normalize whitespace
```

### Step 2: Prepare Source Truth

Compile all source library items with their metadata:

```javascript
const sourceContent = sourceItems.map(item => `
ITEM: ${item.title}
TYPE: ${item.item_type}
CONTENT: ${item.content}
ORGANIZATION: ${item.organization}
LOCATION: ${item.location}
DATES: ${item.start_date} - ${item.end_date}
TAGS: ${item.tags.join(', ')}
`).join('\n---\n');
```

### Step 3: AI-Powered Fact-Checking

Use Gemini AI as a strict fact-checker:

```javascript
const verificationPrompt = `You are a strict fact-checker for resume content. 
Your job is to verify that ALL facts, numbers, technologies, and accomplishments 
in the generated resume come DIRECTLY from the source library items.

SOURCE LIBRARY ITEMS (GROUND TRUTH):
${sourceContent}

GENERATED RESUME CONTENT:
${contentOnly}

VERIFICATION TASK:
1. Check if ANY facts, numbers, dates, technologies, or accomplishments appear 
   in the resume that are NOT in the source items
2. Look for hallucinated metrics (e.g., "50% improvement" when source says "40%")
3. Look for invented technologies (e.g., "Docker" when not mentioned in source)
4. Look for fabricated achievements or responsibilities
5. Look for incorrect dates, organizations, or locations

CRITICAL RULES:
- Paraphrasing and rewording is ALLOWED (e.g., "Built" vs "Developed")
- Adding acronyms to full names is ALLOWED (e.g., "AWS" when source says 
  "Amazon Web Services")
- Quantification is ALLOWED if it's in the source (e.g., source says 
  "thousands of users" → resume says "10,000+ users" is OK if reasonable)
- But INVENTING new facts, numbers, or technologies is NOT ALLOWED

Return a JSON object with verification results...
`;
```

### Step 4: Issue Classification

Issues are classified by severity:

- **High Severity**: Clear hallucinations (invented metrics, technologies, achievements)
- **Medium Severity**: Questionable interpretations (stretching vague statements)
- **Low Severity**: Minor paraphrasing differences (acceptable)

### Step 5: Conditional Regeneration

If high or medium severity issues are found, regenerate with stricter guidelines:

```javascript
if (!verificationResult.isAccurate) {
  console.warn('⚠️  Verification found potential hallucinations:', 
               verificationResult.issues);
  return await regenerateWithStricterGuidelines(...);
}
```

## Regeneration with Stricter Guidelines

When verification fails, the system regenerates with:

1. **Explicit Issue List**: Shows what went wrong in the first attempt
2. **Source Content Emphasis**: Highlights the ground truth more prominently
3. **Stricter Fact-Checking Rules**: More explicit "do not invent" instructions
4. **Verification Reminder**: Asks AI to verify every fact before including

```javascript
const strictPrompt = `Your previous attempt had these issues:

ISSUES FOUND:
${issuesList}

SOURCE LIBRARY ITEMS (GROUND TRUTH - USE ONLY THIS):
${sourceContent}

CRITICAL FACT-CHECKING RULES:
1. **USE ONLY FACTS FROM SOURCE ITEMS** - Do not invent ANY numbers, 
   technologies, or achievements
2. **EXACT METRICS** - If source says "40%", do not change it to "50%"
3. **EXACT TECHNOLOGIES** - Only mention technologies explicitly listed 
   in source items
4. **EXACT DATES** - Use only dates provided in source items
5. **NO HALLUCINATION** - If something is not in the source, DO NOT include it
6. **VERIFY EVERY FACT against source items before including**
`;
```

## What's Allowed vs. Not Allowed

### ✅ Allowed (Acceptable Transformations)

1. **Paraphrasing**: "Built" → "Developed", "Created" → "Architected"
2. **Acronym Addition**: "Amazon Web Services" → "AWS (Amazon Web Services)"
3. **Reasonable Quantification**: "thousands of users" → "10,000+ users"
4. **Verb Variation**: Using different power verbs for same action
5. **Formatting Changes**: Restructuring bullets for clarity
6. **Keyword Optimization**: Adding both acronym and full form

### ❌ Not Allowed (Hallucinations)

1. **Metric Exaggeration**: Source says "40%" → Resume says "50%"
2. **Invented Technologies**: Adding "Docker" when not in source
3. **Fabricated Achievements**: "Led team of 5" when not mentioned
4. **Incorrect Dates**: Changing employment dates
5. **Made-up Organizations**: Adding companies not in source
6. **False Credentials**: Inventing certifications or degrees

## Example Verification Flow

### Scenario: Metric Exaggeration Detected

**Source Content:**
```
Optimized database queries, reducing response time by 40%
```

**Generated Resume (First Attempt):**
```
Optimized database queries, reducing response time by 50% and improving 
user satisfaction
```

**Verification Result:**
```json
{
  "isAccurate": false,
  "issues": [
    {
      "type": "hallucinated_metric",
      "content": "claimed 50% improvement but source says 40%",
      "severity": "high"
    },
    {
      "type": "fabricated_achievement",
      "content": "mentions user satisfaction improvement not in source",
      "severity": "high"
    }
  ],
  "summary": "Found 2 high-severity hallucinations"
}
```

**Action:** Regenerate with stricter guidelines

**Generated Resume (Second Attempt):**
```
Optimized database queries using indexing and caching strategies, 
reducing response time by 40%
```

**Verification Result:**
```json
{
  "isAccurate": true,
  "issues": [],
  "summary": "All facts verified against source content"
}
```

**Action:** ✅ Accept and return to user

## Benefits

1. **Accuracy Guarantee**: Ensures resume content is truthful and verifiable
2. **Ethical Compliance**: Prevents fabrication of achievements or credentials
3. **User Trust**: Users can trust that their resume accurately represents their library
4. **ATS Compatibility**: Accurate content is more likely to pass recruiter verification
5. **Legal Protection**: Reduces risk of misrepresentation in job applications

## Performance Considerations

- **Additional API Call**: Verification adds one extra Gemini API call
- **Regeneration Cost**: If verification fails, requires another generation call
- **Time Impact**: Adds ~2-3 seconds to generation process
- **Accuracy Benefit**: Worth the cost for ensuring factual accuracy

## Monitoring and Logging

The system logs verification results:

```javascript
console.log('Stage 3: Verifying content accuracy against library...');

if (!verificationResult.isAccurate) {
  console.warn('⚠️  Verification found potential hallucinations:', 
               verificationResult.issues);
  console.log('🔄 Regenerating with stricter fact-checking guidelines...');
} else {
  console.log('✅ Verification passed: Content is accurate to library items');
}
```

## Future Enhancements

Potential improvements:

- [ ] Add verification confidence scores
- [ ] Track verification failure rates
- [ ] Implement caching for verified content
- [ ] Add user-facing verification report
- [ ] Create verification quality metrics dashboard
- [ ] Allow users to review and approve flagged issues
- [ ] Implement multi-round verification for complex resumes

## Technical Implementation

### Files Modified

1. `server.js` - Added verification and regeneration functions
2. `public/js/generate.js` - Updated progress steps (8 steps instead of 7)
3. `public/pages/generate.html` - Updated progress bar labels

### Key Functions

- `verifyResumeAccuracy(generatedLatex, sourceItems, ai)` - Main verification function
- `regenerateWithStricterGuidelines(...)` - Regeneration with enhanced fact-checking
- `generateSectionContent(...)` - Enhanced with strict fact-checking rules

## Conclusion

The three-stage generation process with verification ensures that ResumeForge produces accurate, truthful resumes that strictly adhere to the user's library content. This builds trust, ensures ethical compliance, and produces resumes that can withstand scrutiny from recruiters and hiring managers.

---

**Implementation Date:** 2026
**Version:** 3.0 (Verification System)
**Status:** ✅ Complete
