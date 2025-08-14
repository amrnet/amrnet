# Contributing to AMRnet

Thank you for your interest in contributing to AMRnet! 🎉 We welcome
contributions from researchers, developers, and public health professionals
worldwide.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch
4. **Make** your changes
5. **Test** your changes
6. **Submit** a pull request

## 🛠️ Development Setup

### Prerequisites

- **Node.js** 18+ with npm
- **Python** 3.8+ (for data processing)
- **MongoDB** 6.0+ (local or Atlas)
- **Git** for version control

### Initial Setup

```bash
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
```

## 📋 Types of Contributions

### 🐛 Bug Reports

Help us improve by reporting bugs using our
[bug report template](.github/ISSUE_TEMPLATE/bug_report.md).

**Before reporting:**

- Search existing issues to avoid duplicates
- Test in latest version
- Gather environment details
- Include steps to reproduce

### ✨ Feature Requests

Suggest new features using our
[feature request template](.github/ISSUE_TEMPLATE/feature_request.md).

**Good feature requests include:**

- Clear problem statement
- Proposed solution
- Use cases and user stories
- Implementation considerations

### 🦠 Adding New Organisms

We especially welcome contributions for new organism support! See our
comprehensive [Developer Guide](DEVELOPER_GUIDE.md) for detailed instructions
on:

- Data schema requirements
- API endpoint implementation
- Frontend component creation
- Testing procedures

### 📖 Documentation

Help improve our documentation:

- Fix typos and clarify content
- Add examples and tutorials
- Translate content
- Update API documentation

### 🎨 UI/UX Improvements

Enhance the user experience:

- Design improvements
- Accessibility enhancements
- Mobile responsiveness
- Performance optimizations

## 🔀 Git Workflow

### Branch Naming Convention

```bash
# Feature branches
feature/organism-ecoli-support
feature/resistance-prediction-ml
feature/mobile-responsive-charts

# Bug fix branches
fix/data-export-csv-encoding
fix/map-zoom-performance
hotfix/critical-api-security

# Documentation branches
docs/api-endpoint-examples
docs/user-guide-updates
```

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(organisms): add Shigella species support

- Implement Shigella data model
- Add API endpoints for Shigella data
- Create dashboard visualizations
- Include resistance pattern analysis

Closes #123
```

```bash
fix(api): resolve TSV export encoding issues

- Fix UTF-8 encoding for international characters
- Update content-type headers
- Add error handling for malformed data

Fixes #456
```

## 🧪 Testing Guidelines

### Running Tests

```bash
# Frontend tests
cd client
npm test

# Backend tests
npm run test:backend

# End-to-end tests
npm run test:e2e

# All tests
npm run test:all
```

### Test Requirements

**For bug fixes:**

- Add regression tests
- Ensure existing tests pass
- Test edge cases

**For new features:**

- Unit tests for core logic
- Integration tests for API endpoints
- Component tests for UI elements
- E2E tests for user workflows

**For organism additions:**

- Data validation tests
- API endpoint tests
- Dashboard component tests
- Performance benchmarks

### Test Coverage

Maintain test coverage above 80%:

```bash
# Check coverage
npm run test:coverage

# Generate coverage report
npm run coverage:report
```

## 📏 Code Style Guidelines

### JavaScript/TypeScript

We use ESLint and Prettier for consistent code formatting:

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

**Key conventions:**

- Use TypeScript for type safety
- Prefer functional components with hooks
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Follow the existing component structure

### Python

For data processing scripts:

```bash
# Lint Python code
pip install black isort flake8
black . && isort . && flake8 .
```

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Ensure accessibility (WCAG 2.1 AA)
- Test in multiple browsers

## 🔍 Code Review Process

### Before Submitting

- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] No console errors or warnings
- [ ] Feature works in multiple browsers
- [ ] Accessibility requirements met

### Pull Request Template

```markdown
## 📝 Description

Brief description of changes

## 🔄 Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## 🧪 Testing

- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] All tests pass

## 📸 Screenshots

(If applicable)

## 🔗 Related Issues

Closes #issue_number
```

### Review Criteria

Reviewers will check:

- Code quality and style compliance
- Test coverage and passing tests
- Documentation completeness
- Security considerations
- Performance impact
- Accessibility compliance

## 🌍 Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please read
our [Code of Conduct](CODE_OF_CONDUCT.md).

### Communication

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Email**: amrnetdashboard@gmail.com for sensitive matters

### Being Respectful

- Use inclusive language
- Be constructive in feedback
- Help newcomers learn
- Acknowledge others' contributions
- Assume positive intent

## 🎯 Contribution Areas

### High Priority

- **New Organism Support**: Expand pathogen coverage
- **Performance Optimization**: Improve dashboard speed
- **Mobile Experience**: Enhance mobile usability
- **Accessibility**: WCAG 2.1 AA compliance
- **API Documentation**: Comprehensive examples

### Medium Priority

- **Internationalization**: Additional language support
- **Data Visualization**: New chart types
- **Export Features**: Enhanced data export options
- **User Experience**: UI/UX improvements

### Good First Issues

Look for issues labeled `good first issue`:

- Documentation improvements
- Small bug fixes
- UI polish
- Test additions

## 📚 Resources

### Learning Resources

- **React**: [React Documentation](https://react.dev/)
- **Node.js**: [Node.js Guide](https://nodejs.org/en/docs/)
- **MongoDB**: [MongoDB Manual](https://docs.mongodb.com/)
- **AMR Data**:
  [WHO AMR Resources](https://www.who.int/antimicrobial-resistance)

### AMRnet Specific

- **Developer Guide**: [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- **API Documentation**: [docs/api.rst](docs/api.rst)
- **User Guide**: [amrnet.readthedocs.io](https://amrnet.readthedocs.io)

### Development Tools

- **VS Code Extensions**: ESLint, Prettier, MongoDB
- **Browser Tools**: React DevTools, Redux DevTools
- **API Testing**: Postman, Insomnia

## 🏆 Recognition

### Contributors

All contributors are recognized in:

- GitHub contributors list
- Project documentation
- Annual acknowledgment posts
- Conference presentations (with permission)

### Significant Contributions

Major contributors may be:

- Invited to join the core team
- Acknowledged in academic publications
- Featured in project announcements
- Invited to present at conferences

## 📞 Getting Help

### Technical Issues

1. **Search** existing issues and discussions
2. **Check** documentation and guides
3. **Ask** in GitHub Discussions
4. **Create** an issue if needed

### Questions About Contributing

- Email: amrnetdashboard@gmail.com
- GitHub: @amrnet/core-team
- Discussions:
  [GitHub Discussions](https://github.com/amrnet/amrnet/discussions)

## 🔄 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features
- **PATCH**: Bug fixes

### Release Schedule

- **Patch releases**: As needed for critical bugs
- **Minor releases**: Monthly with new features
- **Major releases**: Annually with significant changes

Thank you for contributing to AMRnet! Your work helps advance global
antimicrobial resistance surveillance and supports public health worldwide. 🌍
