
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProduction } from '@/contexts/ProductionContext';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ClipboardList } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getEmployeeAssignments } = useProduction();
  const navigate = useNavigate();
  
  const [assignments, setAssignments] = useState<any[]>([]);
  
  useEffect(() => {
    if (user?.id) {
      setAssignments(getEmployeeAssignments(user.id));
    }
  }, [user, getEmployeeAssignments]);

  const pendingAssignments = assignments.filter(a => !a.completed);
  const completedAssignments = assignments.filter(a => a.completed);

  const navigateToTasks = () => {
    navigate('/tasks');
  };

  return (
    <AppLayout requiredRoles={['Employee']}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Employee Dashboard</h1>
          <Button onClick={navigateToTasks}>
            <ClipboardList className="mr-2 h-4 w-4" />
            View My Tasks
          </Button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tasks
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
              <div className="text-2xl font-bold">{completedAssignments.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{pendingAssignments.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {assignments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Shift</th>
                      <th className="text-left py-3 px-4 font-medium">Machine</th>
                      <th className="text-left py-3 px-4 font-medium">Process</th>
                      <th className="text-right py-3 px-4 font-medium">Target</th>
                      <th className="text-right py-3 px-4 font-medium">Achieved</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.slice(0, 5).map((assignment) => (
                      <tr key={assignment.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{new Date(assignment.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">{assignment.shift}</td>
                        <td className="py-3 px-4">{assignment.machineNo}</td>
                        <td className="py-3 px-4">{assignment.process}</td>
                        <td className="py-3 px-4 text-right">{assignment.targetQty}</td>
                        <td className="py-3 px-4 text-right">
                          {assignment.achievedQty !== undefined ? assignment.achievedQty : '-'}
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
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-6 text-center text-gray-500">
                No tasks assigned yet.
              </div>
            )}
            
            {assignments.length > 5 && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" onClick={navigateToTasks}>
                  View All Tasks
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Tasks Summary */}
        {pendingAssignments.length > 0 && (
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-800">Action Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-700 mb-4">You have {pendingAssignments.length} pending {pendingAssignments.length === 1 ? 'task' : 'tasks'} that require your attention.</p>
              <Button onClick={navigateToTasks}>
                Update Tasks
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default EmployeeDashboard;
