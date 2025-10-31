# AMRnet Documentation Translation Status

This file tracks the translation progress for AMRnet documentation.

## Supported Languages

- 🇪🇸 **Spanish (es)**: 0% complete
- 🇫🇷 **French (fr)**: 0% complete
- 🇵🇹 **Portuguese (pt)**: 0% complete

## Files to Translate

- [ ] index.rst
- [ ] tutorial.rst
- [ ] userguide.rst
- [ ] installation.rst
- [ ] feature.rst
- [ ] performance.rst
- [ ] deployment.rst
- [ ] security.rst
- [ ] internationalization.rst
- [ ] troubleshooting.rst
- [ ] api.rst
- [ ] usage.rst
- [ ] data.rst
- [ ] contributing.rst

## Translation Workflow

1. **Extract messages**: `make gettext`
2. **Update translations**: `make update-locale`
3. **Edit PO files**: Translate strings in `locale/[lang]/LC_MESSAGES/`
4. **Build translated docs**: `make build-locale`
5. **Test locally**: Check `_build/[lang]/` directories

## Translation Guidelines

- Keep technical terms consistent across languages
- Maintain the same structure and formatting
- Test all links work in translated versions
- Consider cultural context for examples

## Getting Help

- Use professional translation services for medical/scientific terms
- Coordinate with native speakers from target regions
- Review translations with domain experts
