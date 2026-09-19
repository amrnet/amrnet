// ─── Text formatting conventions ─────────────────────────────────────────────
// Each entry is an object: { type, text }
// type: 'heading' | 'warning' | 'body' | 'bullet' | 'subheading'
// The PDF and preview renderers consume this structure to style each block.

function h(text)    { return { type: 'heading',    text }; }
function sh(text)   { return { type: 'subheading', text }; }
function w(text)    { return { type: 'warning',    text }; }
function b(text)    { return { type: 'body',       text }; }
function li(text)   { return { type: 'bullet',     text }; }

export function getSalmonellaTexts() {
  return [
    b('This report was generated using the AMRnet dashboard (https://www.amrnet.org). See the website for documentation.'),

    h('Source Data'),
    b('AMRnet displays genome-derived information on antimicrobial resistance (AMR) and genotypes for the bacterial pathogen Salmonella Typhi.'),
    b('The prevalence estimates shown are calculated using genome collections derived from non-targeted sampling frames (i.e. surveillance and burden studies, rather than AMR-focused studies or outbreak investigations) with known year of isolation and country of origin.'),
    b('Salmonella Typhi data in AMRnet are drawn from Pathogenwatch (https://pathogen.watch), which calls AMR determinants and genotypes from genome assemblies (see https://doi.org/10.1038/s41467-021-23091-2).'),
    b('The Salmonella Typhi data in Pathogenwatch are curated by the Global Typhoid Genomics Consortium (https://www.typhoidgenomics.org), as described in Carey et al. (2023), eLife (https://doi.org/10.7554/eLife.85867).'),
    b('The AMRnet dashboard mirrors the data and functionality of the TyphiNET dashboard (https://www.typhi.net), on which AMRnet is based.'),
    b('Individual genome information, including derived genotype and AMR calls, sequence data accession numbers, and source information (PubMedID for citation), can be downloaded as a spreadsheet from the AMRnet dashboard (https://www.amrnet.org).'),
    b('AMRnet\'s Salmonella Typhi database was last updated on November 6th, 2024.'),

    h('Variable Definitions'),
    b('The genotypes reported here are from the GenoTyphi scheme, defined in Dyson & Holt (2021), J. Infect. Dis. (https://doi.org/10.1093/infdis/jiab414).'),
    b('Travel-associated cases are attributed to the country of travel, not the country of isolation (see Ingle et al. 2019, PLoS NTDs, https://doi.org/10.1371/journal.pntd.0007620).'),
    b('Antimicrobial resistance determinants are described in the Typhi Pathogenwatch paper (see Argimon et al. 2021, Nat. Commun., https://doi.org/10.1038/s41467-021-23091-2).'),

    h('Abbreviations'),
    li('MDR: Multidrug resistant (resistant to ampicillin, chloramphenicol, and trimethoprim-sulfamethoxazole).'),
    li('XDR: Extensively drug resistant (MDR plus resistance to ciprofloxacin and ceftriaxone).'),
    li('Ciprofloxacin NS: Ciprofloxacin non-susceptible (MIC >= 0.06 mg/L, due to presence of one or more resistance genes or mutations).'),
    li('Ciprofloxacin R: Ciprofloxacin resistant (MIC >= 0.5 mg/L, due to multiple mutations and/or resistance genes; see Carey et al., 2023 https://doi.org/10.7554/eLife.85867).'),
  ];
}

export function getKlebsiellaTexts() {
  return [
    b('This report was generated using the AMRnet dashboard (https://www.amrnet.org). See the website for documentation.'),

    h('Source Data'),
    b('AMRnet displays information on antimicrobial resistance (AMR) and multi-locus sequence types (MLST) for the bacterial pathogen Klebsiella pneumoniae, derived from public genome data.'),
    b('Klebsiella pneumoniae data in AMRnet are sourced from Pathogenwatch (https://pathogen.watch), which calls AMR and genotypes (MLST) from genomes assembled from public data (see https://doi.org/10.1093/cid/ciab784). See below for details of how the genotyping is undertaken.'),
    w('The Klebsiella pneumoniae data used in AMRnet are not yet curated for purpose-of-sampling, and therefore reflect the biases of global sequencing efforts which have been largely directed at sequencing ESBL and carbapenemase-producing strains or hypervirulent strains in order to understand their emergence and spread, and to investigate outbreaks in hospitals. The KlebNET consortium is undertaking efforts to curate the public genome data for Klebsiella pneumoniae, which will ultimately allow AMRnet to identify genome collections derived from non-targeted sampling frames suitable to calculate national annual AMR prevalence estimates and trends. Until then, please be careful when interpreting the data in the dashboard.'),
    b('Individual genome information, including MLST and AMR calls, and sequence data accession numbers, can be downloaded as a spreadsheet from the AMRnet dashboard (https://www.amrnet.org).'),
    b('AMRnet\'s Klebsiella pneumoniae database was last updated on November 6th, 2024.'),

    h('Variable Definitions'),
    b('Genotype — Pathogenwatch assigns sequence types (STs) using the 7-locus MLST scheme for Klebsiella pneumoniae, defined by Diancourt et al (2005), J Clin Microbiol (https://doi.org/10.1128/jcm.43.8.4178-4182.2005) and maintained by Institut Pasteur (https://bigsdb.pasteur.fr/klebsiella/).'),
    b('Antimicrobial resistance determinants are identified by Pathogenwatch using Kleborate v2, developed and maintained by the Holt lab (https://github.com/klebgenomics/Kleborate) and described in Lam et al (2021), Nature Communications (https://doi.org/10.1038/s41467-021-24448-3).'),

    h('Abbreviations'),
    li('ESBL: Extended-spectrum beta-lactamase.'),
    li('MLST: Multi-locus sequence type.'),
    li('ST: Sequence type.'),
  ];
}

export function getNgonoTexts() {
  return [
    b('This report was generated using the AMRnet dashboard (https://www.amrnet.org). See the website for documentation.'),

    h('Source Data'),
    b('AMRnet displays information on antimicrobial resistance (AMR) and genotype (sequence type) for the bacterial pathogen Neisseria gonorrhoeae, derived from public genome data.'),
    b('The prevalence estimates shown are calculated using genome collections derived from non-targeted sampling frames (i.e. surveillance and burden studies, as opposed to AMR focused studies or outbreak investigations). These include EuroGASP 2013, 2018 & 2020 and several national surveillance studies.'),
    b('Neisseria gonorrhoeae data in AMRnet are sourced from Pathogenwatch (https://pathogen.watch), which calls AMR and lineage genotypes (MLST, NG-MAST) from genomes assembled from public data (see https://doi.org/10.1186/s13073-021-00858-2). See below for details of how the genotyping is undertaken.'),
    b('Individual genome information, including AMR, MLST and NG-MAST calls, sequence data accession numbers, and source information (PubMedID for citation) can be downloaded as a spreadsheet from the AMRnet dashboard (https://www.amrnet.org).'),
    b('AMRnet\'s Neisseria gonorrhoeae database was last updated on March 24th, 2025.'),

    h('Variable Definitions'),
    b('Genotype — Users can choose from (i) sequence types (STs) assigned using the 7-locus MLST scheme for Neisseria, defined by Bennett et al (2007), BMC Biology (https://doi.org/10.1186/1741-7007-5-35); or (ii) STs assigned using the 2-locus N. gonorrhoeae multi-antigen sequence typing (NG-MAST) scheme, defined by Martin et al (2004), J Infect Dis (https://doi.org/10.1086/383047). Both schemes are hosted by PubMLST (https://pubmlst.org/neisseria/).'),
    b('Antimicrobial resistance determinants — These are identified by Pathogenwatch using an inhouse dictionary developed and maintained in consultation with an expert advisory group, as described by Sánchez-Busó et al (2021), Genome Medicine (https://doi.org/10.1186/s13073-021-00858-2).'),
    b('AMR determinants within genotypes — This plot shows combinations of determinants that result in clinical resistance to Azithromycin or Ceftriaxone, as defined in Figure 3 of Sánchez-Busó et al (2021), Genome Medicine (https://doi.org/10.1186/s13073-021-00858-2).'),
    b('Susceptible to cat I/II drugs — No determinants found for Azithromycin, Ceftriaxone, Cefixime (category I) or Benzylpenicillin, Ciprofloxacin, Spectinomycin (category II).'),

    h('Abbreviations'),
    li('MDR: Multidrug resistant (resistant to one of Azithromycin / Ceftriaxone / Cefixime [category I representatives], plus two or more of Benzylpenicillin / Ciprofloxacin / Spectinomycin [category II representatives]).'),
    li('XDR: Extensively drug resistant (resistant to two of Azithromycin / Ceftriaxone / Cefixime [category I drugs], plus three of Benzylpenicillin / Ciprofloxacin / Spectinomycin [category II representatives]).'),
    b('Note: these definitions are based on those defined in the European CDC Response Plan, modified to use the specific representatives of category I and II antibiotic classes available in the dashboard (https://www.ecdc.europa.eu/sites/default/files/documents/multi-and-extensively-drug-resistant-gonorrhoea-response-plan-Europe-2019.pdf).'),
  ];
}

export function getEcoliTexts() {
  return [
    b('This report was generated using the AMRnet dashboard (https://www.amrnet.org). See the website for documentation.'),

    h('Source Data'),
    b('Escherichia coli and Shigella data visualized in AMRnet are sourced from Enterobase (https://enterobase.warwick.ac.uk/). Sequence types (STs) are assigned in silico via the Achtman MLST scheme, with novel STs created as needed, and unique core-genome MLST types derived from 2,513 loci. Pathovars are predicted by hierarchical clustering, while phylogroups are determined using ClermontTyper (v. 5 July 2019) and EzClermont (v. 25 August 2018). O:H serotypes and fimH alleles are called with EcTyper and FimTyper, respectively. Antimicrobial-resistance genotypes are detected using NCBI\'s AMRFinderPlus (https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/) and virulence factors are identified via BlastFrost. For full details on pathovar prediction, MLST schemas, and other genotyping workflows, see the Enterobase documentation (https://enterobase.warwick.ac.uk/docs/).'),
    b('The last update was made on May 22nd, 2025.'),

    sh('Pathotypes included in the E. coli (diarrheagenic) dashboard:'),
    li('Shiga toxin-producing E. coli (STEC)'),
    li('Enterohemorrhagic E. coli (EHEC)'),
    li('Enterotoxigenic E. coli (ETEC)'),
    li('Enteropathogenic E. coli (EPEC)'),
    li('Enteroinvasive E. coli (EIEC)'),

    w('The Escherichia coli data used in AMRnet are not yet curated for purpose-of-sampling, and therefore reflect the biases of global sequencing efforts.'),

    h('Variable Definitions'),
    b('Lineages are labeled by the pathovar followed by the (7-locus) ST.'),
    b('AMR determinants — Enterobase identifies AMR determinants using NCBI\'s AMRFinderPlus. AMRnet imports these AMR genotype calls, and assigns them to drugs/classes in the dashboard using the Subclass curated in refgenes (https://www.microbiologyresearch.org/content/journal/mgen/10.1099/mgen.0.000832).'),

    h('Abbreviations'),
    li('MDR: Multidrug resistant (resistant to ampicillin, chloramphenicol, and trimethoprim-sulfamethoxazole).'),
    li('XDR: Extensively drug resistant (MDR plus resistant to fluoroquinolones and third-generation cephalosporins).'),
    li('Ciprofloxacin NS: Ciprofloxacin non-susceptible (MIC >= 0.06 mg/L, due to presence of one or more qnr genes or mutations in gyrA/parC/gyrB).'),
    li('Ciprofloxacin R: Ciprofloxacin resistant (MIC >= 0.5 mg/L, due to the presence of multiple mutations and/or genes).'),
  ];
}

export function getIntsTexts() {
  return [
    b('This report was generated using the AMRnet dashboard (https://www.amrnet.org). See the website for documentation.'),

    h('Source Data'),
    b('Salmonella (invasive non-typhoidal) data visualised in AMRnet are drawn from Enterobase (https://enterobase.warwick.ac.uk/), which calls AMR genotypes using NCBI\'s AMRFinderPlus, assigns lineages using MLST, cgMLST and hierarchical clustering, and assigns serotypes using SISTR. The dashboard currently includes all genomes identified as serotype Typhimurium or Enteritidis (which account for >90% of iNTS genomes), and identifies lineages thereof using MLST. Last update: May 14th, 2025.'),
    b('For information about Salmonella Typhi, please see the Typhi dashboard.'),
    w('The Salmonella (invasive non-typhoidal) data used in AMRnet have not yet been curated to include information on purpose of sampling, and therefore reflect the biases of global sequencing efforts, which may be skewed towards sequencing drug-resistant organisms and/or those isolated during outbreaks. Data curation efforts are ongoing; until then, please be careful when drawing inferences about the generalisability of the data featured in the dashboard.'),

    h('Variable Definitions'),
    b('Lineages — Lineages associated with invasive disease in low-income countries are labeled by the serotype, either Typhimurium (iTYM) or Enteritidis (iENT), followed by the (7-locus) ST, followed by invasive sublineages defined by Van Puyvelde et al. 2023 and Fong et al. 2023.'),
    b('AMR determinants — Enterobase identifies AMR determinants using NCBI\'s AMRFinderPlus. AMRnet assigns these determinants to drugs/classes in the dashboard using the Subclass curated in refgenes. AMR categories are those described in Van Puyvelde et al. 2023.'),

    h('Abbreviations'),
    li('iTYM: Invasive Salmonella Typhimurium.'),
    li('iENT: Invasive Salmonella Enteritidis.'),
    li('ST: Sequence Type.'),
    li('WAC: West Africa Clone.'),
    li('CEAC: Central/East African Clone.'),
    li('L: Lineage.'),
    li('MDR: Multidrug resistant (resistant to ampicillin, chloramphenicol, and trimethoprim-sulfamethoxazole).'),
    li('XDR: Extensively drug resistant (MDR plus resistant to either (i) ciprofloxacin and ceftriaxone, or (ii) azithromycin and ceftriaxone).'),
    li('PDR: Pan-drug resistant (MDR plus resistant to ciprofloxacin, azithromycin and ceftriaxone).'),
    li('Ciprofloxacin NS: Ciprofloxacin non-susceptible (MIC >= 0.06 mg/L, due to presence of one or more qnr genes or mutations in gyrA/parC/gyrB).'),
    li('Ciprofloxacin R: Ciprofloxacin resistant (MIC >= 0.5 mg/L, due to the presence of multiple mutations and/or genes).'),
  ];
}

export function getDEcoliTexts() {
  return [
    b('This report was generated using the AMRnet dashboard (https://www.amrnet.org). See the website for documentation.'),

    h('Source Data'),
    b('Escherichia coli (diarrheagenic) data visualised in AMRnet are drawn from Enterobase (https://enterobase.warwick.ac.uk/), which calls AMR genotypes using NCBI\'s AMRFinderPlus (https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/) and assigns lineages using MLST, cgMLST and hierarchical clustering.'),
    b('The last update was made on May 14th, 2025.'),

    sh('Pathotypes included in the E. coli (diarrheagenic) dashboard:'),
    li('Shiga toxin-producing E. coli (STEC)'),
    li('Enterohemorrhagic E. coli (EHEC)'),
    li('Enterotoxigenic E. coli (ETEC)'),
    li('Enteropathogenic E. coli (EPEC)'),
    li('Enteroinvasive E. coli (EIEC)'),

    w('The E. coli data used in AMRnet are not yet curated for purpose-of-sampling, and therefore reflect the biases of global sequencing efforts which may be skewed towards sequencing AMR strains and/or outbreaks. Data curation efforts are ongoing; until then, please be careful when interpreting the data in the dashboard.'),

    h('Variable Definitions'),
    b('Lineages are labeled by the pathovar followed by the (7-locus) ST.'),
    b('AMR determinants — Enterobase identifies AMR determinants using NCBI\'s AMRFinderPlus. AMRnet imports these AMR genotype calls, and assigns them to drugs/classes in the dashboard using the Subclass curated in refgenes (https://www.microbiologyresearch.org/content/journal/mgen/10.1099/mgen.0.000832).'),
  ];
}

export function getShigeTexts() {
  return [
    b('This report was generated using the AMRnet dashboard (https://www.amrnet.org). See the website for documentation.'),

    h('Source Data'),
    b('Shigella data visualised in AMRnet are drawn from Enterobase (https://enterobase.warwick.ac.uk/), which calls AMR genotypes using NCBI\'s AMRFinderPlus (https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/) and assigns lineages using 7-gene MLST. The last update was made on May 14th, 2025.'),
    w('The Shigella + EIEC data used in AMRnet are not yet curated for purpose-of-sampling, and therefore reflect the biases of global sequencing efforts which may be skewed towards sequencing AMR strains and/or outbreaks. Data curation efforts are ongoing; until then, please be careful when interpreting the data in the dashboard.'),

    h('Variable Definitions'),
    b('Lineages — The logic used by Enterobase to classify genomes as Shigella or EIEC are detailed here. Shigella sonnei are monophyletic and labelled as lineage \'S. sonnei\'. For other Shigella, lineages are labeled by the species followed by the HC400 (HierCC) cluster ID. EIEC lineages are labeled by ST (e.g. \'EIEC ST99\').'),
    b('AMR determinants — Enterobase identifies AMR determinants using NCBI\'s AMRFinderPlus. AMRnet imports these AMR genotype calls, and assigns them to drugs/classes in the dashboard using the Subclass curated in refgenes.'),
  ];
}

export function getSaureusTexts() {
  return [
    b('This report was generated using the AMRnet dashboard (https://www.amrnet.org). See the website for documentation.'),

    h('Source Data'),
    b('Staphylococcus aureus data visualised in AMRnet are drawn from a curated collection of publicly available whole-genome sequences. AMR genotypes are called using a specialised pipeline integrating acquired resistance gene detection and point mutation identification. Genotypes are assigned using MLST (multilocus sequence typing).'),

    h('Variable Definitions'),
    b('Genotype — Genotypes are assigned based on MLST clonal complexes (CCs), which group sequence types (STs) sharing a common ancestor.'),
    b('AMR determinants — Resistance is detected via acquired genes (e.g. mecA, blaZ, erm genes) and chromosomal point mutations (e.g. in grlA, gyrA, rpoB, fusA). Binary resistance calls (1 = resistant, 0 = susceptible) are stored per drug.'),

    h('Abbreviations'),
    li('MRSA: Methicillin-resistant Staphylococcus aureus (presence of mecA or mecC).'),
    li('Pansusceptible: No resistance detected across all tested drugs.'),
  ];
}

export function getStrepneumoTexts() {
  return [
    b('This report was generated using the AMRnet dashboard (https://www.amrnet.org). See the website for documentation.'),

    h('Source Data'),
    b('Streptococcus pneumoniae data visualised in AMRnet are drawn from a curated collection of publicly available whole-genome sequences. AMR genotypes are called using a specialised pipeline integrating acquired resistance gene detection and point mutation identification. Genotypes are assigned using MLST.'),

    h('Variable Definitions'),
    b('Genotype — Genotypes are assigned based on MLST sequence types (STs) and Global Pneumococcal Sequence Cluster (GPSC) lineages.'),
    b('AMR determinants — Resistance is detected via acquired genes (e.g. erm, tet, cat genes) and chromosomal point mutations (e.g. in parC, gyrA, folA, folP). Binary resistance calls (1 = resistant, 0 = susceptible) are stored per drug.'),

    h('Abbreviations'),
    li('Pansusceptible: No resistance detected across all tested drugs.'),
    li('Co-Trimoxazole: Combined trimethoprim-sulfamethoxazole resistance.'),
  ];
}

export function getSentericaintsTexts() {
  return [
    b('This report was generated using the AMRnet dashboard (https://www.amrnet.org). See the website for documentation.'),

    h('Source Data'),
    b('Salmonella enterica data visualised in AMRnet are drawn from Enterobase (https://enterobase.warwick.ac.uk/), which calls AMR genotypes using NCBI\'s AMRFinderPlus (https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/AMRFinder/) and assigns lineages using 7-gene MLST. The last update was made on May 14th, 2025.'),
    b('For information about Salmonella Typhi, please see the Typhi dashboard.'),
    w('The Salmonella enterica data used in AMRnet are not yet curated for purpose-of-sampling, and therefore reflect the biases of global sequencing efforts.'),

    h('Variable Definitions'),
    b('Genotype — Enterobase assigns sequence types (STs) using the 7-locus MLST scheme for Salmonella enterica, defined by Achtman et al. 2022 (https://doi.org/10.1098/rstb.2021.0240).'),
    b('Antimicrobial resistance determinants are described in Cerdeira et al., Nucleic Acids Res, 2026 (https://doi.org/10.1093/nar/gkaf1101).'),

    h('Abbreviations'),
    li('MDR: Multidrug resistant (resistant to ampicillin, chloramphenicol, and trimethoprim-sulfamethoxazole).'),
    li('XDR: Extensively drug resistant (MDR plus resistant to ciprofloxacin and ceftriaxone).'),
    li('Ciprofloxacin NS: Ciprofloxacin non-susceptible (MIC >= 0.06 mg/L, due to presence of one or more genes or mutations).'),
    li('Ciprofloxacin R: Ciprofloxacin resistant (MIC >= 0.5 mg/L, due to presence of multiple mutations and/or genes; see Carey et al., 2023 https://doi.org/10.7554/eLife.85867).'),
  ];
}