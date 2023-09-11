const metadata = [
  {
    $addFields: {
      NAME: {
        $trim: {
          input: {
            $toString: "$NAME",
          },
        },
      },
      ACCESSION: "$NAME",
    },
  },
  // {
  //   $addFields: {
  //     ACCESSION: "$NAME",
  //   },
  // }
  {
    $addFields: {
      ACCESSION: "$NAME",
      STRAIN: {
        $cond: {
          if: {
            $in: [
              "$STRAIN",
              ["NA", "", " ", "Not Provided"],
            ],
          },
          then: "-",
          else: "$STRAIN",
        },
      },
      CONTACT: {
        $cond: {
          if: {
            $in: [
              "$CONTACT",
              ["NA", "", " ", "Not Provided"],
            ],
          },
          then: "-",
          else: "$CONTACT",
        },
      },
      "TGC ID": {
        $cond: {
          if: {
            $in: [
              "$TGC ID",
              ["NA", "", " ", "Not Provided"],
            ],
          },
          then: "-",
          else: "$TGC ID",
        },
      },
      AGE: {
        $cond: {
          if: {
            $in: [
              "$AGE",
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
          else: "$AGE",
        },
      },
      "PURPOSE OF SAMPLING": {
        $cond: {
          if: {
            $in: [
              "$PURPOSE OF SAMPLING",
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
          else: "$PURPOSE OF SAMPLING",
        },
      },
      SOURCE: {
        $cond: {
          if: {
            $in: [
              "$SOURCE",
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
          else: "$SOURCE",
        },
      },
      "SYMPTOM STATUS": {
        $cond: {
          if: {
            $in: [
              "$SYMPTOM STATUS",
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
          else: "$SYMPTOM STATUS",
        },
      },
      LOCATION: {
        $cond: {
          if: {
            $in: [
              "$LOCATION",
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
          else: "$LOCATION",
        },
      },
      "PROJECT ACCESSION": {
        $cond: {
          if: {
            $in: [
              "$PROJECT ACCESSION",
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
          else: "$PROJECT ACCESSION",
        },
      },
      BIOSAMPLE: {
        $cond: {
          if: {
            $in: [
              "$BIOSAMPLE",
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
          else: "$BIOSAMPLE",
        },
      },
      LAB: {
        $cond: {
          if: {
            $in: [
              "$LAB",
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
          else: "$LAB",
        },
      },
      PMID: {
        $cond: {
          if: {
            $in: [
              "$PMID",
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
          else: "$PMID",
        },
      },
      "COUNTRY ISOLATED": {
        $cond: {
          if: {
            $in: [
              "$COUNTRY ISOLATED",
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
          else: "$COUNTRY ISOLATED",
        },
      },
    },
  },
  // {
  //   $addFields: {
  //     PMID: {
  //       $cond: {
  //         if: {
  //           $eq: ["$PMID", "-"],
  //         },
  //         then: "-",
  //         else: {
  //           $toInt: "$PMID",
  //         },
  //       },
  //     },
  //   },
  // }
  {
    $addFields: {
      DATE: {
        $cond: {
          if: {
            $in: [
              "$DATE",
              [
                null,
                "NA",
                "Not Provided",
                "",
                "-",
                undefined,
              ],
            ],
          },
          then: "-",
          else: "$DATE",
        },
      },
      // DATE: {
      //   $toString: "$DATE",
      // },
    },
  },
  {
    $addFields: {
      DATE: {
        $toString: "$DATE",
      },
    },
  },
  {
    $addFields: {
      dateStringParts: {
        $split: ["$DATE", " "],
      },
    },
  },
  {
    $addFields: {
      DATE: {
        $arrayElemAt: ["$dateStringParts", -1],
      },
    },
  },
  // {
  //   $addFields: {
  //     DATE: {
  //       $cond: {
  //         if: {
  //           $eq: ["$DATE", "-"],
  //         },
  //         then: "-",
  //         else: {
  //           $toInt: "$DATE",
  //         },
  //       },
  //     },
  //   },
  // }
  // {
  //   $addFields: {
  //     DATE: {
  //       $cond: {
  //         if: {
  //           $and: [
  //             {
  //               $gt: [
  //                 {
  //                   $strLenCP: {
  //                     $ifNull: ["$DATE", ""],
  //                   },
  //                 },
  //                 4,
  //               ],
  //             },
  // Check length after handling null values
  //             {
  //               $ne: ["$DATE", null],
  //             }, // Check if DATE is not null
  //           ],
  //         },
  //
  //         then: "-",
  //         else: "$DATE",
  //       },
  //     },
  // DATE: {
  //   $cond: [
  //     {
  //       $not: {
  //         $gt: ["$DATE", null],
  //       },
  //     },
  //     "-",
  //     "$DATE",
  //   ],
  // },
  //   },
  // },
  {
    $addFields: {
      "TRAVEL ASSOCIATED": {
        $ifNull: ["$TRAVEL ASSOCIATED", "-"],
      },
    },
  },
  {
    $addFields: {
      COUNTRY_ONLY: {
        $cond: {
          if: {
            $in: [
              "$COUNTRY OF ORIGIN",
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
          else: "$COUNTRY OF ORIGIN",
        },
      },
    },
  },
  {
    $addFields: {
      REGION_IN_COUNTRY: {
        $cond: {
          if: {
            $in: [
              "$LOCATION",
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
          else: "$LOCATION",
        },
      },
    },
  },
  {
    $addFields: {
      COUNTRY_ORIGIN: {
        $cond: {
          if: {
            $in: [
              "$COUNTRY OF ORIGIN",
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
          else: "$COUNTRY OF ORIGIN",
        },
      },
    },
  },
  {
    $addFields: {
      "TRAVEL COUNTRY": {
        $cond: {
          if: {
            $in: [
              "$TRAVEL COUNTRY",
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
          else: "$TRAVEL COUNTRY",
          // else: {
          //   $cond: [
          //     {
          //       $not: {
          //         $gt: ["$TRAVEL COUNTRY", null],
          //       },
          //     },
          //     "-",
          //     "$TRAVEL COUNTRY",
          //   ],
          // },
        },
      },
    },
  },
  {
    $addFields: {
      TRAVEL_LOCATION: {
        $cond: {
          if: {
            $in: [
              "$TRAVEL COUNTRY",
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
          else: {
            $cond: [
              {
                $not: {
                  $gt: ["$TRAVEL COUNTRY", null],
                },
              },
              "-",
              "$TRAVEL COUNTRY",
            ],
          },
        },
      },
    },
  },
  {
    $addFields: {
      ACCESSION: {
        $cond: {
          if: {
            $in: [
              "$ACCESSION",
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
          else: "$ACCESSION",
        },
      },
    },
  },
  {
    $addFields: {
      "COUNTRY OF ORIGIN": {
        $cond: {
          if: {
            $in: [
              "$COUNTRY OF ORIGIN",
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
          else: "$COUNTRY OF ORIGIN",
        },
      },
    },
  },
  {
    $addFields: {
      TRAVEL: {
        $cond: {
          if: {
            $in: ["$TRAVEL ASSOCIATED", ["No"]],
          },
          then: "local",
          else: {
            $cond: {
              if: {
                $in: [
                  "$TRAVEL ASSOCIATED",
                  ["Yes"],
                ],
              },
              then: "travel",
              else: "$TRAVEL ASSOCIATED",
              // else: {
              //   $cond: [
              //     {
              //       $not: {
              //         $gt: [
              //           "$TRAVEL ASSOCIATED",
              //           null,
              //         ],
              //       },
              //     },
              //     "-",
              //     "$TRAVEL ASSOCIATED",
              //   ],
              // },
            },
          },
        },
      },
    },
  },
  {
    $addFields: {
      "TRAVEL ASSOCIATED": {
        $cond: {
          if: {
            $in: [
              "$TRAVEL ASSOCIATED",
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
          else: "$TRAVEL ASSOCIATED",
          // else: {
          //   $cond: [
          //     {
          //       $not: {
          //         $gt: ["$TRAVEL ASSOCIATED", null],
          //       },
          //     },
          //     "-",
          //     "$TRAVEL ASSOCIATED",
          //   ],
          // },
        },
      },
    },
  },
  // {
  //   $addFields: {
  //     BIOSAMPLE: {
  //       $cond: {
  //         if: {
  //           $in: [
  //             "$TBIOSAMPLE",
  //             [
  //               "NA",
  //               "Not Provided",
  //               "",
  //               "-",
  //               undefined,
  //             ],
  //           ],
  //         },
  //         then: "-",
  //         else: "$BIOSAMPLE",
  //       },
  //       $cond: [
  //         {
  //           $not: {
  //             $gt: ["$BIOSAMPLE", null],
  //           },
  //         },
  //         "-",
  //         "$BIOSAMPLE",
  //       ],
  //     },
  //   },
  // }
  {
    $addFields: {
      DATE: {
        $ifNull: ["$DATE", "-"],
      },
      "TGC ID": {
        $ifNull: ["$TGC ID", "-"],
      },
      ACCESSION: {
        $ifNull: ["$ACCESSION", "-"],
      },
      AGE: {
        $ifNull: ["$AGE", "-"],
      },
      "COUNTRY OF ORIGIN": {
        $ifNull: ["$COUNTRY OF ORIGIN", "-"],
      },
      LOCATION: {
        $ifNull: ["$LOCATION", "-"],
      },
      COUNTRY_ONLY: {
        $ifNull: ["$COUNTRY_ONLY", "-"],
      },
      COUNTRY_ORIGIN: {
        $ifNull: ["$COUNTRY_ORIGIN", "-"],
      },
      "COUNTRY ISOLATED": {
        $ifNull: ["$COUNTRY ISOLATED", "-"],
      },
      "TRAVEL COUNTRY": {
        $ifNull: ["$TRAVEL COUNTRY", "-"],
      },
      STRAIN: {
        $ifNull: ["$STRAIN", "-"],
      },
      "PURPOSE OF SAMPLING": {
        $ifNull: ["$PURPOSE OF SAMPLING", "-"],
      },
      SOURCE: {
        $ifNull: ["$SOURCE", "-"],
      },
      "SYMPTOM STATUS": {
        $ifNull: ["$SYMPTOM STATUS", "-"],
      },
      "PROJECT ACCESSION": {
        $ifNull: ["$PROJECT ACCESSION", "-"],
      },
      BIOSAMPLE: {
        $ifNull: ["$BIOSAMPLE", "-"],
      },
      LAB: {
        $ifNull: ["$LAB", "-"],
      },
      CONTACT: {
        $ifNull: ["$CONTACT", "-"],
      },
      ACCURACY: {
        $ifNull: ["$ACCURACY", "-"],
      },
      PMID: {
        $ifNull: ["$PMID", "-"],
      },
      LATITUDE: {
        $ifNull: ["$LATITUDE", "-"],
      },
      LONGITUDE: {
        $ifNull: ["$LONGITUDE", "-"],
      },
    },
  },
  {
    $project: {
      NAME: 1,
      DATE: 1,
      "TGC ID": 1,
      ACCESSION: 1,
      AGE: 1,
      "TRAVEL ASSOCIATED": 1,
      "TRAVEL COUNTRY": 1,
      STRAIN: 1,
      "PURPOSE OF SAMPLING": 1,
      SOURCE: 1,
      "SYMPTOM STATUS": 1,
      "PROJECT ACCESSION": 1,
      BIOSAMPLE: 1,
      LAB: 1,
      CONTACT: 1,
      ACCURACY: 1,
      PMID: 1,
      LATITUDE: 1,
      LONGITUDE: 1,
      COUNTRY_ONLY: 1,
      REGION_IN_COUNTRY: 1,
      COUNTRY_ORIGIN: 1,
      TRAVEL_LOCATION: 1,
      TRAVEL: 1,
      "COUNTRY ISOLATED": 1,
      LOCATION: 1,
      "COUNTRY OF ORIGIN": 1,
    },
  },
  {
    $merge: {
      into: "metadata",
    },
  },
];
export default metadata;