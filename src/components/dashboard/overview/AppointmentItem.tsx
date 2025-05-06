
import React from "react";

interface AppointmentItemProps {
  client: string;
  service: string;
  time: string;
  date: string;
}

const AppointmentItem = ({ client, service, time, date }: AppointmentItemProps) => {
  return (
    <div className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
      <div className="flex items-center space-x-3">
        <div className="bg-kontrola-100 text-kontrola-700 h-10 w-10 rounded-full flex items-center justify-center">
          {client.charAt(0)}
        </div>
        <div>
          <p className="font-medium">{client}</p>
          <p className="text-sm text-gray-500">{service}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium">{time}</p>
        <p className="text-sm text-gray-500">{date}</p>
      </div>
    </div>
  );
};

export default AppointmentItem;
