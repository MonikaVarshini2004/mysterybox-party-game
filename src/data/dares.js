/**
 * src/data/dares.js
 * Organized dare challenges with difficulty levels and categories:
 * acting, singing, dancing, funny, creative, quick-thinking.
 * All dares are safe, playful, and 100% voluntary.
 */

export const DARES = [
  // Easy
  {
    id: "d-e1",
    text: "Pretend you're a high-energy DJ dropping an imaginary beat for 30 seconds! 🎧",
    difficulty: "Easy",
    category: "acting",
  },
  {
    id: "d-e2",
    text: "Invent a 10-second commercial jingle singing about your favorite snack! 🍫",
    difficulty: "Easy",
    category: "singing",
  },
  {
    id: "d-e3",
    text: "Show your signature disco dance move with maximum enthusiasm! 🕺",
    difficulty: "Easy",
    category: "dancing",
  },
  {
    id: "d-e4",
    text: "Name 5 yellow fruits or vegetables in under 8 seconds! 🍌",
    difficulty: "Easy",
    category: "quick-thinking",
  },
  {
    id: "d-e5",
    text: "Tell a funny pun or one-liner with a completely straight face! 😐",
    difficulty: "Easy",
    category: "funny",
  },
  {
    id: "d-e6",
    text: "Invent an original superhero name and strike their epic battle pose! 🦸",
    difficulty: "Easy",
    category: "creative",
  },
  {
    id: "d-e7",
    text: "Do a slow-motion victory celebration across the room! 🏆",
    difficulty: "Easy",
    category: "funny",
  },

  // Medium
  {
    id: "d-m1",
    text: "Act out an over-the-top scene of ordering hot coffee in a pirate accent! 🏴‍☠️",
    difficulty: "Medium",
    category: "acting",
  },
  {
    id: "d-m2",
    text: "Sing the chorus of any hit pop song in an exaggerated operatic voice! 🎤",
    difficulty: "Medium",
    category: "singing",
  },
  {
    id: "d-m3",
    text: "Perform the robot dance while beatboxing your own background music! 🤖",
    difficulty: "Medium",
    category: "dancing",
  },
  {
    id: "d-m4",
    text: "Recite the alphabet backward starting from Z to M in 20 seconds! ⏱️",
    difficulty: "Medium",
    category: "quick-thinking",
  },
  {
    id: "d-m5",
    text: "Pretend you are a runway fashion model wearing an imaginary avant-garde outfit! 👠",
    difficulty: "Medium",
    category: "acting",
  },
  {
    id: "d-m6",
    text: "Create a dramatic 30-second movie trailer using only the words 'banana' and 'mystery'! 🍌",
    difficulty: "Medium",
    category: "creative",
  },
  {
    id: "d-m7",
    text: "Do your best impression of a startled cat seeing a cucumber! 🐱",
    difficulty: "Medium",
    category: "funny",
  },

  // Hard
  {
    id: "d-h1",
    text: "Moonwalk across the room while whistling or humming a dramatic theme song! 🌙",
    difficulty: "Hard",
    category: "dancing",
  },
  {
    id: "d-h2",
    text: "Speak entirely in rhyming couplets for the next full minute! 📜",
    difficulty: "Hard",
    category: "creative",
  },
  {
    id: "d-h3",
    text: "Perform an impromptu 30-second rap summarizing what happened earlier today! 🎙️",
    difficulty: "Hard",
    category: "singing",
  },
  {
    id: "d-h4",
    text: "Act out a dramatic soap-opera plot twist monologue completely on the spot! 🎭",
    difficulty: "Hard",
    category: "acting",
  },
  {
    id: "d-h5",
    text: "Name 10 countries starting with different letters in 25 seconds! 🌍",
    difficulty: "Hard",
    category: "quick-thinking",
  },
  {
    id: "d-h6",
    text: "Attempt the salsa or flamenco footwork rhythm for 30 uninterrupted seconds! 💃",
    difficulty: "Hard",
    category: "dancing",
  },
  {
    id: "d-h7",
    text: "Say this tongue twister 4 times fast: 'Unique New York, You know you need unique New York'! 👅",
    difficulty: "Hard",
    category: "quick-thinking",
  },
];

// String array preserving existing functionality
export const DEFAULT_DARES = DARES.map((d) => d.text);
