import os
import json
from pathlib import Path
import openai
import time

# --- Configuration ---
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("Error: OPENAI_API_KEY environment variable not found. Please set it.")
    # Exit with a non-zero code to indicate failure in CI
    exit(1)

# Initialize OpenAI client (using the newer client library)
client = openai.OpenAI(api_key=OPENAI_API_KEY)

SOURCE_LANG_CODE = "en"
SOURCE_LANG_NAME = "English"
TARGET_LANGUAGES = {
    "fr": "French",
    "es": "Spanish",
    "pt": "Portuguese",
    # "de": "German",
    # "it": "Italian",
    # "ja": "Japanese",
    # "zh": "Chinese (Simplified)"
}

# Support multiple possible locations for locale files
POSSIBLE_LOCALES_DIRS = [
    Path("locales"),
    Path("client/locales"),
    Path("client/src/locales"),
    Path("src/locales")
]

OPENAI_MODEL = "gpt-3.5-turbo"

def find_source_file():
    """Find the source en.json file in possible locations."""
    for locales_dir in POSSIBLE_LOCALES_DIRS:
        source_path = locales_dir / f"{SOURCE_LANG_CODE}.json"
        if source_path.exists():
            print(f"Found source file at: {source_path}")
            return source_path, locales_dir
    return None, None

def translate_text_openai(text, target_lang_name, source_lang_name="English"):
    """Translates text using OpenAI API."""
    if not text or not text.strip():
        return ""
    try:
        prompt = (
            f"You are a professional translator for web application UI. "
            f"Translate the following {source_lang_name} text into {target_lang_name}. "
            f"Crucially, preserve any placeholders (e.g., {{variable_name}}) exactly as they are. "
            f"Also, maintain any HTML tags (e.g., <strong>, <br/>) and their attributes. "
            f"Only provide the translated text, without any additional comments or formatting.\n\n"
            f"Text to translate:\n\"\"\"\n{text}\n\"\"\""
        )

        completion = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a professional translator."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.1
        )

        translated_text = completion.choices[0].message.content
        print(f"  Translated: '{text[:50]}...' -> '{translated_text[:50]}...'")

        # Rate limiting to respect OpenAI API limits
        time.sleep(0.5)

        return translated_text

    except Exception as e:
        print(f"  Error translating '{text[:50]}...': {e}")
        return text  # Return original text if translation fails

def translate_json_recursively(source_obj, target_lang_name, source_lang_name):
    """Recursively translates JSON objects, arrays, and strings."""
    if isinstance(source_obj, dict):
        translated_dict = {}
        for key, value in source_obj.items():
            translated_dict[key] = translate_json_recursively(value, target_lang_name, source_lang_name)
        return translated_dict
    elif isinstance(source_obj, list):
        return [translate_json_recursively(item, target_lang_name, source_lang_name) for item in source_obj]
    elif isinstance(source_obj, str):
        if source_obj.strip():
            return translate_text_openai(source_obj, target_lang_name, source_lang_name)
        else:
            return source_obj
    else:
        return source_obj

def main():
    print("Starting translation process...")

    # Find the source file
    source_file_path, source_locales_dir = find_source_file()

    if not source_file_path or not source_locales_dir:
        print("Error: Source language file 'en.json' not found in any of these locations:")
        for dir_path in POSSIBLE_LOCALES_DIRS:
            print(f"  - {dir_path / f'{SOURCE_LANG_CODE}.json'}")
        exit(1)

    try:
        with open(source_file_path, "r", encoding="utf-8") as f:
            source_data = json.load(f)
        print(f"Source '{source_file_path}' loaded successfully.")
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON from {source_file_path}: {e}")
        exit(1)
    except Exception as e:
        print(f"Error reading source file {source_file_path}: {e}")
        exit(1)

    # Create output directory (use the same directory as source)
    output_dir = source_locales_dir
    output_dir.mkdir(parents=True, exist_ok=True)

    # Also create/update root locales directory for compatibility
    root_locales_dir = Path("locales")
    root_locales_dir.mkdir(parents=True, exist_ok=True)

    for lang_code, lang_name in TARGET_LANGUAGES.items():
        print(f"\n--- Translating to {lang_name} ({lang_code}) ---")

        # Check if target file already exists and load it
        target_file_path = output_dir / f"{lang_code}.json"
        root_target_file_path = root_locales_dir / f"{lang_code}.json"

        existing_data = {}
        if target_file_path.exists():
            try:
                with open(target_file_path, "r", encoding="utf-8") as f:
                    existing_data = json.load(f)
                print(f"Loaded existing translations from {target_file_path}")
            except Exception as e:
                print(f"Could not load existing translations from {target_file_path}: {e}")

        # Perform translation
        translated_data = translate_json_recursively(source_data, lang_name, SOURCE_LANG_NAME)

        # Merge with existing data (prioritize new translations)
        if isinstance(existing_data, dict) and isinstance(translated_data, dict):
            merged_data = {**existing_data, **translated_data}
        else:
            merged_data = translated_data

        try:
            # Write to the original location
            with open(target_file_path, "w", encoding="utf-8") as f:
                json.dump(merged_data, f, ensure_ascii=False, indent=2)
            print(f"Successfully wrote translations to {target_file_path}")

            # Also write to root locales directory
            with open(root_target_file_path, "w", encoding="utf-8") as f:
                json.dump(merged_data, f, ensure_ascii=False, indent=2)
            print(f"Successfully wrote translations to {root_target_file_path}")

        except Exception as e:
            print(f"Error writing translations: {e}")

    print("\nAll translation files processed.")

if __name__ == "__main__":
    main()
