# :guitar: SXSW 2026 Schedule — OpenClaw Skill

> **Your personal guide to SXSW 2026.** Search 3,400+ events, find speakers, browse music showcases, film screenings, and keynotes for the March 12-18 conference and festivals in Austin, TX.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js 18+](https://img.shields.io/badge/node-18%2B-green.svg)](https://nodejs.org)
[![ClawdHub](https://img.shields.io/badge/ClawdHub-Skill-green.svg)](https://clawhub.ai)

---

## Why This Skill?

SXSW is massive — 3,400+ events across 195 venues over 7 days. Finding what you actually want to see is a project in itself. This skill gives your OpenClaw agent instant access to the full schedule so you can:

- **Ask in plain English** — "What AI panels are on Friday?" instead of scrolling through pages
- **Get recommendations** — Keynotes, featured sessions, and fireside chats highlighted automatically
- **Search by anything** — Date, track, venue, format, speaker, or free-text keywords
- **Plan your day** — "What's happening today?" groups events by time slot with venues

**How it works:** The skill ships with a pre-scraped copy of the complete SXSW 2026 schedule from [schedule.sxsw.com](https://schedule.sxsw.com/2026). Your agent reads the local data for instant answers and can supplement with web search for last-minute changes and breaking news. No API keys, no accounts, no setup beyond install.

---

## Quick Start (2 Minutes)

**1. Install the skill**

```bash
clawhub install brianleach/sxsw-skill
```

**2. That's it.**

No API keys. No accounts. No configuration. The complete SXSW 2026 schedule is bundled with the skill.

> **What just happened?** The skill installed a pre-scraped dataset of 3,400+ SXSW events with a search index. Your agent can now answer any SXSW schedule question instantly from local data.

---

## What You Can Do

### :calendar: Browse by Date
- "What's happening at SXSW on Saturday March 14?"
- "Show me Thursday's schedule"
- "What's on tomorrow?"

### :mag: Search Events
- "Find AI panels at SXSW"
- "Any sessions about climate change?"
- "What film screenings are there?"
- "Music showcases on 6th Street"

### :studio_microphone: Find Speakers
- "When does Mark Rober speak?"
- "Find all sessions with keynote speakers"
- "Who's speaking about machine learning?"

### :star2: Get Recommendations
- "What are the must-see SXSW events?"
- "Show me the keynotes"
- "What are the featured sessions this year?"

---

## Usage (via OpenClaw Chat)

Just ask naturally — your agent knows when to use this skill:

> **"What's happening at SXSW on Friday?"**
> Shows all events on March 13, grouped by time slot with venues.

> **"Any good AI sessions?"**
> Searches events by the AI track and related tags, sorted by date.

> **"When does Mark Rober speak?"**
> Finds all sessions featuring Mark Rober with times and venues.

> **"What are the must-see keynotes?"**
> Lists all keynotes, featured sessions, and fireside chats.

> **"What music showcases are at Flamingo Cantina?"**
> Filters events by venue name.

> **"I'm interested in climate and sustainability topics"**
> Full-text searches across titles, descriptions, tags, and tracks.

The skill checks local data first for instant results, then supplements with web search if something isn't found or you ask about last-minute changes.

---

## Command Cheat Sheet

| Command | Description |
|---------|-------------|
| `sxsw.ts events --date 2026-03-14` | Events on a specific date |
| `sxsw.ts events --track "AI"` | Filter by track/category |
| `sxsw.ts events --venue "JW Marriott"` | Filter by venue |
| `sxsw.ts events --format "keynote"` | Filter by format type |
| `sxsw.ts events --search "machine learning"` | Full-text search |
| `sxsw.ts events --search "climate" --verbose` | Search with descriptions |
| `sxsw.ts speakers --search "Amy Webb"` | Find speaker sessions |
| `sxsw.ts venues` | List all 195 venues |
| `sxsw.ts tracks` | List all tracks/categories |
| `sxsw.ts today` | Today's events |
| `sxsw.ts tomorrow` | Tomorrow's events |
| `sxsw.ts recommend` | Keynotes & featured sessions |
| `sxsw.ts info` | Dataset info & key dates |

Filters can be combined. Add `--verbose` for descriptions and speaker details. Add `--limit N` to cap results.

---

## Key Dates Reference

| Date | Day | What's Happening |
|------|-----|-----------------|
| **March 12** | Thursday | Opening day — keynotes begin, conference sessions, film premieres |
| **March 13** | Friday | Full programming across all tracks, music showcases begin |
| **March 14** | Saturday | Peak day — 500+ events, all tracks active |
| **March 15** | Sunday | Conference continues, music showcases ramp up |
| **March 16** | Monday | Music festival in full swing, final conference tracks |
| **March 17** | Tuesday | Final conference sessions, music continues |
| **March 18** | Wednesday | Closing day — wrap-up sessions, final showcases |

---

## Installation for ClawdHub

```bash
clawhub install brianleach/sxsw-skill
```

**Manual install:**
```bash
git clone https://github.com/brianleach/sxsw-skill.git
cd sxsw-skill/skill
# Done — no dependencies to install, no API keys needed
```

---

## Requirements

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 18+ | Uses built-in `fetch` and ES modules |
| npm | any | No runtime dependencies |
| API keys | none | Zero-config — schedule data is bundled |

---

## Data Sources

| Source | Type | Events | Updated |
|--------|------|--------|---------|
| [schedule.sxsw.com](https://schedule.sxsw.com/2026) | Scraped JSON | 3,400+ | Pre-bundled |
| Web search | Live supplement | As needed | Real-time |

The bundled dataset includes the complete SXSW 2026 schedule scraped from the official site. Web search supplements the local data for schedule changes, cancellations, and breaking news.

**Want to refresh the data?** Run the included scraper:
```bash
cd scraper
./scrape.sh
cp output/*.json ../skill/data/
```

---

## Troubleshooting

### No events found for my search

**Solution:** Try broader terms. The search matches keywords in titles, descriptions, and tags. Try `--track` for category-level filtering or `--search` for free-text.

### Events showing wrong times

**Solution:** All times are displayed in Central Time (Austin). The raw data stores UTC timestamps — the CLI converts automatically.

### Data seems outdated

**Solution:** Check the data freshness timestamp in any command output. To refresh, run the scraper:
```bash
cd scraper && ./scrape.sh && cp output/*.json ../skill/data/
```

### Film screenings missing dates

**Solution:** Some film screening times are announced closer to the festival. Re-scrape as the event approaches for the latest schedule.

---

## Learn More

- [SXSW 2026 Official Schedule](https://schedule.sxsw.com/2026)
- [SXSW Attend Guide](https://www.sxsw.com/attend/)
- [OpenClaw Documentation](https://docs.openclaw.ai)
- [ClawdHub Skills](https://clawhub.ai)

---

## About This Skill

| | |
|---|---|
| **Author** | Brian Leach |
| **Email** | bleach@gmail.com |
| **LinkedIn** | [linkedin.com/in/brianleach](https://linkedin.com/in/brian-leach-dev) |
| **License** | MIT |
| **Source** | [github.com/brianleach/sxsw-skill](https://github.com/brianleach/sxsw-skill) |

**Built with data from [schedule.sxsw.com](https://schedule.sxsw.com/2026) — your AI agent's guide to SXSW 2026.**
