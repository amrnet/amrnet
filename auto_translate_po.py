import polib
from google.cloud import translate_v2 as translate
import os

# Set your Google Cloud API key as an environment variable
# export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/credentials.json"

LANGS = ['pt', 'es', 'fr']
LOCALE_PATH = 'docs/locale'

def auto_translate_po(po_path, target_lang):
    po = polib.pofile(po_path)
    translate_client = translate.Client()
    changed = False
    for entry in po.untranslated_entries():
        if entry.msgid.strip() and not entry.msgstr.strip():
            result = translate_client.translate(entry.msgid, target_language=target_lang)
            entry.msgstr = result['translatedText']
            changed = True
    if changed:
        po.save(po_path)
        print(f"Translated: {po_path}")

for lang in LANGS:
    lc_messages = os.path.join(LOCALE_PATH, lang, 'LC_MESSAGES')
    for fname in os.listdir(lc_messages):
        if fname.endswith('.po'):
            auto_translate_po(os.path.join(lc_messages, fname), lang)
