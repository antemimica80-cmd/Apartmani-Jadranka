#!/usr/bin/env node
// Fetches an Airbnb iCal export and converts its VEVENT blocks into a flat
// list of blocked YYYY-MM-DD dates, written to a JSON file that the site's
// calendar widget reads (see js/calendar.js).
//
// Usage: AIRBNB_ICAL_URL=<ical-url> OUTPUT_PATH=<path> node scripts/sync-airbnb-ical.mjs

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const icalUrl = process.env.AIRBNB_ICAL_URL;
const outputPath = process.env.OUTPUT_PATH;

if (!icalUrl) {
  console.error('Missing AIRBNB_ICAL_URL environment variable.');
  process.exit(1);
}
if (!outputPath) {
  console.error('Missing OUTPUT_PATH environment variable.');
  process.exit(1);
}

function unfoldLines(text) {
  // RFC 5545: a line starting with a space/tab is a continuation of the previous line.
  return text.replace(/\r\n/g, '\n').split('\n').reduce((lines, line) => {
    if ((line.startsWith(' ') || line.startsWith('\t')) && lines.length) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
    return lines;
  }, []);
}

function parseDateValue(raw) {
  // Handles YYYYMMDD (all-day) and YYYYMMDDTHHMMSS[Z] (timed) formats.
  const digits = raw.replace('Z', '');
  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6)) - 1;
  const day = Number(digits.slice(6, 8));
  return new Date(Date.UTC(year, month, day));
}

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function expandRange(start, end) {
  // DTEND is exclusive per RFC 5545 for all-day VEVENTs (checkout day is not blocked).
  const dates = [];
  const cursor = new Date(start);
  while (cursor < end) {
    dates.push(toISODate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

async function main() {
  const res = await fetch(icalUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch iCal: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  const lines = unfoldLines(text);

  const blocked = new Set();
  let inEvent = false;
  let dtstart = null;
  let dtend = null;

  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      inEvent = true;
      dtstart = null;
      dtend = null;
      continue;
    }
    if (line.startsWith('END:VEVENT')) {
      if (dtstart && dtend) {
        expandRange(dtstart, dtend).forEach((d) => blocked.add(d));
      }
      inEvent = false;
      continue;
    }
    if (!inEvent) continue;

    if (line.startsWith('DTSTART')) {
      const value = line.split(':')[1];
      if (value) dtstart = parseDateValue(value.trim());
    } else if (line.startsWith('DTEND')) {
      const value = line.split(':')[1];
      if (value) dtend = parseDateValue(value.trim());
    }
  }

  const sorted = Array.from(blocked).sort();
  const payload = {
    blocked: sorted,
    lastUpdated: new Date().toISOString()
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');

  console.log(`Wrote ${sorted.length} blocked date(s) to ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
