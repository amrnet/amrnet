.. _label-internationalization:

Internationalization (i18n)
============================

.. container:: justify-text

    AMRnet supports multiple languages to make antimicrobial resistance surveillance
    data accessible to users worldwide. This guide covers the internationalization
    implementation, supported languages, and how to contribute translations.

Supported Languages
-------------------

.. container:: justify-text

    AMRnet currently supports four languages with comprehensive translations:

    - **🇺🇸 English (US)** - Default language (en)
    - **🇫🇷 French (France)** - Professional French translations (fr)
    - **🇧🇷 Portuguese (Brazil)** - Brazilian Portuguese with local conventions (pt)
    - **🇪🇸 Spanish** - International Spanish translations (es)

Language Implementation
-----------------------

.. container:: justify-text

    AMRnet uses `react-i18next <https://react.i18next.com/>`_ for comprehensive
    internationalization support:

Technical Architecture
~~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Core Dependencies:**

    .. code-block:: json

        {
          "react-i18next": "^15.6.1",
          "i18next": "^25.3.2",
          "i18next-browser-languagedetector": "^8.2.0",
          "i18next-http-backend": "^3.0.2"
        }

    **Configuration (client/src/i18n.js):**

    .. code-block:: javascript

        import i18n from 'i18next';
        import { initReactI18next } from 'react-i18next';
        import LanguageDetector from 'i18next-browser-languagedetector';

        // Import translations
        import enTranslations from './locales/en.json';
        import frTranslations from './locales/fr.json';
        import ptTranslations from './locales/pt.json';
        import esTranslations from './locales/es.json';

        i18n
          .use(LanguageDetector)
          .use(initReactI18next)
          .init({
            resources: {
              en: { translation: enTranslations },
              fr: { translation: frTranslations },
              pt: { translation: ptTranslations },
              es: { translation: esTranslations }
            },
            lng: 'en', // default language
            fallbackLng: 'en',
            interpolation: {
              escapeValue: false
            },
            detection: {
              order: ['localStorage', 'navigator', 'htmlTag'],
              caches: ['localStorage']
            }
          });

        export default i18n;

Translation Structure
~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    Translation files are organized hierarchically for maintainability:

    .. code-block:: json

        {
          "dashboard": {
            "title": "AMR Surveillance Dashboard",
            "loading": "Loading data...",
            "error": "Error loading data"
          },
          "navigation": {
            "organisms": "Organisms",
            "about": "About",
            "contact": "Contact",
            "help": "Help"
          },
          "organisms": {
            "styphi": "S. Typhi",
            "kpneumo": "K. pneumoniae",
            "ecoli": "E. coli",
            "ngono": "N. gonorrhoeae"
          },
          "filters": {
            "country": "Country",
            "year": "Year",
            "genotype": "Genotype",
            "resistance": "Resistance"
          }
        }

Language Switcher Component
~~~~~~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Visual Language Selector:**

    .. code-block:: javascript

        import React from 'react';
        import { useTranslation } from 'react-i18next';
        import { Select, MenuItem, FormControl } from '@mui/material';
        import { FlagIcons } from './FlagIcons';

        const LanguageSwitcher = () => {
          const { i18n } = useTranslation();

          const languages = [
            { code: 'en', name: 'English', flag: 'US' },
            { code: 'fr', name: 'Français', flag: 'FR' },
            { code: 'pt', name: 'Português', flag: 'BR' },
            { code: 'es', name: 'Español', flag: 'ES' }
          ];

          const handleLanguageChange = (event) => {
            i18n.changeLanguage(event.target.value);
          };

          return (
            <FormControl size="small">
              <Select
                value={i18n.language}
                onChange={handleLanguageChange}
                displayEmpty
                renderValue={(selected) => {
                  const lang = languages.find(l => l.code === selected);
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FlagIcons country={lang?.flag} size={20} />
                      {lang?.code.toUpperCase()}
                    </div>
                  );
                }}
              >
                {languages.map((language) => (
                  <MenuItem key={language.code} value={language.code}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FlagIcons country={language.flag} size={16} />
                      {language.name}
                    </div>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        };

Usage in Components
~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Basic Translation Usage:**

    .. code-block:: javascript

        import React from 'react';
        import { useTranslation } from 'react-i18next';

        const DashboardHeader = () => {
          const { t } = useTranslation();

          return (
            <header>
              <h1>{t('dashboard.title')}</h1>
              <nav>
                <a href="/organisms">{t('navigation.organisms')}</a>
                <a href="/about">{t('navigation.about')}</a>
              </nav>
            </header>
          );
        };

    **Parameterized Translations:**

    .. code-block:: javascript

        // Translation with parameters
        const WelcomeMessage = ({ userName, organismCount }) => {
          const { t } = useTranslation();

          return (
            <div>
              <h2>{t('welcome.greeting', { name: userName })}</h2>
              <p>{t('welcome.organism_count', { count: organismCount })}</p>
            </div>
          );
        };

        // Translation file
        {
          "welcome": {
            "greeting": "Welcome, {{name}}!",
            "organism_count": "You have access to {{count}} organisms",
            "organism_count_plural": "You have access to {{count}} organisms"
          }
        }

Translation Quality
-------------------

Cultural Adaptation
~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    Each language implementation considers cultural and regional preferences:

    **French Translations:**
    - Formal "vous" form throughout the interface
    - Proper French medical and scientific terminology
    - Standard French punctuation and spacing rules
    - Accent marks and special characters properly implemented

    **Portuguese (Brazil) Translations:**
    - Brazilian Portuguese conventions and expressions
    - Local terminology preferences for medical concepts
    - Culturally appropriate formal/informal language balance
    - Brazilian number and date formatting

    **Spanish Translations:**
    - International Spanish terminology (not region-specific)
    - Professional tone appropriate for scientific content
    - Standard Spanish medical and technical vocabulary
    - Universal Spanish conventions for global accessibility

Technical Considerations
~~~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Text Expansion/Contraction:**
    - UI components accommodate text length variations (±30%)
    - Responsive design ensures proper layout in all languages
    - Button and menu sizing adapts to translated content
    - Tooltip and help text properly positioned

    **Special Characters and Encoding:**
    - UTF-8 encoding support for all special characters
    - Proper font selection for accented characters
    - Right-to-left language support ready (for future languages)
    - Input validation handles international characters

Contributing Translations
-------------------------

Translation Workflow
~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **For Developers:**

    1. **Add New Translation Keys:**

    .. code-block:: bash

        # Update base English file
        # client/src/locales/en.json
        {
          "new_feature": {
            "title": "New Feature Title",
            "description": "Feature description text"
          }
        }

    2. **Update Component Usage:**

    .. code-block:: javascript

        const NewFeature = () => {
          const { t } = useTranslation();

          return (
            <div>
              <h3>{t('new_feature.title')}</h3>
              <p>{t('new_feature.description')}</p>
            </div>
          );
        };

    3. **Update All Language Files:**

    .. code-block:: bash

        # Update fr.json, pt.json, es.json with translations
        # Or use automated translation workflow

Translation Guidelines
~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **For Translators:**

    1. **Context Understanding:**
       - Review the AMRnet dashboard to understand context
       - Consider the scientific and medical nature of content
       - Maintain professional tone appropriate for healthcare professionals

    2. **Terminology Consistency:**
       - Use standard medical/scientific terminology
       - Maintain consistency with existing translations
       - Prefer internationally recognized terms when available

    3. **Technical Constraints:**
       - Keep button text concise (max 20 characters recommended)
       - Consider text expansion in menu items
       - Test UI layout with your translations

    **Translation Template:**

    .. code-block:: json

        {
          "// Instructions": "Translate the values, keep the keys unchanged",
          "// Context": "This is for medical professionals and researchers",
          "// Tone": "Professional, scientific, accessible",

          "dashboard": {
            "title": "[Your translation here]",
            "loading": "[Your translation here]"
          }
        }

Automated Translation
~~~~~~~~~~~~~~~~~~~~

.. container::ifyGitHub Workflow:**

    .. code-block:: yaml

        # .github/workflows/translate_app.yml
        name: Auto-translate Application

        on:
          push:
            paths:
              - 'client/locales/en.json'

        jobs:
          translate:
            runs-on: ubuntu-latest
            steps:
              - uses: actions/checkout@v4
              - name: Auto-translate updates
                run: |
                  # Run translation script
                  npm run translate:auto
              - name: Create PR with translations
                uses: peter-evans/create-pull-request@v5

Accessibility and Internationalization
---------------------------------------

.. container:: justify-text

    Ensuring accessibility across all supported languages:

Screen Reader Support
~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **ARIA Labels and Descriptions:**

    .. code-block:: javascript

        const AccessibleChart = () => {
          const { t } = useTranslation();

          return (
            <div
              role="img"
              aria-label={t('charts.resistance_trend.aria_label')}
              aria-describedby="chart-description"
            >
              <Chart data={data} />
              <div id="chart-description" className="sr-only">
                {t('charts.resistance_trend.description')}
              </div>
            </div>
          );
        };

    **Translation File for Accessibility:**

    .. code-block:: json

        {
          "charts": {
            "resistance_trend": {
              "aria_label": "Resistance trend chart showing AMR patterns over time",
              "description": "This chart displays the percentage of resistant isolates by year, with separate lines for each resistance mechanism"
            }
          }
        }

Keyboard Navigation
~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Translated Keyboard Shortcuts:**

    .. code-block:: javascript

        const KeyboardShortcuts = () => {
          const { t } = useTranslation();

          return (
            <div>
              <kbd>Ctrl</kbd> + <kbd>F</kbd>: {t('shortcuts.search')}
              <br />
              <kbd>Esc</kbd>: {t('shortcuts.close_modal')}
            </div>
          );
        };

Performance Considerations
--------------------------

.. container:: justify-text

    Optimizing i18n performance for production:

Lazy Loading
~~~~~~~~~~~~

.. container:: justify-text

    **Dynamic Language Loading:**

    .. code-block:: javascript

        // Lazy load translations to reduce initial bundle size
        const loadLanguage = async (language) => {
          const translations = await import(`./locales/${language}.json`);
          i18n.addResourceBundle(language, 'translation', translations.default);
          return i18n.changeLanguage(language);
        };

Bundle Optimization
~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Webpack Configuration:**

    .. code-block:: javascript

        // webpack.config.js
        module.exports = {
          optimization: {
            splitChunks: {
              chunks: 'all',
              cacheGroups: {
                i18n: {
                  test: /[\\/]locales[\\/]/,
                  name: 'i18n',
                  chunks: 'all',
                },
              },
            },
          },
        };

Testing Internationalization
----------------------------

.. container:: justify-text

    Ensuring translation quality and functionality:

Automated Testing
~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Translation Key Validation:**

    .. code-block:: javascript

        // __tests__/i18n.test.js
        import { render, screen } from '@testing-library/react';
        import { I18nextProvider } from 'react-i18next';
        import i18n from '../src/i18n';

        describe('Internationalization', () => {
          it('should render all languages without missing keys', () => {
            const languages = ['en', 'fr', 'pt', 'es'];

            languages.forEach(lang => {
              i18n.changeLanguage(lang);
              render(
                <I18nextProvider i18n={i18n}>
                  <DashboardHeader />
                </I18nextProvider>
              );

              // Check that text is not showing translation keys
              expect(screen.queryByText(/dashboard\./)).not.toBeInTheDocument();
            });
          });
        });

Manual Testing
~~~~~~~~~~~~~~

.. container:: justify-text

    **Translation Review Checklist:**

    1. **Visual Review:**
       - Text fits properly in UI components
       - No text overflow or truncation
       - Proper alignment and spacing

    2. **Functional Testing:**
       - Language switching works correctly
       - Persistent language selection
       - All interface elements translated

    3. **Content Review:**
       - Medical terminology accuracy
       - Cultural appropriateness
       - Professional tone consistency

Future Enhancements
-------------------

.. container:: justify-text

    Planned improvements for internationalization:

Additional Languages
~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Potential Language Additions:**
    - German (Deutsch) for European users
    - Arabic (العربية) for MENA region
    - Chinese Simplified (简体中文) for Asian users
    - Russian (Русский) for Eastern European users

Advanced Features
~~~~~~~~~~~~~~~~

.. container:: justify-text

    **Planned Features:**
    - Right-to-left (RTL) language support
    - Number and date formatting per locale
    - Currency and unit localization
    - Regional data presentation preferences

Community Contributions
~~~~~~~~~~~~~~~~~~~~~~

.. container:: justify-text

    **How to Contribute:**
    - Join our `Discussions <https://github.com/amrnet/amrnet/discussions>`_
    - Submit translation improvements via GitHub Issues
    - Participate in translation review process
    - Help test internationalization features

**Contact for Translation Help:**
Email: amrnetdashboard@gmail.com with subject "Translation Contribution"
