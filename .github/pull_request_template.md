# PR Checklist

## What does this PR do?
<!-- 1-2 sentences describing the change -->

## Why is it needed?
<!-- What bug or feature? Link to issue if any -->

## How did you test it?
<!-- Explain what you did BEFORE pushing -->
- [ ] I tested it locally (ran `npm start` and clicked through the feature)
- [ ] I verified it works for **at least 2 organisms** (different data shapes)
- [ ] I added or updated unit tests (see `client/src/__tests__/`)
- [ ] I ran `npm test` and all tests pass
- [ ] I ran `npm run lint` with no errors

## Before/after screenshots
<!-- Paste screenshots for UI changes -->

## Code quality checklist (MUST check each)

### No commented-out code
- [ ] I did NOT comment out working code "just in case"
- [ ] If code is obsolete, I deleted it (git history keeps it)
- [ ] If code is a future feature, I used a feature flag or TODO comment

### Type safety
- [ ] I checked that comparisons use correct types (e.g., `count >= 1` not `count !== '-'`)
- [ ] I checked that `null`/`undefined`/`""`/`"-"` are all handled for DB values
- [ ] I used `console.log` for debugging but removed them before pushing

### Data handling
- [ ] For drug columns: empty = `null || '' || '-'`, resistant = anything else
- [ ] For semicolon-separated gene lists: I split by `';'`, not `','`
- [ ] For organism-specific logic: I tested all affected organisms

### Performance
- [ ] I did NOT remove server-side aggregation without a replacement
- [ ] I did NOT remove `$limit` from MongoDB pipelines
- [ ] I did NOT add heavy computation in render loops

## Server-side / database changes
- [ ] No changes to `server.js`, `routes/`, `config/db.js`
- [ ] If yes, I tested with large datasets (senterica 500K, ecoli 340K)

## Breaking changes
- [ ] None
- [ ] Yes — documented below:
<!-- If yes, describe what breaks and how to migrate -->

---

## Reviewer Notes

**Reviewer to verify before merging:**
1. All unit tests pass in CI
2. No lint warnings
3. `development` branch deploy shows the fix working
4. No regressions on 2+ other organisms
5. Server-side aggregation still works (if affected)

**After merge:**
1. Deploy to `development` EC2: `./deploy/deploy-dev.sh`
2. Validate on https://dev.amrnet.org (or `http://3.88.180.89`)
3. Only then run `./deploy/promote-to-production.sh`
