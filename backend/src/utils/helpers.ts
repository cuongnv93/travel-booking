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
