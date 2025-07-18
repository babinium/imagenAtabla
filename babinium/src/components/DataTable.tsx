import React from 'react';
import { TableData } from '../types';

interface DataTableProps {
  data: TableData;
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No hay datos para mostrar.</p>;
  }

  const headers = Object.keys(data[0]);

  const convertToCSV = (dataToConvert: TableData): string => {
    if (dataToConvert.length === 0) return '';
    
    const csvHeaders = headers.join(',');
    const csvRows = dataToConvert.map(row => 
      headers.map(header => {
        const cellValue = row[header];
        const stringValue = cellValue === null || cellValue === undefined ? '' : String(cellValue);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    ).join('\n');

    return `${csvHeaders}\n${csvRows}`;
  };

  const handleDownload = () => {
    const csvData = convertToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.download = `datos-hoja-calculo-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-800 shadow-lg rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300">
            <tr>
              {headers.map(header => (
                <th key={header} scope="col" className="px-6 py-3 tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                {headers.map(header => (
                  <td key={`${rowIndex}-${header}`} className="px-6 py-4 whitespace-nowrap">
                    {String(row[header])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       <button id="download-csv-btn" onClick={handleDownload} style={{ display: 'none' }}>Descargar</button>
    </div>
  );
};

export default DataTable;