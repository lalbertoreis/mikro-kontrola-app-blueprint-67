
import React from "react";

const WeekdaysHeader: React.FC = () => {
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  return (
    <>
      {weekdays.map((day, i) => (
        <div key={`header-${i}`} className="text-center text-xs font-medium py-1">
          {day}
        </div>
      ))}
    </>
  );
};

export default WeekdaysHeader;
