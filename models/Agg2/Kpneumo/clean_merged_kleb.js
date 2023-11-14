
const clean_merge_kleb = [
    {
        $addFields: {
        NAME: "$name",
        DATE: "$year",
        GENOTYPE: "$ST",
        COUNTRY_ONLY: "$Country",
        "PURPOSE OF SAMPLING":
            "Non Targeted [Other]",
        LOCATION: "$City.region",
        LONGITUDE: "$longitude",
        LATITUDE: "$latitude",
        KStringParts: {
            $split: ["$K_locus_identity", "%"],
        },
        OStringParts: {
            $split: ["$O_locus_identity", "%"],
        },
        },
    },
    {
        $addFields: {
        GENOTYPE: {
            $toString: "$GENOTYPE",
        },
        DATE: {
            $toString: "$DATE",
        },
        },
    },
    {
        $addFields: {
        K_locus_identity: {
            $arrayElemAt: ["$KStringParts", 0],
        },
        O_locus_identity: {
            $arrayElemAt: ["$OStringParts", 0],
        },
        },
    },
    {
        $addFields: {
        K_locus_identity: {
            $divide: [
            {
                $toDouble: "$K_locus_identity",
            },
            100,
            ],
        },
        O_locus_identity: {
            $divide: [
            {
                $toDouble: "$O_locus_identity",
            },
            100,
            ],
        },
        },
    },
    {
        $addFields:{
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
        }
    },
    {
        $addFields:{
        COUNTRY_ONLY: {
            $cond: {
            if: {
                $in: [
                "$COUNTRY_ONLY",
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
            else: "$COUNTRY_ONLY",
            },
        },
        }
    },
    {
        $addFields: {
        Exclude: {
            $cond: {
            if: {
                $and: [
                {
                    $ne: ["$GENOTYPE", "NA"],
                },
                {
                    $ne: ["$COUNTRY_ONLY", "-"],
                },
                {
                    $ne: ["$DATE", "-"],
                },
                {
                    $ne: ["$COUNTRY_ONLY", "-"],
                },
                {
                    $in: [
                    "$PURPOSE OF SAMPLING",
                    [
                        "Non Targeted [Surveillance Study]",
                        "Non Targeted [Routine diagnostics]",
                        "Non Targeted [Reference lab]",
                        "Non Targeted [Other]",
                    ],
                    ],
                },
                {
                    $ne: ["$SYMPTOM STATUS","Asymptomatic Carrier"],
                },
                {
                    $ne: ["$SOURCE", "Environment"],
                },
                {
                    $ne: ["$SOURCE", "Gallbladder"],
                },
                ],
            },
            then: "Include",
            else: "Exclude",
            },
        },
        },
    },
     {
        $project: {
        pw_klebsiella_metadata: 0,
        name: 0,
        year: 0,
        ST: 0,
        "Kleborate version": 0,
        species_match: 0,
        "Genome Name": 0,
        QC_warnings: 0,
        ambiguous_bases: 0,
        "Genome ID": 0,
        Version: 0,
        country: 0,
        "City/region": 0,
        "Age group": 0,
        year: 0,
        "Sample alias": 0,
        month: 0,
        name: 0,
        latitude: 0,
        Location: 0,
        literatureLink: 0,
        day: 0,
        Country: 0,
        longitude: 0,
        "Environmental sample": 0,
        fileId: 0,
        literaturelink: 0,
        "Collection date": 0,
        City: 0,
        FIELD25: 0,
        KStringParts: 0,
        OStringParts: 0,
        },
    },
    {
        $merge: {
            into: "clean_merge_kleb",
        },
    },
];

export default clean_merge_kleb; 