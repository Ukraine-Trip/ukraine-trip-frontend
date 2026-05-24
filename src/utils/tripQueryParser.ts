export interface ParsedQuery {
  region?: string;
  type?: string;
  min_rating?: number;
  title: string;
}

/**
 * Регіони України: ключ — підрядок із тексту користувача (нижній регістр),
 * значення — офіційна назва регіону для API.
 */
const REGION_MAP: Array<[string, string]> = [
  ['львів', 'Львівська'],
  ['галичин', 'Львівська'],
  ['галич', 'Львівська'],
  ['карпат', 'Івано-Франківська'],
  ['буковел', 'Івано-Франківська'],
  ['яремч', 'Івано-Франківська'],
  ['івано-франківськ', 'Івано-Франківська'],
  ['франківськ', 'Івано-Франківська'],
  ['чернівц', 'Чернівецька'],
  ['буковин', 'Чернівецька'],
  ['київ', 'Київська'],
  ['чернігів', 'Чернігівська'],
  ['черніг', 'Чернігівська'],
  ['полтав', 'Полтавська'],
  ['харків', 'Харківська'],
  ['суми', 'Сумська'],
  ['дніпр', 'Дніпропетровська'],
  ['запоріжж', 'Запорізька'],
  ['хмельниц', 'Хмельницька'],
  ['кам\'янець', 'Хмельницька'],
  ['вінниц', 'Вінницька'],
  ['житомир', 'Житомирська'],
  ['рівн', 'Рівненська'],
  ['луцьк', 'Волинська'],
  ['волин', 'Волинська'],
  ['тернопіл', 'Тернопільська'],
  ['тернопол', 'Тернопільська'],
  ['ужгород', 'Закарпатська'],
  ['закарпат', 'Закарпатська'],
  ['мукачев', 'Закарпатська'],
  ['черкас', 'Черкаська'],
  ['умань', 'Черкаська'],
  ['кропивниц', 'Кіровоградська'],
  ['кіровоград', 'Кіровоградська'],
  ['миколаїв', 'Миколаївська'],
  ['херсон', 'Херсонська'],
  ['одес', 'Одеська'],
  ['запоріжж', 'Запорізька'],
];

/**
 * Типи локацій: ключ — підрядок із тексту, значення — тип у API.
 */
const TYPE_MAP: Array<[string, string]> = [
  ['замок', 'castle'],
  ['замки', 'castle'],
  ['фортец', 'castle'],
  ['фортеця', 'castle'],
  ['цитадель', 'castle'],
  ['church', 'church'],
  ['церков', 'church'],
  ['церква', 'church'],
  ['храм', 'church'],
  ['собор', 'church'],
  ['монастир', 'monastery'],
  ['монастирь', 'monastery'],
  ['музей', 'museum'],
  ['музеї', 'museum'],
  ['парк', 'park'],
  ['сад', 'park'],
  ['природ', 'nature'],
  ['водоспад', 'nature'],
  ['озер', 'nature'],
  ['ліс', 'nature'],
  ['гора', 'nature'],
  ['гори', 'nature'],
  ['пляж', 'nature'],
  ['архітектур', 'architecture'],
  ['площ', 'architecture'],
  ['ратуш', 'architecture'],
  ['галерея', 'gallery'],
  ['виставк', 'gallery'],
  ['ресторан', 'restaurant'],
  ['кав\'ярн', 'cafe'],
  ['кафе', 'cafe'],
  ['кава', 'cafe'],
  ['ринок', 'market'],
  ['базар', 'market'],
];

/** Чи є в тексті запит на "кращі" / "топ" місця */
const HIGH_RATING_KEYWORDS = [
  'топ', 'кращ', 'найкращ', 'відом', 'знаменит', 'популярн', 'must see', 'must-see',
];

export function parseTripQuery(text: string): ParsedQuery {
  const lower = text.toLowerCase();

  // --- Регіон ---
  let region: string | undefined;
  for (const [key, value] of REGION_MAP) {
    if (lower.includes(key)) {
      region = value;
      break;
    }
  }

  // --- Тип ---
  let type: string | undefined;
  for (const [key, value] of TYPE_MAP) {
    if (lower.includes(key)) {
      type = value;
      break;
    }
  }

  // --- Рейтинг ---
  const wantsHighRating = HIGH_RATING_KEYWORDS.some((kw) => lower.includes(kw));
  const min_rating = wantsHighRating ? 4.0 : undefined;

  // --- Назва маршруту ---
  const cleaned = text.trim();
  const title = cleaned.length > 60 ? cleaned.slice(0, 57) + '…' : cleaned;

  return { region, type, min_rating, title };
}
