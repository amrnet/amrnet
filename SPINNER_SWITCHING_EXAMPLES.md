// Example of switching spinners in any component

// STEP 1: Change the import // From this: import { SimpleDNASpinner } from
'../Elements/DNASpinner';

// To any of these: import { DNASpinner } from '../Elements/DNASpinner'; //
Complex 3D helix import { DNAPulseSpinner } from '../Elements/DNASpinner'; //
Fast emoji-based import { DNASpinnerSVG } from '../Elements/DNASpinner'; //
Vector graphics import { DNAIconSpinner } from '../Elements/DNASpinner'; //
Ultra simple

// STEP 2: Change the component usage // From this:
<SimpleDNASpinner color="#6F2F9F" height={60} width={60} />

// To any of these: <DNASpinner color="#6F2F9F" height={60} width={60} /> //
Complex 3D <DNAPulseSpinner color="#6F2F9F" height={60} width={60} /> // Fast
emoji <DNASpinnerSVG color="#6F2F9F" height={60} width={60} /> // Vector
graphics <DNAIconSpinner color="#6F2F9F" height={60} width={60} /> // Ultra
simple
