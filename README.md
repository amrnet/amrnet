# AMRnet - Antimicrobial Resistance Dashboard

<div align="center">
  <img src="assets/img/logo-prod.png" alt="AMRnet Logo" width="200" height="120">

  [![GitHub version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/amrnet/amrnet)
  [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
  [![Last Commit](https://img.shields.io/github/last-commit/amrnet/amrnet)](https://github.com/amrnet/amrnet/commits/main)
  [![Issues](https://img.shields.io/github/issues/amrnet/amrnet)](https://github.com/amrnet/amrnet/issues)
  [![Stars](https://img.shields.io/github/stars/amrnet/amrnet)](https://github.com/amrnet/amrnet/stargazers)
  [![DOI](https://zenodo.org/badge/615052960.svg)](https://zenodo.org/doi/10.5281/zenodo.10810218)

  **Making genome-derived AMR surveillance data accessible worldwide**

  [🌐 Live Dashboard](https://www.amrnet.org) | [📖 Documentation](https://amrnet.readthedocs.io) | [🚀 Quick Start](#quick-start) | [💬 Community](https://github.com/amrnet/amrnet/discussions)
</div>

## 🎯 Overview

AMRnet is a comprehensive web-based platform that transforms complex antimicrobial resistance (AMR) genomic surveillance data into accessible, interactive visualizations. Our mission is to democratize access to high-quality AMR data for researchers, public health professionals, and policymakers worldwide.

### ✨ Key Features

- **🗺️ Interactive Global Maps** - Visualize resistance patterns across countries and regions
- **📊 Trend Analysis** - Track resistance changes over time with dynamic graphs
- **🔍 Advanced Filtering** - Explore data by organism, drug, genotype, and geography
- **🌍 Multi-Language Support** - Available in English, French, Portuguese, and Spanish
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **📁 Data Export** - Download filtered datasets for further analysis
- **🔌 API Access** - Programmatic access to all data with comprehensive documentation

### 🦠 Supported Organisms

| Organism | Scientific Name | Key Features |
|----------|----------------|--------------|
| **S. Typhi** | *Salmonella* Typhi | Typhoid fever surveillance |
| **K. pneumoniae** | *Klebsiella pneumoniae* | Healthcare-associated infections |
| **N. gonorrhoeae** | *Neisseria gonorrhoeae* | Gonorrhea resistance monitoring |
| **E. coli** | *Escherichia coli* | ESBL and carbapenemase tracking |
| **Shigella** | *Shigella* spp. | Dysentery and MDR monitoring |
| **Salmonella** | *Salmonella enterica* | Non-typhoidal Salmonella surveillance |

## 🚀 Quick Start

### For Users

1. **🌐 Visit the Dashboard**: Go to [amrnet.org](https://www.amrnet.org)
2. **🦠 Select an Organism**: Choose from our supported organisms
3. **🔍 Apply Filters**: Customize your view by geography, time, and resistance
4. **📊 Explore Visualizations**: Interact with maps and graphs
5. **📥 Export Data**: Download results for your analysis

### For Developers

```bash
# Clone the repository
git clone https://github.com/amrnet/amrnet.git
cd amrnet

# Install dependencies
npm install
cd client && npm install && cd ..

# Set up environment
cp .env.example .env
# Edit .env with your MongoDB connection string

# Start development servers
npm run start:dev
```

Visit `http://localhost:3000` to see the application running locally.

**📚 Need more details?** Check our [Installation Guide](https://amrnet.readthedocs.io/en/latest/installation.html) and [Developer Guide](DEVELOPER_GUIDE.md).
````

#### 4. Inside the project folder run this command to install the server dependencies

````sh
### 4. Install Server Dependencies
In the project root folder (`amrnet`), run:
```bash
npm install

## 🏗️ Architecture

AMRnet is built with modern web technologies for performance and scalability:

```
Frontend (React 18)
├── 🎨 Material-UI Components
├── 📊 Recharts Visualizations
├── 🗺️ React Simple Maps
├── 🔄 Redux State Management
└── 🌍 i18next Internationalization

Backend (Node.js/Express)
├── 🛡️ Express.js REST API
├── 📊 MongoDB Database
├── 🔍 Advanced Aggregation Pipelines
├── 📁 CSV Data Processing
└── 🚀 Performance Optimization

Infrastructure
├── 🐳 Docker Containers
├── ☁️ MongoDB Atlas Cloud Database
├── 🌐 CDN for Global Distribution
└── 📝 Comprehensive Logging
```

## 📖 Documentation

| Resource | Description | Link |
|----------|-------------|------|
| **User Guide** | Complete dashboard usage instructions | [📖 Read the Docs](https://amrnet.readthedocs.io/en/latest/userguide.html) |
| **API Documentation** | RESTful API reference and examples | [🔌 API Docs](https://amrnet.readthedocs.io/en/latest/api.html) |
| **Developer Guide** | Adding new organisms and contributing | [🛠️ Dev Guide](DEVELOPER_GUIDE.md) |
| **Data Dictionary** | Data structure and field definitions | [📊 Data Docs](https://amrnet.readthedocs.io/en/latest/data.html) |

## 🛠️ Installation

### Prerequisites

- **Node.js** 18+ with npm
- **MongoDB** 6.0+ (local or Atlas cloud)
- **Git** for version control

### Development Setup

1. **Clone and Install**:
   ```bash
   git clone https://github.com/amrnet/amrnet.git
   cd amrnet
   npm install
   ```

2. **Client Dependencies**:
   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Environment Configuration**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/amrnet
   NODE_ENV=development
   PORT=3000
   ```

4. **Start Development Servers**:
   ```bash
   npm run start:dev
   ```

The application will be available at `http://localhost:3000` with hot reloading enabled.

### Production Deployment

For production deployment instructions, see our [Deployment Guide](https://amrnet.readthedocs.io/en/latest/deployment.html).

## 🔌 API Access

AMRnet provides a comprehensive RESTful API for programmatic access to all data.

### Quick Examples

```bash
# Get all S. Typhi data
curl "https://api.amrnet.org/styphi"

# Filter by country and year
curl "https://api.amrnet.org/styphi?country=BGD&year_start=2020"

# Get summary statistics
curl "https://api.amrnet.org/styphi/summary"
```

### Python Integration

```python
import requests
import pandas as pd

# Fetch AMR data
response = requests.get('https://api.amrnet.org/styphi',
                       params={'country': 'USA', 'limit': 1000})
data = response.json()

# Convert to DataFrame
df = pd.DataFrame(data['data'])
print(f"Retrieved {len(df)} samples")
```

**📚 Full API Documentation**: [amrnet.readthedocs.io/api](https://amrnet.readthedocs.io/en/latest/api.html)

## 🤝 Contributing

We welcome contributions from the global AMR surveillance community!

### Ways to Contribute

- **🐛 Report Bugs**: [Create an issue](https://github.com/amrnet/amrnet/issues/new?template=bug_report.md)
- **💡 Suggest Features**: [Request features](https://github.com/amrnet/amrnet/issues/new?template=feature_request.md)
- **🔧 Submit Code**: [Fork and create pull requests](https://github.com/amrnet/amrnet/fork)
- **📖 Improve Documentation**: Help us make docs better
- **🦠 Add Organisms**: Follow our [Developer Guide](DEVELOPER_GUIDE.md)

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- **ESLint**: Follow our JavaScript style guide
- **Prettier**: Code formatting consistency
- **JSDoc**: Document all functions and components
- **Testing**: Include unit tests for new features

**📋 Full Contributing Guide**: [CONTRIBUTING.md](CONTRIBUTING.md)

## 📜 Citation & Licensing

### How to Cite

If you use AMRnet data or visualizations in your work, please cite:

```bibtex
@software{amrnet2024,
  title = {AMRnet: Global Antimicrobial Resistance Surveillance Dashboard},
  author = {Holt, Kathryn E. and {AMRnet Team}},
  year = {2024},
  url = {https://www.amrnet.org},
  doi = {10.5281/zenodo.10810218}
}
```

**DOI**: [10.5281/zenodo.10810218](https://zenodo.org/doi/10.5281/zenodo.10810218)

### License

AMRnet is released under the **GNU General Public License v3.0** (GPL-3.0).

- ✅ **Use** - Commercial and non-commercial use allowed
- ✅ **Modify** - Create derivative works and modifications
- ✅ **Distribute** - Share original and modified versions
- ⚠️ **Share Alike** - Derivatives must use GPL-3.0 license
- ⚠️ **Disclose Source** - Source code must be made available

See [LICENSE](LICENSE) for full details.

## 🎯 Funding & Acknowledgments

### Primary Funding

AMRnet is proudly funded by:

- **🏛️ Wellcome Trust** - Core platform development and maintenance
- **🎓 London School of Hygiene & Tropical Medicine** - Institutional support
- **🤝 Global Partnership** - International collaboration network

### Principal Investigator

**Professor Kathryn E. Holt**
*London School of Hygiene & Tropical Medicine*
*Department of Infection Biology*

### Acknowledgments

We gratefully acknowledge:

- **Global Typhoid Genomics Consortium** - Data curation and expertise
- **Pathogenwatch Team** - Bioinformatics pipeline support
- **EnteroBase Contributors** - Database infrastructure
- **Open Source Community** - Technology stack and tools
- **International Collaborators** - Data sharing and validation

## 🆘 Support & Community

### Getting Help

| Type | Resource | Response Time |
|------|----------|---------------|
| **🐛 Bugs** | [GitHub Issues](https://github.com/amrnet/amrnet/issues) | 1-3 days |
| **💡 Features** | [GitHub Discussions](https://github.com/amrnet/amrnet/discussions) | 3-7 days |
| **📧 General** | info@amrnet.org | 5-10 days |
| **📖 Documentation** | [Read the Docs](https://amrnet.readthedocs.io) | Self-service |

### Community Guidelines

We're committed to fostering an inclusive, welcoming community:

- **🤝 Be Respectful** - Treat all community members with courtesy
- **🎯 Stay On Topic** - Keep discussions relevant to AMR surveillance
- **📚 Help Others** - Share knowledge and assist newcomers
- **🔍 Search First** - Check existing issues before creating new ones
- **📝 Be Clear** - Provide detailed bug reports and feature requests

---

<div align="center">

  **AMRnet** - Powered by the global health community

  [🌐 Dashboard](https://www.amrnet.org) • [📖 Docs](https://amrnet.readthedocs.io) • [💻 GitHub](https://github.com/amrnet/amrnet) • [📧 Contact](mailto:info@amrnet.org)

  *Making AMR surveillance data accessible to everyone, everywhere*

</div>
