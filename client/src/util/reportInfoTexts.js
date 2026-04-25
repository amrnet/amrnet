// Per-organism PDF-report copy lives in `report.<organism>` arrays in
// the locale files (client/src/locales/{en,pt,es,fr}.json). i18next falls
// back to the English entries automatically when a non-English locale
// hasn't been translated yet, so non-English PDFs render the English
// strings until translations are filled in.
//
// Each function takes the `t` function from useTranslation() and returns
// the array of paragraph fragments expected by DownloadData.js. Keeping
// the array shape preserves the existing PDF rendering — fragments are
// concatenated into paragraphs by the consumer.

const getReportTexts = (t, organismKey) => t(`report.${organismKey}`, { returnObjects: true });

export const getSalmonellaTexts = t => getReportTexts(t, 'salmonella');
export const getKlebsiellaTexts = t => getReportTexts(t, 'klebsiella');
export const getNgonoTexts = t => getReportTexts(t, 'ngono');
export const getEcoliTexts = t => getReportTexts(t, 'ecoli');
export const getIntsTexts = t => getReportTexts(t, 'ints');
export const getDEcoliTexts = t => getReportTexts(t, 'decoli');
export const getShigeTexts = t => getReportTexts(t, 'shige');
export const getSaureusTexts = t => getReportTexts(t, 'saureus');
export const getStrepneumoTexts = t => getReportTexts(t, 'strepneumo');
export const getSentericaintsTexts = t => getReportTexts(t, 'sentericaints');
