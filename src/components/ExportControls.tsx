
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, FileText, Table } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToCSV, exportToPDF } from '@/utils/exportUtils';
import type { GateEntry } from '@/hooks/useGateData';

interface ExportControlsProps {
  entries: GateEntry[];
}

const ExportControls = ({ entries }: ExportControlsProps) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const getFilteredEntries = () => {
    if (!startDate && !endDate) return entries;
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.log_date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      if (start && entryDate < start) return false;
      if (end && entryDate > end) return false;
      return true;
    });
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const filteredEntries = getFilteredEntries();
      
      if (filteredEntries.length === 0) {
        toast({
          title: "No Data",
          description: "No entries found for the selected date range",
          variant: "destructive",
        });
        return;
      }

      // Transform gate entries for CSV export
      const csvData = filteredEntries.map(entry => ({
        'Log ID': entry.log_id,
        'Student Name': entry.student?.name || 'Unknown',
        'USN': entry.student?.usn || 'N/A',
        'NFC UID': entry.nfc_uid_scanner,
        'Entry Time': entry.entry_time ? new Date(entry.entry_time).toLocaleString() : 'N/A',
        'Exit Time': entry.exit_time ? new Date(entry.exit_time).toLocaleString() : 'N/A',
        'Log Date': entry.log_date,
        'Status': entry.exit_time ? 'Completed' : 'Active',
        'Duration (hrs)': entry.entry_time && entry.exit_time 
          ? ((new Date(entry.exit_time).getTime() - new Date(entry.entry_time).getTime()) / (1000 * 60 * 60)).toFixed(2)
          : 'N/A'
      }));

      const filename = `gate_entries_${startDate || 'all'}_to_${endDate || 'all'}.csv`;
      exportToCSV(csvData, filename);

      toast({
        title: "Export Successful",
        description: `Exported ${csvData.length} entries to CSV`,
      });
    } catch (error) {
      console.error('CSV export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export data to CSV",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const filteredEntries = getFilteredEntries();
      
      if (filteredEntries.length === 0) {
        toast({
          title: "No Data",
          description: "No entries found for the selected date range",
          variant: "destructive",
        });
        return;
      }

      // Calculate summary statistics
      const totalEntries = filteredEntries.length;
      const activeEntries = filteredEntries.filter(entry => !entry.exit_time).length;
      const completedEntries = filteredEntries.filter(entry => entry.exit_time).length;
      
      const pdfData = {
        title: 'Gate Entry Log Report',
        subtitle: `Generated on ${new Date().toLocaleDateString()}`,
        dateRange: startDate || endDate ? `${startDate || 'Start'} to ${endDate || 'End'}` : 'All Dates',
        summary: {
          'Total Entries': totalEntries,
          'Active Entries': activeEntries,
          'Completed Entries': completedEntries,
          'Average Daily Entries': totalEntries > 0 ? Math.round(totalEntries / Math.max(1, new Set(filteredEntries.map(e => e.log_date)).size)) : 0
        },
        headers: ['Student Name', 'USN', 'Entry Time', 'Exit Time', 'Status'],
        data: filteredEntries.map(entry => [
          entry.student?.name || 'Unknown',
          entry.student?.usn || 'N/A',
          entry.entry_time ? new Date(entry.entry_time).toLocaleString() : 'N/A',
          entry.exit_time ? new Date(entry.exit_time).toLocaleString() : 'N/A',
          entry.exit_time ? 'Completed' : 'Active'
        ])
      };

      const filename = `gate_entries_report_${startDate || 'all'}_to_${endDate || 'all'}.pdf`;
      await exportToPDF(pdfData, filename);

      toast({
        title: "Export Successful",
        description: `Exported ${totalEntries} entries to PDF`,
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export data to PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="font-medium flex items-center gap-2">
        <Download className="w-4 h-4" />
        Export Gate Logs
      </h3>
      
      {/* Date Range Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">Start Date</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">End Date</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Export Summary */}
      <div className="text-sm text-gray-600">
        <p>Records to export: {getFilteredEntries().length}</p>
        {(startDate || endDate) && (
          <p>Date range: {startDate || 'Start'} to {endDate || 'End'}</p>
        )}
      </div>

      {/* Export Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleExportCSV}
          disabled={isExporting || entries.length === 0}
          className="flex-1"
          variant="outline"
        >
          <Table className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
        <Button
          onClick={handleExportPDF}
          disabled={isExporting || entries.length === 0}
          className="flex-1"
          variant="outline"
        >
          <FileText className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>
    </div>
  );
};

export default ExportControls;
