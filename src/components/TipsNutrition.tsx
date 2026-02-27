import React from "react";
import TipsPage, { type Tip } from "./TipsPage";

const ICON = "/images/paint/pet-shop.png";

const tips: Tip[] = [
  {
    id: "reading-labels",
    icon: ICON,
    title: "How to read a dog food label",
    summary: "Marketing terms are designed to appeal to owners, not indicate nutritional quality. Here's how to cut through the noise.",
    points: [
      { text: "Ingredients are listed by weight before processing — but 'ingredient splitting' lets manufacturers keep cheap fillers lower on the list by dividing them into separate entries." },
      { text: "Named meat source in the top ingredients is a good sign — 'chicken' or 'salmon' rather than 'animal derivatives'." },
      { text: "Meat meal (e.g. 'chicken meal') is a concentrated protein source — not inherently bad despite sounding less appealing." },
      { text: "Look for FEDIAF (UK/EU) or AAFCO (US) compliance — 'Complete' means it meets all nutritional requirements as a sole diet." },
      { text: "Marketing terms to ignore: premium, super premium, natural, grain-free, human-grade — none have regulatory definitions." },
    ],
    callout: { label: "Grain-free warning", text: "Grain-free diets are under FDA investigation for a possible link to dilated cardiomyopathy. Grain-free does not mean better quality — grains are replaced with potato or lentils, which have similar effects." },
  },
  {
    id: "food-types",
    icon: ICON,
    title: "Dry, wet, raw, or fresh — which is best?",
    summary: "There is no single universally correct answer. Each format has genuine advantages and disadvantages.",
    points: [
      { text: "Dry kibble", sub: ["Convenient, shelf-stable, economical", "Highly processed, often high carbohydrate, reliant on synthetic vitamins", "Quality varies enormously between brands"] },
      { text: "Wet food", sub: ["High palatability, supports hydration, more filling per calorie for weight management", "More expensive, shorter shelf life, more packaging waste"] },
      { text: "Raw feeding", sub: ["High palatability, minimal processing, often improves coat and stool quality", "Real food safety risks (Salmonella, E. coli), nutritional imbalance risk if home-formulated", "Not recommended for immunocompromised dogs or households with vulnerable people"] },
      { text: "Lightly cooked fresh food (e.g. Butternut Box, Pure Pet Food) — palatability benefits without raw safety risks. More expensive." },
      { text: "Mixed feeding (dry + wet) is perfectly valid — manage total daily calories carefully." },
    ],
    callout: { label: "Home cooked?", text: "Studies show the majority of home-cooked recipes — even those published by vets — are nutritionally deficient. Always use a board-certified veterinary nutritionist for a balanced recipe." },
  },
  {
    id: "portion-sizes",
    icon: ICON,
    title: "How much to feed",
    summary: "Feeding guides are a starting point, not a prescription — and they're usually calculated generously. Body condition matters more than the number on the packet.",
    points: [
      { text: "Weigh food with kitchen scales — volume measuring (cups, scoops) is significantly less accurate." },
      { text: "Body condition score at ideal (4–5/9): ribs easily felt without pressing, waist visible from above, slight abdominal tuck from the side." },
      { text: "Use target body weight on feeding guides, not current weight if your dog is overweight." },
      { text: "After neutering: reduce daily food by approximately 25% — energy requirements drop significantly." },
      { text: "Active working dogs, pregnant females, and growing puppies all have substantially higher requirements." },
    ],
    callout: { label: "Monthly check", text: "Check body condition score monthly by running hands along the ribcage. You should feel each rib without pressing hard. Adjust food gradually — a 10–15% reduction over several weeks for weight loss." },
  },
  {
    id: "toxic-foods",
    icon: ICON,
    title: "Foods toxic to dogs",
    summary: "Several common foods can cause serious harm or death in very small quantities. This list is worth knowing thoroughly.",
    points: [
      { text: "Immediately life-threatening", sub: ["Xylitol (sweetener in sugar-free gum, some peanut butters) — causes liver failure even in tiny amounts", "Grapes and raisins — acute kidney failure, safe dose is unknown", "Onions, garlic, leeks, chives (any form) — damage red blood cells cumulatively", "Chocolate — darker is more toxic; causes seizures and cardiac arrhythmia"] },
      { text: "Serious in quantity", sub: ["Alcohol, caffeine, macadamia nuts, nutmeg, raw yeast dough"] },
      { text: "GI upset and obstruction risk", sub: ["Cooked bones (splinter risk), corn on the cob (obstruction), fat trimmings (pancreatitis risk)"] },
    ],
    callout: { label: "Emergency", text: "Call your vet or the Animal Poison Line (01202 509000 UK) immediately, before symptoms appear. Have the product packaging ready." },
  },
  {
    id: "treats",
    icon: ICON,
    title: "Healthy treats",
    summary: "Treats should make up no more than 10% of daily calories. The right treat is small, motivating, and genuinely nutritious.",
    points: [
      { text: "Best training treats: cooked chicken breast, cooked turkey or white fish, commercial training treats (Lily's Kitchen, Fish4Dogs). Small and soft so training momentum isn't broken." },
      { text: "Healthy whole foods: carrots (low calorie, dental benefit), cucumber (very low calorie, hydrating), blueberries (antioxidants), plain cooked egg (complete protein), cooked sweet potato." },
      { text: "Avoid: processed meat snacks (high salt/fat), rawhide (choking and obstruction risk), anything with xylitol." },
      { text: "Frozen Kong: stuffed with plain yogurt or wet food, frozen overnight — takes 20+ minutes to empty, genuinely nutritious." },
      { text: "For weight management: break treats into smaller pieces, use kibble from their daily allowance as training treats, or use play as a reward." },
    ],
  },
  {
    id: "puppy-nutrition",
    icon: ICON,
    title: "Feeding a puppy",
    summary: "Puppies have significantly different nutritional needs to adults. Getting this right supports healthy development and avoids lifelong problems.",
    points: [
      { text: "Feed a puppy-specific food — higher in protein, fat, calcium, and phosphorus to support growth." },
      { text: "Large and giant breed puppies need large-breed puppy food specifically — excess calcium causes developmental orthopaedic disease." },
      { text: "Feeding frequency: 3–4 meals daily under 3 months; 3 meals from 3–6 months; transition to twice daily from 6 months." },
      { text: "Do not supplement with calcium or additional vitamins when feeding a complete balanced puppy food — this causes harm." },
      { text: "Transition to adult food when growth is complete: around 12 months for small breeds, 18–24 months for large/giant breeds." },
    ],
    callout: { label: "Weigh regularly", text: "Weigh puppies monthly and compare to breed growth charts. Both underfeeding and overfeeding during growth have lasting consequences." },
  },
  {
    id: "senior-feeding",
    icon: ICON,
    title: "Feeding a senior dog",
    summary: "Ageing affects metabolism, digestion, and organ function. Small nutritional adjustments can significantly improve quality of life.",
    points: [
      { text: "Lower calorie needs — reduced activity means most seniors need 20–30% fewer calories than their adult peak." },
      { text: "Higher quality protein — older dogs are less efficient at processing protein but still need adequate amounts to maintain muscle mass." },
      { text: "Joint support — diets enriched with omega-3s, glucosamine, and chondroitin." },
      { text: "Kidney disease — moderately reduced phosphorus and sodium. Therapeutic renal diets for diagnosed disease on vet advice." },
      { text: "Smaller, more frequent meals are often better tolerated as digestion slows with age." },
    ],
    callout: { label: "Transition slowly", text: "Switch foods over 7–10 days by mixing increasing amounts of new food with old. Senior digestive systems can be more sensitive to sudden changes." },
  },
  {
    id: "omega-3",
    icon: ICON,
    title: "Omega-3 fatty acids",
    summary: "Omega-3s have the strongest evidence base of any dog supplement. Marine-sourced EPA and DHA provide genuine anti-inflammatory benefit.",
    points: [
      { text: "Benefits with good evidence: reduced inflammation from arthritis and allergies; improved coat quality; may support cardiac and cognitive health." },
      { text: "Source matters: use marine fish oil (salmon, sardine, anchovy) or algae oil — not flaxseed, which dogs cannot efficiently convert to EPA/DHA." },
      { text: "Therapeutic doses are significantly higher than those on most product labels — discuss with your vet for anti-inflammatory effect." },
      { text: "Quality: fish oil goes rancid quickly once opened — buy in small quantities, refrigerate, and check the product is tested for heavy metals." },
      { text: "Stop 1–2 weeks before surgery — omega-3s affect blood clotting." },
    ],
  },
  {
    id: "joint-supplements",
    icon: ICON,
    title: "Joint supplements",
    summary: "Glucosamine and chondroitin are widely used for joint health. The evidence is moderate — some dogs respond well, others don't.",
    points: [
      { text: "Glucosamine and chondroitin are precursors to cartilage components. Most useful for early to moderate arthritis and as prevention in large breeds." },
      { text: "Most over-the-counter products contain below-therapeutic doses — check actual mg levels, not just whether the ingredient is listed." },
      { text: "Green-lipped mussel (Pernax, YuMOVE) contains glucosamine, chondroitin, and omega-3s — well-studied in dogs specifically." },
      { text: "Allow 4–8 weeks before assessing whether supplementation is making a difference." },
      { text: "Safe with virtually no side effects — if it's not helping after 8 weeks, it's unlikely to." },
    ],
  },
  {
    id: "probiotics",
    icon: ICON,
    title: "Probiotics",
    summary: "Dog-specific probiotics have reasonable evidence for GI support. Human probiotics contain different bacterial strains and aren't appropriate.",
    points: [
      { text: "Best evidence for: post-antibiotic recovery (replenishing gut bacteria), stress-related GI upset, during dietary transitions, and acute diarrhoea." },
      { text: "Use dog-specific products — Protexin, FortiFlora, and Proviable are well-regarded options." },
      { text: "Plain unsweetened yogurt with live cultures provides some benefit for dogs without dairy sensitivity." },
      { text: "Evidence for long-term preventive use in healthy dogs is limited — most useful in specific situations rather than routine supplementation." },
    ],
    callout: { label: "Postbiotics", text: "Postbiotics (metabolites produced by gut bacteria) are emerging as a promising area of canine health research. Watch this space." },
  },
  {
    id: "water",
    icon: ICON,
    title: "Hydration",
    summary: "Most dogs don't drink enough water. Chronic mild dehydration affects kidney function, digestion, and energy levels.",
    points: [
      { text: "A rough guideline: dogs need approximately 50–60ml of water per kilogram of body weight daily — more in hot weather and after exercise." },
      { text: "Fresh water in a clean bowl at all times. Some dogs prefer running water — pet fountains can significantly increase intake." },
      { text: "Wet food provides significant moisture (70–80%) and can meaningfully improve hydration, especially for dogs who don't drink much." },
      { text: "Signs of dehydration: dry or sticky gums, skin that doesn't spring back immediately when gently pinched, lethargy." },
      { text: "Sudden increase in water consumption is a sign of several conditions including diabetes, kidney disease, and Cushing's — worth a vet check." },
    ],
  },
  {
    id: "allergies-food",
    icon: ICON,
    title: "Food allergies and intolerances",
    summary: "True food allergies are less common than owners think but do occur. The diagnostic process requires patience.",
    points: [
      { text: "Most common triggers are protein sources — chicken, beef, dairy, wheat, soy." },
      { text: "Signs: chronic itching (especially paws, ears, belly), recurrent ear infections, loose stools, vomiting, skin rashes." },
      { text: "Diagnosis requires an elimination diet: a novel protein/hydrolysed protein diet fed strictly for 8–12 weeks with no other food, treats, or flavoured supplements." },
      { text: "Over-the-counter hypoallergenic foods don't work for elimination diets — cross-contamination in manufacturing means they can still trigger reactions." },
      { text: "Once symptoms resolve, reintroduce individual ingredients one at a time to identify the specific trigger." },
    ],
    callout: { label: "Don't self-diagnose", text: "Environmental allergies (grass, dust mites) are more common than food allergies and present similarly. A vet assessment before elimination dieting saves time and money." },
  },
  {
    id: "weight-management",
    icon: ICON,
    title: "Weight management",
    summary: "Obesity is the most common preventable health problem in UK dogs. Even modest weight loss produces measurable health improvements.",
    points: [
      { text: "Obesity worsens arthritis, increases cancer risk, causes breathing difficulties, raises diabetes risk, and significantly reduces life expectancy." },
      { text: "Start with body condition scoring — ideal dogs have easily palpable ribs, a visible waist, and a slight abdominal tuck." },
      { text: "Reduce daily food by 10–15% and reassess body condition after 4 weeks. Weigh on the same scales monthly." },
      { text: "Low-calorie snacks: carrot sticks, cucumber, blueberries. All volume, minimal calories." },
      { text: "Increase exercise gradually — don't start a heavy exercise programme before weight loss begins in obese dogs." },
      { text: "Prescription weight management diets from your vet provide lower calories while maintaining satiety through high fibre content." },
    ],
  },
  {
    id: "multivitamins",
    icon: ICON,
    title: "Multivitamins — when to use them",
    summary: "Dogs on complete and balanced commercial diets do not need multivitamins. Indiscriminate supplementation can cause harm.",
    points: [
      { text: "Fat-soluble vitamins (A, D, E, K) accumulate in the body — supplementing without deficiency can cause toxicity." },
      { text: "Only supplement vitamins if there's a diagnosed deficiency confirmed by a vet." },
      { text: "Dogs on home-cooked diets often need supplementation — but tailored to the specific recipe by a veterinary nutritionist." },
      { text: "Calcium supplementation in puppies eating complete puppy food causes serious developmental orthopaedic disease." },
      { text: "If your dog is eating a complete food and their coat, weight, and energy are good — they're getting what they need." },
    ],
  },
  {
    id: "pancreatitis",
    icon: ICON,
    title: "Pancreatitis and diet",
    summary: "Pancreatitis is inflammation of the pancreas, often triggered by fatty foods. Diet management is central to prevention and recovery.",
    points: [
      { text: "Classic triggers: fatty food, table scraps, getting into the bin, high-fat treats." },
      { text: "Signs: vomiting, diarrhoea, hunched posture, reluctance to eat, abdominal pain. Severe cases are life-threatening." },
      { text: "Long-term management: low-fat diet (under 10% fat on dry matter basis), no table scraps, no fatty treats, consistent feeding." },
      { text: "Breeds at higher risk: Miniature Schnauzers, Cocker Spaniels, some terrier breeds — should eat low-fat diets as a precaution." },
      { text: "During recovery: small, frequent meals of highly digestible low-fat food as directed by your vet." },
    ],
    callout: { label: "Never ignore symptoms", text: "Acute pancreatitis can deteriorate rapidly. Any dog showing vomiting alongside a hunched, painful posture should see a vet the same day." },
  },
  {
    id: "raw-bones",
    icon: ICON,
    title: "Raw bones — the full picture",
    summary: "Raw bones are genuinely beneficial for dental health and mental enrichment — but they come with real risks that need to be managed.",
    points: [
      { text: "Never give cooked bones — cooking makes them brittle. They splinter into sharp shards that can perforate the gut." },
      { text: "Appropriate raw bones: large raw beef marrow bones or raw meaty bones (chicken wings, lamb ribs) that are size-appropriate." },
      { text: "Always supervise — take the bone away if it becomes small enough to swallow whole or if your dog becomes possessive." },
      { text: "Not appropriate for: dogs with pancreatitis (marrow is very fatty), dogs who gulp food without chewing, dogs with dental disease (may fracture teeth)." },
      { text: "Risk of bacterial contamination — handle with food hygiene precautions, particularly in households with vulnerable people." },
    ],
    callout: { label: "Dental alternatives", text: "If raw bones aren't suitable, VOHC-approved dental chews provide comparable dental benefit with less risk." },
  },
  {
    id: "feeding-schedule",
    icon: ICON,
    title: "Feeding routine and schedule",
    summary: "Consistent feeding times support digestive health, help with house training, and reduce food-related anxiety.",
    points: [
      { text: "Twice daily feeding works well for most adult dogs — morning and evening, roughly 12 hours apart." },
      { text: "Puppies under 6 months need 3 meals daily; puppies under 3 months ideally 4 meals." },
      { text: "Feed at the same times each day — this regulates digestion and makes toilet habits more predictable." },
      { text: "Don't leave food down all day for free feeding — this makes it harder to monitor intake and can contribute to weight gain." },
      { text: "For dogs with GDV (bloat) risk (deep-chested breeds like Great Danes, Standard Poodles), avoid vigorous exercise for 1 hour before and after meals." },
    ],
    callout: { label: "Food anxiety", text: "Dogs who eat extremely fast may benefit from a slow feeder or puzzle bowl — gulping increases the risk of bloat and reduces satiety." },
  },
];

const TipsNutrition: React.FC = () => (
  <TipsPage
    category="nutrition"
    title="Nutrition"
    titleAccent="& feeding"
    subtitle="Clear, unbiased guidance on dog nutrition — understanding ingredients labels, choosing the right food, and building a feeding routine that keeps your dog healthy long-term."
    heroIcon="/images/paint/pet-shop.png"
    tips={tips}
  />
);

export default TipsNutrition;