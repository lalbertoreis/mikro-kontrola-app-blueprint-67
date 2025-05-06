
import React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  link: string;
}

const StatsCard = ({ title, value, change, icon: Icon, link }: StatsCardProps) => {
  return (
    <Link to={link}>
      <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
            <Icon className="h-4 w-4 text-gray-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{value}</div>
          <p className="text-xs text-gray-500 mt-1">{change}</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default StatsCard;
