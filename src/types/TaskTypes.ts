export type TaskRequirement = {
  task: { name: string };
  status: string;
};

export type Task = {
  id: string;
  name: string;
  trader?: { name: string; imageLink: string };
  map?: { name: string };
  wikiLink: string;
  objectives?: { description: string }[];
  minPlayerLevel?: number;
  status: string;
  behindCount: number;
  taskRequirements?: TaskRequirement[];
};