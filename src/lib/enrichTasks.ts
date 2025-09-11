import { Task, TaskRequirement } from "../types/TaskTypes";

function buildDependencyMap(tasks: Task[]): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  tasks.forEach(task => {
    if (task.taskRequirements) {
      task.taskRequirements.forEach(req => {
        if (req.task && req.task.name) {
          if (!map[req.task.name]) map[req.task.name] = [];
          map[req.task.name].push(task.name);
        }
      });
    }
  });
  return map;
}

function countTasksBehind(taskName: string, dependencyMap: Record<string, string[]>, visited = new Set<string>()): number {
  if (visited.has(taskName)) return 0;
  visited.add(taskName);
  const dependents = dependencyMap[taskName] || [];
  let count = dependents.length;
  dependents.forEach(dep => {
    count += countTasksBehind(dep, dependencyMap, visited);
  });
  return count;
}

export function enrichTasksWithBehindCount(tasks: Task[]): Task[] {
  const dependencyMap = buildDependencyMap(tasks);
  return tasks.map(task => ({
    ...task,
    behindCount: countTasksBehind(task.name, dependencyMap),
  }));
}