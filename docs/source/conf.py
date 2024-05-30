# Configuration file for the Sphinx documentation builder.

# -- Project information

project = 'AMRnet'
copyright = '2024, Louise Cerdeira, Vandana Sharma, Kathryn Holt'
author = 'Louise Cerdeira and Vandana Sharma'

release = '0.2'
version = '1.0.0'

# -- General configuration

templates_path = ['_templates']

# -- Options for HTML output

html_logo = 'amrnet-logo.png'

# html_static_path = ['_static']

# -- Logo Option

html_theme = 'sphinx_rtd_theme'

# -- Html Favicon Option

html_favicon = 'favicon.ico'

extensions = [
    'sphinx.ext.duration',
    'sphinx.ext.doctest',
    'sphinx.ext.autodoc',
    'sphinx.ext.autosummary',
    'sphinx.ext.intersphinx',
]

intersphinx_mapping = {
    'python': ('https://docs.python.org/3/', None),
    'sphinx': ('https://www.sphinx-doc.org/en/master/', None),
}
intersphinx_disabled_domains = ['std']
# -- Options for EPUB output
epub_show_urls = 'footnote'

html_theme_options = {
   # 'analytics_id': 'G-XXXXXXXXXX',  #  Provided by Google in your dashboard
    'analytics_anonymize_ip': False,
    'logo_only': True,
    'display_version': False,
    'prev_next_buttons_location': 'bottom',
    'style_external_links': False,
    'vcs_pageview_mode': '',
    'style_nav_header_background': 'white',
    # Toc options
    'collapse_navigation': True,
    'sticky_navigation': True,
    'includehidden': True,
    'titles_only': False
}
