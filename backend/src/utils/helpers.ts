export const generateBookingCode = (): string => {
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `VTP-${randomStr}`;
};

export const slugify = (text: string): string => {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const paginate = (data: any[], total: number, page: number, limit: number) => {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const escapeRegex = (text: string): string => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

const DESTINATION_ALIASES: Record<string, string[]> = {
  hanoi: ['Hà Nội', 'Hanoi', 'Ha Noi'],
  'ha noi': ['Hà Nội', 'Hanoi', 'Ha Noi'],
  danang: ['Đà Nẵng', 'Da Nang'],
  'da nang': ['Đà Nẵng', 'Da Nang'],
  phuquoc: ['Phú Quốc', 'Phu Quoc'],
  'phu quoc': ['Phú Quốc', 'Phu Quoc'],
  halong: ['Hạ Long', 'Ha Long', 'Quảng Ninh', 'Quang Ninh'],
  'ha long': ['Hạ Long', 'Ha Long', 'Quảng Ninh', 'Quang Ninh'],
  sapa: ['Sa Pa', 'Sapa'],
  'sa pa': ['Sa Pa', 'Sapa'],
  hoian: ['Hội An', 'Hoi An'],
  'hoi an': ['Hội An', 'Hoi An'],
  nhatrang: ['Nha Trang'],
  'nha trang': ['Nha Trang'],
  hue: ['Huế', 'Hue'],
  caobang: ['Cao Bằng', 'Cao Bang'],
  'cao bang': ['Cao Bằng', 'Cao Bang'],
  dalat: ['Đà Lạt', 'Da Lat'],
  'da lat': ['Đà Lạt', 'Da Lat'],
  saigon: ['Hồ Chí Minh', 'TP. Hồ Chí Minh', 'TP Hồ Chí Minh', 'Saigon', 'TPHCM'],
  hcm: ['Hồ Chí Minh', 'TP. Hồ Chí Minh', 'TP Hồ Chí Minh', 'Saigon', 'TPHCM'],
  'ho chi minh': ['Hồ Chí Minh', 'TP. Hồ Chí Minh', 'TP Hồ Chí Minh', 'Saigon', 'TPHCM'],
  quynhon: ['Quy Nhơn', 'Quy Nhon'],
  'quy nhon': ['Quy Nhơn', 'Quy Nhon'],
  ninhbinh: ['Ninh Bình', 'Ninh Binh'],
  'ninh binh': ['Ninh Bình', 'Ninh Binh'],
};

export const buildDestinationRegex = (term: string): RegExp => {
  if (!term) return new RegExp('.*');
  const clean = term
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd');

  const matched = DESTINATION_ALIASES[clean];
  if (matched && matched.length > 0) {
    const patterns = Array.from(new Set([escapeRegex(term), ...matched.map(escapeRegex)]));
    return new RegExp(patterns.join('|'), 'i');
  }
  return new RegExp(escapeRegex(term), 'i');
};

