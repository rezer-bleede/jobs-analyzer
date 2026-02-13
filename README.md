# Jobs Analyzer

[![Tests](https://github.com/remisharoon/jobs-analyzer/actions/workflows/deploy.yml/badge.svg)](https://github.com/remisharoon/jobs-analyzer/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Live Demo](https://img.shields.io/badge/demo-live-green.svg)](https://remisharoon.github.io/jobs-analyzer/)

A modern, responsive single-page application for exploring data engineering opportunities across the Middle East. Built with React, TypeScript, and Vite.

![Jobs Analyzer Screenshot](docs/screenshot.png)

## 🌟 Features

### Job Board
- 🔍 **Advanced Search**: Multi-select keyword search with autocomplete
- 🌍 **Country Filter**: Multi-select country filter with flags
- 📅 **Date Filtering**: Filter by posting date (24h, 3 days, 1 week, 2 weeks)
- 🏢 **Company Insights**: View hiring activity by company
- 💼 **Salary Information**: Display salary ranges when available
- 🏠 **Remote Work**: Filter and highlight remote opportunities
- 🎯 **Skills Matching**: Tech, soft, and domain skills extraction

### Analytics Dashboard
- 📊 **Hiring Velocity**: Weekly posting trends with sparklines
- 📈 **Remote Adoption**: Visual breakdown of remote vs on-site roles
- 💰 **Salary Benchmarks**: Average salaries by currency
- 🏭 **Industry Momentum**: Top hiring sectors
- 🏢 **Company Activity**: Most active employers
- 🗺️ **Location Coverage**: Geographic distribution with remote stats
- 🧠 **Skills Demand**: Most in-demand technologies

### Custom Analytics
- 🧩 **Bespoke Widgets**: Create custom charts and tables
- 🎛️ **Flexible Grouping**: Group by company, country, skills, and more
- 📊 **Multiple Visualizations**: Bar charts, donut charts, and tables
- 💾 **Persistent Layout**: Widgets persist across sessions

### Technical Features
- ⚡ **Fast Performance**: Optimized React with Vite
- 📱 **Responsive Design**: Mobile-first, works on all devices
- 🌓 **Dark Mode**: Toggle between light and dark themes
- 🔄 **Data Freshness**: Visual indicators show data age
- 🛡️ **Error Boundaries**: Graceful error handling
- ♿ **Accessibility**: WCAG 2.1 AA compliant
- 🧪 **Tested**: Comprehensive test coverage

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/remisharoon/jobs-analyzer.git
cd jobs-analyzer/web

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to view the application.

### Environment Variables

Create a `.env.local` file (optional):

```env
# Custom data source (optional)
VITE_JOBS_DATA_URL=https://your-data-source.com/jobs.json
```

If not provided, the app uses the local `jobs.json` file.

## 📦 Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### GitHub Pages (Recommended)

1. Fork this repository
2. Enable GitHub Pages in Settings → Pages → GitHub Actions
3. Push to `main` branch
4. Site will be available at `https://<username>.github.io/jobs-analyzer/`

See [Deployment Guide](docs/DEPLOYMENT.md) for detailed instructions for:
- Cloudflare Pages
- Netlify
- Vercel
- Self-hosting

## 📚 Documentation

- [API Documentation](docs/API.md) - Data format and API specification
- [Deployment Guide](docs/DEPLOYMENT.md) - Step-by-step deployment instructions
- [Architecture Overview](docs/ARCHITECTURE.md) - System design and component architecture

## 🗺️ Roadmap

### Completed ✅
- [x] Multi-select country filter
- [x] Data freshness indicators
- [x] Error boundaries
- [x] Comprehensive documentation
- [x] GitHub Actions deployment
- [x] 45+ real Middle East job listings

### In Progress 🚧
- [ ] Tailwind CSS migration
- [ ] Advanced animations
- [ ] Branding assets

### Planned 📋
- [ ] User authentication
- [ ] Job favorites
- [ ] Email alerts
- [ ] Mobile app
- [ ] ML-powered recommendations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📝 Data Source

The application uses a JSON data source that can be:

1. **Static JSON file** (`web/public/jobs.json`)
2. **Cloudflare R2 bucket**
3. **Custom API endpoint**

See [API Documentation](docs/API.md) for the data format specification.

### Sample Data Structure

```json
{
  "metadata": {
    "lastUpdated": "2026-02-13T10:00:00Z",
    "totalJobs": 45,
    "source": "Middle East Data Engineering Jobs",
    "version": "1.0.0"
  },
  "jobs": [
    {
      "job_hash": "me-de-001",
      "title": "Senior Data Engineer",
      "company": "Saudi Aramco",
      "location": "Dhahran, Saudi Arabia",
      "country_inferred": "Saudi Arabia",
      "job_type": "Full-time",
      "date_posted": "2026-02-12T08:00:00Z",
      "is_remote": false,
      "desired_tech_skills_inferred": "Python, Apache Spark, Hadoop, AWS"
    }
  ]
}
```

## 🛠️ Tech Stack

- **Framework**: React 19
- **Language**: TypeScript 5.9
- **Build Tool**: Vite 7
- **Styling**: Bootstrap 5 + Tailwind CSS
- **Routing**: React Router 6
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library
- **CI/CD**: GitHub Actions
- **Hosting**: GitHub Pages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Job data sourced from various Middle East job boards
- Icons by [Lucide](https://lucide.dev/)
- Built with [Vite](https://vitejs.dev/)

## 📞 Support

If you encounter any issues or have questions:

1. Check the [documentation](docs/)
2. Search [existing issues](https://github.com/remisharoon/jobs-analyzer/issues)
3. Open a [new issue](https://github.com/remisharoon/jobs-analyzer/issues/new)

---

Built with ❤️ for the Middle East data engineering community
