const Sprediction = [
  {
    $addFields:
      /**
       * newField: The new field name.
       * expression: The new field expression.
       */
      {
        NAME: "$Genome Name",
      },
  },
  {
    $addFields: {
      NAME: {
        $trim: {
          input: {
            $toString: "$NAME",
          },
        },
      },
    },
  },
  {
    $addFields: {
      "p-Value": {
        $cond: {
          if: {
            $in: [
              "$p-Value",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$p-Value",
        },
      },
      "Mash Distance": {
        $cond: {
          if: {
            $in: [
              "$Mash Distance",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$Mash Distance",
        },
      },
      "Organism ID": {
        $cond: {
          if: {
            $in: [
              "$Organism ID",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$Organism ID",
        },
      },
      "Species Name": {
        $cond: {
          if: {
            $in: [
              "$Species Name",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$Species Name",
        },
      },
      "Species ID": {
        $cond: {
          if: {
            $in: [
              "$Species ID",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$Species ID",
        },
      },
      "Genus ID": {
        $cond: {
          if: {
            $in: [
              "$Genus ID",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$Genus ID",
        },
      },
      "Genus Name": {
        $cond: {
          if: {
            $in: [
              "$Genus Name",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$Genus Name",
        },
      },
      "Reference ID": {
        $cond: {
          if: {
            $in: [
              "$Reference ID",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$Reference ID",
        },
      },
      "Matching Hashes": {
        $cond: {
          if: {
            $in: [
              "$Matching Hashes",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$Matching Hashes",
        },
      },
      "Organism Name": {
        $cond: {
          if: {
            $in: [
              "$Organism Name",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$Organism Name",
        },
      },
      Version: {
        $cond: {
          if: {
            $in: [
              "$Version",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$Version",
        },
      },
      "Genome ID": {
        $cond: {
          if: {
            $in: [
              "$Genome ID",
              [
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$Genome ID",
        },
      },
    },
  },
  {
    $addFields: {
      "p-Value": {
        $ifNull: ["$p-Value", "-"],
      },
      "Mash Distance": {
        $ifNull: ["$Mash Distance", "-"],
      },
      "Organism ID": {
        $ifNull: ["$Organism ID", "-"],
      },
      "Species Name": {
        $ifNull: ["$Species Name", "-"],
      },
      "Species ID": {
        $ifNull: ["$Species ID", "-"],
      },
      "Genus ID": {
        $ifNull: ["$Genus ID", "-"],
      },
      "Genus Name": {
        $ifNull: ["$Genus Name", "-"],
      },
      "Reference ID": {
        $ifNull: ["$Reference ID", "-"],
      },
      "Matching Hashes": {
        $ifNull: ["$Matching Hashes", "-"],
      },
      "Organism Name": {
        $ifNull: ["$Organism Name", "-"],
      },
      Version: {
        $ifNull: ["$Version", "-"],
      },
    },
  },
  {
    $project: {
      "Genome ID": 1,
      Version: 1,
      "Organism Name": 1,
      "Organism ID": 1,
      "Species Name": 1,
      "Species ID": 1,
      NAME: 1,
      "Genus ID": 1,
      "Genus Name": 1,
      "Reference ID": 1,
      "Matching Hashes": 1,
      "p-Value": 1,
      "Mash Distance": 1,
    },
  },
  {
    $merge: {
      into: "predictioncollection",
    },
  },
];
export default Sprediction;