import { Adjacency, NodeId, Tree, TreeNode } from "./TreeBackend";

export interface SideTaskDefinition {
  id: string;
  name: string;
  icon: any;
  tree: Tree;
}

class SideTreeManager {
  readonly tree: Tree;
  currentPath: NodeId[];
  completedNodes = new Map<NodeId, { from: NodeId | null; completedAt: number }>();

  constructor(tree: Tree) {
    this.tree = tree;
    this.currentPath = [tree.startNodeId];
  }

  getCurrentNode(): NodeId | undefined {
    return this.currentPath[this.currentPath.length - 1];
  }

  getCurrentTreeNode(): TreeNode | undefined {
    const currentNode = this.getCurrentNode();
    return currentNode ? this.tree.getNode(currentNode) : undefined;
  }

  getAvailableNextAdjacencies(): Adjacency[] {
    const currentNode = this.getCurrentNode();
    return currentNode ? this.tree.getOutgoing(currentNode) : [];
  }

  moveToNode(toNodeId: NodeId): boolean {
    const from = this.getCurrentNode();
    if (!from) return false;

    const adjacency = this.tree.getOutgoing(from).find((item) => item.to === toNodeId);
    if (!adjacency) return false;

    this.currentPath.push(toNodeId);
    this.completedNodes.set(toNodeId, { from, completedAt: Date.now() });
    return true;
  }

  goBack(): boolean {
    if (this.currentPath.length <= 1) return false;

    const removedNode = this.currentPath.pop();
    if (removedNode) this.completedNodes.delete(removedNode);
    return true;
  }
}

const sideTaskNames = [
  "Accidental Witness",
  "Batya",
  "Blue Fire",
  "Boreas",
  "The Labyrinth",
  "The Unheard",
  "They Are Already Here",
  "Tour",
] as const;

const sideTaskIcon = require("../../assets/unheard.png");

function createSideTaskTree(id: string, name: string): Tree {
  const firstNodeId = `${id}-1`;
  const secondNodeId = `${id}-2`;

  return new Tree(id, firstNodeId, [
    {
      id: firstNodeId,
      type: "regular",
      title: `${name} objective 1`,
      description: `Add the first ${name} objective and its instructions here.`,
      outgoing: [{ id: `${firstNodeId}->${secondNodeId}`, to: secondNodeId }],
    },
    {
      id: secondNodeId,
      type: "regular",
      title: `${name} objective 2`,
      description: `Add the next ${name} objective and its instructions here.`,
      outgoing: [],
      isEnd: true,
    },
  ]);
}

export const sideTaskDefinitions: SideTaskDefinition[] = sideTaskNames.map((name) => {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return {
    id,
    name,
    icon: sideTaskIcon,
    tree: createSideTaskTree(id, name),
  };
});

export const sideTreeManagers = new Map(
  sideTaskDefinitions.map((definition) => [definition.id, new SideTreeManager(definition.tree)])
);

export function getSideTreeManager(treeId: string): SideTreeManager | undefined {
  return sideTreeManagers.get(treeId);
}
