import { decoli, ecoli, ints, kleb, ngono, senterica, shig, typhi, vcholerae, abaumanii, saureus, spneumo } from '../assets/organisms';

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
        <i>Staphylococcus aureus</i>
      </span>
    ),
    stringLabel: 'Staphylococcus aureus',
    value: 'saureus',
    abbr: 'S. aureus',
    img: saureus,
    // disabled: true,
  },
  {
    label: (
      <span>
        <i>Acinetobacter baumanii</i>
      </span>
    ),
    stringLabel: 'Acinetobacter baumanii',
    value: 'abaumanii',
    abbr: 'A. baumanii',
    img: abaumanii,
    // disabled: true,
  },
  {
    label: (
      <span>
        <i>Vibrio Cholerae</i>
      </span>
    ),
    stringLabel: 'Vibrio Cholerae',
    value: 'vcholerae',
    abbr: 'V. Cholerae',
    img: vcholerae,
    // disabled: true,
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
    img: spneumo,
    // disabled: true,
  },
];
