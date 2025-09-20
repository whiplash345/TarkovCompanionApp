const AllItemsQuery = `
  query GetAllItems {
  items {
    # General item fields
    id
    name
    shortName
    normalizedName
    description
    basePrice
    wikiLink
    weight

    # Relationships
    category { id name }
    bartersFor { id }
    bartersUsing { id }
    craftsFor { id }
    craftsUsing { id }
    usedInTasks { id name }
    receivedFromTasks { id name }

    # Flea Market / Price
    avg24hPrice
    sellFor { price currency vendor { ... on Vendor { name } } }
    buyFor { price currency vendor { ... on Vendor { name } } }

    # --- ItemProperties (union subtypes) ---
    properties {
      ... on ItemPropertiesAmmo {
        caliber
        stackMaxSize
        tracer
        tracerColor
        ammoType
        projectileCount
        damage
        armorDamage
        fragmentationChance
        ricochetChance
        penetrationChance
        penetrationPower
        penetrationPowerDeviation
        accuracyModifier
        recoilModifier
        initialSpeed
        lightBleedModifier
        heavyBleedModifier
        durabilityBurnFactor
        heatFactor
        staminaBurnPerDamage
        ballisticCoeficient
        bulletDiameterMilimeters
        bulletMassGrams
        misfireChance
        failureToFeedChance
      }
      ... on ItemPropertiesArmor {
        class
        durability
        repairCost
        speedPenalty
        turnPenalty
        ergoPenalty
        zones
        armorType
        bluntThroughput
        armorSlots { nameId zones }
        material {
          id
          name
          destructibility
          minRepairDegradation
          maxRepairDegradation
          explosionDestructibility
          minRepairKitDegradation
          maxRepairKitDegradation
        }
      }
      ... on ItemPropertiesArmorAttachment {
        class
        durability
        repairCost
        speedPenalty
        turnPenalty
        ergoPenalty
        zones
        armorType
        blindnessProtection
        bluntThroughput
        slots { id name }
        material {
          id
          name
          destructibility
          minRepairDegradation
          maxRepairDegradation
          explosionDestructibility
          minRepairKitDegradation
          maxRepairKitDegradation
        }
      }
      ... on ItemPropertiesBackpack {
        capacity
        speedPenalty
        turnPenalty
        ergoPenalty
        grids{
          width
          height
          filters{
            allowedItems {
              id
              name
              shortName
            }
          }
        }
      }
      ... on ItemPropertiesBarrel {
        ergonomics
        recoilModifier
        centerOfImpact 
        deviationCurve 
        deviationMax
        centerOfImpact
        deviationCurve
        deviationMax
        slots { id name }
      }
      ... on ItemPropertiesChestRig {
        capacity
        speedPenalty
        turnPenalty
        ergoPenalty
        zones
        armorType
        class
        durability
        repairCost
        bluntThroughput
        material {
          id
          name
        }
        armorSlots { nameId zones }
      }
      ... on ItemPropertiesContainer {
        capacity
        grids{
          width
          height
          filters{
            allowedItems {
              id
              name
              shortName
            }
          }
        }
      }
      ... on ItemPropertiesFoodDrink {
        energy
        hydration
        stimEffects { type value duration }
      }
      ... on ItemPropertiesGlasses {
        class
        durability
        repairCost
        blindnessProtection
        ergoPenalty
        bluntThroughput
        material{
          id
          name
          destructibility
          minRepairDegradation
          maxRepairDegradation
          explosionDestructibility
          minRepairKitDegradation
          maxRepairKitDegradation
        }
      }
      ... on ItemPropertiesGrenade {
        type
        fuse
        minExplosionDistance
        maxExplosionDistance
        fragments
      }
      ... on ItemPropertiesHeadwear {
        slots{
          id
          name
          nameId
          filters{
            allowedItems{
              id
              name
              shortName
            }
          }
          required
        }
      }
      ... on ItemPropertiesHeadphone {
        ambientVolume
        compressorAttack
        compressorRelease
        compressorThreshold
      }
      ... on ItemPropertiesHelmet {
        class
        durability
        repairCost
        speedPenalty
        turnPenalty
        ergoPenalty
        headZones
        material{
          id
          name
          destructibility
          minRepairDegradation
          maxRepairDegradation
          explosionDestructibility
          minRepairKitDegradation
          maxRepairKitDegradation
        }
        deafening
        blocksHeadset
        slots{
          id
          name
          nameId
          filters{
            allowedItems{
              id
              name
              shortName
            }
          }
          required
        }
        ricochetX
        ricochetY
        ricochetZ
        armorType
        bluntThroughput
        blindnessProtection
        armorSlots{
          nameId
          zones
        }
      }
      ... on ItemPropertiesKey {
        uses
      }
      ... on ItemPropertiesMagazine {
        capacity
        ergonomics
        recoilModifier
        allowedAmmo { id name }
      }
      ... on ItemPropertiesMedicalItem {
        uses
        useTime
        cures
      }
      ... on ItemPropertiesMelee {
        hitRadius
        slashDamage
        stabDamage
      }
      ... on ItemPropertiesMedKit {
        hitpoints
        useTime
        maxHealPerUse
        cures
        hpCostLightBleeding
        hpCostHeavyBleeding
      }
      ... on ItemPropertiesNightVision {
        intensity
        noiseIntensity
        noiseScale
        diffuseIntensity
      }
      ... on ItemPropertiesPainkiller {
        uses
        useTime
        cures
        painkillerDuration
        energyImpact
        hydrationImpact
      }
      ... on ItemPropertiesPreset {
        baseItem{
          id
          name
          shortName
        }
        ergonomics
        recoilVertical
        recoilHorizontal
        moa
        default
      }
      ... on ItemPropertiesResource {
        units
      }
      ... on ItemPropertiesScope {
        ergonomics
        sightModes
        sightingRange
        recoilModifier
        slots{
          id
          name
          nameId
          filters{
            allowedItems{
              id
              name
              shortName
            }
          }
          required
        }
        zoomLevels
      }
      ... on ItemPropertiesSurgicalKit {
        useTime
        maxLimbHealth
        cures
      }
      ... on ItemPropertiesWeapon {
        fireRate
        ergonomics
        recoilVertical
        recoilHorizontal
        defaultAmmo { id name }
        slots { id name }
      }
      ... on ItemPropertiesWeaponMod {
        ergonomics
        recoilModifier
        accuracyModifier
        slots { id name }
      }
      ... on ItemPropertiesStim {
        stimEffects { type value duration }
      }
    }
  }
}
`;