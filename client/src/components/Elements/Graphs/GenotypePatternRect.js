import React from 'react';

// Helper to sanitize colorLabel for use in SVG IDs
export const sanitizeId = (str) => {
    // Handle null, undefined, or non-string values
    if (str == null) return '';
    // Convert to string if it isn't already
    const stringValue = typeof str === 'string' ? str : String(str);
    return stringValue.replace(/[^a-zA-Z0-9_-]/g, '_');
};

// Get pattern URL for a genotype based on its position in the data
export const getPatternForGenotype = (option, topConvergenceData) => {
    const patternTypes = ['solid', 'stripes', 'dots', 'cross'];
    
    // Handle different input types
    let colorLabel;
    if (typeof option === 'string') {
        colorLabel = option;
    } else if (option && typeof option === 'object' && option.colorLabel) {
        colorLabel = option.colorLabel;
    } else {
        console.warn('Invalid option passed to getPatternForGenotype:', option);
        return `url(#pattern-solid-default)`;
    }
    
    const genotypeIndex = topConvergenceData.findIndex(item => item.colorLabel === colorLabel);
    
    const patternIndex = genotypeIndex !== -1 ? genotypeIndex % patternTypes.length : 0;
    const patternType = patternTypes[patternIndex];
    const safeLabel = sanitizeId(colorLabel);
    
    console.log(`Genotype: ${colorLabel}, Index: ${genotypeIndex}, Pattern: ${patternType}`);
    
    return `url(#pattern-${patternType}-${safeLabel})`;
};

// Legacy function - keeping for backwards compatibility
const GenotypePatternRect = (genName, topXGenotype) => {
    console.log("GenotypePatternRect called with:", genName, topXGenotype);
    const patternTypes = ['solid', 'stripes', 'dots', 'cross'];
    
    // Get the index of the genotype in topXGenotype array
    const genotypeIndex = topXGenotype.findIndex(item => 
        (typeof item === 'string' ? item : item.colorLabel) === genName
    );
    
    const patternIndex = genotypeIndex !== -1 ? genotypeIndex % patternTypes.length : 0;
    const patternType = patternTypes[patternIndex];
    const safeLabel = sanitizeId(genName);
    
    console.log(`Genotype: ${genName}, Index: ${genotypeIndex}, Pattern: ${patternType}, url(#pattern-${patternType}-${safeLabel})`);
    
    return `url(#pattern-${patternType}-${safeLabel})`;
};

export default GenotypePatternRect;