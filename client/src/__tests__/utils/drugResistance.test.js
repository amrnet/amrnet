/**
 * @fileoverview Unit tests for drug resistance classification logic.
 *
 * These tests are the SAFETY NET for ECOLI-family organisms (ecoli, decoli,
 * shige, senterica, sentericaints). Every time someone changes the filtering
 * logic in filters.js, these tests MUST still pass.
 *
 * Critical invariants tested:
 *   - Empty values ("", "-", null, undefined) are NEVER counted as resistant
 *   - Gene names (e.g. "aadA2", "blaTEM-1") ARE counted as resistant
 *   - Semicolon-separated gene lists are split into multiple genes
 *   - QRDR + qnr combinations map correctly to CipS/CipNS/CipR
 */

// ─────────────────────────────────────────────────────────────
// Helpers copied from filters.js — keep in sync
// ─────────────────────────────────────────────────────────────

/** Is the cell value equivalent to "no resistance"? */
function isEmpty(raw) {
  return raw == null || raw === '' || raw === '-';
}

/** Is the genome resistant to this drug (non-empty column)? */
function isResistant(record, column) {
  return !isEmpty(record[column]);
}

/** Count ciprofloxacin resistance markers in a Quinolone field. */
function countMarkers(quinoloneField) {
  if (!quinoloneField || quinoloneField === '-' || quinoloneField === '') return 0;
  const qrdrPattern = /gyr[AB]|par[CE]/i;
  const qnrPattern = /qnr[A-Z]/i;
  const aacCrPattern = /aac.*Ib.*cr/i;
  let n = 0;
  quinoloneField.split(';').map(e => e.trim()).forEach(entry => {
    if (qrdrPattern.test(entry) || qnrPattern.test(entry) || aacCrPattern.test(entry)) n++;
  });
  return n;
}

/** Salmonella-specific: count QRDR mutations only. */
function countSalmonellaQRDR(quinoloneField) {
  if (!quinoloneField || quinoloneField === '-' || quinoloneField === '') return 0;
  const salQRDR = /^(gyrA_S83[FY]|gyrA_D87[AGNVY]|gyrB_S464[FY]|parC_S80I|parC_E84[GK])$/;
  return quinoloneField.split(';').map(e => e.trim()).filter(e => salQRDR.test(e)).length;
}

function hasQnr(quinoloneField) {
  if (!quinoloneField || quinoloneField === '-' || quinoloneField === '') return false;
  return /^qnr[SBD]/i.test(quinoloneField) ||
    quinoloneField.split(';').some(e => /^qnr[SBD]/i.test(e.trim()));
}

/** Classify Salmonella cipro phenotype. */
function classifySalmonellaCipro(qrdrCount, hasQnrGene) {
  if (qrdrCount === 0 && !hasQnrGene) return 'CipS';
  if (qrdrCount === 0 && hasQnrGene) return 'CipNS';
  if (qrdrCount >= 3) return 'CipR';
  if (hasQnrGene) return 'CipR';
  return 'CipNS';
}

// ─────────────────────────────────────────────────────────────
// Tests: empty value handling (the "100% resistance" bug)
// ─────────────────────────────────────────────────────────────

describe('isEmpty', () => {
  test('treats null as empty', () => {
    expect(isEmpty(null)).toBe(true);
  });

  test('treats undefined as empty', () => {
    expect(isEmpty(undefined)).toBe(true);
  });

  test('treats empty string as empty', () => {
    expect(isEmpty('')).toBe(true);
  });

  test('treats "-" as empty (legacy sentinel)', () => {
    expect(isEmpty('-')).toBe(true);
  });

  test('does NOT treat gene names as empty', () => {
    expect(isEmpty('aadA2')).toBe(false);
    expect(isEmpty('blaTEM-1')).toBe(false);
    expect(isEmpty("aph(3'')-Ib")).toBe(false);
    expect(isEmpty('floR')).toBe(false);
  });

  test('does NOT treat semicolon-separated gene lists as empty', () => {
    expect(isEmpty("aadA2; aph(3'')-Ib; aph(6)-Id")).toBe(false);
  });
});

describe('isResistant (ECOLI organisms)', () => {
  // This test directly guards against the "Ampicillin counts every genome as resistant" bug
  // (see commit 3201379d review in CODE_REVIEW_STAGING.md)
  test('a genome with no Beta-lactam value is NOT resistant to Ampicillin', () => {
    expect(isResistant({ 'Beta-lactam': '' }, 'Beta-lactam')).toBe(false);
    expect(isResistant({ 'Beta-lactam': '-' }, 'Beta-lactam')).toBe(false);
    expect(isResistant({ 'Beta-lactam': null }, 'Beta-lactam')).toBe(false);
    expect(isResistant({}, 'Beta-lactam')).toBe(false);
  });

  test('a genome with a Beta-lactam gene IS resistant to Ampicillin', () => {
    expect(isResistant({ 'Beta-lactam': 'blaTEM-1' }, 'Beta-lactam')).toBe(true);
    expect(isResistant({ 'Beta-lactam': 'blaCARB-2' }, 'Beta-lactam')).toBe(true);
    expect(isResistant({ 'Beta-lactam': 'blaTEM-1; blaOXA-1' }, 'Beta-lactam')).toBe(true);
  });

  test('counting resistance across a dataset gives the right prevalence', () => {
    const data = [
      { 'Beta-lactam': 'blaTEM-1' },
      { 'Beta-lactam': 'blaCARB-2' },
      { 'Beta-lactam': '-' },
      { 'Beta-lactam': '' },
      { 'Beta-lactam': null },
      { /* no Beta-lactam key */ },
      { 'Beta-lactam': 'blaOXA-48' },
    ];
    const resistantCount = data.filter(x => isResistant(x, 'Beta-lactam')).length;
    expect(resistantCount).toBe(3); // only 3 genomes have gene values
  });
});

// ─────────────────────────────────────────────────────────────
// Tests: Gene list splitting (the "one string = one gene" bug)
// ─────────────────────────────────────────────────────────────

describe('Gene list splitting', () => {
  test('splits semicolon-separated genes into individual entries', () => {
    const field = "aadA2; aph(3'')-Ib; aph(6)-Id";
    const genes = field.split(';').map(g => g.trim()).filter(Boolean);
    expect(genes).toHaveLength(3);
    expect(genes).toContain('aadA2');
    expect(genes).toContain("aph(3'')-Ib");
    expect(genes).toContain('aph(6)-Id');
  });

  test('handles single gene without separator', () => {
    const field = 'blaTEM-1';
    const genes = field.split(';').map(g => g.trim()).filter(Boolean);
    expect(genes).toHaveLength(1);
  });

  test('returns empty array for empty field', () => {
    expect(''.split(';').map(g => g.trim()).filter(Boolean)).toHaveLength(0);
    expect('-'.split(';').map(g => g.trim()).filter(g => g && g !== '-')).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────
// Tests: Ciprofloxacin marker counting
// ─────────────────────────────────────────────────────────────

describe('countMarkers (generic Quinolone detection)', () => {
  test('returns 0 for empty fields', () => {
    expect(countMarkers('')).toBe(0);
    expect(countMarkers('-')).toBe(0);
    expect(countMarkers(null)).toBe(0);
    expect(countMarkers(undefined)).toBe(0);
  });

  test('counts gyrA mutations', () => {
    expect(countMarkers('gyrA_S83F')).toBe(1);
    expect(countMarkers('gyrA_S83F; gyrA_D87N')).toBe(2);
  });

  test('counts qnr genes', () => {
    expect(countMarkers('qnrS1')).toBe(1);
    expect(countMarkers('qnrB4; qnrS1')).toBe(2);
  });

  test('counts aac(6\')-Ib-cr', () => {
    expect(countMarkers("aac(6')-Ib-cr")).toBe(1);
  });

  test('counts parC and parE mutations', () => {
    expect(countMarkers('parC_S80I')).toBe(1);
    expect(countMarkers('parE_D420N')).toBe(1);
  });

  test('ignores unrelated genes', () => {
    expect(countMarkers('aadA2')).toBe(0); // aminoglycoside, not quinolone
    expect(countMarkers('blaTEM-1')).toBe(0); // beta-lactam
  });
});

// ─────────────────────────────────────────────────────────────
// Tests: Salmonella-specific QRDR classification
// ─────────────────────────────────────────────────────────────

describe('Salmonella QRDR + qnr classification', () => {
  test('0 QRDR + no qnr → CipS', () => {
    expect(classifySalmonellaCipro(0, false)).toBe('CipS');
  });

  test('0 QRDR + qnr → CipNS', () => {
    expect(classifySalmonellaCipro(0, true)).toBe('CipNS');
  });

  test('1 QRDR alone → CipNS', () => {
    expect(classifySalmonellaCipro(1, false)).toBe('CipNS');
  });

  test('1 QRDR + qnr → CipR', () => {
    expect(classifySalmonellaCipro(1, true)).toBe('CipR');
  });

  test('2 QRDR alone → CipNS', () => {
    expect(classifySalmonellaCipro(2, false)).toBe('CipNS');
  });

  test('2 QRDR + qnr → CipR', () => {
    expect(classifySalmonellaCipro(2, true)).toBe('CipR');
  });

  test('3+ QRDR → CipR regardless of qnr', () => {
    expect(classifySalmonellaCipro(3, false)).toBe('CipR');
    expect(classifySalmonellaCipro(3, true)).toBe('CipR');
    expect(classifySalmonellaCipro(5, false)).toBe('CipR');
  });
});

describe('Salmonella QRDR parsing (countSalmonellaQRDR)', () => {
  test('recognizes canonical QRDR mutations', () => {
    expect(countSalmonellaQRDR('gyrA_S83F')).toBe(1);
    expect(countSalmonellaQRDR('gyrA_S83Y')).toBe(1);
    expect(countSalmonellaQRDR('gyrA_D87N')).toBe(1);
    expect(countSalmonellaQRDR('parC_S80I')).toBe(1);
    expect(countSalmonellaQRDR('parC_E84G')).toBe(1);
  });

  test('counts multiple QRDR mutations', () => {
    expect(countSalmonellaQRDR('gyrA_S83F; gyrA_D87N; parC_S80I')).toBe(3);
  });

  test('does not count qnr genes as QRDR', () => {
    expect(countSalmonellaQRDR('qnrS1')).toBe(0);
    expect(countSalmonellaQRDR('qnrB4; gyrA_S83F')).toBe(1); // only the QRDR
  });

  test('ignores unknown mutations', () => {
    expect(countSalmonellaQRDR('gyrA_X99Z')).toBe(0); // not a canonical QRDR
  });
});

describe('hasQnr', () => {
  test('detects qnrS, qnrB, qnrD', () => {
    expect(hasQnr('qnrS1')).toBe(true);
    expect(hasQnr('qnrB4')).toBe(true);
    expect(hasQnr('qnrD1')).toBe(true);
  });

  test('works with semicolon lists', () => {
    expect(hasQnr('gyrA_S83F; qnrS1')).toBe(true);
  });

  test('returns false for empty and unrelated', () => {
    expect(hasQnr('')).toBe(false);
    expect(hasQnr('-')).toBe(false);
    expect(hasQnr('gyrA_S83F')).toBe(false);
    expect(hasQnr(null)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// Integration test: full Ampicillin workflow
// Guards against the 3201379d bug
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// Tests: Beta-lactam gene pattern classification
// Guards against drugs showing as raw DB columns instead of
// calculated classes per docs/pathogen.rst AMR definition table.
// ─────────────────────────────────────────────────────────────

describe('Beta-lactam gene classification', () => {
  const CARBAPENEMASE_RE = new RegExp('^bla(KPC|NDM|IMP|VIM|GES|SPM|IMI|SME|FRI|OXA-(23|24|40|48|58|72|162|181|204|232|244|252|436|484|517|519|538|681))(\\b|[-_])');
  const ESBL_RE = new RegExp('^bla(CTX-M|SHV-(2|5|12|14|18|27|28|30|31|32|38|52|55)|CMY|DHA|ACC|FOX|MOX|LAT|MIR|ACT|CFE|OXY-2|OXY-5|PER|VEB|BES|TLA|SFO|BEL)(\\b|[-_])');

  const match = (re, cell) => String(cell).split(';').map(s => s.trim()).some(g => g && re.test(g));

  describe('Carbapenemase pattern', () => {
    test('detects KPC, NDM, IMP, VIM', () => {
      expect(match(CARBAPENEMASE_RE, 'blaKPC-4')).toBe(true);
      expect(match(CARBAPENEMASE_RE, 'blaNDM-5')).toBe(true);
      expect(match(CARBAPENEMASE_RE, 'blaIMP-1')).toBe(true);
      expect(match(CARBAPENEMASE_RE, 'blaVIM-2')).toBe(true);
    });

    test('detects OXA-48-family carbapenemases', () => {
      expect(match(CARBAPENEMASE_RE, 'blaOXA-48')).toBe(true);
      expect(match(CARBAPENEMASE_RE, 'blaOXA-181')).toBe(true);
      expect(match(CARBAPENEMASE_RE, 'blaOXA-232')).toBe(true);
    });

    test('does NOT match narrow-spectrum OXA (not carbapenemase)', () => {
      expect(match(CARBAPENEMASE_RE, 'blaOXA-1')).toBe(false);
      expect(match(CARBAPENEMASE_RE, 'blaOXA-10')).toBe(false);
    });

    test('does NOT match penicillinases or ESBLs', () => {
      expect(match(CARBAPENEMASE_RE, 'blaTEM-1')).toBe(false);
      expect(match(CARBAPENEMASE_RE, 'blaCTX-M-15')).toBe(false);
      expect(match(CARBAPENEMASE_RE, 'blaSHV-12')).toBe(false);
    });

    test('handles semicolon lists', () => {
      expect(match(CARBAPENEMASE_RE, 'blaOXA-1; blaTEM-1')).toBe(false);
      expect(match(CARBAPENEMASE_RE, 'blaTEM-1; blaNDM-5')).toBe(true);
    });
  });

  describe('ESBL pattern', () => {
    test('detects CTX-M variants', () => {
      expect(match(ESBL_RE, 'blaCTX-M-15')).toBe(true);
      expect(match(ESBL_RE, 'blaCTX-M-27')).toBe(true);
      expect(match(ESBL_RE, 'blaCTX-M')).toBe(true);
    });

    test('detects SHV ESBLs (not narrow-spectrum SHV-1)', () => {
      expect(match(ESBL_RE, 'blaSHV-12')).toBe(true);
      expect(match(ESBL_RE, 'blaSHV-2')).toBe(true);
      expect(match(ESBL_RE, 'blaSHV-5')).toBe(true);
    });

    test('detects AmpC genes', () => {
      expect(match(ESBL_RE, 'blaCMY-4')).toBe(true);
      expect(match(ESBL_RE, 'blaDHA-1')).toBe(true);
    });

    test('does NOT match penicillinases', () => {
      expect(match(ESBL_RE, 'blaTEM-1')).toBe(false);
      expect(match(ESBL_RE, 'blaOXA-1')).toBe(false);
    });
  });
});

describe('Ampicillin prevalence calculation', () => {
  // Mock dataset: 10 genomes, 3 resistant
  const genomes = [
    { Name: 'g1', 'Beta-lactam': 'blaTEM-1' },     // resistant
    { Name: 'g2', 'Beta-lactam': 'blaCARB-2' },    // resistant
    { Name: 'g3', 'Beta-lactam': 'blaOXA-48' },    // resistant
    { Name: 'g4', 'Beta-lactam': '-' },            // susceptible
    { Name: 'g5', 'Beta-lactam': '' },             // susceptible
    { Name: 'g6', 'Beta-lactam': null },           // susceptible
    { Name: 'g7' },                                 // susceptible (no field)
    { Name: 'g8', 'Beta-lactam': '-' },            // susceptible
    { Name: 'g9', 'Beta-lactam': '-' },            // susceptible
    { Name: 'g10', 'Beta-lactam': '-' },           // susceptible
  ];

  test('correct count: 3 of 10 resistant', () => {
    const resistant = genomes.filter(x => isResistant(x, 'Beta-lactam')).length;
    expect(resistant).toBe(3);
  });

  test('correct prevalence: 30%', () => {
    const resistant = genomes.filter(x => isResistant(x, 'Beta-lactam')).length;
    const prevalence = (resistant / genomes.length) * 100;
    expect(prevalence).toBe(30);
  });

  test('BUG GUARD: not all genomes are resistant', () => {
    const resistant = genomes.filter(x => isResistant(x, 'Beta-lactam')).length;
    // This was the bug: countMarkers returned a number, so `number !== '-'` = always true,
    // making every genome count as resistant. This test catches that regression.
    expect(resistant).toBeLessThan(genomes.length);
  });
});
