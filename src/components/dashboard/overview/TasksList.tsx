
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TaskItem from "./TaskItem";

interface Task {
  title: string;
  completed: boolean;
}

interface TasksListProps {
  tasks: Task[];
}

const TasksList = ({ tasks }: TasksListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tarefas</CardTitle>
        <CardDescription>Suas tarefas pendentes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <TaskItem key={index} title={task.title} completed={task.completed} />
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-kontrola-600 hover:bg-kontrola-700">Adicionar Tarefa</Button>
      </CardFooter>
    </Card>
  );
};

export default TasksList;
