# Configuration for pt documentation
from conf import *

language = 'pt'
locale_dirs = ['locale/']

# Language-specific settings
if language == 'es':
    html_title = 'AMRnet - Documentación en Español'
elif language == 'fr':
    html_title = 'AMRnet - Documentation en Français'
elif language == 'pt':
    html_title = 'AMRnet - Documentação em Português'

# internationalization
language = os.environ.get('READTHEDOCS_LANGUAGE_PT', 'pt')
locale_dirs = ['locale/']
gettext_compact = False

# Override any language-specific theme options
html_theme_options.update({
    'source_repository': 'https://github.com/amrnet/amrnet',
    'source_branch': 'main',
    'source_directory': f'docs/',
})
