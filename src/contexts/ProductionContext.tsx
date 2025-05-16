
import React, { createContext, useState, useContext, useEffect } from 'react';

export interface Assignment {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  shift: string;
  size: string;
  machineNo: string;
  process: string;
  targetQty: number;
  achievedQty?: number;
  rejectedQty?: number;
  reasonForLess?: string;
  totalWorkHours?: number;
  completed: boolean;
  createdAt: string;
}

interface ProductionContextType {
  assignments: Assignment[];
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt' | 'completed'>) => void;
  updateAssignment: (id: number, data: Partial<Assignment>) => void;
  getEmployeeAssignments: (employeeId: number) => Assignment[];
  getAllAssignments: () => Assignment[];
  getMachineOptions: () => string[];
  getProcessOptions: () => string[];
  getSizeOptions: () => string[];
}

const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 1,
    employeeId: 1,
    employeeName: 'John Smith',
    date: '2025-05-15',
    shift: 'Morning',
    size: 'Large',
    machineNo: 'MC-101',
    process: 'Assembly',
    targetQty: 150,
    achievedQty: 145,
    rejectedQty: 2,
    reasonForLess: 'Material shortage',
    totalWorkHours: 7.5,
    completed: true,
    createdAt: '2025-05-14T08:00:00Z'
  },
  {
    id: 2,
    employeeId: 2,
    employeeName: 'Jane Doe',
    date: '2025-05-15',
    shift: 'Evening',
    size: 'Medium',
    machineNo: 'MC-102',
    process: 'Packaging',
    targetQty: 200,
    achievedQty: 210,
    rejectedQty: 0,
    totalWorkHours: 8,
    completed: true,
    createdAt: '2025-05-14T14:00:00Z'
  },
  {
    id: 3,
    employeeId: 1,
    employeeName: 'John Smith',
    date: '2025-05-16',
    shift: 'Morning',
    size: 'Small',
    machineNo: 'MC-103',
    process: 'Fabrication',
    targetQty: 100,
    completed: false,
    createdAt: '2025-05-15T09:30:00Z'
  }
];

const ProductionContext = createContext<ProductionContextType | null>(null);

export const ProductionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    // Check for saved assignments on mount
    const savedAssignments = localStorage.getItem('productionSystemAssignments');
    if (savedAssignments) {
      setAssignments(JSON.parse(savedAssignments));
    } else {
      // Initialize with mock data
      setAssignments(INITIAL_ASSIGNMENTS);
      localStorage.setItem('productionSystemAssignments', JSON.stringify(INITIAL_ASSIGNMENTS));
    }
  }, []);

  // Save to localStorage whenever assignments change
  useEffect(() => {
    localStorage.setItem('productionSystemAssignments', JSON.stringify(assignments));
  }, [assignments]);

  const addAssignment = (assignment: Omit<Assignment, 'id' | 'createdAt' | 'completed'>) => {
    const newAssignment: Assignment = {
      ...assignment,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      completed: false
    };
    
    setAssignments(prev => [...prev, newAssignment]);
  };

  const updateAssignment = (id: number, data: Partial<Assignment>) => {
    setAssignments(prev =>
      prev.map(assignment =>
        assignment.id === id ? { ...assignment, ...data } : assignment
      )
    );
  };

  const getEmployeeAssignments = (employeeId: number) => {
    return assignments.filter(assignment => assignment.employeeId === employeeId);
  };

  const getAllAssignments = () => {
    return assignments;
  };

  const getMachineOptions = () => {
    return ['MC-101', 'MC-102', 'MC-103', 'MC-104', 'MC-105'];
  };

  const getProcessOptions = () => {
    return ['Assembly', 'Packaging', 'Fabrication', 'Testing', 'Painting'];
  };

  const getSizeOptions = () => {
    return ['Small', 'Medium', 'Large', 'Extra Large'];
  };

  return (
    <ProductionContext.Provider
      value={{
        assignments,
        addAssignment,
        updateAssignment,
        getEmployeeAssignments,
        getAllAssignments,
        getMachineOptions,
        getProcessOptions,
        getSizeOptions
      }}
    >
      {children}
    </ProductionContext.Provider>
  );
};

export const useProduction = () => {
  const context = useContext(ProductionContext);
  if (!context) {
    throw new Error('useProduction must be used within a ProductionProvider');
  }
  return context;
};
