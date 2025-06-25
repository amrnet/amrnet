# Configuration file for the Sphinx documentation builder.
import os
from urllib.request import urlopen
from pathlib import Path

# -- Project information

project = 'AMRnet'
copyright = '2023, Louise Cerdeira, Vandana Sharma, Megan Carey, Zoe Dyson, Kathryn Holt'

release = '0.1'
version = '1.2.0'

exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']

# -- General configuration

templates_path = ['_templates']

# -- Options for HTML output

html_logo = 'amrnet-logo.png'

# html_static_path = ['_static']

# -- Logo Option

html_theme = 'sphinx_book_theme'

# -- Html Favicon Option

# html_favicon = 'favicon.ico'

extensions = [
    'sphinx.ext.duration',
    'sphinx.ext.doctest',
    'sphinx.ext.autodoc',
    'sphinx.ext.todo',
    'sphinx.ext.autosummary',
    'sphinx.ext.intersphinx',
    'sphinx.ext.viewcode',
    'sphinx.ext.intersphinx',
    'sphinx.ext.mathjax',
    'sphinx.ext.graphviz',
    'sphinx.ext.autosectionlabel',
    'sphinxcontrib.youtube',
    'sphinx_copybutton',
    'sphinx_design',
    'sphinx_examples',
    'sphinx_tabs.tabs',
    'sphinx_thebe',
    'sphinx_togglebutton'
]

autosummary_generate = True

source_suffix = ['.rst', '.md', '.txt']

numfig = True

intersphinx_mapping = {
    'python': ('https://docs.python.org/3/', None),
    'sphinx': ('https://www.sphinx-doc.org/en/master/', None),
     "pst": ("https://pydata-sphinx-theme.readthedocs.io/en/stable/", None),
}
intersphinx_disabled_domains = ['std']

# -- Options for EPUB output
epub_show_urls = 'footnote'

# myst_enable_extensions = [
#     "dollarmath",
#     "amsmath",
#     "deflist",
#     # "html_admonition",
#     # "html_image",
#     "colon_fence",
#     # "smartquotes",
#     # "replacements",
#     # "linkify",
#     # "substitution",
# ]

# html_title = 'AMRnet User Guide'

html_copy_source = True

html_theme_options = {
    "path_to_docs": "docs",
    "repository_url": "https://github.com/amrnet/amrnet/",
    "repository_branch": "https://github.com/amrnet/amrnet/tree/devrev",
    "launch_buttons": {
        # "binderhub_url": "https://mybinder.org",
        # "colab_url": "https://colab.research.google.com/",
        # "deepnote_url": "https://deepnote.com/",
        # "notebook_interface": "jupyterlab",
        # "thebe": True,
        # "jupyterhub_url": "https://datahub.berkeley.edu",  # For testing
    },
    "use_edit_page_button": False,
    "use_source_button": True,
    "use_issues_button": True,
    "use_download_button": True,
    "use_sidenotes": False,
    "show_toc_level": 5,
    "icon_links": [
        # {
        #     "name": "jupyterlab",
        #     "url": "https://colab.research.google.com",
        #     "icon": "amrnet-logo.png",
        #     "type": "local",
        # },
        {
            "name": "GitHub",
            "url": "https://github.com/amrnet/amrnet",
            "icon": "fa-brands fa-github",
        },
    ],
}

# autosectionlabel_prefix_document = True
# nb_execution_mode = "cache"
# thebe_config = {
#     "repository_url": "https://github.com/binder-examples/jupyter-stacks-datascience",
#     "repository_branch": "master",
# }