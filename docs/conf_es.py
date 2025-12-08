# Configuration for es documentation
from conf import *


# Use RTD's default environment variable for language detection
language = os.environ.get('READTHEDOCS_LANGUAGE', 'es')
locale_dirs = ['locale/']
gettext_compact = False

# Language-specific settings
if language == 'es':
    html_title = 'AMRnet - Documentación en Español'
elif language == 'fr':
    html_title = 'AMRnet - Documentation en Français'
elif language == 'pt':
    html_title = 'AMRnet - Documentação em Português'

# Override any language-specific theme options
html_theme_options.update({
    'source_repository': 'https://github.com/amrnet/amrnet',
    'source_branch': 'main',
    'source_directory': f'docs/',
})
