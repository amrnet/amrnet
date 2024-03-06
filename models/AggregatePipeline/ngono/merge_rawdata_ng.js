const merge_rawdata_ng = [
  {
    $lookup: {
      from: 'pw_amr-genes',
      localField: 'NAME',
      foreignField: 'NAME',
      as: 'pw_amr-genes'
    }
  },
  {
    $lookup: {
      from: 'pw_species-prediction',
      localField: 'NAME',
      foreignField: 'Genome Name',
      as: 'pw_species-prediction'
    }
  },
  {
    $lookup: {
      from: 'pw_amr-snps',
      localField: 'NAME',
      foreignField: 'NAME',
      as: 'pw_amr-snps'
    }
  },
  {
    $lookup: {
      from: 'pw_metadata',
      localField: 'NAME',
      foreignField: 'NAME',
      as: 'pw_metadata'
    }
  },
  {
    $lookup: {
      from: 'pw_typing',
      localField: 'NAME',
      foreignField: 'NAME',
      as: 'pw_typing'
    }
  },
  {
    $replaceRoot:
      /**
       * replacementDocument: A document or string.
       */
      {
        newRoot: {
          $mergeObjects: [
            {
              $arrayElemAt: ['$pw_amr-genes', 0]
            },
            {
              $arrayElemAt: ['$pw_species-prediction', 0]
            },
            {
              $arrayElemAt: ['$pw_amr-snps', 0]
            },
            {
              $arrayElemAt: ['$pw_metadata', 0]
            },
            {
              $arrayElemAt: ['$pw_stats', 0]
            },
            {
              $arrayElemAt: ['$pw_typing', 0]
            },
            '$$ROOT'
          ]
        }
      }
  },
  {
    $project: {
      'pw_amr-genes': 0,
      'pw_species-prediction': 0,
      'pw_amr-snps': 0,
      pw_metadata: 0,
      // pw_stats: 0,
      pw_typing: 0
    }
  },
  {
    $merge: {
      into: 'merge_rawdata_ng'
    }
  }
];
export default merge_rawdata_ng;
