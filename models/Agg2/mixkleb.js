const mixkleb = [
  {
    $lookup: {
      from: "pw_klebsiella_metadata",
      localField: "Genome Name",
      foreignField: "name",
      as: "pw_klebsiella_metadata",
    },
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
              $arrayElemAt: ["$pw_klebsiella_metadata", 0],
            },
            "$$ROOT",
          ],
        },
      },
  },
  {
    $project: {
      "pw_klebsiella_metadata": 0,
    },
  },
  {
    $merge: {
      into: "mixkleb2",
    },
  },
];
export default mixkleb; 