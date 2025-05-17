
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useProduction } from '@/contexts/ProductionContext';
import AppLayout from '@/components/layout/AppLayout';
import { CalendarIcon, FilterIcon } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

interface FilterParams {
  date: string | null;
  shift: string | null;
  machineNo: string | null;
  employeeName: string | null;
}

const AdminDashboard: React.FC = () => {
  const { getAllAssignments, getMachineOptions } = useProduction();
  const [filters, setFilters] = useState<FilterParams>({
    date: null,
    shift: null,
    machineNo: null,
    employeeName: null,
  });

  const [filteredAssignments, setFilteredAssignments] = useState(getAllAssignments());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Machine options for filter
  const machineOptions = getMachineOptions();

  // Update filtered data whenever assignments or filters change
  useEffect(() => {
    let results = getAllAssignments();

    if (filters.date) {
      results = results.filter(assignment => assignment.date === filters.date);
    }

    if (filters.shift) {
      results = results.filter(assignment => 
        assignment.shift.toLowerCase() === filters.shift?.toLowerCase()
      );
    }

    if (filters.machineNo) {
      results = results.filter(assignment => 
        assignment.machineNo === filters.machineNo
      );
    }

    if (filters.employeeName) {
      const searchTerm = filters.employeeName.toLowerCase();
      results = results.filter(assignment => 
        assignment.employeeName.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredAssignments(results);
  }, [filters, getAllAssignments]);

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      setFilters(prev => ({ ...prev, date: formattedDate }));
    } else {
      setFilters(prev => ({ ...prev, date: null }));
    }
  };

  const clearFilters = () => {
    setFilters({
      date: null,
      shift: null,
      machineNo: null,
      employeeName: null,
    });
    setSelectedDate(undefined);
  };

  // Calculate statistics for dashboard
  const completedAssignments = filteredAssignments.filter(a => a.completed);
  const totalTargetQty = filteredAssignments.reduce((sum, a) => sum + a.targetQty, 0);
  const totalAchievedQty = completedAssignments.reduce((sum, a) => sum + (a.achievedQty || 0), 0);
  const totalRejectedQty = completedAssignments.reduce((sum, a) => sum + (a.rejectedQty || 0), 0);
  
  const completionRate = completedAssignments.length > 0
    ? Math.round((completedAssignments.length / filteredAssignments.length) * 100)
    : 0;

  return (
    <AppLayout requiredRoles={['Admin']}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Production Dashboard</h1>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredAssignments.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {completionRate}% completion rate
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Target Quantity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTargetQty}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total production goal
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Achieved Quantity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAchievedQty}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalTargetQty > 0 ? Math.round((totalAchievedQty / totalTargetQty) * 100) : 0}% of target
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rejected Quantity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRejectedQty}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalAchievedQty > 0 ? Math.round((totalRejectedQty / totalAchievedQty) * 100) : 0}% rejection rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FilterIcon className="w-5 h-5 mr-2" />
              Filter Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Date</label>
                <div className="flex items-center">
                  <DatePicker 
                    selected={selectedDate} 
                    onSelect={handleDateChange}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Shift</label>
                <Select
                  value={filters.shift || ""}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, shift: value || null }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Shifts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-shifts">All Shifts</SelectItem>
                    <SelectItem value="Morning">Morning</SelectItem>
                    <SelectItem value="Evening">Evening</SelectItem>
                    <SelectItem value="Night">Night</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Machine</label>
                <Select
                  value={filters.machineNo || ""}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, machineNo: value || null }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Machines" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-machines">All Machines</SelectItem>
                    {machineOptions.map(machine => (
                      <SelectItem key={machine} value={machine}>{machine}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Employee</label>
                <Input 
                  placeholder="Search employee name"
                  value={filters.employeeName || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, employeeName: e.target.value || null }))}
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={clearFilters} className="ml-2">
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Employee</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Shift</th>
                    <th className="text-left py-3 px-4 font-medium">Machine</th>
                    <th className="text-left py-3 px-4 font-medium">Process</th>
                    <th className="text-left py-3 px-4 font-medium">Size</th>
                    <th className="text-right py-3 px-4 font-medium">Target</th>
                    <th className="text-right py-3 px-4 font-medium">Achieved</th>
                    <th className="text-right py-3 px-4 font-medium">Rejected</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.length > 0 ? (
                    filteredAssignments.map((assignment) => (
                      <tr key={assignment.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{assignment.employeeName}</td>
                        <td className="py-3 px-4">{new Date(assignment.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">{assignment.shift}</td>
                        <td className="py-3 px-4">{assignment.machineNo}</td>
                        <td className="py-3 px-4">{assignment.process}</td>
                        <td className="py-3 px-4">{assignment.size}</td>
                        <td className="py-3 px-4 text-right">{assignment.targetQty}</td>
                        <td className="py-3 px-4 text-right">
                          {assignment.achievedQty !== undefined ? assignment.achievedQty : '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {assignment.rejectedQty !== undefined ? assignment.rejectedQty : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            assignment.completed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {assignment.completed ? 'Completed' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-6 text-center text-gray-500">
                        No assignments found matching the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
