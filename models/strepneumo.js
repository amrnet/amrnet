import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const strepneumoSchema = new Schema({
  NAME: { type: String },
  DATE: { type: String },
  COUNTRY_ONLY: { type: String },
  GENOTYPE: { type: String },
  Lineage: { type: String },
  Serotype: { type: String },
  Chloramphenicol: { type: String },
  Clindamycin: { type: String },
  Erythromycin: { type: String },
  Fluoroquinolones: { type: String },
  Kanamycin: { type: String },
  // Linezolid: { type: String },
  Tetracycline: { type: String },
  Trimethoprim: { type: String },
  Sulfamethoxazole: { type: String },
  'Co-Trimoxazole': { type: String },
});

const strepneumoModel = mongoose.model('strepneumoModel', strepneumoSchema);

export default strepneumoModel;
