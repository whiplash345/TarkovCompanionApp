// Tree backend framework — paste to src/services/TreeBackend.ts
export type NodeId = string;
export type TreeId = string;
export type PathTag = string; // a string representing one of up to 4 path choices

export interface Adjacency {
  id: string;
  to: NodeId;
  label?: string;
  requiredSideTrees?: TreeId[];
  setsNoReturn?: boolean;
  pathTag?: PathTag | null;
  metadata?: Record<string, any>;
}

export type NodeType = "regular" | "choice";

export interface BaseNode {
  id: NodeId;
  title?: string;
  description?: string;
  isEnd?: boolean;
  pointOfNoReturn?: { message: string };
  choices?: (PathTag | null)[];
  metadata?: Record<string, any>;
  incoming?: NodeId[];
  outgoing?: Adjacency[];
}

export interface RegularNode extends BaseNode {
  type: "regular";
  outgoing?: Adjacency[];
}

export interface ChoiceNode extends BaseNode {
  type: "choice";
  outgoing: Adjacency[];
}

export type TreeNode = RegularNode | ChoiceNode;

export class Tree {
  id: TreeId;
  startNodeId: NodeId;
  nodes: Map<NodeId, TreeNode>;

  constructor(id: TreeId, startNodeId: NodeId, nodes: TreeNode[] = []) {
    this.id = id;
    this.startNodeId = startNodeId;
    this.nodes = new Map(nodes.map((n) => [n.id, n]));
  }

  getNode(id: NodeId): TreeNode | undefined {
    return this.nodes.get(id);
  }

  getOutgoing(nodeId: NodeId): Adjacency[] {
    return this.nodes.get(nodeId)?.outgoing ?? [];
  }

  // Compute incoming links (scan outgoing lists)
  getIncoming(nodeId: NodeId): { from: NodeId; adj: Adjacency }[] {
    const incoming: { from: NodeId; adj: Adjacency }[] = [];
    for (const [fromId, node] of this.nodes.entries()) {
      for (const adj of node.outgoing ?? []) {
        if (adj.to === nodeId) incoming.push({ from: fromId, adj });
      }
    }
    return incoming;
  }

  isEndNode(id: NodeId): boolean {
    return !!this.nodes.get(id)?.isEnd;
  }
}

export interface CompletedNodeInfo {
  from: NodeId | null;
  viaAdjacencyId?: string | null;
  completedAt: number;
}

export function normalizePathTag(tag?: PathTag | null): PathTag | null {
  if (tag == null) return null;
  return tag.trim().toLowerCase() as PathTag;
}

export class TreeManager {
  mainTree: Tree;
  sideTrees: Map<TreeId, Tree> = new Map();
  completedSideTrees: Set<TreeId> = new Set();

  currentPath: NodeId[] = [];
  completedNodes: Map<NodeId, CompletedNodeInfo> = new Map();

  lockedToEnding = false;
  userPathChoice?: PathTag | null;

  constructor(mainTree: Tree, sideTrees: Tree[] = []) {
    this.mainTree = mainTree;
    for (const s of sideTrees) this.sideTrees.set(s.id, s);
    this.resetNavigation();
  }

  resetNavigation() {
    this.currentPath = [this.mainTree.startNodeId];
    this.completedSideTrees.clear();
    this.completedNodes.clear();
    this.lockedToEnding = false;
    this.userPathChoice = undefined;
  }

  setUserPathChoice(tag: PathTag | null) {
    this.userPathChoice = normalizePathTag(tag);
  }

  nodeAllowsPath(nodeId: NodeId, pathTag?: PathTag | null): boolean {
    const node = this.mainTree.getNode(nodeId);
    if (!node?.choices?.length) return true;

    const normalizedPath = normalizePathTag(pathTag);
    if (normalizedPath == null) return true;

    const allowedChoices = (node.choices ?? [])
      .map((choice) => normalizePathTag(choice))
      .filter((choice): choice is PathTag => choice != null);

    return allowedChoices.includes(normalizedPath);
  }

  isAdjacencyAvailableForCurrentPath(adj: Adjacency): boolean {
    const normalizedChoice = normalizePathTag(this.userPathChoice);
    if (normalizedChoice == null) return true;

    const adjacencyPathTag = normalizePathTag(adj.pathTag);
    if (adjacencyPathTag != null && adjacencyPathTag !== normalizedChoice) {
      return false;
    }

    if (!this.nodeAllowsPath(adj.to, normalizedChoice)) {
      return false;
    }

    return true;
  }

  getCurrentNode(): NodeId | undefined {
    return this.currentPath.length ? this.currentPath[this.currentPath.length - 1] : undefined;
  }

  getAvailableNextAdjacencies(nodeId?: NodeId): Adjacency[] {
    const nid = nodeId ?? this.getCurrentNode();
    if (!nid) return [];

    const outs = this.mainTree.getOutgoing(nid);

    return outs.filter((adj) => {
      if (adj.requiredSideTrees?.length) {
        for (const sid of adj.requiredSideTrees) {
          if (!this.isSideTreeComplete(sid)) return false;
        }
      }

      if (this.lockedToEnding) {
        return this.mainTree.isEndNode(adj.to);
      }

      if (!this.isAdjacencyAvailableForCurrentPath(adj)) {
        return false;
      }

      return true;
    });
  }

  moveToNode(toNodeId: NodeId): boolean {
    const from = this.getCurrentNode();
    if (!from) return false;

    const adj = (this.mainTree.getOutgoing(from) ?? []).find((a) => a.to === toNodeId);
    if (!adj) return false;

    const allowed = this.getAvailableNextAdjacencies(from).some((a) => a.id === adj.id);
    if (!allowed) return false;

    this.currentPath.push(toNodeId);
    this.completedNodes.set(toNodeId, {
      from,
      viaAdjacencyId: adj.id,
      completedAt: Date.now(),
    });

    if (adj.setsNoReturn) this.lockedToEnding = true;

    const dest = this.mainTree.getNode(toNodeId);
    if (dest?.pointOfNoReturn) this.lockedToEnding = true;

    return true;
  }

  goBack(): boolean {
    if (this.lockedToEnding) return false;
    if (this.currentPath.length <= 1) return false;

    const removed = this.currentPath.pop()!;
    this.completedNodes.delete(removed);

    return true;
  }

  isAtEnd(): boolean {
    const cur = this.getCurrentNode();
    return cur ? this.mainTree.isEndNode(cur) : false;
  }

  addSideTree(tree: Tree) {
    this.sideTrees.set(tree.id, tree);
  }

  markSideTreeComplete(sideTreeId: TreeId) {
    if (!this.sideTrees.has(sideTreeId)) return false;
    this.completedSideTrees.add(sideTreeId);
    return true;
  }

  isSideTreeComplete(sideTreeId: TreeId) {
    return this.completedSideTrees.has(sideTreeId);
  }

  getStateView() {
    return {
      currentNode: this.getCurrentNode(),
      currentPath: [...this.currentPath],
      availableNextAdjacencies: this.getAvailableNextAdjacencies(),
      completedNodes: Array.from(this.completedNodes.entries()).reduce(
        (acc, [id, info]) => ((acc[id] = info), acc),
        {} as Record<string, CompletedNodeInfo>
      ),
      completedSideTrees: Array.from(this.completedSideTrees),
      lockedToEnding: this.lockedToEnding,
      userPathChoice: this.userPathChoice,
    };
  }
}

// src/services/TreeBackend.ts
export const mainNodes: TreeNode[] = [
  {
    id: "a1",
    type: "regular",
    title: "Find the Fallen Plane",
    description:
      "Visit the fallen plane on Woods.",
    choices: ["Savior", "Fallen", "Debtor", "Survivor"],
    outgoing: [
      {
        id: "a1->a2",
        to: "a2",
      },
    ],
  },
  {
    id: "a2",
    type: "regular",
    title: "Obtain information",
    description: "1. Visit Prapor in the trader menu. \n2. Obtain level 2 with prapor. \n3. Visit the other traders and ask about the fallen plane. \n- You do not need to hand Therapist $2,000",
    choices: ["Savior", "Fallen", "Debtor", "Survivor"],
    outgoing: [
      {
        id: "a2->a3",
        to: "a3",
      },
    ],
  },
  {
    id: "a3",
    type: "regular",
    title: "Retrieve the flash drive from the SUV",
    description: "Pick up the flash drive from the SUV on Shoreline. It will be on the running board of the SUV, which is near the tunnel extract.",
    choices: ["Savior", "Fallen", "Debtor", "Survivor"],
    outgoing: [
      {
        id: "a3->a4",
        to: "a4",
      },
    ],
  },
  {
    id: "a4",
    type: "regular",
    title: "Retrieve the flight recorder from the plane",
    description: "1. You must wait an hour after completing the previous quest, then visit Prapor. \n2. Pick up the flight recorder from the crashed plane. It will be at the rear section of the plane where the tail in broken off.",
    choices: ["Savior", "Fallen", "Debtor", "Survivor"],
    outgoing: [
      {
        id: "a4->a5",
        to: "a5",
      },
    ],
  },
  {
    id: "a5",
    type: "regular",
    title: "Stash the flight recorder",
    description: "Stash the flight recorder on Shoreline",
    choices: ["Savior", "Fallen", "Debtor", "Survivor"],
    outgoing: [
      {
        id: "a5->a6",
        to: "a6",
      },
    ],
  },
  {
    id: "a6",
    type: "regular",
    title: "Hand over tools to Prapor",
    description: "Hand over found in raid tools to Prapor:\n- 2 toolsets\n- 3 rechargeable batteries\n- 5 printable circut boards",
    choices: ["Savior", "Fallen", "Debtor", "Survivor"],
    outgoing: [
      {
        id: "a6->a7",
        to: "a7",
      },
    ],
  },
  {
    id: "a7",
    type: "regular",
    title: "Find items on Shoreline",
    description: "1. Wait 3-5 hours after completing last step\n2. Visit prapor and get more info on the fallen plane\n3. Go to Shoreline and find the Plane crew trandscript and Elektronik's flash drive\n4. Hand over items to Prapor",
    choices: ["Savior", "Fallen", "Debtor", "Survivor"],
    outgoing: [
      {
        id: "a7->a8",
        to: "a8",
      },
    ],
  },
  {
    id: "a8",
    type: "regular",
    title: "Retrieve the armored case",
    description: "1. Wait 1-3 hours after completing last step then visit Prapor again (When he asks you if you read the transcript, answer \"Yes\" for an additional reward\n2. Retrieve the armored case from the fallen plane cockpit.",
    choices: ["Savior", "Fallen", "Debtor", "Survivor"],
    outgoing: [
      {
        id: "a8->a9",
        to: "a9",
      },
    ],
  },
  {
    id: "a9",
    type: "choice",
    title: "Choose what to do with the case",
    description: "You must choose whether to keep the case for yourself or hand it to Prapor. Handing it to Prapor can help with the Survivor and Debtor endings, but may hinder the Savior and Fallen endings.",
    choices: ["Savior", "Fallen", "Debtor", "Survivor"],
    outgoing: [
      {
        id: "a9->b-2",
        to: "b2",
        label: "Keep the case",
      },
      {
        id: "a9->b1-1",
        to: "b1-1",
        label: "Hand over the case",
      },
    ],
  },
  {
    id: "b1-1",
    type: "regular",
    title: "Find compromising material on Prapor",
    description: "",
    choices: ["Savior", "Fallen", "Debtor", "Survivor"],
    outgoing: [
      {
        id: "b1-1->b2",
        to: "b2",
      },
    ],
  },
  {
    id: "b2",
    type: "regular",
    title: "You have the case",
    description: "",
    choices: ["Savior", "Fallen", "Debtor", "Survivor"],
    outgoing: [
      {
        id: "",
        to: "",
      },
    ],
  },
];

export const mainTree = new Tree("main", "a1", mainNodes);
export const treeManager = new TreeManager(mainTree, []);