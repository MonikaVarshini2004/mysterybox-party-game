/**
 * src/data/truths.js
 * Curated collection of safe, fun, and voluntary Truth questions.
 * Categorized by difficulty ("Easy" | "Medium" | "Hard") and category.
 */

export const TRUTHS = [
  // Easy
  {
    id: "t-e1",
    text: "What is the most ridiculous fashion trend you ever enthusiastically rocked?",
    difficulty: "Easy",
    category: "funny",
  },
  {
    id: "t-e2",
    text: "If you could only eat one food for the rest of your life, what would it be?",
    difficulty: "Easy",
    category: "creative",
  },
  {
    id: "t-e3",
    text: "What is an animated character you secretly related to as a child?",
    difficulty: "Easy",
    category: "acting",
  },
  {
    id: "t-e4",
    text: "What is your go-to karaoke anthem when you have the microphone all to yourself?",
    difficulty: "Easy",
    category: "singing",
  },
  {
    id: "t-e5",
    text: "If you were gifted an exotic animal as a pet tomorrow, which one would you pick?",
    difficulty: "Easy",
    category: "creative",
  },
  {
    id: "t-e6",
    text: "Name 3 items currently in your bag, backpack, or pocket right now!",
    difficulty: "Easy",
    category: "quick-thinking",
  },
  {
    id: "t-e7",
    text: "What dance move do you secretly think looks super cool even if no one else does?",
    difficulty: "Easy",
    category: "dancing",
  },

  // Medium
  {
    id: "t-m1",
    text: "What is the weirdest superstition or little habit you secretly still do?",
    difficulty: "Medium",
    category: "funny",
  },
  {
    id: "t-m2",
    text: "What is an unpopular opinion about music, movies, or food you will defend fiercely?",
    difficulty: "Medium",
    category: "quick-thinking",
  },
  {
    id: "t-m3",
    text: "What was your most hilarious or awkward moment during a video call?",
    difficulty: "Medium",
    category: "funny",
  },
  {
    id: "t-m4",
    text: "If you were cast in a major blockbuster film, what role or villain would you play?",
    difficulty: "Medium",
    category: "acting",
  },
  {
    id: "t-m5",
    text: "What was the very first music album or cassette you ever bought or obsessively listened to?",
    difficulty: "Medium",
    category: "singing",
  },
  {
    id: "t-m6",
    text: "What is a creative hobby or craft you've always wanted to try but haven't yet?",
    difficulty: "Medium",
    category: "creative",
  },
  {
    id: "t-m7",
    text: "If you had to do a flash-mob dance tomorrow, which iconic song would you dance to?",
    difficulty: "Medium",
    category: "dancing",
  },

  // Hard
  {
    id: "t-h1",
    text: "What is the funniest or weirdest excuse you ever invented to get out of an invitation?",
    difficulty: "Hard",
    category: "funny",
  },
  {
    id: "t-h2",
    text: "If you had to swap lives with any player in this room for 24 hours, who would it be?",
    difficulty: "Hard",
    category: "creative",
  },
  {
    id: "t-h3",
    text: "What is a hidden talent or quirky party trick that hardly anyone in this room knows about?",
    difficulty: "Hard",
    category: "creative",
  },
  {
    id: "t-h4",
    text: "If you had 60 seconds to pitch a bizarre invention on Shark Tank, what would it be?",
    difficulty: "Hard",
    category: "quick-thinking",
  },
  {
    id: "t-h5",
    text: "What is the most dramatic monologue or impression you could attempt on the spot?",
    difficulty: "Hard",
    category: "acting",
  },
  {
    id: "t-h6",
    text: "What song can you recite all the lyrics to with 100% accuracy right now?",
    difficulty: "Hard",
    category: "singing",
  },
];

// String array for backward compatibility
export const DEFAULT_TRUTHS = TRUTHS.map((t) => t.text);
