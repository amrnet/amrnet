# Code Review: `staging` branch (11 commits by Vandana)

**Reviewed commits:** `b2925c0c...a0ab0cf5` (development → staging)

---

## 🔴 Critical Bugs (MUST FIX before merging)

### 1. `3201379d` — Ampicillin detection is broken

**File:** `client/src/components/Dashboard/filters.js`

```js
// CURRENT (BROKEN):
} else if (drugKey === 'Ampicillin') {
  resistantCount = dataToFilter.filter(x => countMarkers(x['Beta-lactam']) !== '-').length;
}
```

**Problem:** `countMarkers()` returns a **number**, not a string. Comparing `number !== '-'` is always `true`, so **every genome gets counted as Ampicillin-resistant**, even susceptible ones.

**Correct version:**
```js
} else if (drugKey === 'Ampicillin') {
  resistantCount = dataToFilter.filter(x => {
    const v = x['Beta-lactam'];
    return v != null && v !== '' && v !== '-';
  }).length;
}
```

### 2. `3201379d` — Server-side aggregation silently disabled

**File:** `client/src/components/Dashboard/Dashboard.js`

```js
// BEFORE:
const finalDrugsData = serverOk ? serverYd.drugsData : (yearsData.drugsData ?? []);

// VANDANA CHANGED TO:
const finalDrugsData = (yearsData.drugsData ?? []);
```

**Problem:** This removes the server-side aggregation fallback completely. All organism performance optimizations for large datasets (senterica 502K, ecoli 339K) are bypassed. The dashboard will slow down significantly.

**Correct approach:** Revert this line. If there was a bug with server aggregation for Ampicillin specifically, fix the aggregation endpoint — don't disable it globally.

### 3. `b3371b7c` — "Auto-selection fix" is commented-out code

**File:** `client/src/components/Dashboard/Dashboard.js`

```js
case 'shige':
  // if (!isPaginated) {
    dispatch(setDrugResistanceGraphView(drugsECOLI));
    // ...
  // }
  break;
```

**Problem:** She commented out an `if` guard. For paginated organisms, this runs code twice — once here, and once in the auto-selection effect. This can cause flicker or state thrashing.

**Correct fix:** If the auto-selection effect wasn't running for `shige`, fix the effect. Don't break the guard.

### 4. `ae97b09f` — Commented out `$limit` in aggregation

**File:** `routes/api/aggregations.js`

```js
// BEFORE:
{ $sort: { count: -1 } },
{ $limit: 20 },

// AFTER:
{ $sort: { count: -1 } },
// { $limit: 30 },  // ← no limit at all now!
```

**Problem:** For senterica (502K genomes), removing `$limit` could return thousands of genotypes to the client, slowing everything down. The commit message says "fix 100% value" but the fix is unrelated.

**Correct approach:** If 20 was too restrictive, set it to 50. Don't comment it out.

### 5. `98beeef3` — Heatmap color scale "fix" reverses it wrong

**File:** `client/src/components/Elements/Map/mapColorHelper.js`

```js
// BEFORE:
const domain = [0, 20, 100];
const colors = ['#FFE0B2', '#DD2C24', '#0288D1']; // light orange → red → blue

// AFTER:
const domain = [0, 50, 100];
const colors = ['#0288D1', '#FFE0B2', '#DD2C24']; // blue → light orange → red
```

**Problem:** Changing the pivot point from 20 to 50 means low resistance now shows as blue/orange instead of orange. This changes the visualization interpretation globally. Color conventions should be **documented** — was this requested by the PI?

---

## 🟡 Code Quality Issues

### 6. `89c2b587` — Commented-out drug columns instead of feature flags

**File:** `client/src/util/drugClassesRules.js`

```js
const drugColumns = [
  'Aminoglycoside',
  // 'Beta-lactam',       ← commented out
  'Sulfonamide',
  // ...
  // 'Lincosamide',       ← commented out
  // 'Streptothricin',    ← commented out
  // 'Rifamycin',         ← commented out
  // 'Bleomycin',         ← commented out
];
```

**Problem:** Commented-out code rots. If those drugs shouldn't display, delete them. If they should display conditionally, use a feature flag.

### 7. `012f6421` — Trend plot "fix" uses useState without proper deps

**File:** `DrugResistanceGraph.js`

New `brushStartIndex` / `brushEndIndex` state added. The effect that sets them runs on `[drugsYearData, drugResistanceGraphView, ...]` but the brush doesn't reset when organism changes. Could cause stale brush state.

### 8. `8a98ae80` — Good fix, but missed edge cases

```js
`Selected Pathotypes : ${ dataset === 'All'? "All": selectedLineages.join(', ')} `;
```

This is correct logic, but:
- Inconsistent spacing `${ dataset` vs `${dataset`
- Missing `prettier` formatting
- `dataset === 'All'` comparison should probably also check if `selectedLineages.length === 0`

---

## ✅ Acceptable Changes

- `5e835d54` "updates" — minor MUI style tweaks, mostly cosmetic
- Merge commits `2d4e9005`, `eaa845e1`, `a0ab0cf5` — just merges

---

## 📊 Summary

| Severity | Count | Action |
|---|---|---|
| 🔴 Critical bugs | 5 | Fix before merging to development |
| 🟡 Code quality | 3 | Cleanup during merge |
| ✅ Acceptable | 3 | Merge as-is |

---

## 🎯 Recommendation

**Do NOT merge `staging` → `development` as-is.**

Instead:
1. Cherry-pick the good parts (`8a98ae80`, `5e835d54`)
2. Rewrite the buggy parts (`3201379d` Ampicillin logic, `ae97b09f` $limit, `b3371b7c` auto-selection)
3. Discuss the heatmap color change (`98beeef3`) with the team before accepting
4. Add unit tests for the drug resistance filters to prevent the Ampicillin bug recurring
