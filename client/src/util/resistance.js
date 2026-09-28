// Per-genome resistance helpers shared across Co-occurrence and ATB
// Correlation plots. Both compute "%R per class/group" from raw genome data
// using the same organism-specific resistance rules used elsewhere in
// AMRnet, so the answer they give matches what the rest of the dashboard
// sees.

import {
  drugRulesKP,
  drugRulesNG,
  drugRulesSA,
  drugRulesSP,
  drugRulesST,
  statKeysECOLI,
} from './drugClassesRules';

// Categories that aren't real drugs but compound flags (MDR, XDR, Pansusceptible
// etc.) — exclude them when reasoning about pairwise drug resistance.
export const RESISTANCE_EXCLUSIONS = [
  'MDR',
  'XDR',
  'Pansusceptible',
  'Susceptible',
  'Susceptible to cat I/II drugs',
  'H58',
  'Ciprofloxacin NS',
  'Ciprofloxacin R',
  'Trimethoprim-sulfamethoxazole',
  'Trimethoprim-Sulfamethoxazole',
];

/**
 * Determine which drugs a single genome is resistant to.
 * Returns a Set of drug names matching the keys used in the organism's
 * drug-rules mapping (drugRulesST/KP/NG/SA/SP or statKeysECOLI).
 */
export function getResistantDrugs(genome, organism) {
  const resistant = new Set();

  if (organism === 'styphi') {
    drugRulesST.forEach(rule => {
      if (RESISTANCE_EXCLUSIONS.includes(rule.key)) return;
      if (rule.values.some(v => genome[rule.columnID]?.toString() === v.toString())) {
        resistant.add(rule.key);
      }
    });
  } else if (organism === 'kpneumo') {
    drugRulesKP.forEach(rule => {
      if (RESISTANCE_EXCLUSIONS.includes(rule.key)) return;
      const hasResistance = rule.columnIDs.some(id => genome[id] && genome[id] !== '-' && genome[id] !== 'ND');
      if ('every' in rule) {
        const allPresent = rule.columnIDs.every(id => genome[id] && genome[id] !== '-' && genome[id] !== 'ND');
        if (allPresent) resistant.add(rule.key);
      } else if (hasResistance) {
        resistant.add(rule.key);
      }
    });
  } else if (organism === 'ngono') {
    drugRulesNG.forEach(rule => {
      if (RESISTANCE_EXCLUSIONS.includes(rule.key)) return;
      if (Array.isArray(rule.columnID)) {
        if (rule.values.some(v => rule.columnID.some(col => genome[col]?.toString() === v.toString()))) {
          resistant.add(rule.key);
        }
      } else if (rule.values.some(v => genome[rule.columnID]?.toString() === v.toString())) {
        resistant.add(rule.key);
      }
    });
  } else if (['senterica', 'sentericaints', 'ecoli', 'decoli', 'shige'].includes(organism)) {
    statKeysECOLI.forEach(drug => {
      if (RESISTANCE_EXCLUSIONS.includes(drug.name) || !drug.resistanceView || drug.computed) return;
      if (!drug.rules || drug.rules.length === 0) return;
      const matchRule = rule => {
        const raw = genome[rule.column];

        const isEmpty = raw == null || raw === '' || raw === '-';

        // Handle regex-based rules
        if (rule.match) {
          if (isEmpty) return false;

          const genes = String(raw)
            .split(';')
            .map(gene => gene.trim())
            .filter(Boolean);

          const regex = new RegExp(rule.match);

          return genes.some(gene => {
            // Reset lastIndex in case a global regex is ever supplied
            regex.lastIndex = 0;
            return regex.test(gene);
          });
        }

        // Handle value/presence rules
        if (rule.equal !== undefined) {
          if (rule.equal === true) {
            return isEmpty;
          }

          if (rule.equal === false) {
            if (isEmpty) return false;

            const genes = String(raw)
              .split(';')
              .map(gene => gene.trim())
              .filter(Boolean);

            // Exclude specific genes from marker counting
            if (rule.excludeGenes?.length) {
              const remainingGenes = genes.filter(
                gene => !rule.excludeGenes.includes(gene)
              );

              return remainingGenes.length > 0;
            }

            return genes.length > 0;
          }
        }

        return false;
      };

const isResistant = drug.every ? drug.rules.every(matchRule) : drug.rules.some(matchRule);


if (isResistant) resistant.add(drug.name);
    });
  } else if (organism === 'saureus') {
    drugRulesSA.forEach(rule => {
      if (RESISTANCE_EXCLUSIONS.includes(rule.key) || rule.pansusceptible) return;
      if (rule.values.some(v => genome[rule.columnID]?.toString() === v.toString())) {
        resistant.add(rule.key);
      }
    });
  } else if (organism === 'strepneumo') {
    drugRulesSP.forEach(rule => {
      if (RESISTANCE_EXCLUSIONS.includes(rule.key) || rule.pansusceptible) return;
      if (rule.values.some(v => genome[rule.columnID]?.toString() === v.toString())) {
        resistant.add(rule.key);
      }
    });
  }

  return resistant;
}
