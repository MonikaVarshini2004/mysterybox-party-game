/**
 * src/data/surprises.js
 * Surprise Challenges: unpredictable mix of Group Challenges, Bonus Events,
 * and wild solo surprise activities.
 */

export const SURPRISES = [
  // Group Challenges
  {
    id: "s-g1",
    type: "group",
    subType: "Group Challenge",
    text: "Group Challenge! Everyone stands up and performs a synchronized sports stadium wave 3 times! 🌊",
    rules: "All players participate! The opener counts down '3, 2, 1, WAVE!'. If the wave breaks, repeat!",
    difficulty: "Easy",
    category: "group",
  },
  {
    id: "s-g2",
    type: "group",
    subType: "Group Challenge",
    text: "Group Chorus! All players must belt out the chorus of 'Happy Birthday' in extravagant opera style! 🎶",
    rules: "Everyone must join together in their grandest, most dramatic operatic voice for 20 seconds.",
    difficulty: "Medium",
    category: "group",
  },
  {
    id: "s-g3",
    type: "group",
    subType: "Group Challenge",
    text: "Freeze Dance Party! The box opener plays imaginary music. When they yell 'FREEZE!', everyone must freeze! 🧊",
    rules: "Anyone who laughs or moves first gives a high-five or funny cheer to the box opener!",
    difficulty: "Easy",
    category: "group",
  },
  {
    id: "s-g4",
    type: "group",
    subType: "Group Challenge",
    text: "Compliment Dominoes! Every player turns to their left and shares one hilarious or heartfelt compliment! 💖",
    rules: "Go clockwise around the room until all players have both given and received a compliment.",
    difficulty: "Easy",
    category: "group",
  },
  {
    id: "s-g5",
    type: "group",
    subType: "Group Challenge",
    text: "Group Charades! The box opener acts out a secret movie title silently; first player to guess wins! 🎬",
    rules: "No talking, no mouthing words. 60-second time limit for the room to guess correctly.",
    difficulty: "Hard",
    category: "group",
  },

  // Bonus Events
  {
    id: "s-b1",
    type: "bonus",
    subType: "Bonus Event",
    text: "🌟 Mystery Immunity Card! You earn an honorary Immunity Pass for this round!",
    rules: "You can automatically mark this box as complete, OR gift this immunity to any other player!",
    difficulty: "Easy",
    category: "bonus",
  },
  {
    id: "s-b2",
    type: "bonus",
    subType: "Bonus Event",
    text: "👑 Royal Decree! You are the Game Monarch for the next 2 turns!",
    rules: "You get to choose which music genre is hummed during the next challenge, or pick who goes next!",
    difficulty: "Easy",
    category: "bonus",
  },
  {
    id: "s-b3",
    type: "bonus",
    subType: "Bonus Event",
    text: "🎁 Secret Whispers! You are granted permission to ask any player one curious question in secret!",
    rules: "Whisper your question into their ear; they must answer aloud to the room with just one word!",
    difficulty: "Medium",
    category: "bonus",
  },
  {
    id: "s-b4",
    type: "bonus",
    subType: "Bonus Event",
    text: "🔄 Double Dare Switcheroo! You may swap this box's dare with any unrevealed box!",
    rules: "You can trade with another player's closed box or bravely accept this surprise!",
    difficulty: "Hard",
    category: "bonus",
  },

  // Solo Surprise Dares
  {
    id: "s-s1",
    type: "dare",
    subType: "Solo Surprise",
    text: "Impromptu Weather Report: Report on tomorrow's weather in your city as if an apocalypse of kittens arrived! 🐱",
    rules: "Keep a serious meteorologist demeanor for 30 seconds while describing fluffy clouds and kittens.",
    difficulty: "Medium",
    category: "acting",
  },
  {
    id: "s-s2",
    type: "dare",
    subType: "Solo Surprise",
    text: "Statue Challenge: Hold a dramatic Greek statue pose for 45 seconds while others attempt to make you smile! 🗿",
    rules: "No blinking competitions required, just keep the statue pose still and proud!",
    difficulty: "Medium",
    category: "funny",
  },
  {
    id: "s-s3",
    type: "dare",
    subType: "Solo Surprise",
    text: "Alien Handshake: Invent a futuristic 5-step alien handshake and teach it to the person across from you! 👽",
    rules: "Include sound effects for each movement. Both of you must perform it successfully once.",
    difficulty: "Hard",
    category: "creative",
  },
];
