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
        description: "First, ensure you have Dorm room 110 key (blue handle). The on Customs, go into the two story dorms and make your way to the room. Below the room number on the wall, there will be a letter you need to pick up. Next, enter the locked room and pick up the letter on the night stand. Optionally, you also pick up a note in the kitchen next to 110 on the wall.",
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
    tree: new Tree("batya", "b1", [
      {
        id: "b1",
        type: "regular",
        title: "How to initiate the quest",
        description: "Visit one of four locations:\n1. On Customs, in the second floor of fortress in the center of the map, walk up to the mattress underneath the writing \"жопа\" on the wall.\n2. On Reserve, go into the radome at the top of the radar station.\n3. On Shoreline, visit the bunker on the north end of the map.\n4. On Woods, find the mattresses on top of the big rock in the southern half of the USEC camp.\n\nIn the same raid, it may be useful to complete the next step.",
        outgoing: [
          { id: "b1->b2", 
            to: "b2" }
        ],
      },
      {
        id: "b2",
        type: "regular",
        title: "Find a Bogatyrs patch",
        description: "Visit one of four locations:\n1. On Customs, near the radio tower in the south west of the map, enter a white cabin with a couch, and the patch is underneath the pillow.\n2. On Woods, at Prapor's lost convoy south of the scav bunker the patch is against the leg of a dead body.\n3.On Reserve, on the upper roof of the king/queen building(not radar station), the patch will be on a cardboard box.\n4. On Lighthouse, on top of the southmost mountain overlooking the lighthouse, there is a small military camp. The patch is on a rolled up sleeping bag next to a sleeping tent.",
        outgoing: [
          { id: "b2->b3", 
            to: "b3" }
        ],
      },
      {
        id: "b3",
        type: "regular",
        title: "Talk to Jaeger",
        description: "After finding the patch, you must talk to Jaeger, and he will direct you to the Ryabina outpost, which is in between the USEC camp and sniper mountain. You will have to pick up a note and and Strelets' amulet from here.",
        outgoing: [
          { id: "b3->b4", 
            to: "b4" }
        ],
      },
      {
        id: "b4",
        type: "regular",
        title: "Locate the Carousel outpost",
        description: "The next two outposts you need to find are on Interchange, the first near the main entrance of Idea. I suggest bringing a cassete player with you. Here you will find 4 notes, a postcard, an audio tape (listen to this in raid, or after raid if you forget), and Voevoda's audio recorder. In the same raid, you can also do the next step.",
        outgoing: [
          { id: "b4->b5", 
            to: "b5" }
        ],
      },
      {
        id: "b5",
        type: "regular",
        title: "Locate the Gnezdo outpost",
        description: "The other outpost on Interchange is in the woods behind the mall, to the east. I also suggest having a cassete player with you for this. Here you will find 5 notes and another audio tape, which I suggest you listen to in raid, or after.",
        outgoing: [
          { id: "b5->b6", 
            to: "b6" }
        ],
      },
      {
        id: "b6",
        type: "regular",
        title: "Locate the ambush spot",
        description: "Head to Woods, and on an open hill to the north east of ZB-16, you will find Moreman's grave. Here you must grab a note, Moreman's dogtag, and Moreman's phone.",
        outgoing: [
          { id: "b6->b7", 
            to: "b7" }
        ],
      },
      {
        id: "b7",
        type: "regular",
        title: "Craft Moreman's audio tapes",
        description: "With Moreman's phone, in Workbench 1 you need to craft 2 audio tapes, then listen to them. Next, enter your hideout and walk up to the intelligence center's radio to contact Voeveda. Enter the frequency \"35.70\" and then the code \"27.893.2000\".",
        outgoing: [
          { id: "b7->b8", 
            to: "b8" }
        ],
      },
      {
        id: "b8",
        type: "regular",
        title: "Gain access to Lightkeeper",
        description: "If you haven't already, you must gain access to Lightkeeper. Then bring him the five related quest items in raid, then extract. If you die before handing these to Lightkeeper, you must get them again from where you did earlier. ",
        outgoing: [
          { id: "b8->b9", 
            to: "b9" }
        ],
      },
      {
        id: "b9",
        type: "regular",
        title: "Wait for Voeveda to reach out",
        description: "After 6-12 hours from delivering the items to Lightkeeper, Voeveda will reach back out. You can talk to him at the intelligence center with the same frequency as before \"35.70\" and code \"27.893.2000\". He will require you to reach certain skill levels, then eliminate 4 PMCs and 15 targets without dying.",
        outgoing: [
          { id: "b9->b10", 
            to: "b10" }
        ],
      },
      {
        id: "b10",
        type: "regular",
        title: "Contact Voeveda again",
        description: "After completing Voeveda's tasks, contact him again (frequency \"35.70\" and code \"27.893.2000\"). You will be directed to the BEAR camp on the southern most mountain on Lighthouse overlooking the lighthouse. On a table there, you need to grab a note, then extract.",
        outgoing: [
          { id: "b10->b11", 
            to: "b11" }
        ],
      },
      {
        id: "b11",
        type: "regular",
        title: "Interrogate Prapor",
        description: "First, visit Prapor in the trader menu. He is not helpful, and your objective will update. \n\n First, Head to Shoreline and go to scav island. In the back of the house on the island, there is a cultist circle, and in it a photo you need to grab.\n\nSecond, you must go to either Woods or Customs for the next note(if you choose Customs, you will need dorms 314 marked key). On Woods, the note is next to some candles near the cultist circle behind the Sawmill. On Customs, the note is on the wall of 314 marked room in the third floor of the three story dorms.",
        outgoing: [
          { id: "b11->b12", 
            to: "b12" }
        ],
      },
      {
        id: "b12",
        type: "regular",
        title: "Finishing the quest line",
        description: "Finally, we must visit Lightkeeper, then leave. In a separate raid, return the Lightkeeper's lighthouse and pick up the final paper off of a red box outside Lightkeeper's room, then extract.",
      },
    ]),
  },
  {
    id: "blue-fire",
    name: "Blue Fire",
    icon: require("../../assets/Blue_Fire_Icon.webp"),
    tree: new Tree("blue-fire", "c1", [
      {
        id: "c1",
        type: "regular",
        title: "How to initiate the quest",
        description: "Visit one of three locations: \n1. On Woods, inside the emercom base, there is a green shipping container with lots of shelves. On the side of one of the shelves, pick of the paper.\n2. On Interchange, on the highway to the west (main entrance) of the mall, there is a tent. Pick up the note on the side. There is also another tent with a note near the \"Path to River\" extract deeper west in the woods. Finally there is a third note on the wall outside of the locked Emercom medical unit, next to the door.\n3. In Labyrinth, on a table in the prototype weapon area, you can also pick up the note",
        outgoing: [
          { id: "c1->c2",
            to: "c2" }
        ],
      },
      {
        id: "c2",
        type: "regular",
        title: "Talk to Mechanic",
        description: "Visit mechanic, then he will direct you to Streets of Tarkov. You will need one of two keys, either \"Car dealership closer section key(LexOs)\" or \"Mysterious room marked key(Chek. 13)\". If you go to the dealership, you can find the device in a green container on a table in the locked room. If you go to the marked room, you can find the device in the corner of the locked room in a flower pot.",
        outgoing: [
          { id: "c2->c3",
            to: "c3" }
        ],
      },
      {
        id: "c3",
        type: "regular",
        title: "Talk to Mechanic again",
        description: "Visit Mechanic and hand him the device fragment. Next, you will have to go to Labs and plant a Local network hacking device in the server room. If you have already done this in the Boreas story, this objective will auto-complete and you can move on.",
        outgoing: [
          { id: "c3->c4",
            to: "c4" }
        ],
      },
      {
        id: "c4",
        type: "regular",
        title: "Talk to Mechanic once more",
        description: "Visit Mechanic again and he will ask for the device fragment. Currently, this decision has no major story impact. If you hand him the device, Mechanic will pay you 1.5 million rubles. If you keep it, you get the achievement \"Better Served\".\n\nNext, you will need to head to Ground Zero(must be level 21+), Lighthouse, or Labs to find a note. On Ground Zero, you must grab the science office key off the dead scientist. Then, head upstairs and the note will be on a desk in the locked room. If you choose to go Lighthouse, the note can be found in the chalet with the blue roof set on a shelf next to the liquor storage room. If you choose to go Labs, you can find the note in the dark office room on a desk.",
        outgoing: [
          { id: "c4->c5",
            to: "c5" }
        ],
      },
      {
        id: "c5",
        type: "regular",
        title: "Invensitage the post office",
        description: "Head to Streets of Tarkov and bring a cassete player. Visit the post office and you will find 3 cassete tapes, which you will want to listen to in raid, or after. If you listen to the tapes in raid, it may be useful to do the next step the same raid.",
        outgoing: [
          { id: "c5->c6",
            to: "c6" }
        ],
      },
      {
        id: "c6",
        type: "regular",
        title: "Finishing the quest line",
        description: "Out front of the post offuce, there is a blue van. On the road next to one of the wheels, you will find the key to the van. Use this key to open up the trunk and grab a note.",
      },
      
    ]),
  },
  {
    id: "boreas",
    name: "Boreas",
    icon: require("../../assets/Boreas_Icon.webp"),
    tree: new Tree("boreas", "d1", [
      {
        id: "d1",
        type: "regular",
        title: "How to initiate the quest",
        description: "You can start this quest one of threeways.\n\n1. The easiest way, obtain a paradigm poster. These can be found in many different places on Ground Zero, Customs, Lighthouse, and Factory. You can also buy one from the flea market.\n\n2. If you have Intelligence center 3, a message will appear on the radio. Read it to start the quest.\n\n3. If you are going through the Savior ending and are talking with Mr. Kerman, at the stage where he asks you to hand over compromising evidence on Terragroup, you can ask him if there are any leads and he will send you to talk to Mechanic and the quest will begin",
        outgoing: [
          { id: "d1->d2",
            to: "d2" }
        ],
      },
      {
        id: "d2",
        type: "regular",
        title: "Fix the radio tower",
        description: "First step, talk to Mechanic and he will direct you to Woods to repair a radion tower. You need to bring a toolset with you to do this.",
        outgoing: [
          { id: "d2->d3",
            to: "d3" }
        ],
      },
      {
        id: "d3",
        type: "regular",
        title: "Obtain the Paradigm shipping directive",
        description: "Visit Mechanic again, and he will direct you to Lighthouse. In a warehouse in the train station behind water treatment, you will find a table with the needed document on it.",
        outgoing: [
          { id: "d3->d4",
            to: "d4" }
        ],
      },
      {
        id: "d4",
        type: "choice",
        title: "Find transport to the icebreaker",
        description: "Visit Mechanic again, then he will direct you to visit Prapor and the BTR driver to find a way to and from the icebreaker. It doesn't matter which you do first, but we'll start with the BTR driver (the transport to the icebreaker) for this guide. If you completed the BTR task line with the good ending \"The Price of Independence\", talk to the BTR driver (On Woods or Streets of Tarkov) and he will give you immediate access to the Icebreaker. If you completed the BTR task line with the bad ending \"Choose your friends wisely\", you will have to do some tasks for the BTR driver. If you did not complete either ending for the BTR driver at this point, you will have a different task you will have to do for him.",
        outgoing: [
          { id: "d4->d5",
            to: "d5",
            label:"Completed the good ending" },
          { id: "d4->d4-2",
            to: "d4-2",
            label:"Completed the bad ending" },
          { id: "d4->d4-3",
            to: "d4-3",
            label:"Didn't complete an ending" },
        ],
      },
      {
        id: "d4-2",
        type: "regular",
        title: "Help to BTR driver",
        description: "The BTR driver will ask to deliver 200 rounds of 7.62x54R BT ammo. After that, you will need to destroy some documents for him on Customs. They are located in a trench between ZB-013 and Lab/Crackhouse. After finding the documents, find the closest burning barrel and burn them. Finally, visit one of the smugglers bases (either on Shoreline or Interchange) and eliminate 15 targets. Then, visit the BTR driver again and you will unlock the transport to icebreaker.",
        outgoing: [
          { id: "d4-2->d5",
            to: "d5" }
        ],
      },
      {
        id: "d4-3",
        type: "regular",
        title: "Help the BTR driver",
        description: "The BTR driver will ask you to eliminate 10 targets in a smugglers base, either on Shoreline or Interchange. After completing this, visit him again and he he unlock the transport to the Icebreaker.",
        outgoing: [
          { id: "d4-3->d5",
            to: "d5" }
        ],
      },
      {
        id: "d5",
        type: "choice",
        title: "Find transport from the icebreaker",
        description: "Now that you have found a way to the icebreaker, you need to find a way to extract from it. First, visit Prapor. If you have already found the case from Falling Skies and handed it to Prapor, he immediately sends you to get some helicopter oil. If you have found case but decided to keep it for yourself, Prapor needs you to find some items for him before sending you to find helicopter oil. If you haven't reached the step where you find the case in Falling Skies, Prapor will give you some tasks before anything else.",
        outgoing: [
          { id: "d5->d6",
            to: "d6",
            label:"Handed Prapor the case" },
          { id: "d5->d5-2",
            to: "d5-2",
            label:"Kept the case for yourself" },
          { id: "d5->d5-3",
            to: "d5-3",
            label:"Haven't found the case" },
        ],
      },
      {
        id: "d5-2",
        type: "regular",
        title: "Find power filters",
        description: "Find 3 Military power filters with the FIR(Found in Raid) status, and hand them over to Prapor.",
        outgoing: [
          { id: "d5-2->d6",
            to: "d6" }
        ],
      },
      {
        id: "d5-3",
        type: "regular",
        title: "Complete Prapor's tasks",
        description: "Head to Reserve and kill 30 targets. Then, head the the transit to Woods from Reserve and launch a yellow flare. These can be completed in the same raid.",
        outgoing: [
          { id: "d5-3->d6",
            to: "d6" }
        ],
      },
      {
        id: "d6",
        type: "regular",
        title: "Helicopter oil",
        description: "You must find the helicopter oil on Reserve. It can be found in one of 6 different locations.",
        outgoing: [
          { id: "d6->d7",
            to: "d7" }
        ],
      },
      {
        id: "d7",
        type: "regular",
        title: "Travel to icebreaker",
        description: "Make sure to bring a good kit, because icebreaker is quite a fight. Obtain a Sudak Tudak marine repair kit and bring 2,400 Euros, then board the hovercraft at the pier on Shoreline or Lighthouse and you will transit to icebreaker.\n\nNext, make your way to the room with the scientist and iteract with the intercom on the wall.\n\nAfter that, find the dead engineer in the operating room and grab the keycard that spawns next to him. Make your way to the locked door to the engine room, and use the keycard to enter it. Navigate and fight your way through the engine room and more of the ship, past the extraction zone(helipad), until you reach a door with a chain. Interact with the door to update your task, then turn around and make your way back to the helipad. Launch a green flare on the helipad the call the helicopter, then extract.",
        outgoing: [
          { id: "d7->d8",
            to: "d8" }
        ],
      },
      {
        id: "d8",
        type: "regular",
        title: "Breach the icebreaker superstructure",
        description: "Speak to mechanic, then Prapor. You will now have the ability to buy a SZ-1 explosive charge to use on the chained door.\n\nHead back to icebreaker and follow the same pathing to get back to the door, then breach it with the charge (walk away after planting the charge, otherwise you will die). Open the door and you will have to kill Wegde and his squad. Once done, make your way up to level 5 of the ship and you will find a code locked door and your quest will update.\n\nHead back to the scientist in the room and interact with the intercom, and he will tell you he only had part of the door code \"312\". Then, extract.",
        outgoing: [
          { id: "d8->d9",
            to: "d9" }
        ],
      },
      {
        id: "d9",
        type: "regular",
        title: "Speak with Mechanic",
        description: "Speak with Mechanic to get the second part of the door code \"220\" and update your task. Mechanic will first ask you to install a Local network hacking device in the Labs server room. If you have already completed this step in the Blue Fire quest line, it will be skipped here and Mechanic will give you the code immediately.",
        outgoing: [
          { id: "d0->d10",
            to: "d10" }
        ],
      },
      {
        id: "d10",
        type: "regular",
        title: "Return to the icebreaker",
        description: "Head back to the icebreaker once more and progress all to the area with Wedge. Kill his crew, then find the gas torch in one of three spawns in that area. After, head back to the locked door on level 5, then enter the code you found \"312220\". Make your way up to the roof of the icrebreaker and you will find a hatch, which you can open with the gas torch. Once in, locate the captains body and grab the C-1 keycard next to him. Also loot any Satellite Communication Modules(you will need 3 found in raid), Memento Server RAM(you will need 4 FIR), and Gigachad processors(you will need 2 FIR) you find here for further down the quest line. Then, break through the door in the back and make your way to the locked C-1 room(on level 7. The keycard was found on level 9). Open it, and loot 3 C-1 drives. Then, go back to the scientist and inform him about the captains death. This can all be done in one raid, or over multiple raids.",
        outgoing: [
          { id: "d10->d11",
            to: "d11" }
        ],
      },
      {
        id: "d11",
        type: "regular",
        title: "Obtain icebreaker archive data",
        description: "Hand in the 3 C-1 drives to Mechanic(note, the quests \"A Wedge Between Us\", \"Fresh Stock\", \"Oil Change\", and \"War Never Changed\" will become unavailable after handing them in). Next, you will need to hand over the tech items mentioned earlier (3 Ultralink satellite communication modules, 4 Momento server ram, and 2 Gigachad processors) which can only be found on icebreaker. After handing these in, you will receieve the icebreaker archive data from Mechanic, make sure to read it in your handbook.",
        outgoing: [
          { id: "d11->d12",
            to: "d12" }
        ],
      },
      {
        id: "d12",
        type: "regular",
        title: "Help the BTR driver",
        description: "Visit the BTR driver for help evacuating the scientist on the icebreaker and he will give you a new quest line. First, you will need to kill 30 rouges. Second, you will need to mark the transit to Lighthouse from Woods, and the transit to Woods from Lighthouse. Third, you will need to hand over 4 Moonshine, 4 Croutons (Rye or Emelya rye works), 4 Vodka, and 2 Sausage(none need to be FIR) to the BTR driver. Finallaly, extract after completing the third task, then return to the BTR driver in a separate raid to complete the task line. In between each of these tasks, you must speak with the BTR driver. After completing all of these, you can now access icebreaker directly from the map.",
        outgoing: [
          { id: "d13->d13",
            to: "d13" }
        ],
      },
      {
        id: "d13",
        type: "regular",
        title: "Help the scientist get out",
        description: "In a new raid, visit the BTR driver again and he will give you a set of new tasks. You must hand over 5 respirators of any kind, 2 class 5 or 6 ballistic plates, and a kirasa body armor to the BTR driver. You must also kill 20 targets on icebreaker. After that, return to the scientist on the icebreaker, then extract.",
        outgoing: [
          { id: "d13->d14",
            to: "d14" }
        ],
      },
      {
        id: "d14",
        type: "regular",
        title: "Finishing the quest line",
        description: "Visit the BTR one last time to see how the evacuation went. You will learn the scientist ran off during the evacuation attempt, but he left behind a Keycard which the BTR driver gives you \"C-3\". This is a one use keycard to the room the scientist was in. In it, you will find 4 LedX units and a cassete tape.",
      },
    ]),
  },
  {
    id: "the-labyrinth",
    name: "The Labyrinth",
    icon: require("../../assets/The_Labyrinth_Chapter_Icon.webp"),
    tree: new Tree("the-labyrinth", "e1", [
      {
        id: "e1",
        type: "regular",
        title: "How to initiate the quest",
        description: "Find the Knossos key, open up the door in the basement of Shoreline, then walk up to the transit door and your quest line should begin",
        outgoing: [
          { id: "e1->e2",
            to: "e2" }
        ],
      },
      {
        id: "e2",
        type: "regular",
        title: "Speak to Jaeger",
        description: "Visit Jaeger to ask him about the Labyrinth. Then, wait 12-24 hours for him to gather info and visit him again. You will recieve 2 Labrys access cards in the mail(needed to transit) and unlock a barter for more if needed.",
        outgoing: [
          { id: "e2->e3",
            to: "e3" }
        ],
      },
      {
        id: "e3",
        type: "regular",
        title: "Enter the Labyrinth",
        description: "Head to Shoreline(make sure to bring a cassete player) and use the transit to Labyrinth. Once inside the Labyrinth, clear all enemies off the map. It will be very difficuly to complete the next objectives otherwise. Then, you will need to find 7 documents, 1 key, and one audio tape inside the key room. Make sure to listen to the audio tape when you find it. Finally, extract.",
        outgoing: [
          { id: "e3->e4",
            to: "e4" }
        ],
      },
      {
        id: "e4",
        type: "regular",
        title: "Finishing the quest line",
        description: "Talk to Jaeger again and hand him the cassete tape you found. Next, you will need to head to Shoreline to find the final documents that a scientist flushed before you could get them. Head to the pier drainage pipe and they will sitting right outside it. Grab them, and you will complete the chapter.",
        outgoing: [
          { id: "e4->e5",
            to: "e5" }
        ],
      },
    ]),
  },
  {
    id: "the-unheard",
    name: "The Unheard",
    icon: require("../../assets/The_Unheard_Icon.webp"),
    tree: new Tree("the-unheard", "f1", [
      {
        id: "f1",
        type: "regular",
        title: "How to initiate the quest",
        description: "Head to either Ground Zero or Streets of Tarkov to pick up a note.\n\nOn Ground Zero, the note can be found in the Terragroup building with the dead scientist, in the locked science office room. You can find the science office key on the dead scientist, then head upstairs to the doors marked with the number 4, and unlock it. The note can be found on one of the desks.\n\nOn Streets, the note can be found in one of two places in the northern part of the map. On the east side of Primorsky Ave.(the main street dividing the east and west) in the office building with the outdoor spiral stairs, you can find the note on top of a small cabinet. On the west side of the street in the security building, then inside the surveillence room, you can find the note on a desk.",
        outgoing: [
          { id: "f1->f2",
            to: "f2" }
        ],
      },
      {
        id: "f2",
        type: "regular",
        title: "Find documents on Labs",
        description: "The note you found directs you to Laboratory, where you need to find two more documents. The first document you can find in the makeshift medical room on the main floor, underneath the dark offices. The second document you can find in the dark office closer to blue keycard room, next to a fax machine. Then, extract.",
        outgoing: [
          { id: "f2->f3",
            to: "f3" }
        ],
      },
      {
        id: "f3",
        type: "regular",
        title: "Find document on Factory",
        description: "Next you head to Factory. In the medical area, on top of a yellow barrel near a larger blue barrel, you will find the document you need. Then, extract.",
        outgoing: [
          { id: "f3->f4",
            to: "f4" }
        ],
      },
      {
        id: "f4",
        type: "regular",
        title: "Find hard drive on Streets",
        description: "Next you head to Streets. In a G-Wagon near Lexos, at the intersection of Primorsky Ave and Verhnyaya St, you will find the hard drive in between the front seats. Grab it, then extract.",
        outgoing: [
          { id: "f4->f5",
            to: "f5" }
        ],
      },
      {
        id: "f5",
        type: "regular",
        title: "Decrypt the hard drive",
        description: "Once you extract with the drive, a new craft will be available inside intelligence center level 1 to decrypt it which will take 12 hours. Once finished, you can read the contents in your handbook, which will lead you to a locked room in Factory. You need a Terragroup storage room keycard to access it, which only spawns on cultists. Once you have the keycard, head to the room in the cellars of Factory and pick up two notes, then extract.",
        outgoing: [
          { id: "f5->f6",
            to: "f6" }
        ],
      },
      {
        id: "f6",
        type: "regular",
        title: "Find tapes on Labs",
        description: "Your quest now leads to to Labs once more. I suggest you bring a cassete player with you to listen to them in raid.\n\nYou will need to find one of two whiteboards, it doesn't matter which. One is in the dark office closer to blue keycard room. The other is in the office near parking button and the new black keycard safe room.\n\nOn top of finding a whiteboard, you need to find two cassete tapes. In the lecture room underneath the kitchen, can can find one on the floor, and another on a desk near a computer. Finally, extract.",
        outgoing: [
          { id: "f6->f7",
            to: "f7" }
        ],
      },
      {
        id: "f7",
        type: "regular",
        title: "Find more info on Shoreline",
        description: "You now have to head to Shoreline, specifically resort east wing room 305(you do not need a key to enter). Here you need to find a thumb drive in a laptop, a fragment of a note, and finally a key on the nightstand(this is guarenteed to spawn here every raid). Optionally, you can grab the guard post note from the guard desk on the first floor of west wing, near the enterence.",
        outgoing: [
          { id: "f7->f8",
            to: "f8" }
        ],
      },
      {
        id: "f8",
        type: "regular",
        title: "Decrypt the flash drive",
        description: "In intelligence center level 1, you now have a craft to decrypt the flash drive you found. Once done, head to Mechanic to ask for help with further decryption. Mechanic mentions a friend(Elektronik aka Mr. Kerman) who can help, but requires 5 million rubles. After paying, you need to wait for Mr. Kerman to reach out. If you have contacted Mr. Kerman before, this should take about an hour. If you have not, wait 6-12 hours, then speak to Mechanic again, and Mr. Kerman will reach out via your hideout intelligence center.\n\nYou will now unlock a new craft in your intelligce center using a green keycard and two more using red and blue keycards. The red and blue keycard crafts are misleading and a waste of money, only use the green one!",
        outgoing: [
          { id: "f8->f9",
            to: "f9" }
        ],
      },
      {
        id: "f9",
        type: "regular",
        title: "Finishing the quest line",
        description: "Once the A.P. Green keycard is crafted, grab it and the Terragroup corporate apartment key you found on Shoreline, then head to Streets. You need to make your way to the Cardinal apartment complex in the north west of the map. Inside, find apartment 1 and enter it. Inside apartment 1, you will find a secret room that you can enter using the A.P. Green keycard. In this room, you need to find 4 documents, then your quest is complete.",
      }
    ]),
  },
  {
    id: "they-are-already-here",
    name: "They Are Already Here",
    icon: require("../../assets/They_Are_Already_Here_Icon.webp"),
    tree: new Tree("they-are-already-here", "g1", [
      {
        id: "g1",
        type: "regular",
        title: "How to initiate the quest",
        description: "You can start this quest line four ways.\n\nFirst, find a note inside any of the locked marked rooms on Customs, Reserve, or Streets.\n\nSecond, find the note in one of the 2 marked circles on Woods.\n\nThird, pick up the note from the marked circle on Shoreline, in the back of the house on scav island.\n\nFourth, kill any cultist on any location.",
        outgoing: [
          {
            id: "g1->g2",
            to: "g2",
          },
        ],
      },
      {
        id: "g2",
        type: "regular",
        title: "Investiage the cultists torture house",
        description: "Head to Ligthouse and bring a cassete player with you. Head to the sunken village, and in one of the houses you will find evidence of the cultists, and among it a cassete tape. You should also find a key(Cult victim's apartment key) in one of 4 set spawns in the same house. Then, extract.",
        outgoing: [
          {
            id: "g2->g3",
            to: "g3",
          },
        ],
      },
      {
        id: "g3",
        type: "regular",
        title: "Investigate the cult victim's apartment",
        description: "Next, head to Streets to find the cult victim's apartment with the key you found and a cassete player. In the far north east of the map, you will find an apartment building. Make your way up to the third floor, then in the locked apartment 5. In here you should find a note, another cassete tape, and a Book or the Arrival(picking this book up will activate the quest line Blue Fire if it isn't already active). Then, extract.",
        outgoing: [
          {
            id: "g3->g4",
            to: "g4",
          },
        ],
      },
      {
        id: "g4",
        type: "regular",
        title: "Kill a cultist priest",
        description: "Speak to Mechanic about what you found and he will direct you to the cultists. You now need to eliminate a cultist priest.",
        outgoing: [
          {
            id: "g4->g5",
            to: "g5",
          },
        ],
      },
      {
        id: "g5",
        type: "regular",
        title: "Find the cultist priest's note",
        description: "After killing the priest, you need to head to a any locked marked room on Customs, Reserve, or Streets. Inside, you will find a new note from the cultist priest.",
        outgoing: [
          {
            id: "g5->g6",
            to: "g6",
          },
        ],
      },
      {
        id: "g6",
        type: "regular",
        title: "Find more info on Lighthouse",
        description: "Your quest should update with three objectives on Lighthouse, Woods, and Shoreline. You can do these in any order, but for this guide we'll start with Lighthouse. Head to the chalet with the blue roof. Outside on the road the the enterence, you will find an orange atv, and on it a keycard you need. You also need to find a note, which is on one of the second floor balconies between a mattress and a wooden board covered in cultist symbols. Then, extract.",
        outgoing: [
          {
            id: "g6->g7",
            to: "g7",
          },
        ],
      },
      {
        id: "g7",
        type: "regular",
        title: "Find more info on Woods",
        description: "Your quest now leads to Woods. In the sunken village, you need to find a house on the east side. Inside, there will be evidence of cultists, and inside you will need to pick up a paper from a whiteboard. Then, extract.",
        outgoing: [
          {
            id: "g7->g8",
            to: "g8",
          },
        ],
      },
      {
        id: "g8",
        type: "regular",
        title: "Find more info on Shoreline",
        description: "Next, you need to head to Shoreline to repair a radio tower with a toolset. Inside the shack next to the tower if where you repair. You will also need to find a body on the hill leading up to the tower, and next to it's hand a note. Then, extract.",
        outgoing: [
          {
            id: "g8->g9",
            to: "g9",
          },
        ],
      },
      {
        id: "g9",
        type: "regular",
        title: "Access security room on Interchange",
        description: "Visit Mechanic tell him of all the info you found and get your next steps. You will unlock a craft in intelligence center level 1 to restore the keycard you found on Lighthouse. Once crafted, head to the power station on Interchange with the keycard, your cassete player, and an empty USB flash drive(just a normal flash drive). Turn on the power, then make your way the to basement stairs. Once down, you will see a panel next to a locked door. Swipe your restored keycard to open it and enter. Once inside, you will see another panel next to the door, which you need to activate with your keycard to restore the power to that room. Then, head to the server room and turn on the cooling system using a lever in the back. After that, to the left of the cooling system lever, insert your usb drive into the server rack. Finally, head back to the enterence door and there should be a safe, now opened after turning on the cooling system. Grab the cassete tape from it, listen to it, then extract.",
        outgoing: [
          {
            id: "g9->g10",
            to: "g10",
          },
        ],
      },
      {
        id: "g10",
        type: "regular",
        title: "Return to the security room",
        description: "You now need to head back to the security room on Interchange. Turn on the power station power, enter the security room, then turn on the security room power via the panel on the wall. Now, this next step is crucial to obtain the important evidence, which is needed to complete the Savior ending. On a desk in the main room, you will find a note. Once you read it, head to the server room, and underneath a table press a buttom. After pressing the buttom under the table, retrive the flash drive and extract. If you die before extracting, you will need to re-plant to flash drive and collect it the same way in a separate raid. If you do not press the buttom underneath the table, you will not get the major evidence needed for the Savior ending, or the achievement \"And The Light Went Out\".",
        outgoing: [
          {
            id: "g10->g11",
            to: "g11",
          },
        ],
      },
      {
        id: "g11",
        type: "regular",
        title: "Finishing the quest line",
        description: "Speak to Mechanic and hand over to flash drive. Mechanic will then send the major evidence in the mail, which you can read in your handbook. After completing this quest, if you have not unlocked it already, The Unhead quest line will become available.",
      }
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
