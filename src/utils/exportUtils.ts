
import { BookTransaction, LibraryEntry } from '@/hooks/useLibraryData';

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        return typeof value === 'string' && (value.includes(',') || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (data: BookTransaction[] | LibraryEntry[] | any[], filename: string) => {
  // Simple PDF generation using HTML
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  // Determine report type based on data structure
  const isHostelData = data.length > 0 && 'Student Name' in data[0];
  const reportTitle = isHostelData ? 'Hostel Access Report' : 'Library Report';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f2f2f2; font-weight: bold; }
          h1 { color: #333; margin-bottom: 10px; }
          .header-info { margin-bottom: 20px; color: #666; }
          .late-entry { background-color: #fee; }
          .status-late { color: #dc2626; font-weight: bold; }
          .status-ontime { color: #16a34a; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>AccessCircle ${reportTitle}</h1>
        <div class="header-info">
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Total Records: ${data.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              ${Object.keys(data[0] || {}).map(key => `<th>${key}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => {
              const isLate = row.Status === 'Late';
              return `<tr class="${isLate ? 'late-entry' : ''}">
                ${Object.values(row).map((value, index) => {
                  const key = Object.keys(row)[index];
                  const cellClass = key === 'Status' ? (value === 'Late' ? 'status-late' : 'status-ontime') : '';
                  return `<td class="${cellClass}">${value || ''}</td>`;
                }).join('')}
              </tr>`;
            }).join('')}
          </tbody>
        </table>
        ${isHostelData ? `
          <div style="margin-top: 30px; page-break-before: always;">
            <h2>Summary Statistics</h2>
            <p><strong>Total Entries:</strong> ${data.length}</p>
            <p><strong>Late Entries:</strong> ${data.filter(row => row.Status === 'Late').length}</p>
            <p><strong>On-Time Entries:</strong> ${data.filter(row => row.Status === 'On Time').length}</p>
          </div>
        ` : ''}
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
};

export const getDateRangeFilter = (data: any[], startDate?: string, endDate?: string) => {
  if (!startDate && !endDate) return data;

  return data.filter(item => {
    const itemDate = new Date(item.created_at || item.issue_date || item.entry_time || item.log_date);
    const start = startDate ? new Date(startDate) : new Date('1900-01-01');
    const end = endDate ? new Date(endDate) : new Date('2100-12-31');
    
    return itemDate >= start && itemDate <= end;
  });
};

export const generateHostelReport = (entries: any[]) => {
  const today = new Date().toDateString();
  const todayEntries = entries.filter(entry => 
    new Date(entry.created_at).toDateString() === today
  );
  
  const lateEntries = todayEntries.filter(entry => 
    entry.entry_time && new Date(entry.entry_time).getHours() >= 22
  );
  
  const currentOccupancy = todayEntries.filter(entry => 
    entry.entry_time && !entry.exit_time
  ).length;
  
  return {
    totalEntries: todayEntries.length,
    lateEntries: lateEntries.length,
    currentOccupancy,
    onTimePercentage: todayEntries.length > 0 
      ? Math.round(((todayEntries.length - lateEntries.length) / todayEntries.length) * 100)
      : 100
  };
};
