import React from "react";
import TipsPage, { type Tip } from "./TipsPage";

const ICON = "/images/paint/vet.png";

const tips: Tip[] = [
  {
    id: "annual-checkup",
    icon: ICON,
    title: "Annual health check",
    summary: "An annual vet visit is the single most valuable thing you can do for your dog's long-term health.",
    points: [
      { text: "Vets assess weight, eyes, ears, teeth, heart, lungs, abdomen, joints, skin, and lymph nodes in one visit." },
      { text: "Senior dogs (7+ for most breeds, 5+ for giants) benefit from 6-monthly checks." },
      { text: "Prepare a list of any changes you've noticed - appetite, water intake, energy, sleep, or behaviour." },
      { text: "Annual visits are required to keep vaccines, prescription parasite treatments, and travel health certificates current." },
    ],
    callout: { label: "Home health check", text: "Run your hands over your dog monthly - check for new lumps, sore spots, coat changes, and observe gait. You know your dog best." },
  },
  {
    id: "vaccinations",
    icon: ICON,
    title: "Vaccination schedule",
    summary: "Core vaccines protect against serious, widespread diseases. Non-core vaccines are based on lifestyle and risk.",
    points: [
      { text: "Core vaccines", sub: ["Distemper, parvovirus, hepatitis - typically every 3 years after the first annual booster", "Leptospirosis - annually, immunity wanes faster"] },
      { text: "Non-core vaccines", sub: ["Kennel cough - annually, especially before kennels or dog shows", "Rabies - required for international travel"] },
      { text: "Puppy course: first vaccine at 6-8 weeks, second at 10-12 weeks, third if needed at 14-16 weeks." },
      { text: "Titre testing can check whether protection from a previous vaccine is still adequate - discuss with your vet." },
    ],
    callout: { label: "Socialisation window", text: "Vaccination timing overlaps with the 3-14 week socialisation window. Ask your vet about controlled early exposure to other vaccinated dogs." },
  },
  {
    id: "parasites",
    icon: ICON,
    title: "Flea, tick and worm prevention",
    summary: "Regular parasite prevention protects your dog and your household. The right programme depends on your dog's lifestyle.",
    points: [
      { text: "Fleas - 95% of the flea population lives in the environment, not on the dog. Treat both dog and home simultaneously." },
      { text: "Ticks - check after every country walk (between toes, behind ears, under collar). Remove with a tick hook, gripping close to skin, pulling straight out." },
      { text: "Worms - roundworm (human health risk), tapeworm, lungworm (potentially fatal, spread by slugs/snails), and heartworm for abroad." },
      { text: "Standard worming treatments don't cover lungworm - ask your vet specifically if your dog eats slugs or drinks from outdoor bowls." },
      { text: "Prescription treatments are significantly more effective than over-the-counter products." },
    ],
    callout: { label: "Tailored plan", text: "A city dog walking on pavements has very different parasite risks to a country dog in long grass and woodland. Ask your vet for a lifestyle-specific programme." },
  },
  {
    id: "signs-of-pain",
    icon: ICON,
    title: "Signs your dog is in pain",
    summary: "Dogs instinctively hide pain. By the time it's obvious, they've often been suffering for some time.",
    points: [
      { text: "Behavioural signs", sub: ["Withdrawal from interaction or favourite activities", "Reduced appetite or interest in toys", "Aggression or snapping when touched - this is pain, not personality", "Restlessness, inability to settle"] },
      { text: "Physical signs", sub: ["Altered gait, limping, or shortened stride", "Difficulty rising, reluctance to climb stairs or jump", "Hunched posture or protective stance", "Rapid shallow breathing unrelated to exercise"] },
      { text: "Excessive licking or chewing at a specific area of the body." },
      { text: "Changes in facial expression - tense jaw, furrowed brow, partially closed eyes." },
    ],
    callout: { label: "Trust your instincts", text: "You know your dog better than anyone. If something seems off, a vet check is always worthwhile - even if you can't pinpoint exactly what's wrong." },
  },
  {
    id: "spaying-neutering",
    icon: ICON,
    title: "Spaying and neutering",
    summary: "The decision to neuter is significant and nuanced. Timing matters and varies by breed and size.",
    points: [
      { text: "Benefits - eliminates ovarian, uterine, and testicular cancer risk; prevents pyometra (life-threatening uterine infection); reduces roaming and marking in males." },
      { text: "Potential downsides - increased orthopaedic condition risk in large breeds neutered early; weight gain (reduce portions by ~25%); urinary incontinence in some spayed females." },
      { text: "Timing - historical 6-month recommendation is being revised. Large and giant breeds may benefit from waiting until skeletal maturity (12–24 months)." },
      { text: "Chemical castration via implant offers a reversible trial before committing to surgery." },
    ],
    callout: { label: "Breed matters", text: "The right timing differs significantly by breed and sex. Your vet should have breed-specific guidance - don't rely on general rules." },
  },
  {
    id: "joint-health",
    icon: ICON,
    title: "Joint health and arthritis",
    summary: "Arthritis affects 1 in 5 adult dogs and is even more common in seniors. It's manageable - but only caught early.",
    points: [
      { text: "Early warning signs", sub: ["Stiffness after rest, especially in the morning", "Slowing down on walks or tiring faster", "Reluctance to jump into the car or up stairs", "Licking or chewing at joints"] },
      { text: "Home management", sub: ["Weight - even small loss makes a measurable difference to joint stress", "Low-impact exercise - regular gentle walks beat occasional long ones", "Orthopedic memory foam bed", "Non-slip rugs on hard floors"] },
      { text: "Supplements with evidence - omega-3s (EPA/DHA), glucosamine, chondroitin, green-lipped mussel." },
      { text: "Prescription NSAIDs are effective for moderate-severe arthritis but require regular blood monitoring for long-term use." },
      { text: "Monoclonal antibody injections (Librela) offer an alternative for dogs who don't tolerate NSAIDs." },
    ],
    callout: { label: "Don't wait", text: "Many owners attribute early signs to 'just getting older' and delay seeking help. Early intervention slows progression significantly." },
  },
  {
    id: "first-aid-kit",
    icon: ICON,
    title: "Building a dog first aid kit",
    summary: "Accidents happen far from a clinic. A well-stocked kit and basic knowledge can stabilise your dog while you arrange professional help.",
    points: [
      { text: "Essentials to include", sub: ["Sterile gauze pads, bandages, cohesive bandage (Vetrap)", "Saline solution for flushing wounds and eyes", "Antiseptic solution (Hibiscrub)", "Tick removal tool", "Styptic powder (for nail bleeds)", "Digital thermometer - normal is 38–39.2°C", "Muzzle - even gentle dogs bite when in pain", "Your vet's number and nearest emergency clinic"] },
      { text: "Never give human pain medication - paracetamol, ibuprofen, and aspirin are all toxic to dogs." },
      { text: "Don't induce vomiting unless specifically instructed by a vet or poison line." },
      { text: "First aid is for stabilising only - always follow up with a vet." },
    ],
    callout: { label: "Consider a course", text: "The Red Cross and specialist providers offer dog first aid courses. An hour of training is worth more than any kit." },
  },
  {
    id: "weight",
    icon: ICON,
    title: "Managing your dog's weight",
    summary: "Obesity affects 50–60% of UK pet dogs and significantly shortens life expectancy. Small adjustments make a real difference.",
    points: [
      { text: "Body condition score (BCS 1-9): at ideal weight (4-5/9) you should feel ribs without pressing hard, see a waist from above, and notice a slight abdominal tuck from the side." },
      { text: "Use the target weight on feeding guides, not current weight if your dog is overweight." },
      { text: "Weigh food with kitchen scales - volume measuring is imprecise." },
      { text: "After neutering, reduce daily food by approximately 25% - energy requirements drop significantly." },
      { text: "For weight loss, a 10-15% reduction in daily food over several weeks is healthier than dramatic cuts." },
    ],
    callout: { label: "Treat budget", text: "Treats should be no more than 10% of daily calories. For a 400-calorie dog, that's just 40 calories - about one commercial dental stick." },
  },
  {
    id: "dental-health",
    icon: ICON,
    title: "Recognising dental disease",
    summary: "Dental disease is the most common health problem in adult dogs - and largely preventable with a consistent routine.",
    points: [
      { text: "Signs of dental disease", sub: ["Bad breath - the most common and most ignored early sign", "Yellow or brown tartar buildup near the gum line", "Red, swollen, or bleeding gums", "Reluctance to eat hard food or chew on one side", "Dropping food or visible broken teeth"] },
      { text: "Prevention: daily brushing with dog-specific toothpaste is gold standard." },
      { text: "Most dogs benefit from a professional dental clean under anaesthetic at some point - your vet will advise how often." },
      { text: "Dental disease bacteria can enter the bloodstream and affect the heart, kidneys, and liver if left untreated." },
    ],
  },
  {
    id: "toxic-foods",
    icon: ICON,
    title: "Foods that are toxic to dogs",
    summary: "Some common foods can cause serious harm or death in very small quantities. This is worth knowing thoroughly.",
    points: [
      { text: "Immediately dangerous", sub: ["Xylitol (sweetener in sugar-free gum, some peanut butters) - causes liver failure", "Grapes and raisins - can cause acute kidney failure, safe dose unknown", "Onions, garlic, leeks, chives (any form) - damage red blood cells cumulatively", "Chocolate - darker is more toxic; causes seizures and cardiac arrhythmia"] },
      { text: "Serious in larger amounts", sub: ["Alcohol, caffeine, macadamia nuts, nutmeg, raw yeast dough"] },
      { text: "Causes significant GI upset", sub: ["Cooked bones (splinter risk), corn on the cob (obstruction risk), fat trimmings (pancreatitis risk)"] },
    ],
    callout: { label: "In an emergency", text: "Call your vet or the Animal Poison Line (01202 509000 UK) immediately - before symptoms appear. Don't induce vomiting unless specifically instructed." },
  },
  {
    id: "heatstroke",
    icon: ICON,
    title: "Preventing heatstroke",
    summary: "Heatstroke can kill a dog within minutes. Prevention is straightforward - but recognition and response must be fast.",
    points: [
      { text: "Never leave a dog in a parked car - even with windows open, temperatures can become fatal in minutes." },
      { text: "Walk early morning and evening in hot weather - avoid midday. If the pavement burns your hand for 5 seconds, it burns paws." },
      { text: "Always carry water on walks. Short-faced (brachycephalic) breeds, overweight dogs, and elderly dogs are highest risk." },
      { text: "Signs of heatstroke: heavy panting, drooling, glazed eyes, vomiting, collapse, red gums." },
      { text: "First response: move to shade, apply cool (not cold) water to paws, groin, and neck, offer small sips of water, get to a vet immediately." },
    ],
    callout: { label: "Ice water danger", text: "Don't use ice or very cold water - it causes blood vessels to constrict, trapping heat inside. Cool water and airflow is the correct approach." },
  },
  {
    id: "kennel-cough",
    icon: ICON,
    title: "Kennel cough",
    summary: "Kennel cough is highly contagious but usually mild. Knowing the signs and how it spreads helps you manage it sensibly.",
    points: [
      { text: "Classic sign: a honking, harsh cough - often described as if something is stuck in the throat." },
      { text: "Spreads via airborne droplets and shared surfaces - parks, groomers, kennels, and training classes are common transmission points." },
      { text: "Most cases resolve in 1-3 weeks without treatment. Rest and avoiding other dogs is the main management." },
      { text: "See a vet if: the cough is severe, there is discharge from the nose or eyes, your dog is lethargic, or they stop eating." },
      { text: "Annual vaccination significantly reduces severity even if it doesn't always prevent infection entirely." },
    ],
  },
  {
    id: "brachycephalic",
    icon: ICON,
    title: "Health considerations for flat-faced breeds",
    summary: "Bulldogs, Pugs, French Bulldogs, and similar breeds have specific health needs that owners should understand before getting the dog.",
    points: [
      { text: "BOAS (Brachycephalic Obstructive Airway Syndrome) - narrowed nostrils, elongated soft palate, and narrowed trachea restrict airflow." },
      { text: "Signs of breathing difficulty: noisy breathing, snoring, exercise intolerance, sleeping with neck extended, blue-tinged gums during exercise." },
      { text: "Surgical correction can significantly improve quality of life - discuss with a vet who specialises in BOAS." },
      { text: "Overheating is a serious risk - air conditioning in summer, early morning walks only, no strenuous exercise in warm weather." },
      { text: "Eye and skin fold issues are also common - daily skin fold cleaning and regular eye checks are important." },
    ],
    callout: { label: "Insurance note", text: "Brachycephalic breeds typically have higher insurance premiums and may have breed-specific exclusions. Research thoroughly before getting cover." },
  },
  {
    id: "senior-health",
    icon: ICON,
    title: "Caring for a senior dog",
    summary: "Senior dogs need more frequent vet checks, dietary adjustments, and home modifications. Knowing what to expect makes this life stage easier.",
    points: [
      { text: "When is 'senior'? Giant breeds from 5–6 years; large from 7; medium from 7–8; small breeds from 9–10." },
      { text: "6-monthly vet checks rather than annual - conditions progress faster as dogs age." },
      { text: "Cognitive Dysfunction Syndrome (doggy dementia) - signs include disorientation, changed sleep patterns, reduced interaction, house soiling." },
      { text: "Home modifications", sub: ["Orthopedic beds for joint comfort", "Ramps instead of steps", "Non-slip mats on hard floors", "Raised food and water bowls"] },
      { text: "Mental stimulation remains important - nose work, gentle puzzle toys, and short training sessions support cognitive health." },
    ],
    callout: { label: "Palliative care", text: "When a senior dog reaches end of life, your vet can guide you through pain management, quality of life assessment, and the timing of difficult decisions." },
  },
  {
    id: "allergies",
    icon: ICON,
    title: "Dog allergies",
    summary: "Allergies are one of the most common reasons for vet visits. Understanding the types helps you advocate better for your dog.",
    points: [
      { text: "Environmental allergies (atopy) - grass, pollen, dust mites, mould. Seasonal or year-round. Signs: itching, paw licking, ear infections, red skin." },
      { text: "Food allergies - most commonly triggered by protein sources (chicken, beef, dairy). Elimination diets over 8–12 weeks are the diagnostic gold standard." },
      { text: "Flea allergy dermatitis - hypersensitivity to flea saliva. Even one bite can trigger severe itching. Strict flea prevention is essential." },
      { text: "Contact allergies - less common; reaction to something the skin touches directly." },
      { text: "Management typically involves identifying and avoiding triggers, regular bathing with appropriate shampoos, and prescription medication in moderate–severe cases." },
    ],
    callout: { label: "Don't self-diagnose", text: "Skin conditions in dogs have many causes. A vet assessment is needed before starting an elimination diet or any medication." },
  },
  {
    id: "mental-health",
    icon: ICON,
    title: "Your dog's mental health",
    summary: "Emotional and mental wellbeing is as important as physical health. Dogs experience stress, anxiety, and boredom in ways that directly affect behaviour and health.",
    points: [
      { text: "Signs of stress", sub: ["Lip licking, yawning, looking away (calming signals)", "Panting not related to heat or exercise", "Whale eye (white of eye visible)", "Tense body, low or tucked tail"] },
      { text: "Adequate exercise and mental stimulation prevent many behaviour problems - under-stimulated dogs find their own entertainment." },
      { text: "Routine reduces anxiety - predictable feeding, walking, and sleeping times help dogs feel safe." },
      { text: "Safe spaces - every dog should have a place they can retreat to and not be disturbed, including by children." },
      { text: "If your dog shows persistent signs of anxiety, speak to your vet - both medication and behaviour modification have strong evidence." },
    ],
  },
  {
    id: "emergencies",
    icon: ICON,
    title: "Recognising a veterinary emergency",
    summary: "Some situations need immediate veterinary attention. Recognising them quickly can be the difference between life and death.",
    points: [
      { text: "Go immediately - do not wait for the morning", sub: ["Bloated, distended abdomen with retching and distress (GDV - bloat)", "Difficulty breathing or blue/white gums", "Collapse, inability to stand, or sudden paralysis", "Suspected poisoning", "Major trauma, road accident, or serious wound", "Seizure lasting more than 5 minutes or multiple seizures"] },
      { text: "Call first - describe symptoms so the clinic can prepare", sub: ["Eye injuries or sudden vision changes", "Suspected broken bone", "Inability to urinate, especially in male cats and dogs"] },
      { text: "Save the numbers now - your vet's out-of-hours service and nearest emergency clinic." },
    ],
    callout: { label: "Pale or white gums", text: "Gums should be bubble-gum pink. Pale, white, blue, or brick-red gums all indicate a serious emergency requiring immediate veterinary attention." },
  },
  {
    id: "lungworm",
    icon: ICON,
    title: "Lungworm - what every dog owner should know",
    summary: "Lungworm is potentially fatal and is not covered by standard worming treatments. UK cases have increased significantly.",
    points: [
      { text: "Spread by eating or licking slugs, snails, or their slime trails - including on outdoor toys and water bowls." },
      { text: "Signs: coughing, breathing difficulty, exercise intolerance, unexplained bleeding (nose, cuts, gums), neurological symptoms, lethargy." },
      { text: "Standard worming tablets do not protect against lungworm - you need a specific preventive (advocate spot-on, milprazon, or similar)." },
      { text: "Monthly preventive treatment is the best approach, especially for dogs who forage or explore in gardens." },
      { text: "Diagnosis requires a blood test or faecal test - mention it to your vet if symptoms match." },
    ],
    callout: { label: "Garden hygiene", text: "Remove outdoor toys and water bowls at night when slugs and snails are most active. Check your dog's mouth after garden time." },
  },
];

const TipsHealth: React.FC = () => (
  <TipsPage
    category="health"
    title="Health"
    titleAccent="& wellbeing"
    subtitle="Prevention is better than cure. Clear, practical health guidance - from vaccination schedules to recognising early warning signs your vet needs to know about."
    heroIcon="../images/Illustrations/Health-art.png"
    tips={tips}
  />
);

export default TipsHealth;