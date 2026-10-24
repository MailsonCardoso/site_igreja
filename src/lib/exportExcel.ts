/**
 * Utilitário de exportação de dados para Excel / CSV compatível com padrão brasileiro (PT-BR).
 * - Utiliza BOM UTF-8 (\uFEFF) para garantir abertura direta no Excel sem erros de acentuação (ç, ã, é, etc.)
 * - Utiliza ponto e vírgula (;) como delimitador padrão para o Excel em português
 * - Trata escape de aspas, quebras de linha e campos nulos
 */

export interface ExportColumn<T = any> {
  header: string;
  key?: keyof T;
  formatter?: (item: T) => string | number | null | undefined;
}

function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) return "";
  const str = String(val).trim();
  // Se contém ponto e vírgula, aspas, quebra de linha ou começa com caracteres especiais, encapsula entre aspas
  if (str.includes(";") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToExcelCsv<T = any>(
  data: T[],
  columns: ExportColumn<T>[],
  fileName: string
): boolean {
  if (!data || data.length === 0) {
    return false;
  }

  // 1. Linha de cabeçalho
  const headers = columns.map((col) => escapeCsvValue(col.header)).join(";");

  // 2. Linhas de dados
  const rows = data.map((item) => {
    return columns
      .map((col) => {
        let val: any;
        if (col.formatter) {
          val = col.formatter(item);
        } else if (col.key) {
          val = item[col.key];
        }
        return escapeCsvValue(val);
      })
      .join(";");
  });

  // 3. Montar conteúdo com BOM UTF-8 (\uFEFF) para o Excel reconhecer acentos
  const csvContent = "\uFEFF" + [headers, ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // 4. Disparar download no navegador
  const sanitizedFileName = fileName.endsWith(".csv") ? fileName : `${fileName}.csv`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", sanitizedFileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}
