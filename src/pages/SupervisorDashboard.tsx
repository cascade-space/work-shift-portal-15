
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProduction } from '@/contexts/ProductionContext';
import AppLayout from '@/components/layout/AppLayout';
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// List of employees
const EMPLOYEES = [
  { id: 1, name: 'John Smith' },
  { id: 2, name: 'Jane Doe' },
  { id: 3, name: 'Bob Johnson' },
  { id: 4, name: 'Alice Williams' },
];

const SupervisorDashboard: React.FC = () => {
  const { addAssignment, getAllAssignments, getMachineOptions, getProcessOptions, getSizeOptions } = useProduction();
  const [assignments, setAssignments] = useState(getAllAssignments());
  
  // State for the new assignment form
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState({
    employeeId: "",
    date: "",
    shift: "",
    size: "",
    machineNo: "",
    process: "",
    targetQty: ""
  });

  // Options for select fields
  const machineOptions = getMachineOptions();
  const processOptions = getProcessOptions();
  const sizeOptions = getSizeOptions();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      setFormData({
        ...formData,
        date: formattedDate
      });
    } else {
      setFormData({
        ...formData,
        date: ""
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.employeeId || !formData.date || !formData.shift || 
        !formData.size || !formData.machineNo || !formData.process || 
        !formData.targetQty) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Find employee name
    const employee = EMPLOYEES.find(emp => emp.id === parseInt(formData.employeeId));
    if (!employee) {
      toast.error('Invalid employee selected');
      return;
    }

    // Create new assignment
    addAssignment({
      employeeId: parseInt(formData.employeeId),
      employeeName: employee.name,
      date: formData.date,
      shift: formData.shift,
      size: formData.size,
      machineNo: formData.machineNo,
      process: formData.process,
      targetQty: parseInt(formData.targetQty),
      completed: false
    });

    // Update local state
    setAssignments(getAllAssignments());
    
    // Reset form
    setFormData({
      employeeId: "",
      date: "",
      shift: "",
      size: "",
      machineNo: "",
      process: "",
      targetQty: ""
    });
    setSelectedDate(undefined);
    
    toast.success('Task assigned successfully');
  };

  return (
    <AppLayout requiredRoles={['Supervisor']}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Supervisor Dashboard</h1>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignments.filter(a => a.completed).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignments.filter(a => !a.completed).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Assign New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Employee</label>
                  <Select 
                    value={formData.employeeId} 
                    onValueChange={(value) => handleSelectChange('employeeId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEES.map(employee => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <DatePicker 
                    selected={selectedDate} 
                    onSelect={handleDateChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Shift</label>
                  <Select 
                    value={formData.shift} 
                    onValueChange={(value) => handleSelectChange('shift', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Morning">Morning</SelectItem>
                      <SelectItem value="Evening">Evening</SelectItem>
                      <SelectItem value="Night">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Size</label>
                  <Select 
                    value={formData.size} 
                    onValueChange={(value) => handleSelectChange('size', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Size" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizeOptions.map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Machine No.</label>
                  <Select 
                    value={formData.machineNo} 
                    onValueChange={(value) => handleSelectChange('machineNo', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Machine" />
                    </SelectTrigger>
                    <SelectContent>
                      {machineOptions.map(machine => (
                        <SelectItem key={machine} value={machine}>{machine}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Process</label>
                  <Select 
                    value={formData.process} 
                    onValueChange={(value) => handleSelectChange('process', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Process" />
                    </SelectTrigger>
                    <SelectContent>
                      {processOptions.map(process => (
                        <SelectItem key={process} value={process}>{process}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Quantity</label>
                  <Input
                    type="number"
                    name="targetQty"
                    value={formData.targetQty}
                    onChange={handleInputChange}
                    placeholder="Enter target quantity"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit">
                  Assign Task
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Assignments Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Assignments</CardTitle>
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
                    <th className="text-right py-3 px-4 font-medium">Target Qty</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.length > 0 ? (
                    assignments.map((assignment) => (
                      <tr key={assignment.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{assignment.employeeName}</td>
                        <td className="py-3 px-4">{new Date(assignment.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">{assignment.shift}</td>
                        <td className="py-3 px-4">{assignment.machineNo}</td>
                        <td className="py-3 px-4">{assignment.process}</td>
                        <td className="py-3 px-4">{assignment.size}</td>
                        <td className="py-3 px-4 text-right">{assignment.targetQty}</td>
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
                      <td colSpan={8} className="py-6 text-center text-gray-500">
                        No assignments found.
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

export default SupervisorDashboard;
