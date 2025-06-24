```python
import os
import json
from pathlib import Path
import openai
import time

# --- Configuration ---
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("Error: OPENAI_API_KEY not found.")
    exit(1)

openai.api_key = OPENAI_API_KEY

SOURCE_LANG_CODE = "en"
SOURCE_LANG_NAME = "English"
TARGET_LANGUAGES = {
    "fr": "French",
    "es": "Spanish",
    "pt": "Portuguese",
    "de": "German",
    "it": "Italian",
    "ja": "Japanese",
    "zh": "Chinese (Simplified)" # Or "zh-CN"
}
LOCALES_DIR = Path("locales") # Adjust if your path is different
SOURCE_FILE_PATH = LOCALES_DIR / f"{SOURCE_LANG_CODE}.json"
OPENAI_MODEL = "gpt-3.5-turbo" # Or "gpt-4" for potentially better quality but higher cost

def translate_text_openai(text, target_lang_name, source_lang_name="English"):
    """Translates text using OpenAI API."""
    if not text:
        return ""
    try:
        prompt = (
            f"You are a professional translator. Translate the following {source_lang_name} text "
            f"for a web application UI into {target_lang_name}. "
            f"Preserve the original meaning, tone, and any placeholders like {{variable}} or HTML tags if present. "
            f"Only provide the translated text, nothing else.\n\n"
            f"Text to translate:\n\"\"\"\n{text}\n\"\"\""
        )

        completion = openai.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": f"You are a helpful translation assistant specializing in translating web application UI text from {source_lang_name} to {target_lang_name}."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3, # Lower temperature for more deterministic translations
            max_tokens=len(text.split()) * 3 + 50 # Estimate tokens needed
        )
        translated_text = completion.choices[0].message.content.strip()

        # Sometimes GPT might add quotes around the translation
        if translated_text.startswith('"') and translated_text.endswith('"'):
            translated_text = translated_text[1:-1]
        if translated_text.startswith("'") and translated_text.endswith("'"):
            translated_text = translated_text[1:-1]

        return translated_text

    except Exception as e:
        print(f"Error translating '{text}' to {target_lang_name}: {e}")
        # Fallback to original text or handle error as needed
        return f"[TRANSLATION_ERROR] {text}" # So it's obvious in the UI

def main():
    if not SOURCE_FILE_PATH.exists():
        print(f"Source language file not found: {SOURCE_FILE_PATH}")
        return

    with open(SOURCE_FILE_PATH, "r", encoding="utf-8") as f:
        source_data = json.load(f)

    LOCALES_DIR.mkdir(parents=True, exist_ok=True)

    for lang_code, lang_name in TARGET_LANGUAGES.items():
        print(f"\n--- Translating to {lang_name} ({lang_code}) ---")
        target_file_path = LOCALES_DIR / f"{lang_code}.json"
        translated_data = {}

        # Load existing translations to preserve them and only translate new/changed keys (optional)
        # For simplicity here, we'll re-translate everything, but you might want smarter updates.
        # if target_file_path.exists():
        #     with open(target_file_path, "r", encoding="utf-8") as f:
        #         try:
        #             translated_data = json.load(f)
        #         except json.JSONDecodeError:
        #             print(f"Warning: Could not parse existing translation file {target_file_path}")

        for key, value in source_data.items():
            if not isinstance(value, str): # Skip non-string values if any
                translated_data[key] = value
                continue

            print(f"Translating '{key}': \"{value[:50]}...\"")
            translated_text = translate_text_openai(value, lang_name, SOURCE_LANG_NAME)
            translated_data[key] = translated_text
            time.sleep(0.5) # Basic rate limiting to be kind to the API

        with open(target_file_path, "w", encoding="utf-8") as f:
            json.dump(translated_data, f, ensure_ascii=False, indent=2)
        print(f"Successfully wrote translations to {target_file_path}")

    print("\nAll translations processed.")

if __name__ == "__main__":
    main()
```