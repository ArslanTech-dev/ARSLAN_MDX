export function getTruth() {
  const truths = [
    "What's the most embarrassing thing you've done?",
    "Have you ever lied to your best friend?",
    "Who was your first crush?"
  ];
  return truths[Math.floor(Math.random() * truths.length)];
}

export function getDare() {
  const dares = [
    "Send a selfie right now!",
    "Type a message using only your nose.",
    "Call a friend and say 'I love you'."
  ];
  return dares[Math.floor(Math.random() * dares.length)];
}

export function get8Ball(question) {
  const answers = ["Yes, definitely.", "It is certain.", "Without a doubt.", "Most likely.", "Ask again later.", "Don't count on it.", "My reply is no."];
  return answers[Math.floor(Math.random() * answers.length)];
}