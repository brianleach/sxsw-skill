# SXSW 2026 Schedule Scraper

Scrapes the SXSW 2026 schedule from [schedule.sxsw.com](https://schedule.sxsw.com/2026) using their internal search API and public event detail endpoints.

## How It Works

1. Fetches a CSRF token from the schedule site (required for search)
2. POSTs to the search endpoint to get all events and films in one request
3. Fetches full details for each event via the public `/api/web/2026/events/{id}` endpoint
4. Normalizes the data and builds a search index

## Running the Scraper

```bash
cd scraper
chmod +x scrape.sh
./scrape.sh
```

Or directly:

```bash
node scraper/scrape.ts
```

No dependencies beyond Node.js 18+ (uses built-in `fetch`).

## Output Files

| File | Description |
|------|-------------|
| `output/sxsw-2026-schedule.json` | Complete schedule with all event details |
| `output/sxsw-2026-index.json` | Search index with lookups by date, track, venue, format, speaker, and keywords |

Both files include a `scraped_at` timestamp so consumers know how fresh the data is.

## Schedule JSON Structure

```json
{
  "scraped_at": "2026-02-25T...",
  "event_count": 3400,
  "date_range": { "start": "2026-03-12", "end": "2026-03-18" },
  "events": [
    {
      "id": "PP1162947",
      "title": "Event Name",
      "description": "...",
      "date": "2026-03-14",
      "start_time": "2026-03-14T15:30:00Z",
      "end_time": "2026-03-14T16:30:00Z",
      "venue": "Austin Convention Center",
      "track": "AI & Machine Learning",
      "tags": ["AI", "Technology"],
      "format": "Panel",
      "event_type": "Session",
      "speakers": [{ "name": "...", "title": "...", "company": "..." }],
      "url": "https://schedule.sxsw.com/2026/events/PP1162947"
    }
  ]
}
```

## Rate Limiting

The scraper fetches event details in batches of 10 with 150ms delays between batches. A full scrape of ~3000+ events takes about 5-10 minutes.

## Data Sources

| Endpoint | Method | Auth Required |
|----------|--------|---------------|
| `schedule.sxsw.com/{year}` | GET | No (for CSRF token) |
| `schedule.sxsw.com/{year}/search` | POST | CSRF token + cookies |
| `schedule.sxsw.com/api/web/{year}/events/{id}` | GET | No |
