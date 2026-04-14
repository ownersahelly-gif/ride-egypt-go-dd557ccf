import { supabase } from '@/integrations/supabase/client';
import type { ParsedLink, OrderedStop } from './types';

/** Use Google Geocoder to resolve a segment (place name or coordinates) */
function resolveSegment(seg: string): Promise<{ lat: number; lng: number; name: string }> {
  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder();
    const coordMatch = seg.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        const name = status === 'OK' && results?.[0] ? results[0].formatted_address : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        resolve({ lat, lng, name });
      });
    } else {
      const decoded = decodeURIComponent(seg.replace(/\+/g, ' '));
      geocoder.geocode({ address: decoded }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const loc = results[0].geometry.location;
          resolve({ lat: loc.lat(), lng: loc.lng(), name: results[0].formatted_address });
        } else {
          reject(new Error(`Could not find: ${decoded.substring(0, 40)}`));
        }
      });
    }
  });
}

/** Resolve short Google Maps links (maps.app.goo.gl) via edge function */
async function resolveShortLink(url: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('resolve-redirect', {
    body: { url },
  });
  if (error || !data?.resolved) throw new Error('Failed to resolve short link');
  return data.resolved;
}

/** Check if a URL is a short Google Maps link */
function isShortLink(url: string): boolean {
  return /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(url);
}

/** Parse a Google Maps directions URL and resolve origin/destination via Geocoder */
export async function parseGoogleMapsLink(url: string): Promise<{ origin: { lat: number; lng: number; name: string }; destination: { lat: number; lng: number; name: string } } | null> {
  let resolvedUrl = url;

  // Resolve short links first
  if (isShortLink(url)) {
    resolvedUrl = await resolveShortLink(url);
  }

  // Extract the path after /dir/
  const dirMatch = resolvedUrl.match(/\/dir\/(.+?)(?:\/@|\/data=|$|\?)/);
  if (!dirMatch) return null;

  const segments = dirMatch[1].split('/').filter(s => s.trim() !== '');
  if (segments.length < 2) {
    // Try extracting coords from /data= blob as fallback for destination
    const dataCoords: { lat: number; lng: number }[] = [];
    let dm: RegExpExecArray | null;
    const dataRegex = /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/g;
    while ((dm = dataRegex.exec(resolvedUrl)) !== null) {
      dataCoords.push({ lat: parseFloat(dm[1]), lng: parseFloat(dm[2]) });
    }
    if (segments.length >= 1 && dataCoords.length > 0) {
      const origin = await resolveSegment(segments[0]);
      const destCoord = dataCoords[dataCoords.length - 1];
      const destination = await resolveSegment(`${destCoord.lat},${destCoord.lng}`);
      return { origin, destination };
    }
    return null;
  }

  const origin = await resolveSegment(segments[0]);
  const destination = await resolveSegment(segments[segments.length - 1]);

  return { origin, destination };
}

export function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

/** Generate optimized stop order using nearest-neighbor with pickup-before-dropoff constraint */
export function generateOptimizedStops(links: ParsedLink[]): OrderedStop[] {
  const valid = links.filter(l => l.origin && l.destination);
  if (valid.length === 0) return [];

  const allStops: OrderedStop[] = [];
  valid.forEach((l, i) => {
    allStops.push({ lat: l.origin!.lat, lng: l.origin!.lng, name: l.origin!.name, linkIdx: i, type: 'P' });
    allStops.push({ lat: l.destination!.lat, lng: l.destination!.lng, name: l.destination!.name, linkIdx: i, type: 'D' });
  });

  const ordered: OrderedStop[] = [];
  const remaining = new Set(allStops.map((_, i) => i));
  const pickedUp = new Set<number>();

  const pickups = allStops.filter(s => s.type === 'P');
  const cLat = pickups.reduce((s, p) => s + p.lat, 0) / pickups.length;
  const cLng = pickups.reduce((s, p) => s + p.lng, 0) / pickups.length;
  const centroid = { lat: cLat, lng: cLng };

  let firstIdx = -1;
  let firstDist = Infinity;
  for (const i of remaining) {
    const s = allStops[i];
    if (s.type !== 'P') continue;
    const d = haversine(centroid, s);
    if (d < firstDist) { firstDist = d; firstIdx = i; }
  }

  remaining.delete(firstIdx);
  ordered.push(allStops[firstIdx]);
  pickedUp.add(allStops[firstIdx].linkIdx);

  while (remaining.size > 0) {
    const current = ordered[ordered.length - 1];
    let bestIdx = -1;
    let bestDist = Infinity;

    for (const i of remaining) {
      const s = allStops[i];
      if (s.type === 'D' && !pickedUp.has(s.linkIdx)) continue;
      const d = haversine(current, s);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    }

    if (bestIdx === -1) break;
    remaining.delete(bestIdx);
    const stop = allStops[bestIdx];
    ordered.push(stop);
    if (stop.type === 'P') pickedUp.add(stop.linkIdx);
  }

  return ordered;
}

/** Build a Google Maps directions URL from ordered stops */
export function buildGoogleMapsLink(stops: OrderedStop[]): string {
  const points = stops.map(s => `${s.lat},${s.lng}`);
  return `https://www.google.com/maps/dir/${points.join('/')}`;
}
