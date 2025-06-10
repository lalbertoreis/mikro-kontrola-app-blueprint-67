
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Service } from "@/types/service";
import { Employee } from "@/types/employee";
import BookingCalendar from "./BookingCalendar";
import EmployeeSelector from "./EmployeeSelector";
import PeriodSelector from "./PeriodSelector";
import TimeSlotSelector from "./TimeSlotSelector";
import ServiceInfo from "./ServiceInfo";
import BookingSummary from "./BookingSummary";
import { useServicePackages } from "@/hooks/useServicePackages";

interface BookingDateTimeStepProps {
  service: Service;
  employees: Employee[];
  onNextStep: () => void;
  onBookingConfirm: (employeeId: string, date: Date, time: string) => void;
  themeColor?: string;
  businessSlug?: string;
}

const BookingDateTimeStep: React.FC<BookingDateTimeStepProps> = ({
  service,
  employees,
  onNextStep,
  onBookingConfirm,
  themeColor = "#9b87f5", // Default color
  businessSlug
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<"morning" | "afternoon" | "evening" | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  
  const { packages } = useServicePackages();

  useEffect(() => {
    console.log("BookingDateTimeStep - All employees:", employees?.length || 0);
    console.log("BookingDateTimeStep - Service:", service);
    
    if (!employees || !service) {
      console.log("Missing employees or service data");
      setAvailableEmployees([]);
      return;
    }
    
    // Check if this is a package service (has package: prefix in id)
    const isPackageService = typeof service.id === 'string' && service.id.startsWith('package:');
    
    if (isPackageService) {
      // For package services, find employees who have ALL services in the package
      const packageId = service.id.replace('package:', '');
      const packageData = packages.find(pkg => pkg.id === packageId);
      
      if (packageData) {
        console.log("Looking for employees that can provide package:", packageData.name, "with services:", packageData.services);
        
        const filtered = employees.filter((emp) => {
          if (!emp.services || !Array.isArray(emp.services)) {
            console.log(`Employee ${emp.name} has no services array`);
            return false;
          }
          
          // Check if employee has ALL services required for this package
          const hasAllServices = packageData.services.every(requiredServiceId => {
            return emp.services.some((empService) => {
              const empServiceId = typeof empService === 'object' ? (empService as any).id : empService;
              return empServiceId === requiredServiceId;
            });
          });
          
          console.log(`Employee ${emp.name} can provide package ${packageData.name}: ${hasAllServices}`);
          return hasAllServices;
        });
        
        console.log("BookingDateTimeStep - Employees who can provide package:", filtered);
        setAvailableEmployees(filtered);
      }
    } else {
      // For individual services, use existing logic
      const serviceId = typeof service.id === 'object' ? (service.id as any).id : service.id;
      console.log("Looking for employees that can provide service ID:", serviceId);
      
      const filtered = employees.filter((emp) => {
        if (!emp.services || !Array.isArray(emp.services)) {
          console.log(`Employee ${emp.name} has no services array`);
          return false;
        }
        
        const canProvideService = emp.services.some((s) => {
          const empServiceId = typeof s === 'object' ? (s as any).id : s;
          const match = empServiceId === serviceId;
          console.log(`Checking if ${empServiceId} === ${serviceId}: ${match}`);
          return match;
        });
        
        console.log(`Employee ${emp.name} (${emp.id}) can provide service ${serviceId}: ${canProvideService}`);
        return canProvideService;
      });
      
      console.log("BookingDateTimeStep - Filtered employees:", filtered);
      setAvailableEmployees(filtered);
    }
    
    // Reset selections when employees or service change
    setSelectedEmployee(null);
    setSelectedDate(null);
    setSelectedPeriod(null);
    setSelectedTime(null);
  }, [employees, service, packages]);

  const handleNextStep = () => {
    if (selectedEmployee && selectedDate && selectedTime) {
      onBookingConfirm(selectedEmployee.id, selectedDate, selectedTime);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4" style={{ color: themeColor }}>
        {service.name}
      </h2>

      <ServiceInfo service={service} />

      <div className="space-y-6">
        <EmployeeSelector
          employees={availableEmployees}
          selectedEmployee={selectedEmployee}
          onSelectEmployee={setSelectedEmployee}
          themeColor={themeColor}
        />

        {selectedEmployee && (
          <BookingCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            serviceId={service.id}
            employeeId={selectedEmployee.id}
            themeColor={themeColor}
            businessSlug={businessSlug}
          />
        )}

        {selectedDate && (
          <PeriodSelector
            selectedPeriod={selectedPeriod}
            onSelectPeriod={setSelectedPeriod}
            themeColor={themeColor}
          />
        )}

        {selectedDate && selectedPeriod && (
          <TimeSlotSelector
            selectedDate={selectedDate}
            period={selectedPeriod}
            selectedTime={selectedTime}
            onSelectTime={setSelectedTime}
            serviceId={service.id}
            employeeId={selectedEmployee?.id || ""}
            themeColor={themeColor}
            businessSlug={businessSlug}
          />
        )}

        <BookingSummary
          service={service}
          selectedEmployee={selectedEmployee}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onNextStep={handleNextStep}
          themeColor={themeColor}
        />
      </div>
    </div>
  );
};

export default BookingDateTimeStep;
