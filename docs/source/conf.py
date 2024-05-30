# Configuration file for the Sphinx documentation builder.

# -- Project information

project = ' AMRnet'
copyright = '2024, AMRnet'
author = 'Louise Cerdeira and Vandana Sharma'

release = '0.2'
version = '1.0.0'

# -- General configuration

extensions = [
    'sphinx_rtd_theme',
    'sphinx.ext.duration',
    'sphinx.ext.doctest',
    'sphinx.ext.autosectionlabel',
    'sphinx.ext.extlinks',
    'sphinx.ext.autodoc',
    'sphinx.ext.autosummary',
    'sphinx.ext.intersphinx',
    'sphinx.ext.intersphinx',
]

intersphinx_mapping = {
    'python': ('https://docs.python.org/3/', None),
    'sphinx': ('https://www.sphinx-doc.org/en/master/', None),
    "pip": ("https://pip.pypa.io/en/stable/", None),
    "nbsphinx": ("https://nbsphinx.readthedocs.io/en/latest/", None),
    "myst-nb": ("https://myst-nb.readthedocs.io/en/stable/", None),
    "ipywidgets": ("https://ipywidgets.readthedocs.io/en/stable/", None),
    "jupytext": ("https://jupytext.readthedocs.io/en/stable/", None),
    "ipyleaflet": ("https://ipyleaflet.readthedocs.io/en/latest/", None),
    "poliastro": ("https://docs.poliastro.space/en/stable/", None),
    "myst-parser": ("https://myst-parser.readthedocs.io/en/stable/", None),
    "writethedocs": ("https://www.writethedocs.org/", None),
    "jupyterbook": ("https://jupyterbook.org/en/stable/", None),
    "executablebook": ("https://executablebooks.org/en/latest/", None),
    "rst-to-myst": ("https://rst-to-myst.readthedocs.io/en/stable/", None),
    "rtd": ("https://docs.readthedocs.io/en/stable/", None),
    "rtd-dev": ("https://dev.readthedocs.io/en/latest/", None),
    "rtd-blog": ("https://blog.readthedocs.com/", None),
    "jupyter": ("https://docs.jupyter.org/en/latest/", None),
}
intersphinx_disabled_domains = ['std']

templates_path = ['_templates']

# -- Options for HTML output

html_logo = 'amrnet-logo.png'

# -- Logo Option

html_theme = 'sphinx_rtd_theme'

# -- Html Favicon Option

html_favicon = 'favicon.ico'

# -- Options for EPUB output
epub_show_urls = 'footnote'

html_theme_options = {
    'analytics_id': 'G-XXXXXXXXXX',  #  Provided by Google in your dashboard
    'analytics_anonymize_ip': False,
    'logo_only': False,
    'display_version': True,
    'prev_next_buttons_location': 'bottom',
    'style_external_links': False,
    'vcs_pageview_mode': '',
    'style_nav_header_background': 'blue',
    # Toc options
    'collapse_navigation': True,
    'sticky_navigation': True,
    'navigation_depth': 4,
    'includehidden': True,
    'titles_only': False
}
