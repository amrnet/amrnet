.. _label-contributing:

Contributor Guide
=================
.. container:: justify-text

   Thank you for your interest in improving this project. This project is open-source
   under the `GPL-3.0 license <https://opensource.org/licenses/GPL-3.0>`__.
   and welcomes
   contributions in the form of bug reports, feature requests, and pull requests.

   Here is a list of important resources for contributors:

   -  `Source Code <https://github.com/amrnet>`__
   -  `Documentation <https://amrnet.readthedocs.io/>`__
   -  `Issue Tracker <https://github.com/amrnet/amrnet/issues>`__
   -  :doc:`Code of Conduct <codeofconduct>`

How to report a bug
-------------------
.. container:: justify-text

   Report bugs on the `Issue Tracker <https://github.com/amrnet/amrnet/issues>`__.

   When filing an issue, make sure to answer these questions:

   -  Which operating system and Python version are you using?
   -  Which version of this project are you using?
   -  What did you do?
   -  What did you expect to see?
   -  What did you see instead?

   The best way to get your bug fixed is to provide a test case, and/or steps to reproduce
   the issue.

How to request a feature
------------------------
.. container:: justify-text

   Features that improve ``AMRnet`` can be suggested on the
   `Issue Tracker <https://github.com/amrnet/amrnet/issues>`__.
   It's a good idea to first submit the proposal as a feature request prior to submitting a
   pull request as this allows for the best coordination of efforts by preventing the
   duplication of work, and allows for feedback on your ideas.

.. _label-contributing:

Contributor Guide
=================
.. container:: justify-text

   Thank you for your interest in contributing to AMRnet! 🎉 We welcome contributions
   from researchers, developers, and public health professionals worldwide. This project
   is open-source under the `GPL-3.0 license <https://opensource.org/licenses/GPL-3.0>`__
   and welcomes contributions in the form of bug reports, feature requests, and pull requests.

   Here is a list of important resources for contributors:

   -  `Source Code <https://github.com/amrnet/amrnet>`__
   -  `Documentation <https://amrnet.readthedocs.io/>`__
   -  `Issue Tracker <https://github.com/amrnet/amrnet/issues>`__
   -  `Discussions <https://github.com/amrnet/amrnet/discussions>`__
   -  :doc:`Code of Conduct <codeofconduct>`

Quick Start
-----------
.. container:: justify-text

   Ready to contribute? Here's how to set up AMRnet for local development:

   1. **Fork** the repository on GitHub
   2. **Clone** your fork locally
   3. **Create** a feature branch for your changes
   4. **Make** your changes and test them
   5. **Submit** a pull request

Types of Contributions
----------------------

Bug Reports
~~~~~~~~~~~
.. container:: justify-text

   Help us improve by reporting bugs using our `Issue Tracker <https://github.com/amrnet/amrnet/issues>`__.

   **Before reporting a bug:**
   - Search existing issues to avoid duplicates
   - Test with the latest version
   - Check if the issue occurs in different browsers

   **When filing a bug report, please include:**
   - Which operating system and browser you're using
   - Which version of AMRnet you're using
   - Steps to reproduce the issue
   - What you expected to happen
   - What actually happened
   - Screenshots if applicable

Feature Requests
~~~~~~~~~~~~~~~~
.. container:: justify-text

   We welcome feature suggestions that improve AMRnet's functionality for AMR surveillance.

   **Good feature requests include:**
   - Clear description of the problem being solved
   - Specific use cases from public health or research perspectives
   - Consideration of different user types (researchers, policymakers, etc.)

Documentation Improvements
~~~~~~~~~~~~~~~~~~~~~~~~~~
.. container:: justify-text

   Documentation improvements are always welcome, including:
   - Fixing typos or clarifying instructions
   - Adding examples or use cases
   - Translating content to other languages
   - Creating tutorials or guides

How to set up your development environment
------------------------------------------

Prerequisites
~~~~~~~~~~~~~
.. container:: justify-text

   Before you begin, ensure you have:

   - **Node.js** 18+ with npm
   - **Python** 3.8+ (for data processing)
   - **MongoDB** 6.0+ (local or Atlas)
   - **Git** for version control

Initial Setup
~~~~~~~~~~~~~
.. container:: justify-text

   .. code-block:: shell

      # Clone your fork
      git clone https://github.com/YOUR_USERNAME/amrnet.git
      cd amrnet

      # Install dependencies
      npm install
      cd client && npm install && cd ..

      # Set up environment
      cp .env.example .env
      # Edit .env with your configuration

      # Start development servers
      npm run start:dev

   The application will be available at ``http://localhost:3000`` with the API at ``http://localhost:8080``.

Code Quality Standards
----------------------

Linting and Formatting
~~~~~~~~~~~~~~~~~~~~~~
.. container:: justify-text

   AMRnet uses ESLint and Prettier to maintain code quality:

   .. code-block:: shell

      # Lint JavaScript/React code
      cd client && npm run lint

      # Format code with Prettier
      npm run format

      # Fix linting issues automatically
      cd client && npm run lint:fix

Testing
~~~~~~~
.. container:: justify-text

   Always include tests with your contributions:

   .. code-block:: shell

      # Run frontend tests
      cd client && npm test

      # Run tests with coverage
      cd client && npm test -- --coverage

      # Run backend tests (if available)
      npm run test:backend

Git Hooks
~~~~~~~~~
.. container:: justify-text

   Pre-commit hooks automatically run linting and formatting:
   - Configured via ``.editorconfig`` and ``.prettierrc.json``
   - Ensures consistent code style across all contributions

Development Workflow
--------------------

Branch Naming
~~~~~~~~~~~~~
.. container:: justify-text

   Use descriptive branch names:
   - ``feature/add-organism-filtering``
   - ``bugfix/map-rendering-issue``
   - ``docs/update-installation-guide``

Commit Messages
~~~~~~~~~~~~~~~
.. container:: justify-text

   Follow conventional commit format:
   - ``feat: add new organism filtering capability``
   - ``fix: resolve map rendering issue on mobile``
   - ``docs: update installation instructions``

Code Review Process
~~~~~~~~~~~~~~~~~~~
.. container:: justify-text

   All contributions go through code review:
   1. Create a pull request with clear description
   2. Automated tests must pass
   3. Code review by maintainers
   4. Address feedback and update as needed
   5. Merge once approved

Specific Contribution Areas
---------------------------

Frontend Development
~~~~~~~~~~~~~~~~~~~
.. container:: justify-text

   **Technologies:** React 18, Material-UI, Redux, Recharts

   **Key areas for contribution:**
   - New visualization components
   - Mobile responsiveness improvements
   - Accessibility enhancements
   - Performance optimizations

Backend Development
~~~~~~~~~~~~~~~~~~~
.. container:: justify-text

   **Technologies:** Node.js, Express.js, MongoDB

   **Key areas for contribution:**
   - API endpoint optimization
   - Database query improvements
   - Data validation and processing
   - Security enhancements

Data Processing
~~~~~~~~~~~~~~~
.. container:: justify-text

   **Technologies:** Python, pandas, NumPy

   **Key areas for contribution:**
   - New organism data parsers
   - Data quality validation
   - Statistical analysis functions
   - Export format support

Documentation
~~~~~~~~~~~~~
.. container:: justify-text

   **Areas needing help:**
   - User guides and tutorials
   - API documentation
   - Developer onboarding
   - Multi-language translations

How to submit changes
---------------------
.. container:: justify-text

   Open a `pull request <https://github.com/amrnet/amrnet/pulls>`__
   to submit changes to this project.

   **Your pull request should:**
   - Include a clear description of changes
   - Pass all automated tests
   - Include relevant tests for new functionality
   - Update documentation if needed
   - Follow the project's coding standards

   **Pull request template includes:**
   - Description of changes
   - Type of change (bugfix, feature, docs, etc.)
   - Testing checklist
   - Screenshots for UI changes

Community Guidelines
--------------------
.. container:: justify-text

   - Be respectful and inclusive
   - Provide constructive feedback
   - Focus on the scientific and public health mission
   - Help newcomers get started
   - Follow our :doc:`Code of Conduct <codeofconduct>`

Getting Help
------------
.. container:: justify-text

   **Need assistance?**
   - Check existing `Issues <https://github.com/amrnet/amrnet/issues>`__
   - Join our `Discussions <https://github.com/amrnet/amrnet/discussions>`__
   - Review the :doc:`Installation Guide <installation>`
   - Read the `Developer Guide <../tutorial/developer_guide.md>`__

   **For urgent issues:**
   - Security vulnerabilities: See our Security Policy
   - Critical bugs: Use the Issue Tracker with "urgent" label
