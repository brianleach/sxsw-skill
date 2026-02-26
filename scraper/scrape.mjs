#!/usr/bin/env node

/**
 * SXSW 2026 Schedule Scraper
 *
 * Scrapes the SXSW 2026 schedule from schedule.sxsw.com using their
 * internal search API and public event detail endpoints.
 *
 * Strategy:
 * 1. GET any page to obtain CSRF token + session cookies
 * 2. POST /2026/search to get all events (returns ~3000+ in one response)
 * 3. GET /api/web/2026/events/{id} for full details on each event
 *
 * External endpoints accessed:
 *   - schedule.sxsw.com (GET pages, POST search, GET event details)
 *
 * Local files written:
 *   - scraper/output/sxsw-2026-schedule.json
 *   - scraper/output/sxsw-2026-index.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, 'output');
const SCHEDULE_FILE = path.join(OUTPUT_DIR, 'sxsw-2026-schedule.json');
const INDEX_FILE = path.join(OUTPUT_DIR, 'sxsw-2026-index.json');

const BASE_URL = 'https://schedule.sxsw.com';
const YEAR = '2026';
const DELAY_MS = 150; // delay between detail requests
const BATCH_SIZE = 10; // concurrent detail fetches per batch

// ── Helpers ──────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function log(msg) {
  process.stderr.write(`[scraper] ${msg}\n`);
}

// ── Step 1: Get CSRF token and cookies ──────────────────────────────

async function getCSRFToken() {
  log('Fetching CSRF token...');
  const res = await fetch(`${BASE_URL}/${YEAR}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });
  const html = await res.text();
  const match = html.match(/csrf-token['"]\s+content=['"](.*?)['"]/);
  if (!match) throw new Error('Could not find CSRF token in page');

  const cookies = res.headers.getSetCookie?.() || [];
  const cookieStr = cookies.map(c => c.split(';')[0]).join('; ');

  log(`CSRF token: ${match[1].slice(0, 20)}...`);
  return { token: match[1], cookies: cookieStr };
}

// ── Step 2: Search for all events ───────────────────────────────────

async function searchAllEvents(csrf) {
  log('Searching for all events...');
  const res = await fetch(`${BASE_URL}/${YEAR}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-CSRF-Token': csrf.token,
      'X-Requested-With': 'XMLHttpRequest',
      'Cookie': csrf.cookies,
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    body: JSON.stringify({
      term: '',
      filters: [],
      models: ['event'],
      hash: '',
    }),
  });

  if (!res.ok) throw new Error(`Search failed: ${res.status} ${res.statusText}`);
  const data = await res.json();
  log(`Found ${data.hits?.length || 0} events`);
  return data;
}

async function searchAllFilms(csrf) {
  log('Searching for all films...');
  const res = await fetch(`${BASE_URL}/${YEAR}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-CSRF-Token': csrf.token,
      'X-Requested-With': 'XMLHttpRequest',
      'Cookie': csrf.cookies,
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    body: JSON.stringify({
      term: '',
      filters: [],
      models: ['film'],
      hash: '',
    }),
  });

  if (!res.ok) throw new Error(`Film search failed: ${res.status} ${res.statusText}`);
  const data = await res.json();
  log(`Found ${data.hits?.length || 0} films`);
  return data;
}

// ── Step 3: Fetch individual event details ──────────────────────────

async function fetchEventDetail(eventId, isFilm = false) {
  // Films use a different endpoint than events
  const type = isFilm ? 'films' : 'events';
  const url = `${BASE_URL}/api/web/${YEAR}/${type}/${eventId}`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });
  if (!res.ok) return null;
  return res.json();
}

async function fetchDetailsBatch(eventIds, filmIds, onProgress) {
  const results = {};
  for (let i = 0; i < eventIds.length; i += BATCH_SIZE) {
    const batch = eventIds.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async (id) => {
      try {
        const detail = await fetchEventDetail(id, filmIds.has(id));
        if (detail) results[id] = detail;
      } catch (err) {
        log(`  Warning: failed to fetch ${id}: ${err.message}`);
      }
    });
    await Promise.all(promises);
    onProgress(Math.min(i + BATCH_SIZE, eventIds.length), eventIds.length);
    if (i + BATCH_SIZE < eventIds.length) await sleep(DELAY_MS);
  }
  return results;
}

// ── Step 4: Build normalized event records ──────────────────────────

function normalizeEvent(hit, detail, isFilm = false) {
  const src = hit._source;
  const d = detail || {};

  // Films store screening info differently — use first screening for date/venue
  let date = src.date || '';
  let startTime = src.start_time || '';
  let endTime = src.end_time || '';
  let venue = src.venue?.name || d.venue?.name || '';
  let venueAddress = d.venue?.address || '';
  let venueId = src.venue?.id || '';

  if (isFilm && d.screenings?.length > 0) {
    const s = d.screenings[0];
    date = date || s.date || '';
    startTime = startTime || s.start_time || '';
    endTime = endTime || s.end_time || '';
    venue = venue || s.venue?.name || '';
    venueAddress = venueAddress || s.venue?.address || '';
    venueId = venueId || s.venue?.id || '';
  }

  // For films, also pull directors/cast as speakers
  const speakers = (d.contributors || src.panelists || []).map(p => ({
    name: p.name || '',
    title: p.title || p.role || '',
    company: p.company || '',
  }));
  if (isFilm && d.directors) {
    for (const dir of d.directors) {
      if (dir.name && !speakers.some(s => s.name === dir.name)) {
        speakers.push({ name: dir.name, title: 'Director', company: '' });
      }
    }
  }

  return {
    id: hit._id,
    title: src.name || d.name || d.title || '',
    description: d.description || d.long_description || d.synopsis || src.description || '',
    date,
    start_time: startTime,
    end_time: endTime,
    venue,
    venue_address: venueAddress,
    venue_id: venueId,
    track: d.track || src.theme || '',
    tags: d.tags || src.tags || [],
    format: src.format || d.format || (isFilm ? 'Film Screening' : ''),
    event_type: src.event_type || d.event_type || (isFilm ? 'Screening' : ''),
    speakers,
    credential_types: src.credential_types || [],
    experience_level: d.experience_level || '',
    url: `https://schedule.sxsw.com/${YEAR}/events/${hit._id}`,
    thumbnail_url: src.thumbnail_url || '',
  };
}

// ── Step 5: Build search index ──────────────────────────────────────

function buildIndex(events) {
  const byDate = {};
  const byTrack = {};
  const byVenue = {};
  const byFormat = {};
  const byType = {};
  const bySpeaker = {};
  const keywords = {};

  for (const evt of events) {
    // By date
    if (evt.date) {
      (byDate[evt.date] ??= []).push(evt.id);
    }

    // By track
    if (evt.track) {
      (byTrack[evt.track] ??= []).push(evt.id);
    }
    for (const tag of evt.tags) {
      (byTrack[tag] ??= []).push(evt.id);
    }

    // By venue
    if (evt.venue) {
      (byVenue[evt.venue] ??= []).push(evt.id);
    }

    // By format
    if (evt.format) {
      (byFormat[evt.format] ??= []).push(evt.id);
    }

    // By event type
    if (evt.event_type) {
      (byType[evt.event_type] ??= []).push(evt.id);
    }

    // By speaker
    for (const spk of evt.speakers) {
      if (spk.name) {
        (bySpeaker[spk.name] ??= []).push(evt.id);
      }
    }

    // Full-text keyword index (lowercased word → event IDs)
    const text = [evt.title, evt.description, evt.track, ...evt.tags, evt.venue].join(' ').toLowerCase();
    const words = text.match(/\b\w{3,}\b/g) || [];
    for (const w of words) {
      (keywords[w] ??= new Set()).add(evt.id);
    }
  }

  // Convert sets to arrays
  for (const w of Object.keys(keywords)) {
    keywords[w] = [...keywords[w]];
  }

  return { byDate, byTrack, byVenue, byFormat, byType, bySpeaker, keywords };
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Get CSRF credentials
  const csrf = await getCSRFToken();

  // Search for all events and films
  const [eventData, filmData] = await Promise.all([
    searchAllEvents(csrf),
    searchAllFilms(csrf),
  ]);

  const allHits = [...(eventData.hits || []), ...(filmData.hits || [])];
  log(`Total hits to process: ${allHits.length}`);

  // Extract event IDs for detail fetching
  const eventIds = allHits.map(h => h._id);
  const filmIdSet = new Set((filmData.hits || []).map(h => h._id));
  log(`Film IDs: ${filmIdSet.size}`);

  // Fetch details for all events
  log('Fetching event details...');
  const details = await fetchDetailsBatch(eventIds, filmIdSet, (done, total) => {
    if (done % 100 === 0 || done === total) {
      log(`  Progress: ${done}/${total} details fetched`);
    }
  });

  // Normalize events
  log('Normalizing event records...');
  const events = allHits.map(hit => normalizeEvent(hit, details[hit._id], filmIdSet.has(hit._id)));

  // Sort by date and start time
  events.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.start_time.localeCompare(b.start_time);
  });

  // Write schedule
  const schedule = {
    scraped_at: new Date().toISOString(),
    event_count: events.length,
    date_range: {
      start: '2026-03-12',
      end: '2026-03-18',
    },
    events,
  };

  fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(schedule, null, 2));
  log(`Wrote ${events.length} events to ${SCHEDULE_FILE}`);

  // Build and write index
  log('Building search index...');
  const index = buildIndex(events);
  index.scraped_at = schedule.scraped_at;
  index.event_count = schedule.event_count;

  // Add aggregation metadata from search response
  if (eventData.aggregations) {
    index.aggregations = {};
    for (const agg of eventData.aggregations) {
      index.aggregations[agg.name] = agg.buckets.map(b => ({
        key: b.key,
        count: b.doc_count,
      }));
    }
  }

  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
  log(`Wrote index to ${INDEX_FILE}`);

  // Summary
  log('');
  log('=== Scrape Summary ===');
  log(`Events: ${events.length}`);
  log(`Dates: ${Object.keys(index.byDate).length}`);
  log(`Tracks: ${Object.keys(index.byTrack).length}`);
  log(`Venues: ${Object.keys(index.byVenue).length}`);
  log(`Formats: ${Object.keys(index.byFormat).length}`);
  log(`Speakers: ${Object.keys(index.bySpeaker).length}`);
  log(`Keywords: ${Object.keys(index.keywords).length}`);
  log(`Detail fetch success rate: ${Object.keys(details).length}/${eventIds.length}`);
  log('');
}

main().catch(err => {
  log(`Fatal error: ${err.message}`);
  process.exit(1);
});
