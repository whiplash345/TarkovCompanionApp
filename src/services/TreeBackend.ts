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
  // If present, this adjacency is part of a specific path choice (e.g. "alpha")
  // Null/undefined means it's available regardless of path selection.
  pathTag?: PathTag | null;
  metadata?: Record<string, any>;
}

export type NodeType = "regular" | "choice";

export interface BaseNode {
  id: NodeId;
  title?: string;
  description?: string;
  isEnd?: boolean;
  // If present, arriving at this node should show this message as a "point of no return"
  pointOfNoReturn?: { message: string };
  // Up to four high-level path choices that this node can present (strings/tags).
  // UI should enforce length <= 4 when you populate.
  choices?: (PathTag | null)[];
  metadata?: Record<string, any>;
  // Optional explicit lists; incoming can be computed but you may pre-fill if convenient
  incoming?: NodeId[];
  outgoing?: Adjacency[];
}

export interface RegularNode extends BaseNode {
  type: "regular";
  // regular nodes may have outgoing, but choice nodes are the typical place for branching
  outgoing?: Adjacency[];
}

export interface ChoiceNode extends BaseNode {
  type: "choice";
  // choice nodes must present multiple outgoing options (2..4)
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

/* What we store for a completed node: which node (from) or adjacency was used */
export interface CompletedNodeInfo {
  from: NodeId | null;
  viaAdjacencyId?: string | null;
  completedAt: number;
}

export class TreeManager {
  mainTree: Tree;
  sideTrees: Map<TreeId, Tree> = new Map();
  completedSideTrees: Set<TreeId> = new Set();

  // navigation
  currentPath: NodeId[] = []; // node id stack (in order visited)
  completedNodes: Map<NodeId, CompletedNodeInfo> = new Map();

  // lock state
  lockedToEnding = false;

  // user's selected high-level path tag (chosen at app start)
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

  // set the user's chosen path (one of the tags you'll place in nodes' `choices`)
  setUserPathChoice(tag: PathTag | null) {
    this.userPathChoice = tag;
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

  getCurrentNode(): NodeId | undefined {
    return this.currentPath.length ? this.currentPath[this.currentPath.length - 1] : undefined;
  }

  // Available outgoing adjacencies from a node (applies path filter, side-tree requirements, and lock)
  getAvailableNextAdjacencies(nodeId?: NodeId): Adjacency[] {
    const nid = nodeId ?? this.getCurrentNode();
    if (!nid) return [];
    const outs = this.mainTree.getOutgoing(nid);
    return outs.filter((adj) => {
      // side-tree gating
      if (adj.requiredSideTrees?.length) {
        for (const sid of adj.requiredSideTrees) if (!this.isSideTreeComplete(sid)) return false;
      }
      // lock: allow only moves to end nodes when locked
      if (this.lockedToEnding) {
        return this.mainTree.isEndNode(adj.to);
      }
      // path focus: if adjacency has pathTag and user chose a path, only show when they match
      if (adj.pathTag != null && this.userPathChoice != null) {
        return adj.pathTag === this.userPathChoice;
      }
      // if adjacency has no pathTag, it's always available regardless of user's path choice
      return true;
    });
  }

  // Move from current node to the specified nodeId (records which 'from' and which adjacency)
  moveToNode(toNodeId: NodeId): boolean {
    const from = this.getCurrentNode();
    if (!from) return false;
    // find an adjacency from current node that goes to toNodeId and is allowed
    const adj = (this.mainTree.getOutgoing(from) ?? []).find((a) => a.to === toNodeId);
    if (!adj) return false;
    // verify it's available under current filters
    const allowed = this.getAvailableNextAdjacencies(from).some((a) => a.id === adj.id);
    if (!allowed) return false;
    // apply move
    this.currentPath.push(toNodeId);
    this.completedNodes.set(toNodeId, { from, viaAdjacencyId: adj.id, completedAt: Date.now() });
    // check locks
    if (adj.setsNoReturn) this.lockedToEnding = true;
    const dest = this.mainTree.getNode(toNodeId);
    if (dest?.pointOfNoReturn) this.lockedToEnding = true;
    return true;
  }

  // Back navigation (records removed). Blocked if lockedToEnding.
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

  // Shallow view for UI
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
    choices: ["savior", "fallen", "debtor", "survivor"],
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
    choices: ["savior", "fallen", "debtor", "survivor"],
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
    choices: ["savior", "fallen", "debtor", "survivor"],
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
    choices: ["savior", "fallen", "debtor", "survivor"],
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
    choices: ["savior", "fallen", "debtor", "survivor"],
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
    choices: ["savior", "fallen", "debtor", "survivor"],
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
    choices: ["savior", "fallen", "debtor", "survivor"],
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
    description: "1. Wait 1-3 hours after completing last step then visit Prapor again (When he asks you if you read the transcript, answer \"Yes\" for an additional reward\n2. Retrieve the armored case from the fallen plane cockpit.\n3. Choose whether or not to keep the case for yourself.",
    choices: ["savior", "fallen", "debtor", "survivor"],
    outgoing: [
      {
        id: "a8->a9",
        to: "a9",
      },
    ],
  },
];

export const mainTree = new Tree("main", "a1", mainNodes);
export const treeManager = new TreeManager(mainTree, []);

/* ---------------- Example skeleton (minimal) ----------------
const mainNodes: TreeNode[] = [
  {
    id: "start",
    type: "choice",
    title: "Choose your path",
    choices: ["alpha", "bravo", "charlie", "delta"],
    outgoing: [
      { id: "start->a", to: "a", label: "Begin A", pathTag: "alpha" },
      { id: "start->b", to: "b", label: "Begin B", pathTag: "bravo" },
      // a fallback option without pathTag is available regardless of choice
      { id: "start->quick", to: "quick_end", label: "Quick end" },
    ],
  },
  { id: "a", type: "regular", title: "Node A", outgoing: [{ id: "a->end1", to: "end1", label: "End 1", pathTag: "alpha", setsNoReturn: true }] },
  { id: "b", type: "regular", title: "Node B", outgoing: [{ id: "b->end2", to: "end2", label: "End 2", pathTag: "bravo" }] },
  { id: "quick_end", type: "regular", title: "Quick End", isEnd: true },
  { id: "end1", type: "regular", title: "Alpha End", isEnd: true, pointOfNoReturn: { message: "This ending is permanent." } },
  { id: "end2", type: "regular", title: "Bravo End", isEnd: true },
];

const mainTree = new Tree("main", "start", mainNodes);
const manager = new TreeManager(mainTree, []);
// then in UI: call manager.setUserPathChoice("alpha") after the user's initial pick
-------------------------------------------------------------------------- */