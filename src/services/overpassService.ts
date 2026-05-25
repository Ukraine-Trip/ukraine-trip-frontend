/**
 * Overpass API (OpenStreetMap) — пошук реальних POI для агента маршрутів.
 *
 * Архітектура:
 *   1. Для кожного знайденого регіону беремо обмежений bbox.
 *   2. Для кожного типу локації — відповідні OSM-теги.
 *   3. Паралельні запити → deduplicate → ItineraryPoint[].
 *   4. Результат передається в /map-page як initialRoutePoints.
 *      Маршрут будується через вже наявний OSRM у Routing.tsx.
 */

import type { ItineraryPoint } from '../types/types';

// ── Endpoints ──────────────────────────────────────────────────────────────
const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

// ── Bounding boxes для кожної області України [south,west,north,east] ─────
const REGION_BBOX: Record<string, [number, number, number, number]> = {
  'Харківська':        [49.3, 35.4, 50.4, 38.2],
  'Київська':          [49.5, 29.5, 51.5, 32.2],
  'Львівська':         [49.0, 22.5, 50.5, 24.7],
  'Івано-Франківська': [47.7, 23.5, 49.5, 25.5],
  'Чернівецька':       [47.7, 24.8, 48.7, 26.7],
  'Закарпатська':      [47.9, 22.1, 49.1, 24.6],
  'Тернопільська':     [48.7, 24.5, 50.2, 26.4],
  'Хмельницька':       [48.5, 25.9, 50.3, 27.9],
  'Вінницька':         [47.8, 27.1, 50.0, 29.8],
  'Черкаська':         [48.6, 30.5, 50.1, 32.7],
  'Кіровоградська':    [47.6, 30.8, 49.2, 33.5],
  'Дніпропетровська':  [47.2, 33.2, 49.0, 36.4],
  'Запорізька':        [46.4, 34.1, 48.5, 37.2],
  'Одеська':           [45.4, 28.2, 48.0, 31.9],
  'Миколаївська':      [46.2, 30.3, 48.1, 33.3],
  'Херсонська':        [45.8, 31.5, 47.5, 34.5],
  'Полтавська':        [48.5, 32.7, 50.7, 35.6],
  'Сумська':           [50.0, 32.3, 52.4, 35.4],
  'Чернігівська':      [50.2, 30.0, 52.4, 34.3],
  'Житомирська':       [49.4, 26.9, 51.7, 29.9],
  'Рівненська':        [49.9, 24.9, 51.4, 27.4],
  'Волинська':         [50.2, 23.8, 52.3, 26.1],
};

// Бокс усієї України (fallback)
const UA_BBOX = '44.0,22.0,52.5,40.5';

// ── OSM теги для кожного типу ──────────────────────────────────────────────
// Значення — рядок що підставляється у: node[ЗНАЧЕННЯ](bbox)
const TYPE_TAGS: Record<string, string[]> = {
  'замок':       ['"historic"="castle"', '"historic"="fortification"'],
  'церква':      ['"building"="church"', '"historic"="church"'],
  'монастир':    ['"historic"="monastery"', '"building"="monastery"'],
  'музей':       ['"tourism"="museum"'],
  'парк':        ['"leisure"="park"', '"leisure"="nature_reserve"'],
  'природа':     ['"natural"="waterfall"', '"natural"="peak"', '"leisure"="nature_reserve"'],
  'архітектура': ['"historic"="monument"', '"historic"="building"', '"tourism"="attraction"'],
  'галерея':     ['"tourism"="gallery"'],
  'ресторан':    ['"amenity"="restaurant"'],
  'кафе':        ['"amenity"="cafe"'],
  'ринок':       ['"amenity"="marketplace"'],
};

// Загальний пошук без типу (топові туристичні POI)
const DEFAULT_TAGS = [
  '"tourism"="museum"',
  '"historic"="castle"',
  '"tourism"="attraction"',
  '"natural"="waterfall"',
];

// ── Маппінг тип → категорія ItineraryPoint ─────────────────────────────────
const TYPE_TO_CATEGORY: Record<string, ItineraryPoint['category']> = {
  'замок':       'landmark',
  'церква':      'culture',
  'монастир':    'culture',
  'музей':       'culture',
  'парк':        'park',
  'природа':     'landmark',
  'архітектура': 'landmark',
  'галерея':     'culture',
  'ресторан':    'stop',
  'кафе':        'cafe',
  'ринок':       'stop',
};

// ── Утиліти ────────────────────────────────────────────────────────────────
interface OsmElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function buildQuery(tagFilters: string[], bbox: string, limit: number): string {
  const lines = tagFilters
    .flatMap((f) => [`  node[${f}](${bbox});`, `  way[${f}](${bbox});`])
    .join('\n');
  return `[out:json][timeout:20];\n(\n${lines}\n);\nout center ${limit};`;
}

function toPoint(el: OsmElement, category: ItineraryPoint['category']): ItineraryPoint | null {
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  const name =
    el.tags?.['name:uk'] ??
    el.tags?.['name:en'] ??
    el.tags?.['name'] ??
    '';

  if (!lat || !lon || !name.trim()) return null;

  return {
    id: `osm-${el.type}-${el.id}`,
    name: name.trim(),
    lat,
    lng: lon,
    type: category,
    category,
    priority: 3,
    description: el.tags?.['description:uk'] ?? el.tags?.['description'] ?? '',
    imageUrl: '',
    region: el.tags?.['addr:region'] ?? '',
  };
}

async function fetchOverpass(query: string): Promise<OsmElement[]> {
  const body = `data=${encodeURIComponent(query)}`;

  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: AbortSignal.timeout(18000),
      });
      if (!res.ok) continue;
      const json = (await res.json()) as { elements: OsmElement[] };
      return json.elements ?? [];
    } catch {
      // Спробуємо наступний endpoint
    }
  }
  return [];
}

// ── Головна функція ─────────────────────────────────────────────────────────
/**
 * Шукає POI через Overpass API (OSM).
 *
 * @param regions  Масив назв областей (може бути порожнім → вся Україна)
 * @param type     Тип локації ('замок', 'музей', тощо) або undefined
 * @param limit    Максимальна кількість результатів
 */
export async function searchOsmPOIs(
  regions: string[],
  type?: string,
  limit = 10,
): Promise<ItineraryPoint[]> {
  const tags = type ? (TYPE_TAGS[type] ?? DEFAULT_TAGS) : DEFAULT_TAGS;
  const category = type ? (TYPE_TO_CATEGORY[type] ?? 'landmark') : 'landmark';

  // Визначаємо bbox-и для кожного регіону (або вся Україна)
  const bboxes: string[] =
    regions.length > 0
      ? regions
          .map((r) => {
            const bb = REGION_BBOX[r];
            return bb ? `${bb[0]},${bb[1]},${bb[2]},${bb[3]}` : null;
          })
          .filter((b): b is string => b !== null)
      : [UA_BBOX];

  if (bboxes.length === 0) bboxes.push(UA_BBOX);

  // Паралельні запити для кожного bbox
  const perBbox = Math.ceil((limit * 2) / bboxes.length);
  const queries = bboxes.map((bbox) => buildQuery(tags, bbox, perBbox));

  const rawResults = await Promise.all(queries.map(fetchOverpass));

  // Deduplicate за OSM id
  const seen = new Set<string>();
  const points: ItineraryPoint[] = [];

  for (const elements of rawResults) {
    for (const el of elements) {
      const key = `${el.type}-${el.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const pt = toPoint(el, category);
      if (pt) points.push(pt);
    }
  }

  return points.slice(0, limit);
}
