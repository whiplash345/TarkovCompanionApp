export type NodeId = string;
export type TreeId = string;
export type PathTag = string;

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
    description: "You must choose whether to keep the case for yourself or hand it to Prapor. Handing it to Prapor can help with the Survivor and Debtor endings, but may hinder the Savior and Fallen endings. Either option will not stop you from completing any of the four endings",
    choices: ["Savior", "Fallen", "Debtor", "Survivor"],
    outgoing: [
      {
        id: "a9->b-2",
        to: "b2",
        label: "Keep the case (\"The case stays with me\")",
      },
      {
        id: "a9->b1-1",
        to: "b1-1",
        label: "Hand over the case (Other two options)",
      },
    ],
  },
  {
    id: "b1-1",
    type: "regular",
    title: "Find compromising material on Prapor",
    description: "1. Make sure you Intelligence center level 1 is built.\n2. Wait for Mr. Kerman to contact you via the intelligence center.\n3. Attempt to find compromising material on Prapor at his camp on Lighthouse.",
    choices: ["Savior", "Fallen", "Debtor", "Survivor"],
    outgoing: [
      {
        id: "b1-1->b1-2",
        to: "b1-2",
      },
    ],
  },
  {
    id: "b1-2",
    type: "regular",
    title: "Gain access to Lightkeeper",
    description: "Prapors camp yeilded no result, you must gain access to Lightkeeper. Talk to Kerman then Mechanic and you should gain access to the Tarkov side task \"Network Provider Part 1.\". If you do not, you must continue to level you traders with other side tasks until you do. Complete this side task line to gain access to Lightkeeper.",
    choices: ["Savior", "Fallen", "Debtor", "Survivor"],
    outgoing: [
      {
        id: "b1-2->b1-3",
        to: "b1-3",
      },
    ],
  },
  {
    id: "b1-3",
    type: "regular",
    title: "Talk to Lightkeeper",
    description: "Visit Lightkeeper on Lighthouse. He will ask you to bring him 3 blue folders, which you can purchase on the flea market if you like.",
    choices: ["Savior", "Fallen", "Debtor", "Survivor"],
    outgoing: [
      {
        id: "b1-3->b1-4",
        to: "b1-4",
      },
    ],
  },
  {
    id: "b1-4",
    type: "regular",
    title: "Talk to Lightkeeper again",
    description: "Visit Lightkeeper again and turn in the blue folders. He will then ask you to do something on Interchange. You must go in front of the shopping mall and fire a yellow flare. Once you do this, you must kill 15 targets then survive and extract all in one raid. Once you complete this, return to Lightkeeper and he will give you the case you lost to Prapor (goes into character special slot). ",
    choices: ["Savior", "Fallen", "Debtor", "Survivor"],
    outgoing: [
      {
        id: "b1-4->b2",
        to: "b2",
      },
    ],
  },
  {
    id: "b2",
    type: "regular",
    title: "You have the case",
    description: "You have the case, but now you must unlock it. Kerman will contact you and send you to talk to Mechanic to learn of a tool you will need from Labratory. This tool can spawn in several places on Labs, so you may need to check them all in a raid to get it. After retrieving the tool, you will get a craft in your level 1 workbench to unlock the case.",
    choices: ["Savior", "Fallen", "Debtor", "Survivor"],
    outgoing: [
      {
        id: "b2->b3",
        to: "b3",
      },
    ],
  },
  {
    id: "b3",
    type: "choice",
    title: "The case is opened",
    description: "After crafting the case, you will be able to open it in your stash. Amongst valuables, this case will have a keycard belonging to Kroglov and instructions on how to use it. Read the instructions and questions the traders on it. Once you talk to Kerman, you will get a choice to continue working with him or not. This choice is crucial to the ending you are trying to achieve.\n1. If you work with Kerman you will be able to achieve Savior, Debtor, or Fallen. If you attempt and fail certain steps in Savior, you may be redirected to Survior even after choosing to work with Kerman.\n2. If you choose to not work with Kerman, you will only be able to complete Survivor",
    choices: ["Savior", "Fallen", "Debtor", "Survivor"],
    outgoing: [
      {
        id: "b3->c1",
        to: "c1",
        label: "Work with Kerman",
      },
      {
        id: "b3->d1",
        to: "d1",
        label: "Don't work with Kerman",
      },
    ],
  },
  {
    id: "c1",
    type: "regular",
    title: "Obtain the master keycard",
    description: "Kerman will tell you to obtain the master keycard. You can find it on Labs inside the safe in Kruglov's office.",
    choices: ["Savior", "Fallen", "Debtor", "Survivor"],
    outgoing: [
      {
        id: "c1->c3",
        to: "c3",
      },
    ],
  },
  // C2 is accidentally skipped. Maybe bring all IDs back by one later.
  {
    id: "c3",
    type: "regular",
    title: "Speak with Mechanic",
    description: "Kerman also asked you to find an RFID device in Labs, but you will not. You must speak to Mechanic and pay him 40 bitcoins.",
    choices: ["Savior", "Fallen", "Debtor", "Survivor"],
    outgoing: [
      {
        id: "c3->c4",
        to: "c4",
      },
    ],
  },
  {
    id: "c4",
    type: "regular",
    title: "Retrieve the RFID device",
    description: "After paying Mechanic, he will give you a key to a room on Streets. Go to it, and search the room until you find the RFID device. Survive and extract with it, then you can start a craft to make a keycard.",
    choices: ["Savior", "Fallen", "Debtor", "Survivor"],
    outgoing: [
      {
        id: "c4->c5",
        to: "c5",
      },
    ],
  },
  {
    id: "c5",
    type: "choice",
    title: "Swipe your keycard",
    description: "Once your craft is done, head to the port on Shoreline and swipe your keycard. Once done, you will be given a choice to help Kerman. If you do not help Kerman, you will be set on the Fallen ending. If you do help Kerman, you will be set on the other 3 endings.",
    choices: ["Savior", "Fallen", "Debtor", "Survivor"],
    outgoing: [
      {
        id: "c5->c6",
        to: "c6",
        label: "Help Kerman",
      },
      {
        id: "c5->f1",
        to: "f1",
        label: "Don't help Kerman",
      },
    ],
  },
  {
    id: "c6",
    type: "regular",
    title: "Hand in minor evidence",
    description: "Kerman will now ask for dirt on Terragroup. To start, there are 36 pieces of minor evidence you can collect from the side story tasks. If you turn all of them in, you will get an achievement called \"Little Triumphs\"",
    choices: ["Savior", "Fallen", "Debtor", "Survivor"],
    outgoing: [
      {
        id: "c6->c7",
        to: "c7",
      },
    ],
  },
  {
    id: "c7",
    type: "choice",
    title: "Hand in evidence",
    description: "Kerman will also ask you to hand in major evidence, which will determine the ending you pursue.\n1. If you want the Debtor ending, make sure you have completed at least 2 of the other side story tasks. When Kerman asks for evidence, hand in 2 pieces, then choose to stop working with him.\n2. If you want the Savior ending, make sure you have completed all of the side story tasks and listened to every tape. After handing Kerman 2 pieces of evidence, hand him the other 6.\n3. If you try to hand Kerman more than 2 pieces of evidence, but have not listened to every tape or obtained the other 6 main evidence pieces, you will be redirected onto the Survivor path.",
    choices: ["Savior", "Debtor", "Survivor"],
    outgoing: [
      {
        id: "c7->c8",
        to: "c8",
        label: "Hand Kerman more than 2 evidence pieces",
      },
      {
        id: "c7->e1",
        to: "e1",
        label: "Hand Kerman 2 evidence pieces",
      },
    ],
  },
  {
    id: "c8",
    type: "choice",
    title: "Hand in evidence part 2",
    description: "You have chosen to try for Savior. You must hand over all evidence, otherwise you will be redirected to Survivor",
    choices: ["Savior", "Survivor"],
    outgoing: [
      {
        id: "c8->c9",
        to: "c9",
        label: "Hand Kerman all evidence",
      },
      {
        id: "c8->d1",
        to: "d1",
        label: "Fail to gather all evidence",
      },
    ],
  },
  {
    id: "c9",
    type: "choice",
    title: "Fence reaches out",
    description: "If you have not already, make sure you have Intelligence Center Level 3 built. Fence will then reach out and you must get 4.0 Fence reputation. After this, Fence will give you a task, that depends on if you're in PVP or PVE mode.",
    choices: ["Savior", "Survivor"],
    outgoing: [
      {
        id: "c9->c10-1",
        to: "c10-1",
        label: "I'm in PVP mode",
      },
      {
        id: "c9->c10-2",
        to: "c10-2",
        label: "I'm in PVE mode",
      },
    ],
  },
  {
    id: "c10-1",
    type: "regular",
    title: "[PVP] Fence's task",
    description: "During this task, you must not go below 4.0 Fence reputation. You must go to both Woods and Reserve and take to Co-op extracts without killing any scavs or The Goons. You can lure scavs into the extract with the help of smoke grenades.",
    choices: ["Savior", "Survivor"],
    outgoing: [
      {
        id: "c10-1->c11",
        to: "c11",
      },
    ],
  },
  {
    id: "c10-2",
    type: "regular",
    title: "[PVE] Fence's task",
    description: "During this task, you must not go below 4.0 Fence reputation. You must go to Interchange and Shoreline and kill 5 PMCs in one raid without killing any scavs.",
    choices: ["Savior", "Survivor"],
    outgoing: [
      {
        id: "c10-2->c11",
        to: "c11",
      },
    ],
  },
  {
    id: "c11",
    type: "choice",
    title: "Complete BTR task line",
    description: "You must complete the BTR side task line, ending in \"The Price of Independence\". If you reach \"The Price of Independence\" but choose to side with Skier and complete \"Chose Your Friends Wisely\" instead, you will be redirected to the Survivor ending.",
    choices: ["Savior", "Survivor"],
    outgoing: [
      {
        id: "c11->c12",
        to: "c12",
        label: "Complete \"The Price of Independence\"",
      },
      {
        id: "c11->d1",
        to: "d1",
        label: "Side with Skier",
      },
    ],
  },
  {
    id: "c12",
    type: "regular",
    title: "Savior ending",
    description: "Congratulations, you are locked into the Savior ending! You must build Solar Power in your hideout, then you will get the final craft for the keycard to terminal. Once the keycard is crafted, head to Shoreline between 21:00 and 06:00. Talk to the intercom and swipe your keycard, then approach the terminal gate with your knife out. You can now attempt to escape Tarkov. If you fail the first time, don't worry, you can craft another keycard in your hideout and attempt again until you succeed.",
    choices: ["Savior"],
    outgoing: [
    ],
  },
  {
    id: "d1",
    type: "regular",
    title: "Don't work with Kerman (Survivor)",
    description: "",
    choices: ["Survivor"],
    outgoing: [
      {
        id: "d1->d2",
        to: "d2",
      },
    ],
  },
  {
    id: "e1",
    type: "regular",
    title: "Debtor",
    description: "",
    choices: ["Debtor"],
    outgoing: [
      {
        id: "e1->e2",
        to: "e2",
      },
    ],
  },
  {
    id: "f1",
    type: "regular",
    title: "Fallen",
    description: "",
    choices: ["Fallen"],
    outgoing: [
      {
        id: "f1->f2",
        to: "f2",
      },
    ],
  },
];

export const mainTree = new Tree("main", "a1", mainNodes);
export const treeManager = new TreeManager(mainTree, []);