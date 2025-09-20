const AchievementQuery = `
  query {
    achievements(lang: en) 
        {
            id
            name
            description
            hidden
            playersCompletedPercent
            adjustedPlayersCompletedPercent
            side
            normalizedSide
            rarity
            normalizedRarity
            imageLink
        }
    }
`;