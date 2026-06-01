import regionsData from '../../../../librarian/cities.json';

export const DANGEROUS_REGIONS = [
  'Donetsk',
  'Luhansk',
  'Zaporizhzhia',
  'Kherson',
  'Mykolaiv',
  'Kharkiv',
  'Sumy',
  'Kyiv',
  'Chernihiv',
  'Dnipropetrovsk',
  'Odesa',
];

export const formatDate = (start: string | null, end: string | null): string => {
  if (!start) return '';
  const fmt = (d: Date) =>
    d.toLocaleString('uk-UA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  const s = new Date(start);
  if (!end || start === end) return fmt(s);
  return `${fmt(s)} — ${fmt(new Date(end))}`;
};

export const pointsLabel = (count: number): string => {
  if (count % 10 === 1 && count % 100 !== 11) return `${count} точка`;
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100))
    return `${count} точки`;
  return `${count} точок`;
};

export const getRegionForCity = (cityName: string): string | null => {
  const foundRegion = regionsData.find(
    (region) =>
      region.center === cityName ||
      region.cities.some((city) => city.name === cityName)
  );
  return foundRegion ? foundRegion.name : null;
};

export const isDangerousRegion = (cityName: string): boolean => {
  const region = getRegionForCity(cityName);
  return region ? DANGEROUS_REGIONS.includes(region) : false;
};
