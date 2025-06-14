
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
import MobileBookingSteps from "./MobileBookingSteps";
import { useServicePackages } from "@/hooks/useServicePackages";
import { useIsMobile } from "@/hooks/use-mobile";

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
  themeColor = "#9b87f5",
  businessSlug
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<"morning" | "afternoon" | "evening" | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const isMobile = useIsMobile();
  
  const { packages, isLoading: isPackagesLoading } = useServicePackages();

  useEffect(() => {
    setIsLoadingEmployees(true);
    
    if (!employees || !service) {
      setAvailableEmployees([]);
      setIsLoadingEmployees(false);
      return;
    }
    
    // Check if this is a package service (has package: prefix in id)
    const isPackageService = typeof service.id === 'string' && service.id.startsWith('package:');
    
    if (isPackageService) {
      // For package services, find employees who have ALL services in the package
      const packageId = service.id.replace('package:', '');
      const packageData = packages.find(pkg => pkg.id === packageId);
      
      if (packageData && !isPackagesLoading) {
        const filtered = employees.filter((emp) => {
          if (!emp.services || !Array.isArray(emp.services)) {
            return false;
          }
          
          // Check if employee has ALL services required for this package
          const hasAllServices = packageData.services.every(requiredServiceId => {
            return emp.services.some((empService) => {
              const empServiceId = typeof empService === 'object' ? (empService as any).id : empService;
              return empServiceId === requiredServiceId;
            });
          });
          
          return hasAllServices;
        });
        
        setAvailableEmployees(filtered);
        setIsLoadingEmployees(false);
      } else if (isPackagesLoading) {
        // Still loading packages, wait
        return;
      } else {
        // Package not found
        setAvailableEmployees([]);
        setIsLoadingEmployees(false);
      }
    } else {
      // For individual services, use existing logic
      const serviceId = typeof service.id === 'object' ? (service.id as any).id : service.id;
      
      const filtered = employees.filter((emp) => {
        if (!emp.services || !Array.isArray(emp.services)) {
          return false;
        }
        
        const canProvideService = emp.services.some((s) => {
          const empServiceId = typeof s === 'object' ? (s as any).id : s;
          return empServiceId === serviceId;
        });
        
        return canProvideService;
      });
      
      setAvailableEmployees(filtered);
      setIsLoadingEmployees(false);
    }
    
    // Reset selections when employees or service change
    setSelectedEmployee(null);
    setSelectedDate(null);
    setSelectedPeriod(null);
    setSelectedTime(null);
  }, [employees, service, packages, isPackagesLoading]);

  const handleNextStep = () => {
    if (selectedEmployee && selectedDate && selectedTime) {
      onBookingConfirm(selectedEmployee.id, selectedDate, selectedTime);
    }
  };

  // Show loading state while determining available employees
  if (isLoadingEmployees) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4" style={{ color: themeColor }}>
          {service.name}
        </h2>
        <ServiceInfo service={service} />
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Carregando profissionais disponíveis...</p>
          <div className="flex gap-2">
            {[1, 2].map((item) => (
              <div 
                key={item} 
                className="w-24 h-10 bg-gray-200 animate-pulse rounded-md"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Se for mobile, usar o layout de etapas
  if (isMobile) {
    return (
      <MobileBookingSteps
        service={service}
        employees={availableEmployees}
        onBookingConfirm={onBookingConfirm}
        themeColor={themeColor}
        businessSlug={businessSlug}
      />
    );
  }

  // Layout desktop (mantém o código existente)
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
