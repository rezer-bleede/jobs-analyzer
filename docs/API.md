# API Documentation

## Overview

The Jobs Analyzer application consumes job data from a JSON API endpoint. This document describes the data format and API specification.

## Data Format

### Response Structure

```json
{
  "metadata": {
    "lastUpdated": "2026-02-13T10:00:00Z",
    "totalJobs": 45,
    "source": "Middle East Data Engineering Jobs",
    "version": "1.0.0",
    "dataFreshness": "live"
  },
  "jobs": [
    {
      "job_hash": "me-de-001",
      "title": "Senior Data Engineer",
      "company": "Saudi Aramco",
      "location": "Dhahran, Saudi Arabia",
      "city_inferred": "Dhahran",
      "state_inferred": "Eastern Province",
      "country_inferred": "Saudi Arabia",
      "job_type": "Full-time",
      "date_posted": "2026-02-12T08:00:00Z",
      "is_remote": false,
      "site": "LinkedIn",
      "job_url": "https://example.com/job/1",
      "min_amount": 35000,
      "max_amount": 55000,
      "currency": "SAR",
      "desired_tech_skills_inferred": "Python, Apache Spark, Hadoop, AWS, Kafka, Airflow",
      "desired_soft_skills_inferred": "Leadership, Communication, Problem Solving",
      "desired_domain_skills_inferred": "Oil & Gas, Data Pipelines, ETL",
      "job_description_inferred": "Lead data engineering initiatives...",
      "job_requirements_inferred": "7+ years experience...",
      "company_industry": "Oil & Gas"
    }
  ]
}
```

## Schema

### Metadata Object

| Field | Type | Description |
|-------|------|-------------|
| `lastUpdated` | ISO 8601 DateTime | Timestamp when data was last updated |
| `totalJobs` | integer | Total number of jobs in the dataset |
| `source` | string | Data source identifier |
| `version` | string | API version |
| `dataFreshness` | string | Indicates data freshness status |

### Job Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `job_hash` | string | Yes | Unique job identifier |
| `title` | string | Yes | Job title |
| `company` | string | Yes | Company name |
| `location` | string | Yes | Full location string |
| `city_inferred` | string | No | Inferred city name |
| `state_inferred` | string | No | Inferred state/province |
| `country_inferred` | string | No | Inferred country name |
| `job_type` | string | No | Job type (Full-time, Contract, etc.) |
| `date_posted` | ISO 8601 DateTime | No | Job posting date |
| `is_remote` | boolean/string | No | Remote work status |
| `site` | string | No | Job source (LinkedIn, etc.) |
| `job_url` | string | No | URL to job posting |
| `min_amount` | number | No | Minimum salary |
| `max_amount` | number | No | Maximum salary |
| `currency` | string | No | Salary currency code |
| `desired_tech_skills_inferred` | string | No | Comma-separated technical skills |
| `desired_soft_skills_inferred` | string | No | Comma-separated soft skills |
| `desired_domain_skills_inferred` | string | No | Comma-separated domain skills |
| `job_description_inferred` | string | No | Job description |
| `job_requirements_inferred` | string | No | Job requirements |
| `company_industry` | string | No | Company industry |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_JOBS_DATA_URL` | Primary API endpoint URL | - |
| `VITE_APP_TITLE` | Application title | "ME Data Engineering Jobs" |

## Endpoints

### GET /jobs.json

Returns the complete job dataset.

**Response:** `200 OK`
- Content-Type: `application/json`
- Body: JobsData object (see Schema above)

**Error Responses:**
- `404 Not Found`: Data file not found
- `500 Internal Server Error`: Server error

### Fallback Behavior

If the primary URL fails (CORS error, network issue, etc.), the application automatically falls back to the local `/jobs.json` file. This ensures the site remains functional even when the primary data source is unavailable.

## CORS Configuration

When hosting your own data endpoint, ensure CORS headers are configured:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
Access-Control-Allow-Headers: Content-Type
```

## Data Updates

The application supports scheduled data refreshes. The `lastUpdated` timestamp in the metadata is used to display data freshness indicators to users.

## Rate Limiting

No rate limiting is implemented in the client. Implement rate limiting on your server as needed.

## Version History

### v1.0.0 (Current)
- Initial API with metadata wrapper
- Support for salary ranges
- Skills categorization (tech, soft, domain)
- Data freshness indicators

## Examples

### cURL

```bash
curl -X GET "https://your-domain.com/jobs.json" \
  -H "Accept: application/json"
```

### JavaScript

```javascript
const response = await fetch('https://your-domain.com/jobs.json');
const data = await response.json();
console.log(`Loaded ${data.metadata.totalJobs} jobs`);
console.log(`Last updated: ${data.metadata.lastUpdated}`);
```

### Python

```python
import requests

response = requests.get('https://your-domain.com/jobs.json')
data = response.json()
print(f"Loaded {data['metadata']['totalJobs']} jobs")
```
