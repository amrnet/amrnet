const typing = [
  {
    $addFields: {
      GENOTYPE: {
        $toString: "$GENOTYPHI GENOTYPE",
      },
      h58_genotypes: {
        $cond: {
          if: {
            $in: [
              "$GENOTYPHI GENOTYPE",
              [
                "4.3.1",
                "4.3.1.1",
                "4.3.1.1.P1",
                "4.3.1.2",
                "4.3.1.2.1",
                "4.3.1.2.1.1",
                "4.3.1.3",
                "4.3.1.1.EA1",
                "4.3.1.2.EA2",
                "4.3.1.2.EA3",
                "4.3.1.3.Bdq",
              ],
            ],
          },
          then: "$GENOTYPHI GENOTYPE",
          else: "-",
        },
      },
    },
  },
  {
    $addFields: {
      NAME: {
        $toString: "$NAME",
      },
      GENOTYPE_SIMPLE: {
        $cond: {
          if: {
            $in: ["$h58_genotypes", ["-"]],
          },
          then: "Non-H58",
          else: "H58",
        },
      },
      GENOTYPE: {
        $cond: {
          if: {
            $in: [
              "$NAME",
              [
                "9953_5_76_LaoLNT1480_2010",
                "10060_6_13_LaoSV430_2009",
                "10060_6_20_LaoUI10788_2007",
                "10060_6_30_LaoUI14598_2009",
                "10209_5_36_LaoUI2001_2002",
                "10209_5_60_LaoUI3396_2003",
              ],
            ],
          },
          then: "2.2.3",
          else: "$GENOTYPE",
        },
      },
      "GENOTYPHI SNPs CALLED": {
        $cond: {
          if: {
            $in: [
              "$NAME",
              [
                "9953_5_76_LaoLNT1480_2010",
                "10060_6_13_LaoSV430_2009",
                "10060_6_20_LaoUI10788_2007",
                "10060_6_30_LaoUI14598_2009",
                "10209_5_36_LaoUI2001_2002",
                "10209_5_60_LaoUI3396_2003",
              ],
            ],
          },
          then: "2.2.3",
          else: "$GENOTYPHI SNPs CALLED",
        },
      },
      "Inc Types": {
        $ifNull: ["$Inc Types", "-"],
      },
    },
  },
  {
    $project:
      /**
       * specifications: The fields to
       *   include or exclude.
       */
      {
        NAME: 1,
        REFERENCE: 1,
        "MLST ST (EnteroBase)": 1,
        "MLST PROFILE (EnteroBase)": 1,
        "GENOTYPHI SNPs CALLED": 1,
        "Inc Types": 1,
        GENOTYPE: 1,
        h58_genotypes: 1,
        GENOTYPE_SIMPLE: 1,
      },
  },
  {
    $merge: {
      into: "typingcollection",
    },
  },
];
export default typing;