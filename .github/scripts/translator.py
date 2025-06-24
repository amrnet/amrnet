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
# The API key is passed here. If using an older 'openai' library, it might be openai.api_key = OPENAI_API_KEY
client = openai.OpenAI(api_key=OPENAI_API_KEY)

SOURCE_LANG_CODE = "en"
SOURCE_LANG_NAME = "English"
TARGET_LANGUAGES = {
    "fr": "French",
    "es": "Spanish",
    "pt": "Portuguese",
    "de": "German",
    "it": "Italian",
    "ja": "Japanese",
    "zh": "Chinese (Simplified)" # Or "zh-CN" for mainland China
}
LOCALES_DIR = Path("locales") # Adjust if your path is different (e.g., Path("src/locales"))
SOURCE_FILE_PATH = LOCALES_DIR / f"{SOURCE_LANG_CODE}.json"
OPENAI_MODEL = "gpt-3.5-turbo" # Or "gpt-4" for potentially better quality but higher cost

def translate_text_openai(text, target_lang_name, source_lang_name="English"):
    """Translates text using OpenAI API."""
    if not text or not text.strip(): # Also check for empty strings after stripping whitespace
        return ""
    try:
        # Construct the prompt for the LLM
        # Emphasize preserving placeholders and HTML tags
        prompt = (
            f"You are a professional translator for web application UI. "
            f"Translate the following {source_lang_name} text into {target_lang_name}. "
            f"Crucially, preserve any placeholders (e.g., {{variable_name}}) exactly as they are. "
            f"Also, maintain any HTML tags (e.g., <strong>, <br/>) and their attributes. "
            f"Only provide the translated text, without any additional comments or formatting.\n\n"
            f"Text to translate:\n\"\"\"\n{text}\n\"\"\""
        )

        # Call the OpenAI Chat Completions API
        completion = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": f"You are a helpful translation assistant specializing in translating web application UI text from {source_lang_name} to {target_lang_name}. Maintain all placeholders and HTML."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3, # Lower temperature for more deterministic translations
            # Estimate tokens needed. It's often safer to be generous or let the API manage.
            # Max tokens can be an issue if the translation is much longer than source.
            max_tokens=len(text.split()) * 2 + 100 # Adjusted for potential expansion + buffer
        )
        translated_content = completion.choices[0].message.content.strip()

        # Robustly remove potential surrounding quotes if the model adds them
        if (translated_content.startswith('"') and translated_content.endswith('"')) or \
           (translated_content.startswith("'") and translated_content.endswith("'")):
            # Only remove if the string is actually quoted and not just contains quotes
            if len(translated_content) > 1 and translated_content[0] == translated_content[-1]:
                translated_content = translated_content[1:-1]

        return translated_content

    except openai.APIError as e:
        print(f"OpenAI API Error for '{text}' to {target_lang_name}: {e}")
        return f"[API_ERROR] {text}"
    except Exception as e:
        print(f"General error translating '{text}' to {target_lang_name}: {e}")
        return f"[TRANSLATION_ERROR] {text}" # So it's obvious in the UI

def translate_json_recursively(source_obj, target_lang_name, source_lang_name):
    """
    Recursively translates string values within a nested JSON object.
    """
    if isinstance(source_obj, dict):
        translated_obj = {}
        for key, value in source_obj.items():
            translated_obj[key] = translate_json_recursively(value, target_lang_name, source_lang_name)
        return translated_obj
    elif isinstance(source_obj, list):
        translated_obj = []
        for item in source_obj:
            translated_obj.append(translate_json_recursively(item, target_lang_name, source_lang_name))
        return translated_obj
    elif isinstance(source_obj, str):
        # Only translate strings that are not empty after stripping whitespace
        if source_obj.strip():
            print(f"Translating: \"{source_obj[:70]}{'...' if len(source_obj) > 70 else ''}\"")
            translated_text = translate_text_openai(source_obj, target_lang_name, source_lang_name)
            time.sleep(0.5) # Basic rate limiting to be kind to the API
            return translated_text
        else:
            return "" # Return empty string for empty input strings
    else:
        return source_obj # Return non-string, non-list, non-dict values as-is

def main():
    print(f"Starting translation process. Source file: {SOURCE_FILE_PATH}")

    if not SOURCE_FILE_PATH.exists():
        print(f"Error: Source language file not found at {SOURCE_FILE_PATH}.")
        print("Please ensure 'locales/en.json' exists in your project root or adjust LOCALES_DIR.")
        exit(1)

    try:
        with open(SOURCE_FILE_PATH, "r", encoding="utf-8") as f:
            source_data = json.load(f)
        print("Source 'en.json' loaded successfully.")
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON from {SOURCE_FILE_PATH}: {e}")
        exit(1)
    except Exception as e:
        print(f"Error reading source file {SOURCE_FILE_PATH}: {e}")
        exit(1)

    LOCALES_DIR.mkdir(parents=True, exist_ok=True) # Ensure the 'locales' directory exists

    for lang_code, lang_name in TARGET_LANGUAGES.items():
        print(f"\n--- Translating to {lang_name} ({lang_code}) ---")
        target_file_path = LOCALES_DIR / f"{lang_code}.json"
        
        # Perform recursive translation of the entire source_data structure
        translated_data = translate_json_recursively(source_data, lang_name, SOURCE_LANG_NAME)

        try:
            with open(target_file_path, "w", encoding="utf-8") as f:
                json.dump(translated_data, f, ensure_ascii=False, indent=2)
            print(f"Successfully wrote translations to {target_file_path}")
        except Exception as e:
            print(f"Error writing translations to {target_file_path}: {e}")
            # Do not exit here, continue to next language if one file write fails

    print("\nAll translation files processed.")
    # Consider adding logic here to check if any translations resulted in errors
    # or if all languages were successfully written before exiting.

if __name__ == "__main__":
    main()
