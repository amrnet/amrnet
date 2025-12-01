const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function processData(inputDir, outputDir) {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Get list of files in the input directory
    const files = fs.readdirSync(inputDir);

    files.forEach(file => {
        const inputFilePath = path.join(inputDir, file);
        const outputFilePath = path.join(outputDir, file);

        // Example processing: Copy the file
        // In a real scenario, this would involve more complex data processing
        console.log(`Processing file: ${file}`);
        fs.copyFileSync(inputFilePath, outputFilePath);
        console.log(`Processed and saved to: ${outputFilePath}`);
    });
}

// Example usage:
// const inputDirectory = './input_data';
// const outputDirectory = './processed_data';
// processData(inputDirectory, outputDirectory);

module.exports = processData;
