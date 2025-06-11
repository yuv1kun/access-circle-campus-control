
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, User, Download, FileText } from 'lucide-react';
import { useHostelData } from '@/hooks/useHostelData';
import { exportToCSV, exportToPDF, getDateRangeFilter } from '@/utils/exportUtils';
import HostelSearch from '@/components/HostelSearch';
import HostelNFCScanner from '@/components/HostelNFCScanner';
import MobileHeader from '@/components/MobileHeader';
import { useIsMobile } from '@/hooks/use-mobile';

interface HostelDashboardProps {
  onLogout: () => void;
}

const HostelDashboard = ({ onLogout }: HostelDashboardProps) => {
  const { entries, lateEntries, stats, isLoading, error } = useHostelData();
  const isMobile = useIsMobile();

  const handleExportCSV = () => {
    const exportData = entries.map(entry => ({
      'Log ID': entry.log_id,
      'Student Name': entry.student?.name || 'Unknown',
      'USN': entry.student?.usn || 'Unknown',
      'Entry Time': entry.entry_time ? new Date(entry.entry_time).toLocaleString() : 'N/A',
      'Exit Time': entry.exit_time ? new Date(entry.exit_time).toLocaleString() : 'N/A',
      'Date': entry.log_date,
      'Reader ID': entry.reader_id || 'N/A',
      'Status': entry.entry_time && new Date(entry.entry_time).getHours() >= 22 ? 'Late' : 'On Time'
    }));
    
    exportToCSV(exportData, `hostel-access-log-${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportPDF = () => {
    const exportData = entries.map(entry => ({
      'Student Name': entry.student?.name || 'Unknown',
      'USN': entry.student?.usn || 'Unknown',
      'Entry Time': entry.entry_time ? new Date(entry.entry_time).toLocaleString() : 'N/A',
      'Exit Time': entry.exit_time ? new Date(entry.exit_time).toLocaleString() : 'N/A',
      'Status': entry.entry_time && new Date(entry.entry_time).getHours() >= 22 ? 'Late' : 'On Time'
    }));
    
    exportToPDF(exportData, `hostel-access-report-${new Date().toISOString().split('T')[0]}`);
  };

  const getTimeBadge = (entry: any) => {
    if (!entry.entry_time) return null;
    const isLate = new Date(entry.entry_time).getHours() >= 22;
    return (
      <Badge variant={isLate ? 'destructive' : 'default'}>
        {isLate ? 'LATE' : 'ON TIME'}
      </Badge>
    );
  };

  const getAccessType = (entry: any) => {
    if (entry.entry_time && entry.exit_time) return 'In/Out';
    if (entry.entry_time) return 'Check-In';
    if (entry.exit_time) return 'Check-Out';
    return 'Unknown';
  };

  const headerActions = [
    {
      label: 'Export CSV',
      onClick: handleExportCSV,
      icon: <Download className="w-4 h-4 mr-2" />
    },
    {
      label: 'Export PDF',
      onClick: handleExportPDF,
      icon: <FileText className="w-4 h-4 mr-2" />
    }
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Database Connection Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Unable to connect to the hostel database. Please check your connection and try again.</p>
            <Button onClick={() => window.location.reload()} className="w-full">Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100">
      <MobileHeader
        title="Hostel Admin Dashboard"
        subtitle="AccessCircle - Residential Management"
        backgroundColor="bg-red-900"
        textColor="text-white"
        actions={headerActions}
        onLogout={onLogout}
      />

      <div className={`container mx-auto p-4 sm:p-6 grid grid-cols-1 gap-4 sm:gap-6 ${isMobile ? 'max-w-full' : 'lg:grid-cols-3'}`}>
        {/* NFC Scanning Section */}
        <div className={isMobile ? 'order-1' : 'lg:col-span-2'}>
          <HostelNFCScanner />
        </div>

        {/* Quick Search */}
        <div className={isMobile ? 'order-2' : 'lg:col-span-1'}>
          <HostelSearch />
        </div>

        {/* Late Entries Alert */}
        <Card className={isMobile ? 'order-3' : 'lg:col-span-1'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 text-base sm:text-lg">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              Late Entries ({lateEntries.length})
            </CardTitle>
            <CardDescription className="text-sm">Post-curfew arrivals requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Loading late entries...</p>
                </div>
              ) : lateEntries.length > 0 ? (
                lateEntries.map((entry) => (
                  <div key={entry.log_id} className="p-3 border border-red-200 rounded bg-red-50">
                    <p className="font-medium text-sm">{entry.student?.name || 'Unknown Student'}</p>
                    <p className="text-xs text-gray-600">
                      {entry.student?.usn || 'Unknown USN'} • {entry.entry_time ? new Date(entry.entry_time).toLocaleString() : 'No timestamp'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No late entries today</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* All Entries Log */}
        <Card className={isMobile ? 'order-4 col-span-1' : 'lg:col-span-2'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              Entry/Exit Log
            </CardTitle>
            <CardDescription className="text-sm">Complete hostel access history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">Loading hostel entries...</p>
                </div>
              ) : entries.length > 0 ? (
                entries.map((entry) => (
                  <div 
                    key={entry.log_id} 
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      entry.entry_time && new Date(entry.entry_time).getHours() >= 22
                        ? 'border-red-200 bg-red-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <User className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">{entry.student?.name || 'Unknown Student'}</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {entry.student?.usn || 'Unknown USN'} • {getAccessType(entry)}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {entry.entry_time && `In: ${new Date(entry.entry_time).toLocaleString()}`}
                          {entry.entry_time && entry.exit_time && ' • '}
                          {entry.exit_time && `Out: ${new Date(entry.exit_time).toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                      {getTimeBadge(entry)}
                      <span className="text-xs text-gray-400 truncate max-w-20">
                        {entry.reader_id || 'Unknown Reader'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hostel entries found</p>
                  <p className="text-sm text-gray-400">Start scanning NFC cards to see entries here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HostelDashboard;
