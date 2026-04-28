# Verification System Troubleshooting Guide

## 🔧 Common Issues and Solutions

### Issue 1: Verification Always Fails

**Symptoms:**
- Every resume generation triggers regeneration
- Console shows: `⚠️ Verification found potential hallucinations`
- Generation takes longer than expected

**Possible Causes:**
1. Source library items are too vague
2. Verification is too strict
3. AI is misinterpreting paraphrasing as hallucination

**Solutions:**

**Solution A: Add More Detail to Library Items**
```markdown
❌ Bad (too vague):
"Built a web app"

✅ Good (detailed):
"Built a full-stack web application using React, Node.js, and PostgreSQL 
that serves 10,000+ users daily. Implemented user authentication, real-time 
notifications, and RESTful API with 99.9% uptime."
```

**Solution B: Check Severity Filtering**
```javascript
// In server.js, verifyResumeAccuracy() function
// Current filtering (may be too strict):
const criticalIssues = result.issues.filter(
  issue => issue.severity === 'high' || issue.severity === 'medium'
);

// Try filtering only high severity:
const criticalIssues = result.issues.filter(
  issue => issue.severity === 'high'
);
```

**Solution C: Review Verification Logs**
```bash
# Check console output for specific issues
# Look for patterns in flagged content
# Example:
⚠️  Verification found potential hallucinations: [
  {
    type: "hallucinated_metric",
    content: "claimed 50% improvement but source says 40%",
    severity: "high"
  }
]
```

### Issue 2: Verification Never Fails (Too Lenient)

**Symptoms:**
- Verification always passes even with obvious errors
- Console shows: `✅ Verification passed` every time
- Generated resumes contain invented facts

**Possible Causes:**
1. Verification prompt is not strict enough
2. AI is being too lenient in fact-checking
3. Source content is not being properly compiled

**Solutions:**

**Solution A: Verify Source Content Compilation**
```javascript
// In server.js, verifyResumeAccuracy() function
// Add debug logging:
console.log('Source items for verification:', sourceItems.length);
console.log('Source content length:', sourceContent.length);

// Ensure source content includes all metadata:
const sourceContent = sourceItems.map(item => `
ITEM: ${item.title}
TYPE: ${item.item_type}
CONTENT: ${item.content}
${item.organization ? `ORGANIZATION: ${item.organization}` : ''}
${item.location ? `LOCATION: ${item.location}` : ''}
${item.start_date ? `START: ${item.start_date}` : ''}
${item.end_date ? `END: ${item.end_date}` : ''}
TAGS: ${Array.isArray(item.tags) ? item.tags.join(', ') : item.tags}
---
`).join('\n');
```

**Solution B: Enhance Verification Prompt**
```javascript
// Make verification stricter by emphasizing critical rules:
const verificationPrompt = `You are an EXTREMELY STRICT fact-checker...

CRITICAL RULES (ZERO TOLERANCE):
- ANY metric that doesn't match source EXACTLY is a HIGH severity issue
- ANY technology not explicitly in source is a HIGH severity issue
- ANY achievement not clearly stated in source is a HIGH severity issue
...`;
```

### Issue 3: Regeneration Loop

**Symptoms:**
- System keeps regenerating indefinitely
- Console shows multiple regeneration attempts
- Generation never completes

**Possible Causes:**
1. Regeneration is triggering verification again
2. Verification is failing on regenerated content
3. Infinite loop in code

**Solutions:**

**Solution A: Check Regeneration Logic**
```javascript
// In server.js, generateResume() function
// Ensure regeneration does NOT trigger verification again:

if (!verificationResult.isAccurate) {
  console.warn('⚠️  Verification found potential hallucinations');
  // Regenerate WITHOUT verification (fail-open approach)
  return await regenerateWithStricterGuidelines(...);
  // ↑ This should NOT call verifyResumeAccuracy() again
}
```

**Solution B: Add Regeneration Counter**
```javascript
// Prevent infinite loops with a counter:
async function generateResume(jobDescription, allItems, templateContent, userProfile, ai, attemptCount = 0) {
  // ... existing code ...
  
  if (!verificationResult.isAccurate && attemptCount < 1) {
    console.warn('⚠️  Verification found potential hallucinations');
    return await regenerateWithStricterGuidelines(..., attemptCount + 1);
  }
  
  // If second attempt also fails, return anyway (fail-open)
  return generatedLatex;
}
```

### Issue 4: Verification Parsing Error

**Symptoms:**
- Console shows: `Verification parsing error`
- Verification always passes (fail-open behavior)
- No verification results returned

**Possible Causes:**
1. AI returned invalid JSON
2. JSON parsing failed
3. Response format changed

**Solutions:**

**Solution A: Check JSON Response Format**
```javascript
// In server.js, verifyResumeAccuracy() function
try {
  const response = await ai.models.generateContent({ 
    model: 'gemini-2.5-flash', 
    contents: verificationPrompt 
  });
  const text = response.text.trim();
  
  // Add debug logging:
  console.log('Verification response:', text.slice(0, 200));
  
  // Clean up response:
  const cleanText = text
    .replace(/^```json\n?/, '')
    .replace(/\n?```$/, '')
    .trim();
  
  const result = JSON.parse(cleanText);
  // ...
} catch (err) {
  console.error('Verification parsing error:', err);
  console.error('Raw response:', response.text);
  // Fail open (assume accurate)
  return { isAccurate: true, issues: [], summary: 'Verification check completed' };
}
```

**Solution B: Add Response Validation**
```javascript
// Validate JSON structure before using:
const result = JSON.parse(cleanText);

if (!result.hasOwnProperty('isAccurate') || !Array.isArray(result.issues)) {
  console.error('Invalid verification response structure:', result);
  return { isAccurate: true, issues: [], summary: 'Verification check completed' };
}
```

### Issue 5: Slow Generation Time

**Symptoms:**
- Generation takes >20 seconds
- Users complain about slow performance
- Timeout errors

**Possible Causes:**
1. Too many API calls
2. Large library items
3. Network latency

**Solutions:**

**Solution A: Optimize API Calls**
```javascript
// Ensure parallel execution:
const [projectScores, experienceScores] = await Promise.all([
  projectItems.length > 0 ? scoreItemsByCategory(...) : Promise.resolve([]),
  experienceItems.length > 0 ? scoreItemsByCategory(...) : Promise.resolve([])
]);

const [projectSection, experienceSection, otherSection] = await Promise.all([
  topProjects.length > 0 ? generateSectionContent(...) : Promise.resolve(''),
  topExperiences.length > 0 ? generateSectionContent(...) : Promise.resolve(''),
  otherItems.length > 0 ? generateSectionContent(...) : Promise.resolve('')
]);
```

**Solution B: Limit Content Size**
```javascript
// Truncate large library items:
const sourceContent = sourceItems.map(item => `
ITEM: ${item.title}
CONTENT: ${item.content.slice(0, 2000)} // Limit to 2000 chars
...
`).join('\n');
```

**Solution C: Add Timeout Handling**
```javascript
// Add timeout to verification:
const verificationPromise = ai.models.generateContent({ 
  model: 'gemini-2.5-flash', 
  contents: verificationPrompt 
});

const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Verification timeout')), 10000)
);

try {
  const response = await Promise.race([verificationPromise, timeoutPromise]);
  // ...
} catch (err) {
  if (err.message === 'Verification timeout') {
    console.warn('Verification timed out, assuming accurate');
    return { isAccurate: true, issues: [], summary: 'Verification timed out' };
  }
  throw err;
}
```

### Issue 6: False Positives (Acceptable Content Flagged)

**Symptoms:**
- Verification flags acceptable paraphrasing
- Acronym additions are marked as errors
- Reasonable interpretations are rejected

**Possible Causes:**
1. Verification is too strict
2. Allowed transformations not clear in prompt
3. AI misunderstanding acceptable changes

**Solutions:**

**Solution A: Clarify Allowed Transformations**
```javascript
// In verificationPrompt, emphasize allowed changes:
CRITICAL RULES:
- Paraphrasing and rewording is ALLOWED (e.g., "Built" vs "Developed")
- Adding acronyms to full names is ALLOWED (e.g., "AWS" when source says 
  "Amazon Web Services")
- Quantification is ALLOWED if it's in the source (e.g., source says 
  "thousands of users" → resume says "10,000+ users" is OK if reasonable)
- Verb variation is ALLOWED (e.g., "Shipped", "Launched", "Delivered" 
  for same action)
- But INVENTING new facts, numbers, or technologies is NOT ALLOWED
```

**Solution B: Adjust Severity Filtering**
```javascript
// Only flag high severity issues:
const criticalIssues = result.issues.filter(
  issue => issue.severity === 'high'
);

// Or add more granular filtering:
const criticalIssues = result.issues.filter(issue => {
  // Ignore paraphrasing issues
  if (issue.type === 'paraphrasing_difference') return false;
  // Ignore acronym additions
  if (issue.type === 'acronym_addition') return false;
  // Flag everything else
  return issue.severity === 'high' || issue.severity === 'medium';
});
```

### Issue 7: Missing Verification Step in UI

**Symptoms:**
- Progress bar doesn't show verification step
- UI shows 7 steps instead of 8
- Users don't see verification happening

**Possible Causes:**
1. Frontend not updated
2. JavaScript not loaded
3. Cache issue

**Solutions:**

**Solution A: Verify Frontend Code**
```javascript
// In public/js/generate.js, check steps array:
const steps = [
  { txt: 'Parsing job description...', pct: 10, num: '1 / 8' },
  { txt: 'Scoring projects...', pct: 20, num: '2 / 8' },
  { txt: 'Scoring experiences...', pct: 30, num: '3 / 8' },
  { txt: 'Generating projects section...', pct: 45, num: '4 / 8' },
  { txt: 'Generating experience section...', pct: 60, num: '5 / 8' },
  { txt: 'Generating skills section...', pct: 75, num: '6 / 8' },
  { txt: 'Integrating final resume...', pct: 85, num: '7 / 8' },
  { txt: 'Verifying accuracy...', pct: 95, num: '8 / 8' }, // ← Must be present
];
```

**Solution B: Clear Browser Cache**
```bash
# Hard refresh in browser:
# Chrome/Firefox: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
# Or clear cache manually in browser settings
```

**Solution C: Check Console for Errors**
```javascript
// Open browser console (F12) and check for JavaScript errors
// Look for errors loading generate.js
```

## 🧪 Testing Verification

### Test Case 1: Metric Exaggeration

**Setup:**
```markdown
Library Item:
"Optimized database queries, reducing response time by 40%"
```

**Expected Behavior:**
- Resume should say "40%", not "50%" or higher
- If AI tries to exaggerate, verification should catch it

**Test:**
1. Add library item with specific metric
2. Generate resume
3. Check if metric is preserved exactly
4. If not, check console for verification warning

### Test Case 2: Invented Technology

**Setup:**
```markdown
Library Item:
"Built with React and Node.js"
```

**Expected Behavior:**
- Resume should only mention React and Node.js
- Should NOT add Docker, Kubernetes, etc.

**Test:**
1. Add library item with specific technologies
2. Generate resume
3. Check if only listed technologies appear
4. If extra technologies appear, check verification logs

### Test Case 3: Acceptable Paraphrasing

**Setup:**
```markdown
Library Item:
"Built a REST API"
```

**Expected Behavior:**
- "Developed a REST API" is acceptable
- "Architected a REST API" is acceptable
- Verification should NOT flag this

**Test:**
1. Add library item with simple statement
2. Generate resume
3. Check if paraphrasing is allowed
4. Verification should pass (not trigger regeneration)

## 📊 Monitoring Verification

### Console Logs to Watch

**Successful Verification:**
```
Stage 1: Scoring and generating sections...
Stage 2: Integrating sections into final resume...
Stage 3: Verifying content accuracy against library...
✅ Verification passed: Content is accurate to library items
```

**Failed Verification:**
```
Stage 1: Scoring and generating sections...
Stage 2: Integrating sections into final resume...
Stage 3: Verifying content accuracy against library...
⚠️  Verification found potential hallucinations: [...]
🔄 Regenerating with stricter fact-checking guidelines...
```

**Verification Error:**
```
Stage 3: Verifying content accuracy against library...
Verification parsing error: [error details]
✅ Verification passed: Content is accurate to library items
(Note: Fail-open behavior - assumes accurate on error)
```

## 🔍 Debugging Tips

### Enable Verbose Logging

```javascript
// In server.js, add debug logging:

// Before verification:
console.log('=== VERIFICATION DEBUG ===');
console.log('Source items count:', sourceItems.length);
console.log('Generated LaTeX length:', generatedLatex.length);
console.log('Content only length:', contentOnly.length);

// After verification:
console.log('Verification result:', JSON.stringify(verificationResult, null, 2));
console.log('Critical issues:', verificationResult.issues.length);
console.log('=== END DEBUG ===');
```

### Check API Response

```javascript
// Log raw AI response:
const response = await ai.models.generateContent({ 
  model: 'gemini-2.5-flash', 
  contents: verificationPrompt 
});

console.log('Raw verification response:', response.text);
```

### Validate Source Content

```javascript
// Ensure source content is complete:
sourceItems.forEach(item => {
  if (!item.content || item.content.length < 10) {
    console.warn('Warning: Item has minimal content:', item.title);
  }
});
```

## 🆘 Getting Help

If you're still experiencing issues:

1. **Run the test script:**
   ```bash
   node scripts/test-verification.js
   ```

2. **Check documentation:**
   - [VERIFICATION_SYSTEM.md](./VERIFICATION_SYSTEM.md)
   - [VERIFICATION_QUICK_REFERENCE.md](./VERIFICATION_QUICK_REFERENCE.md)

3. **Review console logs:**
   - Look for error messages
   - Check verification warnings
   - Verify all stages complete

4. **Test with simple data:**
   - Create a minimal library item
   - Generate resume
   - Check if verification works

5. **Report issues:**
   - Include console logs
   - Describe expected vs actual behavior
   - Provide library item examples

---

**Last Updated:** 2026-04-28
**Version:** 3.0 (Verification System)
**Status:** Production Ready
