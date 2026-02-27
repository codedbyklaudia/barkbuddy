import React from "react";
import TipsPage, { type Tip } from "./TipsPage";

const ICON = "/images/paint/groomer.png";

const tips: Tip[] = [
  {
    id: "brushing",
    icon: ICON,
    title: "Brushing your dog's coat",
    summary: "The right brush used consistently prevents matting, distributes natural oils, and gives you a chance to check for skin issues.",
    points: [
      { text: "Match the brush to the coat type", sub: ["Slicker brush for medium and double coats", "Pin brush for long, silky coats", "Bristle brush for short, smooth coats", "Deshedding tool for double-coated breeds during shedding season"] },
      { text: "Brush in the direction of hair growth using long, gentle strokes - never drag against the grain." },
      { text: "Hold the base of any mat close to the skin before working through it - this stops you pulling the skin." },
      { text: "Pay extra attention to armpits, behind the ears, around the collar, and between the toes - these spots mat first." },
    ],
    callout: { label: "How often?", text: "Short coats: weekly. Medium coats: 2–3× a week. Long or curly: daily. Double coats: daily during shedding season." },
  },
  {
    id: "bathing",
    icon: ICON,
    title: "Bathing at home",
    summary: "Every 4–6 weeks is ideal. Too frequent strips natural oils; too infrequent allows skin issues to develop.",
    points: [
      { text: "Always brush before bathing - wet fur mats far more easily than dry." },
      { text: "Use a dog-specific shampoo - human products have the wrong pH for canine skin." },
      { text: "Lukewarm water only. Apply shampoo from neck to tail in circular motions. Flannel for the face - never pour water over the head." },
      { text: "Rinse until the water runs completely clear - shampoo residue is a common cause of skin irritation." },
      { text: "Press towels into the coat rather than rubbing, which causes tangles." },
    ],
    callout: { label: "Drying", text: "If using a hairdryer, lowest heat, keep it moving constantly. Never hold it in one spot." },
  },
  {
    id: "nails",
    icon: ICON,
    title: "Nail trimming",
    summary: "Overgrown nails change your dog's gait and put strain on joints. Understanding the quick is the key to confident trimming.",
    points: [
      { text: "The quick is the blood vessel inside the nail - on light nails it shows pink, on dark nails watch for a grey oval appearing in the cut surface." },
      { text: "Make a single, decisive cut with sharp clippers - hesitating or blunt clippers crush rather than cut." },
      { text: "Trim small amounts at a time. File rough edges smooth afterwards." },
      { text: "Don't forget dewclaws - the inner leg claw that doesn't wear down naturally." },
    ],
    callout: { label: "If you cut the quick", text: "Apply styptic powder or press cornstarch firmly for 1-2 minutes. Stay calm - it stops quickly." },
  },
  {
    id: "ears",
    icon: ICON,
    title: "Ear cleaning",
    summary: "Floppy-eared breeds and swimmers need regular ear cleaning to prevent infections. Over-cleaning is just as harmful as neglect.",
    points: [
      { text: "Healthy ears are pale pink, odourless, and have minimal wax. Check weekly." },
      { text: "Use only vet-approved ear cleaning solution - not water or home remedies." },
      { text: "Apply, massage the base for 20–30 seconds, let your dog shake, then wipe the outer canal with a cotton ball - never a cotton bud." },
      { text: "Red, swollen, smelly, or painful ears need a vet visit - not home cleaning. It can make it worse!" },
    ],
    callout: { label: "Warning signs", text: "Frequent head-shaking, dark crumbly debris, or strong smell all indicate a vet visit is needed before any cleaning attempt." },
  },
  {
    id: "dental",
    icon: ICON,
    title: "Dental care",
    summary: "80% of dogs show dental disease by age three. Daily brushing is gold standard - but effective alternatives exist.",
    points: [
      { text: "Use dog-specific toothpaste only - human toothpaste contains xylitol and fluoride, both TOXIC to dogs." },
      { text: "Introduce brushing gradually: fingertip → finger brush → toothbrush over several sessions." },
      { text: "Focus on outer surfaces of back teeth - where tartar builds fastest." },
      { text: "Alternatives in descending effectiveness: VOHC-approved dental chews, water additives, dental diets, dental wipes." },
    ],
    callout: { label: "Bad breath is not normal", text: "Persistent bad breath is usually the first sign of dental disease - not a normal dog smell. If your dog has a bad smell, mention it to your vet at your next visit." },
  },
  {
    id: "shedding",
    icon: ICON,
    title: "Managing seasonal shedding",
    summary: "Twice-yearly coat blowouts are normal for double-coated breeds. Managing them well saves your furniture and keeps your dog comfortable.",
    points: [
      { text: "Shedding is triggered by light changes, not temperature - indoor dogs may shed more evenly year-round." },
      { text: "Increase brushing to daily during peak shedding using a deshedding tool to reach the undercoat." },
      { text: "A warm bath loosens dead undercoat dramatically - try a deshedding bath at the start of shedding season." },
      { text: "Omega-3 supplements support coat health and can reduce excessive shedding." },
      { text: "Patchy hair loss or out-of-season shedding can signal stress, parasites, or hormonal issues - worth a vet check." },
    ],
  },
  {
    id: "professional",
    icon: ICON,
    title: "When to book a professional groomer",
    summary: "Some tasks require professional tools and experience. Knowing when to book prevents injury and saves stress.",
    points: [
      { text: "Coat trimming and styling - especially Poodles, Schnauzers, Spaniels, and Bichons." },
      { text: "Severely matted coats - dematting without experience causes real pain and risks skin cuts." },
      { text: "Deshedding treatments - professional high-velocity dryers remove far more undercoat than home methods." },
      { text: "Booking frequency: non-shedding coats every 6–8 weeks; long shedding coats every 8–12 weeks." },
    ],
    callout: { label: "Finding a good groomer", text: "Look for BDGA, City & Guilds, or PIF accreditation. A good groomer welcomes questions and lets you see the facilities." },
  },
  {
    id: "puppy-grooming",
    icon: ICON,
    title: "Grooming a puppy",
    summary: "Early positive experiences build habits for life. The goal at this stage is association, not perfection.",
    points: [
      { text: "Introduce grooming tools before using them - let the puppy sniff and investigate with no pressure." },
      { text: "Start with 1–2 minute sessions, building duration gradually over weeks." },
      { text: "Regularly touch paws, ears, belly and mouth in non-grooming moments to normalise handling." },
      { text: "Reward with high-value treats throughout - not just at the end." },
    ],
    callout: { label: "First bath", text: "Wait until at least 8 weeks. Use puppy-specific shampoo, keep it short, and make the drying calm and positive." },
  },
  {
    id: "coat-types",
    icon: ICON,
    title: "Understanding coat types",
    summary: "The right grooming approach depends entirely on coat type. What works for a Labrador will harm a Poodle's coat.",
    points: [
      { text: "Short smooth coats (Boxers, Whippets) - bristle brush weekly, monthly bath, minimal shedding management." },
      { text: "Double coats (Labradors, Huskies, GSDs) - heavy seasonal shedders, slicker + deshedding tool, never shave." },
      { text: "Long silky coats (Spaniels, Setters) - daily brushing, professional trimming every 8–12 weeks." },
      { text: "Curly/wavy coats (Poodles, Cockapoos) - grow continuously, must be clipped every 6–8 weeks, brush every other day." },
      { text: "Wire coats (Terriers, Schnauzers) - hand-stripping or clipping, professional grooming strongly recommended." },
    ],
  },
];

const TipsGrooming: React.FC = () => (
  <TipsPage
    category="grooming"
    title="Grooming"
    titleAccent="guides"
    subtitle="Practical, detailed grooming advice for every coat type - from daily brushing routines to knowing when to call in a professional."
    heroIcon="/images/paint/groomer.png"
    tips={tips}
  />
);

export default TipsGrooming;