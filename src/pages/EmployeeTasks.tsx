
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useProduction, Assignment } from '@/contexts/ProductionContext';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';

const EmployeeTasks: React.FC = () => {
  const { user } = useAuth();
  const { getEmployeeAssignments, updateAssignment } = useProduction();
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<Assignment[]>([]);
  const [completedAssignments, setCompletedAssignments] = useState<Assignment[]>([]);
  
  // Form state
  const [currentTask, setCurrentTask] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState({
    achievedQty: '',
    rejectedQty: '',
    reasonForLess: '',
    totalWorkHours: ''
  });
  
  // Initialize assignments
  useEffect(() => {
    if (user?.id) {
      const allAssignments = getEmployeeAssignments(user.id);
      setAssignments(allAssignments);
      setPendingAssignments(allAssignments.filter(a => !a.completed));
      setCompletedAssignments(allAssignments.filter(a => a.completed));
    }
  }, [user, getEmployeeAssignments]);

  const handleTaskSelect = (task: Assignment) => {
    setCurrentTask(task);
    setFormData({
      achievedQty: task.achievedQty?.toString() || '',
      rejectedQty: task.rejectedQty?.toString() || '',
      reasonForLess: task.reasonForLess || '',
      totalWorkHours: task.totalWorkHours?.toString() || ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentTask) return;
    
    // Validate form
    if (!formData.achievedQty || !formData.rejectedQty || !formData.totalWorkHours) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const achievedQty = parseInt(formData.achievedQty);
    const rejectedQty = parseInt(formData.rejectedQty);
    
    // Additional validation
    if (isNaN(achievedQty) || achievedQty < 0) {
      toast.error('Achieved quantity must be a positive number');
      return;
    }
    
    if (isNaN(rejectedQty) || rejectedQty < 0) {
      toast.error('Rejected quantity must be a positive number');
      return;
    }
    
    const totalWorkHours = parseFloat(formData.totalWorkHours);
    if (isNaN(totalWorkHours) || totalWorkHours <= 0) {
      toast.error('Total work hours must be a positive number');
      return;
    }
    
    // If achieved < target and no reason is provided
    if (achievedQty < currentTask.targetQty && !formData.reasonForLess) {
      toast.error('Please provide a reason for less achievement');
      return;
    }
    
    // Update the assignment
    updateAssignment(currentTask.id, {
      achievedQty,
      rejectedQty,
      reasonForLess: formData.reasonForLess,
      totalWorkHours,
      completed: true
    });
    
    // Update local state
    const updatedAssignments = getEmployeeAssignments(user?.id || 0);
    setAssignments(updatedAssignments);
    setPendingAssignments(updatedAssignments.filter(a => !a.completed));
    setCompletedAssignments(updatedAssignments.filter(a => a.completed));
    
    // Reset form
    setCurrentTask(null);
    setFormData({
      achievedQty: '',
      rejectedQty: '',
      reasonForLess: '',
      totalWorkHours: ''
    });
    
    toast.success('Task updated successfully');
  };

  const isReasonRequired = currentTask && 
    formData.achievedQty && 
    parseInt(formData.achievedQty) < currentTask.targetQty;

  return (
    <AppLayout requiredRoles={['Employee']}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <h1 className="text-2xl font-bold">My Tasks</h1>
          
          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                Pending Tasks
                <span className="ml-2 text-sm px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                  {pendingAssignments.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingAssignments.length > 0 ? (
                  pendingAssignments.map((task) => (
                    <div 
                      key={task.id} 
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                        currentTask?.id === task.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                      }`}
                      onClick={() => handleTaskSelect(task)}
                    >
                      <div className="flex justify-between mb-1">
                        <div className="font-medium">{task.process}</div>
                        <div className="text-sm text-gray-500">{new Date(task.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-sm text-gray-500 mb-1">
                        {task.machineNo} • {task.shift} Shift
                      </div>
                      <div className="text-sm font-medium">Target: {task.targetQty} units</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-3 text-gray-500">
                    No pending tasks.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Completed Tasks Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                Completed Tasks
                <span className="ml-2 text-sm px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                  {completedAssignments.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedAssignments.length > 0 ? (
                <div className="space-y-3">
                  {completedAssignments.slice(0, 3).map((task) => (
                    <div key={task.id} className="p-3 rounded-lg border border-gray-200">
                      <div className="flex justify-between mb-1">
                        <div className="font-medium">{task.process}</div>
                        <div className="text-sm text-gray-500">{new Date(task.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-sm text-gray-500 mb-1">
                        {task.machineNo} • {task.shift} Shift
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Target: {task.targetQty}</div>
                        <div>Achieved: {task.achievedQty}</div>
                      </div>
                    </div>
                  ))}
                  
                  {completedAssignments.length > 3 && (
                    <div className="text-center text-sm text-gray-500 mt-2">
                      + {completedAssignments.length - 3} more completed tasks
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-3 text-gray-500">
                  No completed tasks yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          {currentTask ? (
            <Card>
              <CardHeader>
                <CardTitle>Update Task</CardTitle>
                <CardDescription>
                  Fill in the production details for {currentTask.process} on {new Date(currentTask.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} id="taskForm" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Process
                      </label>
                      <Input value={currentTask.process} disabled />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Machine No.
                      </label>
                      <Input value={currentTask.machineNo} disabled />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Target Quantity
                      </label>
                      <Input value={currentTask.targetQty} disabled />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Size
                      </label>
                      <Input value={currentTask.size} disabled />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Achieved Quantity (ACH QTY) *
                      </label>
                      <Input
                        name="achievedQty"
                        type="number"
                        value={formData.achievedQty}
                        onChange={handleInputChange}
                        placeholder="Enter achieved quantity"
                        required
                        min="0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Rejected Quantity *
                      </label>
                      <Input
                        name="rejectedQty"
                        type="number"
                        value={formData.rejectedQty}
                        onChange={handleInputChange}
                        placeholder="Enter rejected quantity"
                        required
                        min="0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Total Work Hours *
                      </label>
                      <Input
                        name="totalWorkHours"
                        type="number"
                        value={formData.totalWorkHours}
                        onChange={handleInputChange}
                        placeholder="Enter total work hours"
                        required
                        min="0.1"
                        step="0.1"
                      />
                    </div>
                  </div>
                  
                  {isReasonRequired && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Reason for Less Achievement *
                      </label>
                      <Textarea
                        name="reasonForLess"
                        value={formData.reasonForLess}
                        onChange={handleInputChange}
                        placeholder="Please explain why the achieved quantity is less than the target"
                        required={isReasonRequired}
                        className="min-h-[80px]"
                      />
                    </div>
                  )}
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentTask(null)}>
                  Cancel
                </Button>
                <Button type="submit" form="taskForm">
                  Submit Report
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-8">
                <h2 className="text-2xl font-semibold mb-2">No Task Selected</h2>
                <p className="text-gray-500 mb-6">
                  Select a task from the left panel to update its progress.
                </p>
                {pendingAssignments.length === 0 && (
                  <div className="bg-green-50 text-green-700 p-4 rounded-lg">
                    All tasks have been completed. Great job!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default EmployeeTasks;
