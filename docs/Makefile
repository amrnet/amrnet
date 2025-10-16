# Minimal makefile for Sphinx documentation
#

# You can set these variables from the command line, and also
# from the environment for the first two.
SPHINXOPTS    ?=
SPHINXBUILD   ?= sphinx-build
SOURCEDIR     = .
BUILDDIR      = _build

# Languages for translation
LANGUAGES     = es fr pt

# Put it first so that "make" without argument is like "make help".
help:
	@$(SPHINXBUILD) -M help "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)

# Internationalization targets
gettext:
	@$(SPHINXBUILD) -b gettext "$(SOURCEDIR)" "$(BUILDDIR)/gettext" $(SPHINXOPTS)
	@echo
	@echo "Build finished. The message catalogs are in $(BUILDDIR)/gettext."

update-pot: gettext
	@echo "Updating POT files..."

init-locale:
	@for lang in $(LANGUAGES); do \
		mkdir -p locale/$$lang/LC_MESSAGES; \
		sphinx-intl update -p $(BUILDDIR)/gettext -l $$lang; \
	done

update-locale: gettext
	@echo "Updating locale files..."
	@sphinx-intl update -p $(BUILDDIR)/gettext

build-locale:
	@for lang in $(LANGUAGES); do \
		echo "Building $$lang documentation..."; \
		$(SPHINXBUILD) -b html -D language=$$lang $(SOURCEDIR) $(BUILDDIR)/$$lang $(SPHINXOPTS); \
	done

.PHONY: help Makefile gettext update-pot init-locale update-locale build-locale

# Catch-all target: route all unknown targets to Sphinx using the new
# "make mode" option.  $(O) is meant as a shortcut for $(SPHINXOPTS).
%: Makefile
	@$(SPHINXBUILD) -M $@ "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)
