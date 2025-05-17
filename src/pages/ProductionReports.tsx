
import React, { useState, useEffect } from 'react';
import { format, parseISO, isAfter, isBefore, isEqual } from 'date-fns';
import { Download, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import AppLayout from '@/components/layout/AppLayout';
import { useProduction } from '@/contexts/ProductionContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// List of employees - same as in SupervisorDashboard
const EMPLOYEES = [
  { id: 1, name: 'John Smith' },
  { id: 2, name: 'Jane Doe' },
  { id: 3, name: 'Bob Johnson' },
  { id: 4, name: 'Alice Williams' },
];

const ProductionReports: React.FC = () => {
  const { getAllAssignments, getMachineOptions } = useProduction();
  const [allAssignments, setAllAssignments] = useState(getAllAssignments());
  const [filteredAssignments, setFilteredAssignments] = useState(getAllAssignments());
  
  // Filter states
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedShift, setSelectedShift] = useState<string>("all");
  const [selectedMachine, setSelectedMachine] = useState<string>("all");

  const machineOptions = getMachineOptions();

  // Pending submissions (employees who haven't submitted for today)
  const [pendingSubmissions, setPendingSubmissions] = useState<string[]>([]);

  useEffect(() => {
    // Calculate pending submissions
    const today = new Date().toISOString().split('T')[0];
    
    const pendingEmployees = EMPLOYEES.filter(employee => {
      const employeeAssignments = allAssignments.filter(a => 
        a.employeeId === employee.id && 
        a.date === today
      );
      
      // Check if any assignments are not completed
      return employeeAssignments.some(assignment => !assignment.completed);
    }).map(e => e.name);
    
    setPendingSubmissions(pendingEmployees);
  }, [allAssignments]);

  // Apply filters to the assignments
  useEffect(() => {
    let filtered = [...allAssignments];
    
    // Date range filter
    if (startDate) {
      filtered = filtered.filter(a => {
        const assignmentDate = parseISO(a.date);
        return isAfter(assignmentDate, startDate) || isEqual(assignmentDate, startDate);
      });
    }
    
    if (endDate) {
      filtered = filtered.filter(a => {
        const assignmentDate = parseISO(a.date);
        return isBefore(assignmentDate, endDate) || isEqual(assignmentDate, endDate);
      });
    }
    
    // Employee filter
    if (selectedEmployee !== "all") {
      const employeeId = parseInt(selectedEmployee);
      filtered = filtered.filter(a => a.employeeId === employeeId);
    }
    
    // Shift filter
    if (selectedShift !== "all") {
      filtered = filtered.filter(a => a.shift === selectedShift);
    }
    
    // Machine filter
    if (selectedMachine !== "all") {
      filtered = filtered.filter(a => a.machineNo === selectedMachine);
    }
    
    // Only show completed assignments (with submission data)
    filtered = filtered.filter(a => a.completed);
    
    setFilteredAssignments(filtered);
  }, [allAssignments, startDate, endDate, selectedEmployee, selectedShift, selectedMachine]);

  // Function to reset filters
  const resetFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedEmployee("all");
    setSelectedShift("all");
    setSelectedMachine("all");
  };

  // Function to download report as CSV
  const downloadCSV = () => {
    // CSV Header
    let csvContent = "Employee Name,Date,Shift,Machine No,Process,Target Quantity,Achieved Quantity,Rejected Quantity,Reason for Less,Total Work Hours\n";
    
    // Add each row of data
    filteredAssignments.forEach(assignment => {
      const row = [
        assignment.employeeName,
        new Date(assignment.date).toLocaleDateString(),
        assignment.shift,
        assignment.machineNo,
        assignment.process,
        assignment.targetQty,
        assignment.achievedQty || 0,
        assignment.rejectedQty || 0,
        `"${assignment.reasonForLess || ''}"`,
        assignment.totalWorkHours || 0
      ].join(',');
      
      csvContent += row + "\n";
    });
    
    // Create a download link
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `production_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    // Download the CSV file
    link.click();
    document.body.removeChild(link);
    
    toast.success("Report downloaded successfully");
  };

  return (
    <AppLayout requiredRoles={['Supervisor']}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Production Reports</h1>
          <Button onClick={downloadCSV} className="w-full md:w-auto" disabled={filteredAssignments.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Download as CSV
          </Button>
        </div>

        {/* Pending Submissions Alert */}
        {pendingSubmissions.length > 0 && (
          <Card className="bg-amber-50 border-amber-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-800">Pending Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-700 mb-2">The following employees have not submitted reports for today's shift:</p>
              <ul className="list-disc pl-5 text-amber-800">
                {pendingSubmissions.map(name => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" /> Filter Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <DatePicker selected={startDate} onSelect={setStartDate} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <DatePicker selected={endDate} onSelect={setEndDate} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Employee</label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {EMPLOYEES.map(employee => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Shift</label>
                <Select value={selectedShift} onValueChange={setSelectedShift}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Shifts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Shifts</SelectItem>
                    <SelectItem value="Morning">Morning</SelectItem>
                    <SelectItem value="Evening">Evening</SelectItem>
                    <SelectItem value="Night">Night</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Machine</label>
                <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Machines" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Machines</SelectItem>
                    {machineOptions.map(machine => (
                      <SelectItem key={machine} value={machine}>
                        {machine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button variant="outline" onClick={resetFilters} className="w-full">
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Production Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Machine No.</TableHead>
                    <TableHead>Process</TableHead>
                    <TableHead className="text-right">TRG QTY</TableHead>
                    <TableHead className="text-right">ACH QTY</TableHead>
                    <TableHead className="text-right">REJ QTY</TableHead>
                    <TableHead>Reason for Less</TableHead>
                    <TableHead className="text-right">Work Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.length > 0 ? (
                    filteredAssignments.map((assignment) => {
                      const isTargetMet = (assignment.achievedQty || 0) >= assignment.targetQty;
                      
                      return (
                        <TableRow 
                          key={assignment.id}
                          className={isTargetMet ? 'bg-green-50' : 'bg-red-50'}
                        >
                          <TableCell className="font-medium">{assignment.employeeName}</TableCell>
                          <TableCell>{new Date(assignment.date).toLocaleDateString()}</TableCell>
                          <TableCell>{assignment.shift}</TableCell>
                          <TableCell>{assignment.machineNo}</TableCell>
                          <TableCell>{assignment.process}</TableCell>
                          <TableCell className="text-right">{assignment.targetQty}</TableCell>
                          <TableCell className="text-right font-medium">
                            {assignment.achievedQty || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            {assignment.rejectedQty || 0}
                          </TableCell>
                          <TableCell>
                            {!isTargetMet && (
                              <span className="text-red-600 font-medium">
                                {assignment.reasonForLess || 'No reason provided'}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {assignment.totalWorkHours || 'N/A'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                        No reports match the current filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ProductionReports;
