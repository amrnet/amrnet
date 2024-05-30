# Configuration file for the Sphinx documentation builder.
import os
from urllib.request import urlopen
from pathlib import Path

# -- Project information

project = 'AMRnet'
copyright = '2024, Louise Cerdeira, Vandana Sharma, Kathryn Holt'

release = '0.2'
version = '1.0.0'

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
    'ablog',
    'myst_nb',
    'sphinx.ext.duration',
    'sphinx.ext.doctest',
    'sphinx.ext.autodoc',
    'sphinx.ext.autosummary',
    'sphinx.ext.intersphinx',
    'sphinx.ext.viewcode',
    'sphinxcontrib.youtube',
    'sphinx_copybutton',
    'sphinx_design',
    'sphinx_examples',
    'sphinx_tabs.tabs',
    'sphinx_thebe',
    'sphinx_togglebutton',
]

numfig = True

intersphinx_mapping = {
    'python': ('https://docs.python.org/3/', None),
    'sphinx': ('https://www.sphinx-doc.org/en/master/', None),
     "pst": ("https://pydata-sphinx-theme.readthedocs.io/en/latest/", None),
}
intersphinx_disabled_domains = ['std']
# -- Options for EPUB output
epub_show_urls = 'footnote'

myst_enable_extensions = [
    "dollarmath",
    "amsmath",
    "deflist",
    # "html_admonition",
    # "html_image",
    "colon_fence",
    # "smartquotes",
    # "replacements",
    # "linkify",
    # "substitution",
]
html_title = 'AMRnet Dashboard User Guide'

html_copy_source = True

html_theme_options = {
    "path_to_docs": "docs",
    "repository_url": "https://github.com/amrnet/amrnet",
    "repository_branch": "staging",
    "launch_buttons": {
        "binderhub_url": "https://mybinder.org",
        "colab_url": "https://colab.research.google.com/",
        "deepnote_url": "https://deepnote.com/",
        "notebook_interface": "jupyterlab",
        "thebe": True,
        "jupyterhub_url": "https://datahub.berkeley.edu",  # For testing
    },
    "use_edit_page_button": True,
    "use_source_button": True,
    "use_issues_button": True,
    "use_download_button": True,
    "use_sidenotes": True,
    "show_toc_level": 2,
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
        # {
        #     "name": "PyPI",
        #     "url": "https://pypi.org/project/sphinx-book-theme/",
        #     "icon": "https://img.shields.io/pypi/dw/sphinx-book-theme",
        #     "type": "url",
        # },
    ],
    # For testing
    # "use_fullscreen_button": False,
    # "home_page_in_toc": True,
    # "extra_footer": "<a href='https://google.com'>Test</a>",  # DEPRECATED KEY
    # "show_navbar_depth": 2,
    # Testing layout areas
    # "navbar_start": ["test.html"],
    # "navbar_center": ["test.html"],
    # "navbar_end": ["test.html"],
    # "navbar_persistent": ["test.html"],
    # "footer_start": ["test.html"],
    # "footer_end": ["test.html"]
}   
    # 'analytics_id': 'G-XXXXXXXXXX',  #  Provided by Google in your dashboard
    # 'analytics_anonymize_ip': False,
    # 'logo_only': True,
    # 'display_version': False,
    # 'prev_next_buttons_location': 'bottom',
    # 'style_external_links': False,
    # 'vcs_pageview_mode': '',
    #'style_nav_header_background': 'white',
    # Toc options
    # 'use_edit_page_button': True,
    # 'use_source_button': True,
    # 'repository_branch': 'staging',
    # 'show_toc_level': 2,
    # 'home_page_in_toc': True,
    # 'use_issues_button': True,
    # 'collapse_navigation': True,
    # 'navigation_depth': 4
    # 'sticky_navigation': True,
    # 'includehidden': True,
    # 'titles_only': False

html_sidebars = {
    "html/*": [
        "navbar-logo.html",
        "database.html",
        "api.html",
        "usage.html",
        # "ablog/tagcloud.html",
        # "ablog/categories.html",
        # "ablog/archives.html",
        "sbt-sidebar-nav.html",
    ]
}

nb_execution_mode = "cache"
thebe_config = {
    "repository_url": "https://github.com/binder-examples/jupyter-stacks-datascience",
    "repository_branch": "master",
}