/**
 * Utility for exporting data to UTF-8 BOM CSV files
 * Ensures Vietnamese accents render perfectly in Microsoft Excel, Google Sheets, and LibreOffice.
 */

export interface CsvColumn<T = any> {
  key: string;
  label: string;
  formatter?: (row: T) => string | number | null | undefined;
}

export function exportToCsv<T = any>(
  filename: string,
  rows: T[],
  columns: CsvColumn<T>[]
) {
  if (!rows || rows.length === 0) {
    alert('Không có dữ liệu để xuất file CSV.');
    return;
  }

  const escapeCell = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = columns.map((col) => escapeCell(col.label)).join(',');

  const bodyRows = rows.map((row) => {
    return columns
      .map((col) => {
        if (col.formatter) {
          return escapeCell(col.formatter(row));
        }
        return escapeCell((row as Record<string, any>)[col.key]);
      })
      .join(',');
  });

  // Prepend UTF-8 BOM (\uFEFF) so Excel natively recognizes UTF-8 Vietnamese characters
  const csvContent = '\uFEFF' + [headerRow, ...bodyRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
