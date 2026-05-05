# AMRnet drug data model — a guide

This document explains how AMRnet decides what counts as resistance, how it
counts it, and how it shows it on the dashboard. It is written for people who do
not read JavaScript. If you are a developer, the canonical files are at the
bottom.

Mistakes here change the headline numbers in the dashboard!

---

## 1. The three layers (the big picture)

AMRnet has three separate data structures that all talk about drugs. They look
similar but they do different jobs, and they are read by different parts of the
app.

| Layer                                                                                       | What it is                                                                                                       | What it answers                                                                | Where it lives                        |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------- |
| **Drug rules** (`drugRulesST`, `drugRulesKP`, `drugRulesNG`, …)                             | A list of recipes: "for drug X, look at column Y, the sample is resistant if the value is one of Z".             | _"Is this single sample resistant to this drug?"_                              | `client/src/util/drugClassesRules.js` |
| **Stat keys** (`statKeysST`, `statKeysKP`, `statKeysNG`, `statKeysECOLI`, …)                | A counting list: "to count drug X across the dataset, look at column Y and count rows where the value equals Z". | _"How many samples in this country / year / lineage are resistant to drug X?"_ | `client/src/util/drugClassesRules.js` |
| **Drug lists** (`drugsST`, `drugsKP`, `drugsNG`, `defaultDrugsForDrugResistanceGraphST`, …) | The list of drug names that appear on the chart axes, legends, and dropdowns.                                    | _"What drugs should the dashboard offer the user?"_                            | `client/src/util/drugs.js`            |

The same drug usually appears in all three layers, but **the entries are not
automatically synchronised** — RSE has to keep them consistent. When they drift
apart, the dashboard shows numbers that contradict each other.

---

## 2. The restaurant analogy

Think of AMRnet like a restaurant.

- The **database** is the pantry. Each shelf (column) holds one type of raw
  ingredient — for example, the shelf labelled `cip_pred_pheno` holds the
  predicted ciprofloxacin phenotype for every sample, with values like `CipS`
  (susceptible), `CipNS` (non-susceptible), or `CipR` (resistant).
- The **drug rules** (`drugRulesST` etc.) are the **recipes**. They say things
  like _"a sample counts as Ciprofloxacin-resistant if the `cip_pred_pheno`
  shelf has the value `CipR`."_ Recipes are used per-sample.
- The **stat keys** (`statKeysST` etc.) are the **inventory clipboard**. They
  say things like _"to count how many CipR samples we have in stock, go to shelf
  `cip_pred_pheno` and tally the rows where the value is `CipR`."_ The clipboard
  is used over the whole dataset to compute totals.
- The **drug lists** (`drugsST`, `drugsKP`, …) are the **menu**. Whatever
  appears here is what the customer (the dashboard user) sees as a clickable
  option.
- The **charts and tooltips** are the **plate**. They display what was cooked.

If the recipe says "use shelf A" but the inventory clipboard says "count from
shelf B", you'll plate a dish that doesn't match what the kitchen made. That's
the bug in PR #378.

---

## 3. A worked example: Ciprofloxacin in _Salmonella_ Typhi

Ciprofloxacin is the drug where the data model is most subtle, so it's the best
one to walk through.

### What the database has

The `styphi` collection has **three different ways** of recording ciprofloxacin
susceptibility for each sample:

| Pantry shelf (column) | Type    | Values                     | Meaning                                                                                                                                 |
| --------------------- | ------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `cip_pred_pheno`      | text    | `CipS`, `CipNS`, or `CipR` | A three-way verdict per sample. **`CipNS` here means "non-susceptible **but not** fully resistant"** (i.e. the intermediate band only). |
| `CipNS`               | boolean | `0` or `1`                 | A flag that is `1` whenever the sample is non-susceptible _or worse_. **This includes both `CipNS` and `CipR` cases.**                  |
| `CipR`                | boolean | `0` or `1`                 | A flag that is `1` whenever the sample is fully resistant.                                                                              |

In the local database, the counts line up like this:

| Query                      | Count     | Reading                                        |
| -------------------------- | --------- | ---------------------------------------------- |
| `cip_pred_pheno = 'CipNS'` | 7,146     | Non-susceptible **only** (intermediate band)   |
| `cip_pred_pheno = 'CipR'`  | 1,625     | Fully resistant only                           |
| `CipNS = 1`                | **8,771** | Non-susceptible **OR worse** (= 7,146 + 1,625) |
| `CipR = 1`                 | 1,625     | Fully resistant only                           |
| Total samples              | 14,100    | Everything in the collection                   |

This is **not a bug in the database** — it's a deliberate convention. The
boolean `CipNS` column matches the **AMRnet definition** of "non-susceptible",
which always includes the resistant subset. The text column `cip_pred_pheno`
exposes the underlying three-way phenotype for finer-grained queries.

### How the three layers currently use this

For Salmonella Typhi (`drugRulesST`, `statKeysST`, `drugsST` — all in
`client/src/util/`):

| Layer                     | Entry                                     | Pantry shelf used                           | Counts                             |
| ------------------------- | ----------------------------------------- | ------------------------------------------- | ---------------------------------- |
| **Drug rules**            | `Ciprofloxacin NS`                        | `cip_pred_pheno`, values `['CipNS']`        | Intermediate only — 7,146          |
| **Drug rules**            | `Ciprofloxacin R`                         | `cip_pred_pheno`, values `['CipR']`         | Resistant only — 1,625             |
| **Drug rules**            | `Ciprofloxacin`                           | `cip_pred_pheno`, values `['CipNS','CipR']` | Non-susceptible _or worse_ — 8,771 |
| **Stat keys**             | `CipNS`                                   | `cip_pred_pheno`, value `CipNS`             | Intermediate only — 7,146          |
| **Stat keys**             | `CipR`                                    | `cip_pred_pheno`, value `CipR`              | Resistant only — 1,625             |
| **Drug list** (`drugsST`) | `'Ciprofloxacin NS'`, `'Ciprofloxacin R'` | (used by drug rules)                        | Two separate bars on the chart     |

So **today there are two different definitions of "CipNS" living in the same
codebase**:

- In `drugRulesST` it means **intermediate only** (7,146).
- In `statKeysST` it means **intermediate only** as well (also 7,146), and is
  used by Map / Heat Map views.

If we were to _change_ the `statKeys` row to read from the boolean `CipNS`
column (`column: 'CipNS'`, `key: 1`), the **same name** "CipNS" would suddenly
mean **8,771** instead of 7,146 — without anyone changing the chart label.
**That is the trap PR #378 falls into.** The schema choice is defensible (8,771
is the AMRnet definition) but you can't change one structure and leave the other
behind, and you can't ship it without a comment explaining what `CipNS` now
means.

### The right way to make a CipNS change

Pick one definition of `CipNS` and propagate it to **all three** structures
**and** the chart label, in one PR, with a smoke test confirming the count
matches what you expect.

| If you decide…                                      | Drug rules entry                                                                       | Stat keys entry                          | Drug list entry      | Chart label                                           |
| --------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------- | -------------------- | ----------------------------------------------------- |
| Keep CipNS = intermediate only (current convention) | `values: ['CipNS']` on `cip_pred_pheno`                                                | `column: cip_pred_pheno`, `key: 'CipNS'` | `'Ciprofloxacin NS'` | "Ciprofloxacin (non-susceptible — intermediate only)" |
| Redefine CipNS = NS or worse (AMRnet definition)    | `values: ['CipNS','CipR']` on `cip_pred_pheno` **or** read from boolean `CipNS` column | `column: 'CipNS'`, `key: 1`              | `'Ciprofloxacin NS'` | "Ciprofloxacin (non-susceptible — AMRnet definition)" |

Whichever you pick, **the choice has to be the same in every layer**, and the
user-facing label has to make the meaning unambiguous. Surveillance numbers feed
into clinical and policy decisions; "CipNS = 7,146 here, 8,771 there" is a
serious quality-of-data problem.

---

## 4. Glossary — what the abbreviations mean

| Term               | Stands for                       | Clinical meaning                                                                                                           | Notes                                                                                                                               |
| ------------------ | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **CipS**           | Ciprofloxacin susceptible        | MIC ≤ 0.06 mg/L (per CLSI for _Salmonella_ Typhi). Drug should work normally.                                              | The "good" bucket.                                                                                                                  |
| **CipNS**          | Ciprofloxacin non-susceptible    | MIC > 0.06 mg/L. Includes the intermediate band **and** fully resistant. AMRnet use "non-susceptible" as an umbrella term. | Sometimes used loosely to mean "intermediate only". The text column uses it that way; the boolean column uses the umbrella meaning. |
| **CipR**           | Ciprofloxacin resistant          | MIC ≥ 1 mg/L. Drug should not be used.                                                                                     | Always a strict subset of CipNS.                                                                                                    |
| **AzithR**         | Azithromycin resistant           | Phenotypic resistance to azithromycin.                                                                                     |                                                                                                                                     |
| **ESBL**           | Extended-spectrum β-lactamase    | Sample carries an enzyme that breaks down most β-lactams (penicillins + cephalosporins).                                   |                                                                                                                                     |
| **MDR**            | Multidrug resistant              | Resistant to ampicillin **and** chloramphenicol **and** trimethoprim-sulfamethoxazole (Salmonella Typhi definition).       | Definition is organism-specific — see `drugRulesMDRXDR_NG` for _N. gonorrhoeae_.                                                    |
| **XDR**            | Extensively drug resistant       | MDR **plus** resistant to ciprofloxacin **and** ceftriaxone (Salmonella Typhi definition).                                 |                                                                                                                                     |
| **PDR**            | Pan-drug resistant               | Resistant to every tested drug class.                                                                                      | Reported but rare.                                                                                                                  |
| **Pansusceptible** | Susceptible to everything tested | No resistance markers detected.                                                                                            | The complement of "any AMR".                                                                                                        |

---

## 5. Reference: every organism, every layer

The AMRnet codebase has these structures. **Every change to drug-class logic
should update all three columns of the relevant row in lockstep.**

| Organism                                                    | Drug rules                                                           | Stat keys                             | Drug list (chart axes)                                                                   | Notes                                                                                  |
| ----------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| _Salmonella_ Typhi (`styphi`)                               | `drugRulesST`                                                        | `statKeysST`                          | `drugsST`, `drugsSTLegendsOnly`, `defaultDrugsForDrugResistanceGraphST`, `drugClassesST` | Has both Cip-rule trio (NS / R / NS+R) and Cip-statkey pair (CipNS / CipR).            |
| _Salmonella_ (non-typhoidal) (`senterica`, `sentericaints`) | `drugRulesECOLI`                                                     | `statKeysECOLI`                       | `drugsECOLI`                                                                             | Shares Enterobase rules with E. coli.                                                  |
| _E. coli_ / _Shigella_ (`ecoli`, `decoli`, `shige`)         | `drugRulesECOLI`                                                     | `statKeysECOLI`                       | `drugsECOLI`, `markersDrugsSH`                                                           | Per-class column flags (`Aminoglycoside`, `Beta-lactam`, …) live on each sample row.   |
| _Klebsiella pneumoniae_ (`kpneumo`)                         | `drugRulesKP`, `drugRulesKPOnlyMarkers`                              | `statKeysKP`, `statKeysKPOnlyMarkers` | `drugsKP`, `markersDrugsKP`                                                              | Uses "value is anything other than `'-'`" as the resistance test, not specific values. |
| _Neisseria gonorrhoeae_ (`ngono`)                           | `drugRulesNG`, plus `drugRulesMDRXDR_NG` for the MDR/XDR definitions | `statKeysNG`                          | `drugsNG`, `defaultDrugsForDrugResistanceGraphNG`, `drugClassesNG`                       | Each drug has its own boolean column.                                                  |
| _Staphylococcus aureus_ (`saureus`)                         | `drugRulesSA`                                                        | (none — uses the rules directly)      | `drugsSA` (derived from rules)                                                           | **Dev-only — hidden in production.**                                                   |
| _Streptococcus pneumoniae_ (`strepneumo`)                   | `drugRulesSP`                                                        | (none — uses the rules directly)      | `drugsSP` (derived from rules)                                                           | **Dev-only — hidden in production.**                                                   |

There are also **heat-map sub-rules** (`drugClassesRulesSTHeatMap`,
`drugClassesRulesNG`, etc.) that sit on top of the drug rules. They drill down
into _which specific gene or mutation_ is responsible for resistance. Those are
out of scope for this document, but they read from the same database columns —
so renaming a column breaks them too.

---

## 6. Common pitfalls (and how PR #378 fell into one)

1. **Changing `statKeys` without changing `drugRules`** — you end up with a
   dashboard where the per-sample chart says one thing and the
   country-aggregated map says another, because one is computed via rules and
   the other via stat keys. _(This is the core PR #378 issue.)_
2. **Commenting out a rule instead of deleting it** — leaves a dead reference
   that some other file may still mention by name. The right move is either to
   _delete_ the rule and remove all references, or to _redefine_ it correctly.
   "Comment it out for now" leaves the code in a half-finished state.
3. **Renaming a drug in `drugs.js` without updating the chart label** — the user
   sees the old label but the data underneath has been redefined. Numbers move
   silently and there is no way for a clinician to tell.
4. **Using `'temp'` as a strategy** — drug-class semantics determine whether a
   country looks like it has a public-health emergency. Temporary fixes do not
   exist for this kind of code; either the change is right and lands cleanly, or
   it does not land.
5. **Two PRs with identical content against `development` and `main`** — the
   repository's flow is `development` → validate on dev EC2 → `main`. Bypassing
   it makes hotfixes harder to reason about and breaks the staging guarantee.

---

## 7. Where the code lives (for reference)

- `client/src/util/drugClassesRules.js` — every drug rule and stat-keys array,
  plus the MDR/XDR definitions and the heat-map sub-rules.
- `client/src/util/drugs.js` — every drug list shown on the dashboard, the
  acronym lookup tables, and the per-organism drug-class selectors
  (`getDrugClasses`).
- `client/src/components/Dashboard/filters.js` — where the rules and stat keys
  are actually consumed to compute per-country and per-year aggregates.
- `client/src/components/Elements/Graphs/DrugResistanceGraph/DrugResistanceGraph.js`
  — where `drugsST` etc. become the bars and lines on the chart.

If you are about to edit any of those, please read this document first, and
pair-review the change before opening the PR.
