---
name: sxsw-2026
description: SXSW 2026 schedule lookup, event search, speaker info, and recommendations for the March 12-18 conference and festivals in Austin, TX. Use when the user asks about SXSW events, sessions, music showcases, film screenings, speakers, venues, or schedule planning.
homepage: "https://github.com/brianleach/sxsw-skill"
license: MIT
metadata:
  clawdbot:
    emoji: "🎸"
    tags: [sxsw, austin, conference, schedule, events, music, film, tech, speakers]
    requires:
      bins: ["node"]
      env: []
    files: ["scripts/sxsw.mjs"]
    install: []
---

# SXSW 2026 Schedule Skill

Real-time SXSW 2026 schedule lookup, event search, speaker info, and recommendations for the March 12-18 conference and festivals in Austin, TX.

## When to Use

- User asks about SXSW 2026 schedule, events, sessions, or speakers
- User asks "What's happening at SXSW today/tomorrow/on [date]"
- User wants SXSW recommendations, must-see events, or keynotes
- User asks about SXSW venue locations or event times
- User asks about music showcases, film screenings, or comedy events
- User asks about specific speakers or topics at SXSW
- User asks about any SXSW 2026 related queries
- User mentions SXSW, South by Southwest, or the Austin March conference

## Data Sources

The skill uses a **local-first** approach with a pre-scraped schedule dataset:

| Source | Type | Description |
|--------|------|-------------|
| `data/sxsw-2026-schedule.json` | Local JSON | Complete schedule with 3,400+ events |
| `data/sxsw-2026-index.json` | Local JSON | Search index (by date, track, venue, format, speaker, keyword) |
| Web search | Live | Supplemental — for schedule changes, cancellations, breaking news |

### When to Use Web Search

Supplement the local dataset with web search when:
- User asks about schedule changes, cancellations, or last-minute additions
- User asks about news, announcements, or breaking SXSW info
- The query isn't found in the local dataset
- The event date is within 48 hours (things change last minute at SXSW)

## Implementation

### Quick Start

```bash
node scripts/sxsw.mjs info           # dataset overview
node scripts/sxsw.mjs today          # today's events
node scripts/sxsw.mjs recommend      # keynotes & featured sessions
```

### Script Usage

The CLI at `scripts/sxsw.mjs` supports these commands:

```bash
# List/filter events
node scripts/sxsw.mjs events --date 2026-03-14
node scripts/sxsw.mjs events --track "AI"
node scripts/sxsw.mjs events --venue "JW Marriott"
node scripts/sxsw.mjs events --format "keynote"
node scripts/sxsw.mjs events --search "machine learning"
node scripts/sxsw.mjs events --search "climate" --date 2026-03-15 --verbose

# Speaker search
node scripts/sxsw.mjs speakers --search "Amy Webb"

# Browse
node scripts/sxsw.mjs venues
node scripts/sxsw.mjs tracks
node scripts/sxsw.mjs today
node scripts/sxsw.mjs tomorrow
node scripts/sxsw.mjs recommend
node scripts/sxsw.mjs info
```

Filters can be combined. Add `--verbose` for descriptions and speaker details. Add `--limit N` to cap results.

## Key Dates Reference

| Date | Day | Notes |
|------|-----|-------|
| 2026-03-12 | Thursday | Opening day — keynotes, featured sessions begin |
| 2026-03-13 | Friday | Full programming, film premieres begin |
| 2026-03-14 | Saturday | Peak day — all tracks active |
| 2026-03-15 | Sunday | Music showcases ramp up |
| 2026-03-16 | Monday | Music festival in full swing |
| 2026-03-17 | Tuesday | Final conference sessions, music continues |
| 2026-03-18 | Wednesday | Closing day |

## Tips for Users

- Ask about specific dates: "What's happening Thursday March 12?"
- Ask about topics: "Any AI panels this week?"
- Ask about people: "When does Mark Rober speak?"
- Ask for recommendations: "What are the must-see keynotes?"
- Ask about venues: "What's at the Convention Center on Saturday?"
- Combine filters: "Film screenings on Friday at the Paramount?"

## Response Formatting

- For "what's happening on [date]" queries: group events by time slot, show venue
- For speaker queries: show all their sessions with times and venues
- For track/topic queries: show relevant sessions sorted by date/time
- For "recommend" queries: highlight keynotes, featured sessions, and fireside chats
- Always include the direct schedule.sxsw.com event URL when referencing specific events
- When listing many events, show the most relevant first and mention total count

## Austin Local Context

Since the user is likely in Austin during SXSW:
- Convention Center is at 500 E Cesar Chavez St (renamed from Convention Center Blvd)
- JW Marriott, Hilton, Fairmont are the main hotel venues — all walkable downtown
- Music showcases cluster on 6th Street, Red River Cultural District, and Rainey Street
- CapMetro is free during SXSW (Red Line rail + buses)
- Use the capmetro-skill for transit info
- Rideshare pickup/dropoff zones shift during SXSW — check sxsw.com/attend for maps

## Error Handling

- If the data files cannot be loaded, report the error and suggest re-running the scraper
- If a search returns no results, suggest broadening the query or trying web search
- If the user asks about something not in the dataset, use web search to find the answer

## External Endpoints

| Endpoint | Data Sent | Data Received |
|----------|-----------|---------------|
| None | N/A | N/A |

This skill reads only local JSON data files. No external network requests are made by the scripts. Web search is handled by the OpenClaw agent when needed.

## Security & Privacy

- No API keys or credentials required
- No external network requests from the skill scripts
- No user data collected or transmitted
- All data is read-only from pre-scraped local JSON files
- Source data is publicly available at schedule.sxsw.com

## Trust Statement

This skill reads a pre-scraped copy of the publicly available SXSW 2026 schedule. It makes no network requests, requires no API keys, and stores no user data. The scraped data can be refreshed by running the included scraper.
