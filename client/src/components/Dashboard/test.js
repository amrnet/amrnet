
    if (rule.key === 'Susceptible' || rule.key === 'Sulfonamides' || rule.key === 'Ciprofloxacin' || rule.key === 'Tetracycline' || rule.key === 'Cefixime' || rule.key === 'Penicillin' || rule.key === 'Spectinomycin') {
      const drugClass = { ...drugClassResponse };

      drugClassesRulesNG[rule.key].forEach((classRule) => {
        const classRuleName = classRule.name;

        drugClass[classRuleName] = genotypeData.filter((x) => {
          return classRule.rules.every((r) => x[r.columnID] === r.value);
        }).length;

        if (classRule.susceptible) {
          drugClass.resistantCount =
            drugClass.totalCount - drugClass[classRuleName];
        }
      });

