# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Jobs Board  │  │  Analytics   │  │   Custom     │      │
│  │              │  │  Dashboard   │  │  Analytics   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 React + TypeScript                   │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐             │   │
│  │  │ Filters │  │ Charts  │  │  State  │             │   │
│  │  └─────────┘  └─────────┘  └─────────┘             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ fetch()
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │   Cloudflare R2      │    │   Static JSON        │      │
│  │   (Primary Source)   │◄──►│   (Fallback)         │      │
│  └──────────────────────┘    └──────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Directory Structure

```
web/src/
├── components/
│   ├── charts/           # SVG chart components
│   │   ├── BarChart.tsx
│   │   ├── DonutChart.tsx
│   │   └── SparklineChart.tsx
│   ├── FilterBar.tsx     # Search and filter controls
│   ├── JobCard.tsx       # Individual job display
│   ├── SkillHighlights.tsx
│   ├── SummaryMetrics.tsx
│   └── CountryMultiSelect.tsx
├── pages/
│   ├── HomePage.tsx      # Jobs board
│   ├── AnalyticsPage.tsx # Dashboard
│   └── CustomAnalyticsPage.tsx
├── services/
│   └── jobsService.ts    # Data fetching and normalization
├── utils/
│   ├── analytics.ts      # Analytics calculations
│   ├── jobFilters.ts     # Filter logic
│   └── skills.ts         # Skills parsing
├── types/
│   ├── job.ts           # Job type definitions
│   └── metadata.ts      # Metadata types
└── hooks/
    └── useTheme.tsx     # Theme management
```

## Data Flow

### 1. Data Loading

```
App.tsx
  │
  ├─► fetchJobs()
  │   │
  │   ├─► Fetch from VITE_JOBS_DATA_URL
  │   │   ├─► Success: Return data
  │   │   └─► Failure: Try fallback
  │   │
  │   └─► Fetch from /jobs.json (fallback)
  │
  └─► normaliseJobs()
      └─► Map raw data to Job interface
```

### 2. Filtering

```
User Input
  │
  ▼
FilterBar
  │
  ├─► Search terms ────────┐
  ├─► Location selection ──┤
  ├─► Date posted ─────────┤
  └─► Countries ───────────┤
                           ▼
                    applyFilters()
                           │
                           ▼
                    Filtered Jobs
                           │
                           ▼
                    JobCard components
```

### 3. Analytics

```
Jobs Data
  │
  ▼
Analytics Utils
  │
  ├─► buildPostingTrends() ──┐
  ├─► buildRemoteSplit() ────┤
  ├─► buildSalaryBenchmarks()┤
  ├─► buildCompanyActivity()─┤
  └─► buildSkillFrequency() ─┘
                             │
                             ▼
                       Charts & Tables
```

## Key Components

### JobCard

Displays individual job information:
- Title and company
- Location and remote status
- Skills (tech, soft, domain)
- Salary range (if available)
- Apply button

### FilterBar

Controls for filtering job list:
- Multi-select search (keywords, companies, skills)
- Location dropdown
- Date posted filter
- Country multi-select
- Reset button

### Analytics Dashboard

Visualizations:
- **Hiring Velocity**: Sparkline + bar chart
- **Remote Adoption**: Donut chart
- **Salary Benchmarks**: Table by currency
- **Industry Momentum**: Bar chart
- **Company Activity**: Bar chart
- **Location Coverage**: Table with remote stats
- **Skills Demand**: Tag cloud

### Custom Analytics

User-configurable widgets:
- Choose grouping dimension (company, country, skills, etc.)
- Choose visualization type (table, bar, donut)
- Dynamic aggregation

## State Management

### Local State (useState)

- Jobs data
- Filter state
- Loading state
- Error state
- Widget configurations (Custom Analytics)

### Derived State (useMemo)

- Filtered jobs
- Analytics aggregations
- Options lists
- Metrics calculations

### No Global State Library

The application uses React's built-in state management:
- Props drilling for component communication
- useState for local state
- useMemo for expensive calculations
- No Redux, Context, or Zustand needed

## Performance Optimizations

### 1. Memoization

```typescript
// Expensive calculations cached
const filteredJobs = useMemo(() => applyFilters(jobs, filters), [jobs, filters])
const analytics = useMemo(() => buildAnalytics(jobs), [jobs])
```

### 2. Lazy Loading

```typescript
// Components loaded on demand
const CustomAnalyticsPage = lazy(() => import('./pages/CustomAnalyticsPage'))
```

### 3. Virtualization (Future)

For large job lists:
```typescript
// react-window for rendering large lists
<FixedSizeList height={500} itemCount={jobs.length} ... />
```

### 4. Data Fetching

- Single initial fetch
- No polling (manual refresh or scheduled rebuild)
- Fallback to local data

## Security Considerations

### Client-Side

- No sensitive data in localStorage
- XSS prevention via React's escaping
- CORS handling for external data

### Data

- No authentication required (public data)
- HTTPS only for data sources
- Input validation on data normalization

## Testing Strategy

### Unit Tests

```
src/__tests__/
├── jobFilters.test.ts    # Filter logic
├── analytics.test.ts     # Analytics utils
├── jobsService.test.ts   # Data service
└── App.test.tsx          # Component tests
```

### Test Coverage

- ✅ Filter combinations
- ✅ Data normalization
- ✅ Error handling
- ✅ Component rendering
- ✅ User interactions

### Integration Tests

- End-to-end user flows
- Data fetching and display
- Filter application
- Navigation between pages

## Build System

### Vite Configuration

```typescript
// vite.config.ts
export default {
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      // Code splitting
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
}
```

### Build Process

1. TypeScript compilation
2. React transformation
3. CSS processing (PostCSS + Tailwind)
4. Asset optimization
5. Bundle splitting
6. Output to `dist/`

## Deployment Targets

### GitHub Pages

- Static site hosting
- Integrated with GitHub Actions
- Automatic deployments

### Cloudflare Pages

- Edge network distribution
- Automatic HTTPS
- Branch previews

### Self-Hosted

- Any static file server
- Docker container
- CDN (CloudFront, etc.)

## Future Enhancements

### Potential Features

1. **Real-time Updates**
   - WebSocket connection
   - Server-sent events
   - Polling fallback

2. **User Accounts**
   - Save favorite jobs
   - Custom alerts
   - Application tracking

3. **Advanced Analytics**
   - Trend forecasting
   - Salary predictions
   - Skills gap analysis

4. **Mobile App**
   - React Native
   - PWA features
   - Push notifications

5. **Machine Learning**
   - Job recommendations
   - Skills matching
   - Market predictions

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Build Tool | Vite 7 |
| Styling | Bootstrap 5 + Tailwind CSS |
| Routing | React Router 6 |
| Charts | Custom SVG |
| Testing | Vitest + React Testing Library |
| Linting | ESLint |
| CI/CD | GitHub Actions |

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - See [LICENSE](../LICENSE)
