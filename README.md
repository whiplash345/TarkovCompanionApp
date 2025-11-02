# TarkovCompanionApp
Tarkov Companion App for Capstone final project at Full Sail University

## Introduction
This Tarkov companion app will serve two main features, tracking progression and calculating cultist circle value. In Tarkov, tracking progressions towards certain goals like obtaining the Kappa container and Lightkeeper trader can be difficult as the game does not provide in-game indicators. This app will help users focus their time on working towards these specific goals to obtain what they want and avoid working on unnecessary missions. The cultist circle valculator also fills a massive gap the the game lacks. The true base-value of an item is not known in game and the cultist circle calculates the value of thew return based on this. Players will want to hit certain values of sacrificed items for certain returns, but struggle when they do not know the true value of the item. The cultist circle feature is able to use API that pulls the base value of items, allowing players to search for items they may have or want to but to sacrifice in their cultist circle.

## Features

The progression feature will consist of three main frames:
- Task Progression
- Hideout Progression
- Needed Items Progression
- AI Chat Bot

The cultist circle feature will consist of one frame that will allow the searching of items and value calculation to pass the needed amount.

## Technologies and Development Setup

The app will be programmed in React Nativew and Type Script. It uses a GraphQL API pull from Tarkov.dev to get all necessary data to keep the app up to date. Everything is coded dynamically, so the app should update naturally when changes are made to tasks and such. I am developing the app primarily in VSCode while using an Android Studio emulator to view the progress. I have a supabase database ready, though I am not sure I want to use accounts for this app. With the direction I am going, I may just have users store their progress on their local devices. However, I will still be using this database as my own hub for API calls. Instead of having every user call Tarkov.dev every time there is an update, my database will make calls every 5 minutes (As suggested by Tarkov.dev for active updates) and all users will call from it for their updated app data. Anyone who would be developing along with me will need to install dependencies for git, TypeScript, React, and Expo. They would need to download VSCode for coding and Android Studio to run the emulator. The emulator is controlled entirely by expo. Specific steps for starting and finished a day's development are in the CodingHelp folder at the top of the root directory. In addition to this, I will also be using a ChatGPT API call with a RAG using Chromo DB and BM25 to create a robust AI chat companion for anyone using the app.

## Installation

There is currently no available instalation. This project is still in development and has not reached it's alpha yet.

## License

MIT License

## Contributers

- whiplash345

## Project status

Alpha development