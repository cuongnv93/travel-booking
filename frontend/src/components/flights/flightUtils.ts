import { removeVietnameseTones } from '@/lib/utils';
import { DEFAULT_AIRPORTS } from '@/hooks/useSettings';

export function findAirportCode(query: string | null, customAirports: any[] = DEFAULT_AIRPORTS): string | null {
  if (!query) return null;
  const list = Array.isArray(customAirports) && customAirports.length > 0 ? customAirports : DEFAULT_AIRPORTS;
  const raw = query.trim().toLowerCase();
  const qClean = removeVietnameseTones(query);
  const directMatch = list.find((a: any) => a && (a.code?.toLowerCase() === raw || removeVietnameseTones(a.code || '') === qClean));
  if (directMatch) return directMatch.code;

  const nameMatch = list.find((a: any) => {
    if (!a) return false;
    const cityObj = a.cities || a.city || {};
    const cityValues = typeof cityObj === 'object' && cityObj ? Object.values(cityObj) : [cityObj];
    const nameClean = removeVietnameseTones(a.name || '');
    return (
      nameClean.includes(qClean) ||
      qClean.includes(nameClean) ||
      cityValues.some((cityName: any) => {
        if (typeof cityName !== 'string') return false;
        const cnClean = removeVietnameseTones(cityName);
        return cnClean.includes(qClean) || qClean.includes(cnClean);
      })
    );
  });
  return nameMatch ? nameMatch.code : null;
}
