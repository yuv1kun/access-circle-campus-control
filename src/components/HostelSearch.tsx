
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, User, Clock } from 'lucide-react';
import { useHostelSearch } from '@/hooks/useHostelData';

const HostelSearch = () => {
  const { searchQuery, setSearchQuery, searchResults, isSearching, searchStudents } = useHostelSearch();
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      searchStudents(debouncedQuery);
    }
  }, [debouncedQuery]);

  const getLastAccess = (student: any) => {
    const logs = student.NFC_Rings?.[0]?.Hostel_Access_Logs || [];
    if (logs.length === 0) return 'No access recorded';
    
    const latest = logs.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
    
    const time = latest.entry_time || latest.exit_time;
    return time ? new Date(time).toLocaleString() : 'No timestamp';
  };

  const getAccessStatus = (student: any) => {
    const logs = student.NFC_Rings?.[0]?.Hostel_Access_Logs || [];
    const todayLogs = logs.filter((log: any) => 
      new Date(log.created_at).toDateString() === new Date().toDateString()
    );
    
    const lastLog = todayLogs.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
    
    if (!lastLog) return { status: 'Unknown', variant: 'secondary' as const };
    
    if (lastLog.entry_time && !lastLog.exit_time) {
      return { status: 'Inside', variant: 'default' as const };
    } else if (lastLog.exit_time) {
      return { status: 'Outside', variant: 'outline' as const };
    }
    
    return { status: 'Unknown', variant: 'secondary' as const };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Student Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by USN, name, or contact..."
              className="pl-10"
            />
          </div>
          
          {isSearching && (
            <div className="text-center py-4 text-sm text-gray-500">
              Searching...
            </div>
          )}
          
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map((student) => {
                const accessStatus = getAccessStatus(student);
                return (
                  <div key={student.usn} className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-8 h-8 text-gray-400" />
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.usn}</p>
                          <p className="text-xs text-gray-500">{student.contact_no}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={accessStatus.variant}>
                          {accessStatus.status}
                        </Badge>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {getLastAccess(student)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {searchQuery && !isSearching && searchResults.length === 0 && (
            <div className="text-center py-4 text-sm text-gray-500">
              No students found matching "{searchQuery}"
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HostelSearch;
