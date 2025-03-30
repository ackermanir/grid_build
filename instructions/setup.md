# Deck Building Game Specification

## Overview
A deck building game similar to Spirit Island and Dominion, with a grid-based play area, resource management, and tech tier progression.

## Game Setup

### Initial Player State
* Start with a deck of 10 cards:
  * Defend - 4 cards
  * Copper - 4 cards
  * Til the Land - 2 cards

### Player Attributes
* **Card Plays**: How many card plays the player has on a turn. Starts at 4 each round.
* **Buy**: How many cards the player can buy this turn. Starts at 1.
* **Gold**: How much gold is available to buy. Player starts at 0 each turn.
* **Card draw**: How many cards will be drawn at the start of the turn. Starts at 5.
* **Wounds**: How many wounds the player has in their deck. Starts at 0.
* **Tech tier level**: Starts at 1, can go up to 5 (victory).

## Game Board

### Play Area
* 3x3 grid with three land types (randomly distributed)
* Land Types (3 of each on the grid):
  * **Generate Gold (Yellow)**
    * +2 gold
  * **Generate Cards (Blue)**
    * Draw 1 card
  * **Generate Card Play (Red)**
    * +0.5 card play (add 1 card play every two benefits)

## Enemy Mechanics

### Attack Pattern
* **Rounds 1-2**:
  * No attacks
* **Rounds 3-7**:
  * Attack 1-3 random tiles with 2 damage each
* **Rounds 8-12**:
  * Attack 3-5 random tiles with 2 damage each
* **Rounds 12+**:
  * Attack 5 random tiles with 4 damage each

### Attack Resolution
* Enemy attacks that are going to happen at the end of the turn are shown with a number in the top right corner of a tile
* Player can negate damage by playing a card with defense on that tile
* If damage is not negated:
  * A wound is added to player's discard pile
  * Wound cards cost 0 and have no actions
* After 4 wounds: Player draws 1 less card per turn
* After 6 wounds in deck: Player loses

## Gameplay

### Turn Structure
1. Draw cards up to Card draw attribute
2. Play cards based on number of card plays remaining
3. Buy cards based on number of buys left
4. Discard any used and remaining cards

### Card Playing Mechanics
* When a card is played, it is placed on a grid tile
* Card affects the grid it's played on (e.g., adding defense)
* If a card lists "Land Benefit", player gets the modifiers of that land type
* Defense for a tile is the sum of all cards that impacted it
* Only one card can be played on each tile in a turn
* When a card is played, its emoji appears in the center of the tile

### Deck Mechanics
* Standard deck drawing rules apply
* When draw deck is empty, discard pile is shuffled to form a new draw deck

### Victory and Defeat
* **Victory**: Reach Tech tier 5
* **Defeat**: Accumulate 6+ wounds in deck

## UI Requirements

### Display Elements
* Player attributes
* Round count
* List of cards in hand
* Grid with land types and defense values
* Shop (available cards to buy)

### Interactions
* Click on card to play it, then click on grid tile to place it
* Ineligible grid tiles should not respond to clicks
* Click on card in shop to buy (if you have enough gold)
* All card types should be available at once to buy in the shop (unless the shop is out of that card type)
* End turn button

## Technical Implementation

* Built using React and TypeScript
* Deployed on GitHub Pages
* Core game logic separated from UI for testing
* Cards available to buy are defined in cards.csv file, please read this file and implement them as strongly typed
