import React from "react";
import TipsPage, { type Tip } from "./TipsPage";

const ICON = "../images/icons/training.svg";

const tips: Tip[] = [
  {
    id: "positive-reinforcement",
    icon: ICON,
    image: "../images/tips/positive.jpg",
    title: "Positive reinforcement - the science",
    summary: "Reward-based training isn't just kinder - it consistently produces better results and a stronger bond than punishment-based methods.",
    points: [
      { text: "When a behaviour is followed by something pleasant, the brain releases dopamine, reinforcing that behaviour. The dog learns: doing this makes good things happen." },
      { text: "Multiple studies show reward-trained dogs are more obedient, less anxious, less aggressive, and better at problem-solving." },
      { text: "A marker (clicker or sharp 'yes!') bridges the gap between behaviour and reward - it must come within 1–2 seconds of the desired behaviour." },
      { text: "The Three Ds of proofing — increase Duration, Distance, and Distraction gradually. Never increase more than one at a time." },
    ],
    callout: { label: "Why punishment backfires", text: "Punishment suppresses behaviour short-term but leaves the underlying motivation intact. It damages trust, can trigger aggression, and often makes problems worse over time." },
  },
  {
    id: "sit",
    icon: ICON,
    image: "../images/tips/sit.png",
    title: "Teaching 'sit'",
    summary: "Sit is usually the first command taught and forms the basis of many others. It gives your dog something to do instead of jumping, pulling, or demanding attention.",
    points: [
      { text: "Hold a treat close to your dog's nose, then slowly raise your hand - their bottom lowers as their nose follows up." },
      { text: "Mark the instant their bottom touches the floor, then reward." },
      { text: "Add the verbal cue 'sit' only once they're reliably following the hand movement — saying it early adds confusion." },
      { text: "Practice in 3-5 repetition bursts, multiple times a day, in different locations." },
      { text: "Use sit before meals, before going through doors, and before greetings - this builds it into real life." },
    ],
  },
  {
    id: "stay",
    icon: ICON,
    image: "../images/tips/stay.png",
    title: "Teaching 'stay'",
    summary: "Stay teaches impulse control and keeps your dog safe at roadsides, before being released from the car, and in busy environments.",
    points: [
      { text: "Ask for a sit, then hold your palm flat towards them and take one small step back. Mark and reward immediately if they don't move." },
      { text: "Build duration before distance - start with 1 second, then 2, then 5, before adding physical distance." },
      { text: "Always return to your dog to release them - calling them out of stay makes recall harder to train separately." },
      { text: "Add a release cue ('okay', 'free') so they know when the behaviour ends - stay means stay until told otherwise." },
    ],
    callout: { label: "Never punish a slow stay", text: "If your dog moves, simply reset and try with less difficulty. Making stay negative destroys the behaviour faster than anything else." },
  },
  {
    id: "recall",
    icon: ICON,
    image: "../images/tips/recall.webp",
    title: "Building a reliable recall",
    summary: "Recall is the most important safety command - and the most carefully maintained. A reliable 'come' could save your dog's life.",
    points: [
      { text: "Never punish a dog who comes to you, even if they took a long time - this teaches them that coming back equals bad things." },
      { text: "Make coming to you the best thing that happened in their day. Use the highest-value reward in your toolkit." },
      { text: "Use a long line (5-10m) while practising so you can gently reel them in if needed — never let them 'win' by running off." },
      { text: "Build in easy environments first, then progressively more distracting ones over weeks." },
      { text: "Have a special recall word used only for this - not 'come' if you've already poisoned it by using it when they don't comply." },
    ],
    callout: { label: "Emergency recall", text: "Train a 'super recall' — a sound (whistle or unique word) paired with an extraordinary reward like a jackpot of chicken. Use it sparingly so it never loses its power." },
  },
  {
    id: "down",
    icon: ICON,
    image: "../images/tips/down.jpg",
    title: "Teaching 'down'",
    summary: "Down is harder than sit for many dogs as it requires more physical vulnerability. It's extremely useful for long-duration settled behaviour.",
    points: [
      { text: "From a sit, hold a treat in front of their nose and bring it slowly to the ground between their paws." },
      { text: "When elbows touch the floor, mark immediately and reward." },
      { text: "If they won't follow the lure all the way down, try luring under your bent knee — they duck under and end up in a down naturally." },
      { text: "Don't push or force the position — this creates resistance and undermines trust." },
      { text: "Add the verbal cue only once the movement is reliable." },
    ],
  },
  {
    id: "leave-it",
    icon: ICON,
    image: "../images/tips/leaveit.jpg",
    title: "Teaching 'leave it'",
    summary: "Leave it teaches your dog to disengage from something - dropped food, a dead animal, road debris. It's a genuine safety behaviour.",
    points: [
      { text: "Hold a treat in your closed fist. Your dog will sniff, lick, paw — wait. When they back off, mark and reward from your other hand." },
      { text: "Progress: treat on floor covered by your foot → uncovered but guarded → verbal cue added → treats on the ground with you standing away." },
      { text: "The rule: they never get the thing they were asked to leave — the reward always comes from you." },
      { text: "Practice with everyday items on walks before needing it in a real situation." },
    ],
    callout: { label: "Drop it vs leave it", text: "Leave it means don't take it. Drop it means release what's in your mouth. They're different — both are worth training." },
  },
  {
    id: "loose-lead",
    icon: ICON,
    image: "../images/tips/loose-leash.png",
    title: "Loose lead walking",
    summary: "Dogs pull because it works - they go forward, the owner follows. The fix is making pulling completely ineffective and loose lead highly rewarding.",
    points: [
      { text: "The core rule: a tight lead never means forward movement. The moment tension appears — stop completely. Say nothing. Wait." },
      { text: "When your dog turns to look at you or releases tension, mark and reward. Then move forward again." },
      { text: "Start in a low-distraction environment - not the street. Build to busier areas once the behaviour is solid at home." },
      { text: "Every person who walks the dog must use the same approach - one person allowing pulling undoes everyone else's work." },
      { text: "Front-clip harnesses redirect rather than punish pulling - useful management while training." },
    ],
    callout: { label: "Expect weeks not days", text: "Loose lead walking takes consistent work over weeks. Every walk is a training session. Allowing pulling on even one walk reinforces that pulling sometimes works." },
  },
  {
    id: "crate-training",
    icon: ICON,
    image: "../images/tips/crate.jpg",
    title: "Crate training",
    summary: "A crate introduced correctly becomes a chosen den - a private, secure space your dog goes to voluntarily.",
    points: [
      { text: "Never use the crate as punishment - this ruins the association entirely." },
      { text: "Introduction: leave door open, scatter treats inside, feed meals just inside the doorway, gradually move bowl further back over several days." },
      { text: "Build duration slowly: door closed for a few seconds → minutes → leaving the room → leaving the house." },
      { text: "Always return before your dog becomes distressed - you want the crate to predict your reliable return, not abandonment." },
      { text: "Duration limits: approximately 1 hour per month of age for puppies up to 4 hours maximum. Adults maximum 4-5 hours daytime." },
    ],
    callout: { label: "Frozen Kong", text: "A Kong stuffed with wet food and frozen overnight takes 15-20 minutes to empty and keeps your dog happily occupied throughout." },
  },
  {
    id: "separation-anxiety",
    icon: ICON,
    image: "../images/tips/anxiety-separation.avif",
    title: "Separation anxiety",
    summary: "True separation anxiety is a genuine panic response, not disobedience. Understanding the difference changes how you approach it.",
    points: [
      { text: "Classic signs (within 30 minutes of leaving, often within 5): destructive behaviour near exits, continuous barking/howling, house soiling, drooling, attempts to escape." },
      { text: "Set up a camera before leaving - this is the most accurate diagnosis tool. Many owners discover their dog settles within minutes." },
      { text: "Graduated desensitisation: start by picking up keys and putting them down, then going to the door and back, then stepping outside for 1 second. Build duration never triggering a full anxiety response." },
      { text: "Avoid dramatic departures and returns - these increase the contrast between presence and absence." },
      { text: "Moderate to severe separation anxiety almost always needs a clinical animal behaviourist alongside the owner's work." },
    ],
    callout: { label: "Medication", text: "Medication can be a valuable tool alongside behaviour modification - not a substitute for it. Speak to your vet, who can refer to a behaviourist." },
  },
  {
    id: "socialisation",
    icon: ICON,
    image: "../images/tips/socialising.webp",
    title: "Socialisation",
    summary: "The critical window is 3-14 weeks, but adult dogs can absolutely learn to be more comfortable in the world with patience.",
    points: [
      { text: "Socialisation is not just meeting other dogs - it's positive exposure to the full range of things your dog will encounter in life." },
      { text: "People (children, hats, uniforms), animals, environments, sounds, surfaces, and handling all need to be covered." },
      { text: "The dog's emotional state during exposure is everything - an overwhelmed dog is being flooded, not socialised." },
      { text: "Start at distance from anything worrying. Let them approach at their own pace. Pair novel things with high-value food." },
      { text: "One bad experience can undo significant progress - manage the environment carefully, especially early on." },
    ],
    callout: { label: "Adult dogs", text: "Gradual progress built on the dog's comfort level is sustainable. Flooding - forcing a dog to 'get over it' - can permanently worsen fear responses." },
  },
  {
    id: "house-training",
    icon: ICON,
    image: "../images/tips/housetraining.avif",
    title: "House training",
    summary: "House training is almost entirely about management and timing - not punishment. Get both right and it typically happens within a few weeks.",
    points: [
      { text: "Take puppies outside every 30-45 minutes, after every meal, after every nap, and after every play session." },
      { text: "Go outside with them and reward the instant they finish - not when they come back inside. Timing is critical." },
      { text: "Accidents happen - clean with an enzymatic cleaner to remove the scent completely. Punishing accidents doesn't help and makes dogs hide from you to go." },
      { text: "Watch for pre-toilet signals: circling, sniffing, squatting, or suddenly losing interest in play." },
      { text: "Consistent feeding times make toilet times more predictable." },
    ],
    callout: { label: "Night time", text: "Puppies under 4 months typically cannot hold their bladder for more than 4 hours. Set an alarm rather than expecting them to last the night." },
  },
  {
    id: "jumping",
    icon: ICON,
    image: "../images/tips/stopjumping.jpg",
    title: "Stopping jumping up",
    summary: "Jumping up is a greeting behaviour that works - someone always reacts. Making it unrewarding is straightforward once everyone is consistent.",
    points: [
      { text: "The fix: remove all reward from jumping. Turn away completely, cross arms, look at the ceiling. Zero eye contact, zero touch, zero voice." },
      { text: "The moment all four paws are on the floor - mark and reward immediately." },
      { text: "Ask visitors to do the same - a dog who is greeted when jumping by even one person will keep trying." },
      { text: "Reward a sit as an incompatible alternative - a dog sitting cannot simultaneously jump." },
      { text: "Don't alternate between allowing jumping (when you're dressed casually) and stopping it (when you're dressed up) - this inconsistency makes it much harder to train." },
    ],
  },
  {
    id: "barking",
    icon: ICON,
    image: "../images/tips/barking.avif",
    title: "Managing excessive barking",
    summary: "Barking is normal dog communication. 'Excessive' means the behaviour has become habitual or anxiety-driven - both are addressable.",
    points: [
      { text: "Identify the trigger before trying to fix it - alert barking, demand barking, boredom barking, anxiety barking, and reactive barking all have different solutions." },
      { text: "Alert barking at the window: block visual access first, then desensitise to the trigger from a distance with counter-conditioning." },
      { text: "Demand barking (for attention or food): never reward it - wait for quiet, even briefly, before giving the dog what they want." },
      { text: "Boredom barking: more exercise, more mental stimulation, enrichment activities." },
      { text: "Shouting 'quiet!' rewards alert barking - your dog thinks you're joining in. A calm, quiet response is more effective." },
    ],
    callout: { label: "Reactive barking", text: "On-lead reactivity (barking at dogs, people, bikes) is a specific behaviour that benefits enormously from a qualified trainer or behaviourist." },
  },
  {
    id: "resource-guarding",
    icon: ICON,
    image: "../images/tips/guarding.jpeg",
    title: "Resource guarding",
    summary: "Growling over food, toys, or spaces is normal canine behaviour - but it needs to be managed carefully and not punished.",
    points: [
      { text: "A growl is a warning signal - punishing it removes the warning but not the underlying emotion, making bites more likely." },
      { text: "Prevention: from puppyhood, regularly approach the food bowl, add a treat, and walk away. Teach the dog that people near their food means good things." },
      { text: "Trade-up: teach 'drop it' using high-value exchanges so that giving something up always predicts something better appearing." },
      { text: "Never take things by force - this escalates guarding and damages trust." },
      { text: "Moderate to severe resource guarding - involving snapping or biting - needs a qualified behaviourist assessment." },
    ],
  },
  {
    id: "enrichment",
    icon: ICON,
    image: "../images/tips/Mental_enrichment.jpg",
    title: "Mental enrichment",
    summary: "Mental stimulation tires dogs as effectively as physical exercise and addresses many common behaviour problems rooted in boredom.",
    points: [
      { text: "Sniffy walks - allowing your dog to stop and sniff as long as they want provides significant mental stimulation." },
      { text: "Food puzzles and Kongs - feeding meals from puzzle feeders adds 10-20 minutes of problem-solving to every meal." },
      { text: "Scatter feeding - scatter kibble in grass for natural foraging behaviour." },
      { text: "Nose work - hide treats around the house and cue your dog to find them; builds confidence and tires dogs quickly." },
      { text: "Training sessions - 5 minutes of learning a new skill provides comparable mental fatigue to a 30-minute walk for many dogs." },
    ],
    callout: { label: "Under-stimulation", text: "Destructive behaviour, excessive barking, and hyperactivity at home are often symptoms of insufficient mental and physical outlet — not personality problems." },
  },
  {
    id: "professional-trainer",
    icon: ICON,
    image: "../images/tips/trainer.jpg",
    title: "Choosing a professional trainer",
    summary: "Dog training is unregulated in the UK - anyone can call themselves a trainer. Knowing what to look for protects your dog.",
    points: [
      { text: "Look for: ABTC, APBC, IMDT, or CCPDT accreditation - these require qualification and adherence to professional standards." },
      { text: "A good trainer explains their methods clearly and welcomes questions. Force-free, reward-based methods are supported by the current science." },
      { text: "Avoid: prong collars, shock collars, choke chains, and 'dominance-based' approaches - the dominance model has been comprehensively rejected by modern animal behaviour science." },
      { text: "For aggression, severe anxiety, or any behaviour involving biting, a clinical animal behaviourist rather than a general trainer is appropriate." },
    ],
    callout: { label: "Vet referral", text: "Your vet can refer you to a clinical behaviourist directly - similar to a specialist referral. For serious behaviour problems, this is the recommended route." },
  },
  {
    id: "tricks",
    icon: ICON,
    image: "../images/tips/dog_tricks.jpg",
    title: "Teaching tricks",
    summary: "Tricks aren't just fun - they build confidence, improve focus, and strengthen the training relationship between you and your dog.",
    points: [
      { text: "Spin / twist: lure your dog in a circle with a treat held close to their nose." },
      { text: "Paw / shake: tap or hold their paw, immediately mark and reward the moment they lift it." },
      { text: "Roll over: from a down, lure with a treat from their nose over their shoulder until they tip onto their side, then over." },
      { text: "Touch: hold your palm out flat - any nose-to-palm contact gets marked and rewarded. Builds towards targeting and direction changes." },
      { text: "Middle: stand with legs slightly apart, lure your dog to walk through and stand between your legs." },
    ],
    callout: { label: "Short sessions", text: "5 minutes of trick training burns significant mental energy and ends on a positive. Always finish with something your dog knows well so the session ends in success." },
  },
];

const TipsTraining: React.FC = () => (
  <TipsPage
    category="training"
    title="Training"
    titleAccent="& behaviour"
    subtitle="Science-backed training advice to build confidence, strengthen your bond, and tackle problem behaviours — from first commands to fixing habits that have crept in."
    heroIcon="../images/Illustrations/training-art(1).png"
    tips={tips}
  />
);

export default TipsTraining;