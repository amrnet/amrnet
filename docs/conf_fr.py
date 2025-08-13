# Configuration for fr documentation
from conf import *

language = 'fr'
locale_dirs = ['locale/']

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
    'source_branch': 'devrev-final',
    'source_directory': f'docs/',
})
