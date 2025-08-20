# Translation Workflow for AMRnet

This directory contains the automated translation system for the AMRnet web application.

## Overview

The translation workflow automatically translates English locale files to multiple target languages using OpenAI's API when changes are detected in the source English files.

## Files

- **`translate_app.yml`** - GitHub Actions workflow that triggers translation
- **`scripts/translator_improved.py`** - Python script that performs the actual translation
- **`scripts/translator.py`** - Original translator script (legacy)

## How It Works

1. **Trigger**: Workflow runs when:
   - Changes are made to `client/locales/en.json` or `client/src/locales/en.json`
   - Manual trigger via GitHub Actions tab
   - Push to `devrev-final`, `main`, or `staging` branches

2. **Process**:
   - Finds English source file in project structure
   - Uses OpenAI GPT-3.5-turbo to translate text
   - Preserves placeholders like `{variable}` and HTML tags
   - Merges with existing translations (keeps manual edits)
   - Writes to both original location and root `locales/` directory

3. **Output**: Creates a Pull Request with:
   - Updated translation files
   - Detailed description of changes
   - Automatic assignment to triggering user

## Supported Languages

Currently configured for:
- French (`fr`)
- Spanish (`es`)
- Portuguese (`pt`)

Additional languages can be added in the `TARGET_LANGUAGES` dictionary in the translator script.

## Setup Requirements

### GitHub Secrets
Set the following secret in your GitHub repository settings:

- `OPENAI_API_KEY` - Your OpenAI API key with access to the GPT-3.5-turbo model

### Permissions
The workflow requires:
- `contents: write` - To commit translated files
- `pull-requests: write` - To create pull requests

## File Structure

The translator automatically detects English source files in these locations:
```
locales/en.json                 # Root level
client/locales/en.json          # Client directory
client/src/locales/en.json      # Client source directory
src/locales/en.json             # Source directory
```

Translated files are created in the same directory as the source file.

## Testing

Run the test script to verify setup:
```bash
./test-translation-setup.sh
```

This checks:
- ✅ Required files exist
- ✅ JSON syntax is valid
- ✅ Translation keys are present
- ✅ Git branch configuration
- ✅ Environment setup

## Manual Usage

To run translations locally:
```bash
# Set your API key
export OPENAI_API_KEY="your-api-key-here"

# Run the translator
python .github/scripts/translator_improved.py
```

## Troubleshooting

### Common Issues

1. **"Source file not found"**
   - Ensure `en.json` exists in one of the supported locations
   - Check file permissions

2. **"OpenAI API error"**
   - Verify `OPENAI_API_KEY` is set correctly
   - Check API key has sufficient credits
   - Verify model access (gpt-3.5-turbo)

3. **"Permission denied" in GitHub Actions**
   - Check repository permissions
   - Verify workflow permissions configuration

4. **"No changes detected"**
   - Ensure changes are in monitored paths
   - Check branch triggers match current branch

### Logs
Check workflow logs in GitHub Actions tab for detailed error information.

## Customization

### Adding Languages
Edit `TARGET_LANGUAGES` in `translator_improved.py`:
```python
TARGET_LANGUAGES = {
    "fr": "French",
    "es": "Spanish",
    "pt": "Portuguese",
    "de": "German",        # Add new language
    "it": "Italian",       # Add new language
}
```

### Changing AI Model
Update `OPENAI_MODEL` in the translator script:
```python
OPENAI_MODEL = "gpt-4"  # For higher quality (more expensive)
```

### Modifying Trigger Conditions
Edit the workflow `on` section to change when translations run:
```yaml
on:
  push:
    branches: [your-branch]
    paths: ['your/path/to/en.json']
```

## Rate Limiting

The translator includes rate limiting (0.5s between requests) to respect OpenAI API limits. For large translation files, consider:
- Increasing delay between requests
- Using batch processing
- Implementing retry logic

## Cost Considerations

Translation costs depend on:
- Number of text strings
- Length of content
- Model used (GPT-3.5-turbo vs GPT-4)
- Frequency of updates

Monitor your OpenAI usage dashboard to track costs.
