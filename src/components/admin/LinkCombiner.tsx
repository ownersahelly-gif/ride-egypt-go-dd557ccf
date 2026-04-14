import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Link2, Plus, Trash2, ExternalLink, Copy, MapPin, Loader2, Route } from 'lucide-react';
import { toast } from 'sonner';

interface ParsedLink {
  id: string;
  raw: string;
  origin: { lat: number; lng: number; name?: string } | null;
  destination: { lat: number; lng: number; name?: string } | null;
  error?: string;
}

/**
 * Extracts origin/destination coordinates from various Google Maps link formats.
 * Supports:
 * - /dir/lat,lng/lat,lng
 * - /dir/Place+Name/Place+Name/@lat,lng
 * - ?saddr=lat,lng&daddr=lat,lng
 * - /place/.../@lat,lng
 */
function parseGoogleMapsLink(url: string): { origin: { lat: number; lng: number; name?: string }; destination: { lat: number; lng: number; name?: string } } | null {
  try {
    // Format: /dir/origin/destination or /dir/origin/destination/@...
    const dirMatch = url.match(/\/dir\/([^/]+)\/([^/]+)/);
    if (dirMatch) {
      const parsePoint = (s: string): { lat: number; lng: number; name?: string } | null => {
        // Try lat,lng format
        const coordMatch = s.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
        if (coordMatch) {
          return { lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) };
        }
        // It's a place name — try to extract coords from the @ portion later
        return null;
      };

      const origin = parsePoint(decodeURIComponent(dirMatch[1]));
      const destination = parsePoint(decodeURIComponent(dirMatch[2]));

      // Try to get coords from the @ portion of the URL
      const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);

      if (origin && destination) {
        return { origin, destination };
      }

      // If we have place names, look for data= parameters with coordinates
      const allCoords: { lat: number; lng: number }[] = [];
      const coordRegex = /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/g;
      let match;
      while ((match = coordRegex.exec(url)) !== null) {
        allCoords.push({ lat: parseFloat(match[1]), lng: parseFloat(match[2]) });
      }

      if (allCoords.length >= 2) {
        return {
          origin: { ...allCoords[0], name: decodeURIComponent(dirMatch[1]).replace(/\+/g, ' ') },
          destination: { ...allCoords[allCoords.length - 1], name: decodeURIComponent(dirMatch[2]).replace(/\+/g, ' ') },
        };
      }

      // Fallback: if one is coord and we have @ for the other
      if (origin && !destination && atMatch) {
        return { origin, destination: { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]), name: decodeURIComponent(dirMatch[2]).replace(/\+/g, ' ') } };
      }
      if (!origin && destination && atMatch) {
        return { origin: { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]), name: decodeURIComponent(dirMatch[1]).replace(/\+/g, ' ') }, destination };
      }
    }

    // Format: saddr/daddr query params
    const saddrMatch = url.match(/[?&]saddr=([^&]+)/);
    const daddrMatch = url.match(/[?&]daddr=([^&]+)/);
    if (saddrMatch && daddrMatch) {
      const parseCoord = (s: string) => {
        const m = decodeURIComponent(s).match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
        return m ? { lat: parseFloat(m[1]), lng: parseFloat(m[2]) } : null;
      };
      const o = parseCoord(saddrMatch[1]);
      const d = parseCoord(daddrMatch[1]);
      if (o && d) return { origin: o, destination: d };
    }

    // Try extracting all coordinate pairs from the URL
    const allCoords: { lat: number; lng: number }[] = [];
    const patterns = [
      /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/g,
      /(-?\d{1,3}\.\d{4,}),\s*(-?\d{1,3}\.\d{4,})/g,
    ];
    for (const pattern of patterns) {
      let m;
      while ((m = pattern.exec(url)) !== null) {
        const lat = parseFloat(m[1]);
        const lng = parseFloat(m[2]);
        if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
          // Avoid duplicates
          if (!allCoords.some(c => Math.abs(c.lat - lat) < 0.0001 && Math.abs(c.lng - lng) < 0.0001)) {
            allCoords.push({ lat, lng });
          }
        }
      }
    }

    if (allCoords.length >= 2) {
      return { origin: allCoords[0], destination: allCoords[allCoords.length - 1] };
    }

    return null;
  } catch {
    return null;
  }
}

function generateCombinedGoogleMapsLink(links: ParsedLink[]): string | null {
  const valid = links.filter(l => l.origin && l.destination);
  if (valid.length === 0) return null;

  // Collect all pickup and dropoff points
  const pickups = valid.map(l => l.origin!);
  const dropoffs = valid.map(l => l.destination!);

  // Order: first pickup → other pickups → other dropoffs → last dropoff
  // Use centroid-based ordering for a sensible route
  const orderByAngle = (points: { lat: number; lng: number }[]) => {
    if (points.length <= 1) return points;
    const cLat = points.reduce((s, p) => s + p.lat, 0) / points.length;
    const cLng = points.reduce((s, p) => s + p.lng, 0) / points.length;
    return [...points].sort((a, b) => {
      const angleA = Math.atan2(a.lat - cLat, a.lng - cLng);
      const angleB = Math.atan2(b.lat - cLat, b.lng - cLng);
      return angleA - angleB;
    });
  };

  const orderedPickups = orderByAngle(pickups);
  const orderedDropoffs = orderByAngle(dropoffs);

  // Build waypoints: origin = first pickup, destination = last dropoff, middle = waypoints
  const allPoints = [...orderedPickups, ...orderedDropoffs];
  const origin = allPoints[0];
  const destination = allPoints[allPoints.length - 1];
  const waypoints = allPoints.slice(1, -1);

  let url = `https://www.google.com/maps/dir/${origin.lat},${origin.lng}`;
  for (const wp of waypoints) {
    url += `/${wp.lat},${wp.lng}`;
  }
  url += `/${destination.lat},${destination.lng}`;

  return url;
}

const LinkCombiner = ({ lang }: { lang: string }) => {
  const [links, setLinks] = useState<ParsedLink[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [combinedLink, setCombinedLink] = useState<string | null>(null);
  const [bulkInput, setBulkInput] = useState('');

  const addLink = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    const parsed = parseGoogleMapsLink(trimmed);
    const newLink: ParsedLink = {
      id: crypto.randomUUID(),
      raw: trimmed,
      origin: parsed?.origin || null,
      destination: parsed?.destination || null,
      error: parsed ? undefined : (lang === 'ar' ? 'تعذر استخراج الإحداثيات' : 'Could not extract coordinates'),
    };
    setLinks(prev => [...prev, newLink]);
    setCombinedLink(null);
  };

  const addBulkLinks = () => {
    const urls = bulkInput.split('\n').map(s => s.trim()).filter(Boolean);
    for (const url of urls) {
      addLink(url);
    }
    setBulkInput('');
  };

  const removeLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
    setCombinedLink(null);
  };

  const generateLink = () => {
    const result = generateCombinedGoogleMapsLink(links);
    if (result) {
      setCombinedLink(result);
      toast.success(lang === 'ar' ? 'تم إنشاء الرابط المجمع!' : 'Combined link generated!');
    } else {
      toast.error(lang === 'ar' ? 'لا توجد روابط صالحة لدمجها' : 'No valid links to combine');
    }
  };

  const copyLink = () => {
    if (combinedLink) {
      navigator.clipboard.writeText(combinedLink);
      toast.success(lang === 'ar' ? 'تم النسخ!' : 'Copied!');
    }
  };

  const validCount = links.filter(l => l.origin && l.destination).length;

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Route className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground text-lg">
          {lang === 'ar' ? 'دمج روابط Google Maps' : 'Combine Google Maps Links'}
        </h3>
      </div>
      <p className="text-sm text-muted-foreground">
        {lang === 'ar'
          ? 'الصق روابط رحلات Google Maps لأشخاص مختلفين وسيتم إنشاء رابط واحد يجمع كل نقاط الالتقاط والتوصيل معاً'
          : 'Paste Google Maps driving links for different people and generate one combined route connecting all pickup and dropoff points'}
      </p>

      {/* Single link input */}
      <div className="flex gap-2">
        <Input
          className="flex-1 text-sm"
          placeholder={lang === 'ar' ? 'الصق رابط Google Maps هنا...' : 'Paste a Google Maps link here...'}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && inputValue.trim()) {
              addLink(inputValue);
              setInputValue('');
            }
          }}
        />
        <Button
          size="sm"
          disabled={!inputValue.trim()}
          onClick={() => { addLink(inputValue); setInputValue(''); }}
        >
          <Plus className="w-4 h-4 me-1" />
          {lang === 'ar' ? 'إضافة' : 'Add'}
        </Button>
      </div>

      {/* Bulk paste */}
      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          {lang === 'ar' ? 'إضافة عدة روابط دفعة واحدة' : 'Bulk paste multiple links'}
        </summary>
        <div className="mt-2 space-y-2">
          <Textarea
            className="text-xs"
            rows={4}
            placeholder={lang === 'ar' ? 'رابط واحد في كل سطر...' : 'One link per line...'}
            value={bulkInput}
            onChange={e => setBulkInput(e.target.value)}
          />
          <Button size="sm" variant="outline" onClick={addBulkLinks} disabled={!bulkInput.trim()}>
            <Plus className="w-4 h-4 me-1" />
            {lang === 'ar' ? 'إضافة الكل' : 'Add All'}
          </Button>
        </div>
      </details>

      {/* Links list */}
      {links.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {lang === 'ar' ? `الروابط (${validCount} صالحة من ${links.length})` : `Links (${validCount} valid of ${links.length})`}
          </Label>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {links.map((link, idx) => (
              <div
                key={link.id}
                className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${
                  link.error ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-muted/30'
                }`}
              >
                <span className="font-mono text-muted-foreground w-5 shrink-0">#{idx + 1}</span>
                {link.origin && link.destination ? (
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-green-500 shrink-0" />
                      <span className="truncate">
                        {link.origin.name || `${link.origin.lat.toFixed(4)}, ${link.origin.lng.toFixed(4)}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                      <span className="truncate">
                        {link.destination.name || `${link.destination.lat.toFixed(4)}, ${link.destination.lng.toFixed(4)}`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="flex-1 text-destructive truncate">{link.error}</span>
                )}
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeLink(link.id)}>
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate button */}
      {links.length >= 2 && validCount >= 2 && (
        <Button onClick={generateLink} className="w-full gap-2">
          <Link2 className="w-4 h-4" />
          {lang === 'ar' ? `دمج ${validCount} رحلة في رابط واحد` : `Combine ${validCount} trips into one link`}
        </Button>
      )}

      {links.length === 1 && (
        <p className="text-xs text-muted-foreground text-center">
          {lang === 'ar' ? 'أضف رابطاً آخر على الأقل لدمج الرحلات' : 'Add at least one more link to combine trips'}
        </p>
      )}

      {/* Combined result */}
      {combinedLink && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
          <Label className="text-sm font-semibold text-primary">
            {lang === 'ar' ? 'الرابط المجمع' : 'Combined Route Link'}
          </Label>
          <div className="flex gap-2">
            <Input readOnly value={combinedLink} className="text-xs flex-1 font-mono" />
            <Button size="sm" variant="outline" onClick={copyLink}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.open(combinedLink, '_blank')}>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {lang === 'ar'
              ? 'يبدأ المسار من أقرب نقطة التقاط ويمر بجميع نقاط الالتقاط ثم جميع نقاط التوصيل'
              : 'Route starts from the nearest pickup, passes through all pickups, then all dropoffs'}
          </p>
        </div>
      )}

      {/* Clear all */}
      {links.length > 0 && (
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => { setLinks([]); setCombinedLink(null); }}>
          <Trash2 className="w-3 h-3 me-1" />
          {lang === 'ar' ? 'مسح الكل' : 'Clear All'}
        </Button>
      )}
    </div>
  );
};

export default LinkCombiner;
