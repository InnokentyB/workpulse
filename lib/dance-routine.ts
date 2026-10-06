export type DanceVariant = "seated" | "standing";
export const DANCE_BEATS = 8;
export const DANCE_BEAT_MS = 750;
export const DANCE_PHRASES = [
  { name: "Side to side", seated: "Stay seated. Tap your left heel, then your right heel, alternating gently.", standing: "Step left and bring your right foot beside it, then step right and bring your left foot beside it." },
  { name: "Shoulder groove", seated: "Keep your feet on the floor. Gently lift and relax your shoulders with the rhythm.", standing: "Stand comfortably. Gently lift and relax your shoulders with the rhythm." },
  { name: "Reach and return", seated: "Reach one hand forward at chest height, return, then repeat with the other hand.", standing: "Reach one hand forward at chest height, return, then repeat with the other hand." },
  { name: "Easy sway", seated: "Keep both feet grounded. Gently shift your upper body left and right without leaning far.", standing: "Shift your weight gently left and right, keeping both feet close to the floor." },
  { name: "Heel pulses", seated: "Tap your heels forward, one at a time, with small relaxed movements.", standing: "Tap one heel forward and bring it back, then switch feet. Keep the steps small." },
  { name: "Soft finish", seated: "Open your hands gently to the sides, bring them back in and let your shoulders relax.", standing: "Open your hands gently to the sides, bring them back in and settle into a comfortable stance." },
] as const;
