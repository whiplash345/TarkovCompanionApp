import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal } from "react-native";
import { Colors } from "../constants/colors";

type PathItem = {
  id: string;
  title: string;
  image: any;
  difficulty: string;
  rewards: string[];
  details: string;
  note: string;
};

// const imageItems = [
//   require("../../assets/Savior_icon.webp"),
//   require("../../assets/Fallen_icon.webp"),
//   require("../../assets/Debtor_icon.webp"),
//   require("../../assets/Survivor_icon.webp"),
// ];

//Content for different paths
const pathOptions: PathItem[] = [
  {
    id: "savior",
    title: "Savior",
    image: require("../../assets/Savior_icon.webp"),
    difficulty: "Hard",
    rewards: [
    "Dogtag (Savior)",
    "Armband (For Humanity)",
    "Achievement (Savior)",
    "Savior Hideout Style (Walls, Ceiling, Floor)",
    "Main Menu Background (Peaceful Sky)",
    "200,000 USD (40,000 for PVE)",
    "Storage cases (1x Plates, 1x Magazines, 1x Medicine, 1x Money, 1x THICC Weapon, 1x THICC Item, 2x Ammo)",
    "Melee Weapons(1x Red Rebel, 1x Taiga)",
    "Guns (3x AS Val Mod4, 3x PKP, 3x M32A1 40mm Grenade Launcher, 3x MK-18 Mjölnir .338 rifle, 3x Saiga automatic shotgun, 3x TKPD",
    "Ammo (x200 .338 AP, x200 7.62x54R BS, x200 9.3x64mm 7N33, x200 9x39 BP, x100 12/70 AP-20, x18 M433 40mm Grenade, x18 M441 40mm Grenade",
    ],
    details:
      "Save Tarkov",
    note: "You will be able to change your choice later, but not once you cross a point of no return",
  },
  {
    id: "fallen",
    title: "Fallen",
    image: require("../../assets/Fallen_icon.webp"),
    difficulty: "Medium",
    rewards: [
    "Dogtag (Savior)",
    "Armband (For Humanity)",
    "Achievement (Savior)",
    "Savior Hideout Style (Walls, Ceiling, Floor)",
    ],
    details:
      "Good for balanced playstyles. Provides strong progression and useful rewards.",
    note: "Best if you want a more narrative-driven reward path.",
  },
  {
    id: "debtor",
    title: "Debtor",
    image: require("../../assets/Debtor_icon.webp"),
    difficulty: "Easy",
    rewards: [
    "Dogtag (Savior)",
    "Armband (For Humanity)",
    "Achievement (Savior)",
    "Savior Hideout Style (Walls, Ceiling, Floor)",
    ],
    details:
      "A reliable choice for steady advancement with lower risk.",
    note: "Great for players who want a smoother start.",
  },
  {
    id: "survivor",
    title: "Survivor",
    image: require("../../assets/Survivor_icon.webp"),
    difficulty: "Hard",
    rewards: [
    "Dogtag (Savior)",
    "Armband (For Humanity)",
    "Achievement (Savior)",
    "Savior Hideout Style (Walls, Ceiling, Floor)",
    ],
    details:
      "Strong reward package for experienced players.",
    note: "Choose this if you want the biggest payoff for a tougher challenge.",
  },
];

type Props = {
  onComplete?: () => void;
};

export default function PathSelectionScreen({ onComplete }: Props) {
  const [selectedPath, setSelectedPath] = useState<PathItem | null>(null);

  const handleChoose = () => {
    setSelectedPath(null);
    onComplete?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Choose a Path</Text>
      </View>

      <View style={styles.grid}>
        {pathOptions.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => setSelectedPath(item)}
          >
            <Image source={item.image} style={styles.image} resizeMode="contain" />
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={selectedPath !== null} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.popup}>
            <View style={styles.popupHeader}>
              <View style={styles.popupImageWrapper}>
                <Image source={selectedPath?.image} style={styles.popupImage} resizeMode="contain"/>
              </View>

              <View style={styles.popupTitleWrapper}>
                <Text style={styles.popupTitle}>{selectedPath?.title}</Text>
              </View>

              <TouchableOpacity onPress={() => setSelectedPath(null)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Difficulty</Text>
              <Text style={styles.rowValue}>{selectedPath?.difficulty}</Text>
            </View>
            <View style={styles.rewardsSection}>
              <Text style={styles.rowLabel}>Rewards</Text>
              {selectedPath?.rewards.map((reward, index) => (
                <Text key={index} style={styles.rewardText}>
                  {"\u2022"} {reward}
                </Text>
              ))}
            </View>
            <View style={styles.divider} />

            <View style={styles.largeBox}>
              <Text style={styles.largeText}>{selectedPath?.details}</Text>
            </View>
            <Text style={styles.smallText}>{selectedPath?.note}</Text>

            <TouchableOpacity style={styles.chooseButton} onPress={handleChoose}>
              <Text style={styles.chooseButtonText}>Choose</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderBottomWidth: 2,
    borderBottomColor: Colors.tanPrimary,
    alignItems: "center",
  },
  headerText: {
    color: Colors.tanPrimary,
    fontSize: 20,
    fontWeight: "bold",
  },
  grid: {
    flex: 1,
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  card: {
    width: "48%",
    aspectRatio: 1,
    backgroundColor: "#111",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  image: { width: "100%", height: "100%" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-start",
    padding: 16,
    paddingTop: 100,
  },
  popup: {
    flex: 1,
    backgroundColor: "#111214",
    borderRadius: 20,
    padding: 18,
  },
  popupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  popupImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
  },
  popupImage: {
    width: "100%",
    height: "100%",
  },
  popupTitleWrapper: {
    flex: 1,
    marginLeft: 12,
  },
  popupTitle: {
    color: Colors.tanPrimary,
    fontSize: 24,
    fontWeight: "700",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 22,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.tanPrimary,
    opacity: 0.35,
    marginVertical: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  rowLabel: {
    color: "#ccc",
    fontSize: 15,
  },
  rowValue: {
    color: "#f00",
    fontSize: 15,
    flex: 1,
    marginLeft: 12,
    textAlign: "right",
  },
  rewardsSection: {
  marginBottom: 10,
  },
  rewardText: {
    color: "#fff",
    fontSize: 15,
    marginTop: 4,
    marginLeft: 8,
  },
  largeBox: {
    backgroundColor: "#1c1c1f",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  largeText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
  },
  smallText: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 18,
  },
  chooseButton: {
    backgroundColor: Colors.tanPrimary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  chooseButtonText: {
    color: Colors.backgroundSecondary,
    fontSize: 17,
    fontWeight: "700",
  },
});

// type Props = {
//   onComplete?: () => void;
// };

// export default function PathSelectionScreen({ onComplete }: Props) {
//   return (
//     <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
//       <Text style={{ color: "#fff" }}>Choose your path</Text>
//       <TouchableOpacity onPress={() => onComplete?.()}>
//         <Text style={{ color: "#f00" }}>Continue</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }