import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const saureusSchema = new Schema({
  NAME: { type: String },
  DATE: { type: String },
  COUNTRY_ONLY: { type: String },
  GENOTYPE: { type: String },
  Amikacin: { type: String },
  Gentamicin: { type: String },
  Tobramycin: { type: String },
  Kanamycin: { type: String },
  Methicillin: { type: String },
  Penicillin: { type: String },
  'Fusidic Acid': { type: String },
  Vancomycin: { type: String },
  Clindamycin: { type: String },
  Erythromycin: { type: String },
  Mupirocin: { type: String },
  Linezolid: { type: String },
  Tetracycline: { type: String },
  Trimethoprim: { type: String },
  Daptomycin: { type: String },
  Rifampicin: { type: String },
  Ciprofloxacin: { type: String },
  Moxifloxacin: { type: String },
  Teicoplanin: { type: String },
});

const saureusModel = mongoose.model('saureusModel', saureusSchema);

export default saureusModel;
