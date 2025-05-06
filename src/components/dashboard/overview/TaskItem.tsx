
import React from "react";

interface TaskItemProps {
  title: string;
  completed: boolean;
}

const TaskItem = ({ title, completed }: TaskItemProps) => {
  return (
    <div className="flex items-center space-x-3">
      <div className={`h-5 w-5 rounded-full border flex items-center justify-center 
        ${completed 
          ? 'bg-green-500 border-green-500 text-white' 
          : 'border-gray-300'}`}
      >
        {completed && (
          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <span className={`${completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
        {title}
      </span>
    </div>
  );
};

export default TaskItem;
