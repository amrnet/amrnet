import { decoli, ecoli, ints, kleb, ngono, senterica, shig, typhi } from '../assets/organisms';

export const organismsCards = [
  {
    label: (
      <span>
        <i>Salmonella</i> Typhi
      </span>
    ),
    stringLabel: 'Salmonella Typhi',
    value: 'styphi',
    abbr: 'S. Typhi',
    img: typhi,
  },
  {
    label: (
      <span>
        Invasive non-typhoidal <i>Salmonella</i>
      </span>
    ),
    stringLabel: 'Invasive non-typhoidal Salmonella',
    value: 'sentericaints',
    abbr: 'iNTS',
    img: ints,
  },
  {
    label: (
      <span>
        <i>Salmonella enterica</i>
      </span>
    ),
    stringLabel: 'Salmonella enterica',
    value: 'senterica',
    abbr: 'S. enterica',
    img: senterica,
  },
  {
    label: (
      <span>
        <i>Neisseria gonorrhoeae</i>
      </span>
    ),
    stringLabel: 'Neisseria gonorrhoeae',
    value: 'ngono',
    abbr: 'N. gonorrhoeae',
    img: ngono,
  },
  {
    label: (
      <span>
        <i>Klebsiella pneumoniae</i>
      </span>
    ),
    stringLabel: 'Klebsiella pneumoniae',
    value: 'kpneumo',
    abbr: 'K. pneumoniae',
    img: kleb,
  },
  {
    label: (
      <span>
        <i>Shigella</i> + EIEC
      </span>
    ),
    stringLabel: 'Shigella + EIEC',
    value: 'shige',
    abbr: 'Shigella+EIEC',
    img: shig,
  },
  
  {
    label: (
      <span>
        Diarrheagenic <i>E. coli</i>
      </span>
    ),
    stringLabel: 'Diarrheagenic E. coli',
    value: 'decoli',
    abbr: 'DEC',
    img: decoli,
  },
  {
    label: (
      <span>
        <i>Escherichia coli</i>
      </span>
    ),
    stringLabel: 'Escherichia coli',
    value: 'ecoli',
    abbr: 'E. coli',
    img: ecoli,
  },
  {
    label: (
      <span>
        <i>Staphylococcus aureus</i>
      </span>
    ),
    stringLabel: 'Staphylococcus aureus',
    value: 'aureus',
    abbr: 'S. aureus',
    // img: saureus,
    disabled: true,
  },
  {
    label: (
      <span>
        <i>Acinetobacter baumanii</i>
      </span>
    ),
    stringLabel: 'Acinetobacter baumanii',
    value: 'baumanii',
    abbr: 'A. baumanii',
    // img: abaumannii,
    disabled: true,
  },
  {
    label: (
      <span>
        <i>Pseudomonas aeruginosa</i>
      </span>
    ),
    stringLabel: 'Pseudomonas aeruginosa',
    value: 'aeru',
    abbr: 'P. aeruginosa',
    // img: paeruginosa,
    disabled: true,
  },
  {
    label: (
      <span>
        <i>Haemophilus influenza</i>
      </span>
    ),
    stringLabel: 'Haemophilus influenza',
    value: 'influ',
    abbr: 'H. influenza',
    // img: hinfluenza,
    disabled: true,
  },
  {
    label: (
      <span>
        <i>Streptococcus pneumoniae</i>
      </span>
    ),
    stringLabel: 'Streptococcus pneumoniae',
    value: 'spneumo',
    abbr: 'S. pneumoniae',
    // img: spneumoniae,
    disabled: true,
  },
];

export const amrLikeOrganisms = ['decoli', 'ecoli', 'shige', 'sentericaints'];
