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

export const sideTaskDefinitions: SideTaskDefinition[] = [
  {
    id: "accidental-witness",
    name: "Accidental Witness",
    icon: require("../../assets/Accidental_Witness_Icon.webp"),
    tree: new Tree("accidental-witness", "a1", [
      {
        id: "a1",
        type: "regular",
        title: "How to initiate the quest",
        description: "To start this quest, go to Dorms on Customs. There will be some cars parked in the back. Walk up to the car vandalized in red words, and you will start the quest",
        outgoing: [
          { id: "a1->a2", 
            to: "a2" },
        ],
      },
      {
        id: "a2",
        type: "regular",
        title: "Find info on Kruglov",
        description: "First, ensure you have Dorm room 110 key (blue handle). The on Customs, go into the two story dorms and make your way to the room. Below the room number on the wall, there will be a letter you need to pick up (read it and every other note you pick up in raid to avoid loosing progress if you die). Next, enter the locked room and pick up the letter on the night stand. Optionally, you also pick up a note in the kitchen next to 110 on the wall (collecting all optional notes leads to an achievement).",
        outgoing: [
          { id: "a2->a3", 
            to: "a3" },
        ],
      },
      {
        id: "a3",
        type: "regular",
        title: "Talk to Skier",
        description: "After extracting, visit Skier. He will direct you to Zmiesky apartment 3 on Streets of Tarkov, which you will need a key for. Once you're in it, you must find 4 notes, then extract.",
        outgoing: [
          { id: "a3->a4", 
            to: "a4" },
        ],
      },
      {
        id: "a4",
        type: "regular",
        title: "Talk to Skier again",
        description: "Visit Skier again, then visit Ragman. You will be directed to Chekannaya Street, house 13. Apartment 7, which is on the second floor. Walk up to the door and attempt to breach it. After that, go back downstairs to the mailbox on the wall and grab a letter and a newspaper, then extract.",
        outgoing: [
          { id: "a4->a5", 
            to: "a5" },
        ],
      },
      {
        id: "a5",
        type: "regular",
        title: "Find Pasha's courier",
        description: "Go to Customs and behind the two story dorms building. There will be a big rock, and next to it a broken bike and a jacket, as well as a note you must pick up, then extract.",
        outgoing: [
          { id: "a5->a6", 
            to: "a6" },
        ],
      },
      {
        id: "a6",
        type: "regular",
        title: "Talk to Skier once more",
        description: "Visit Skier again, and he will direct us towards Reshala's bunkhouse. First, you must obtain the key, which can spawn on Reshala. Then visit the bunkhouse next to lab/crackhouse. There you need to grab three notes, then extract.",
        outgoing: [
          { id: "a6->a7", 
            to: "a7" },
        ],
      },
      {
        id: "a7",
        type: "regular",
        title: "Finishing the quest line",
        description: "Finally, you will need to go to Shoreline to find Kozlov's hideout (bring your cassete player). In the village there is a house with a flower bed, a cassete tape is hidden there, and you will need to listen to it. Optionally, there is a note in that same house on the floor you can grab.",
      },
    ]),
  },
  {
    id: "batya",
    name: "Batya",
    icon: require("../../assets/Batya_Icon.webp"),
    tree: new Tree("batya", "batya-intro", [
      {
        id: "batya-intro",
        type: "regular",
        title: "Batya: Begin the task",
        description: "Add the opening objective and instructions for Batya here.",
        outgoing: [{ id: "batya-intro->batya-finale", to: "batya-finale" }],
      },
      {
        id: "batya-finale",
        type: "regular",
        title: "Batya: Complete the task",
        description: "Add the final objective and instructions for Batya here.",
        outgoing: [],
        isEnd: true,
      },
    ]),
  },
  {
    id: "blue-fire",
    name: "Blue Fire",
    icon: require("../../assets/Blue_Fire_Icon.webp"),
    tree: new Tree("blue-fire", "blue-fire-intro", [
      {
        id: "blue-fire-intro",
        type: "regular",
        title: "Blue Fire: Begin the task",
        description: "Add the opening objective and instructions for Blue Fire here.",
        outgoing: [{ id: "blue-fire-intro->blue-fire-finale", to: "blue-fire-finale" }],
      },
      {
        id: "blue-fire-finale",
        type: "regular",
        title: "Blue Fire: Complete the task",
        description: "Add the final objective and instructions for Blue Fire here.",
        outgoing: [],
        isEnd: true,
      },
    ]),
  },
  {
    id: "boreas",
    name: "Boreas",
    icon: require("../../assets/Boreas_Icon.webp"),
    tree: new Tree("boreas", "boreas-intro", [
      {
        id: "boreas-intro",
        type: "regular",
        title: "Boreas: Begin the task",
        description: "Add the opening objective and instructions for Boreas here.",
        outgoing: [{ id: "boreas-intro->boreas-finale", to: "boreas-finale" }],
      },
      {
        id: "boreas-finale",
        type: "regular",
        title: "Boreas: Complete the task",
        description: "Add the final objective and instructions for Boreas here.",
        outgoing: [],
        isEnd: true,
      },
    ]),
  },
  {
    id: "the-labyrinth",
    name: "The Labyrinth",
    icon: require("../../assets/The_Labyrinth_Chapter_Icon.webp"),
    tree: new Tree("the-labyrinth", "the-labyrinth-intro", [
      {
        id: "the-labyrinth-intro",
        type: "regular",
        title: "The Labyrinth: Begin the chapter",
        description: "Add the opening objective and instructions for The Labyrinth here.",
        outgoing: [{ id: "the-labyrinth-intro->the-labyrinth-finale", to: "the-labyrinth-finale" }],
      },
      {
        id: "the-labyrinth-finale",
        type: "regular",
        title: "The Labyrinth: Complete the chapter",
        description: "Add the final objective and instructions for The Labyrinth here.",
        outgoing: [],
        isEnd: true,
      },
    ]),
  },
  {
    id: "the-unheard",
    name: "The Unheard",
    icon: require("../../assets/The_Unheard_Icon.webp"),
    tree: new Tree("the-unheard", "the-unheard-intro", [
      {
        id: "the-unheard-intro",
        type: "regular",
        title: "The Unheard: Begin the task",
        description: "Add the opening objective and instructions for The Unheard here.",
        outgoing: [{ id: "the-unheard-intro->the-unheard-finale", to: "the-unheard-finale" }],
      },
      {
        id: "the-unheard-finale",
        type: "regular",
        title: "The Unheard: Complete the task",
        description: "Add the final objective and instructions for The Unheard here.",
        outgoing: [],
        isEnd: true,
      },
    ]),
  },
  {
    id: "they-are-already-here",
    name: "They Are Already Here",
    icon: require("../../assets/They_Are_Already_Here_Icon.webp"),
    tree: new Tree("they-are-already-here", "they-are-already-here-intro", [
      {
        id: "they-are-already-here-intro",
        type: "regular",
        title: "They Are Already Here: Begin the task",
        description: "Add the opening objective and instructions for They Are Already Here here.",
        outgoing: [
          {
            id: "they-are-already-here-intro->they-are-already-here-finale",
            to: "they-are-already-here-finale",
          },
        ],
      },
      {
        id: "they-are-already-here-finale",
        type: "regular",
        title: "They Are Already Here: Complete the task",
        description: "Add the final objective and instructions for They Are Already Here here.",
        outgoing: [],
        isEnd: true,
      },
    ]),
  },
  {
    id: "tour",
    name: "Tour",
    icon: require("../../assets/Tour_Icon.webp"),
    tree: new Tree("tour", "tour-intro", [
      {
        id: "tour-intro",
        type: "regular",
        title: "Tour: Begin the task",
        description: "Add the opening objective and instructions for Tour here.",
        outgoing: [{ id: "tour-intro->tour-finale", to: "tour-finale" }],
      },
      {
        id: "tour-finale",
        type: "regular",
        title: "Tour: Complete the task",
        description: "Add the final objective and instructions for Tour here.",
        outgoing: [],
        isEnd: true,
      },
    ]),
  },
];

export const sideTreeManagers = new Map(
  sideTaskDefinitions.map((definition) => [definition.id, new SideTreeManager(definition.tree)])
);

export function getSideTreeManager(treeId: string): SideTreeManager | undefined {
  return sideTreeManagers.get(treeId);
}
