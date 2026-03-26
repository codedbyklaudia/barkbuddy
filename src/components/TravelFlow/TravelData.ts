import type { Country, CountryContent } from './types';

// All countries
export const COUNTRIES: Country[] = [
  // UK & Ireland (used for to-uk flow)
  { id: 'uk',           name: 'United Kingdom', continentId: 'uk-ireland', image: '../../../images/travel/uk.png'           },
  { id: 'ireland',      name: 'Ireland',        continentId: 'uk-ireland', image: '../../../images/travel/ireland.png'      },


  // Europe
  { id: 'france',       name: 'France',       continentId: 'europe', image: '../../../images/travel/france.png'       },
  { id: 'germany',      name: 'Germany',      continentId: 'europe', image: '../../../images/travel/germany.png'      },
  { id: 'spain',        name: 'Spain',        continentId: 'europe', image: '../../../images/travel/spain.png'        },
  { id: 'italy',        name: 'Italy',        continentId: 'europe', image: '../../../images/travel/italy.png'        },
  { id: 'portugal',     name: 'Portugal',     continentId: 'europe', image: '../../../images/travel/portugal.png'     },
  { id: 'netherlands',  name: 'Netherlands',  continentId: 'europe', image: '../../../images/travel/netherlands.png'  },
  { id: 'belgium',      name: 'Belgium',      continentId: 'europe', image: '../../../images/travel/belgium.png'      },
  { id: 'switzerland',  name: 'Switzerland',  continentId: 'europe', image: '../../../images/travel/switzerland.png'  },
  { id: 'austria',      name: 'Austria',      continentId: 'europe', image: '../../../images/travel/austria.png'      },
  { id: 'poland',       name: 'Poland',       continentId: 'europe', image: '../../../images/travel/poland.png'       },
  { id: 'czech',        name: 'Czech Republic', continentId: 'europe', image: '../../../images/travel/czech.png'      },
  { id: 'croatia',      name: 'Croatia',      continentId: 'europe', image: '../../../images/travel/croatia.png'      },
  { id: 'greece',       name: 'Greece',       continentId: 'europe', image: '../../../images/travel/greece.png'       },
  { id: 'sweden',       name: 'Sweden',       continentId: 'europe', image: '../../../images/travel/sweden.png'       },
  { id: 'norway',       name: 'Norway',       continentId: 'europe', image: '../../../images/travel/norway.png'       },
  { id: 'denmark',      name: 'Denmark',      continentId: 'europe', image: '../../../images/travel/denmark.png'      },
  { id: 'hungary',      name: 'Hungary',      continentId: 'europe', image: '../../../images/travel/hungary.png'      },
  { id: 'romania',      name: 'Romania',      continentId: 'europe', image: '../../../images/travel/romania.png'      },
  { id: 'turkey',       name: 'Turkey',       continentId: 'europe', image: '../../../images/travel/turkey.png'       },

  // North America
  { id: 'usa',          name: 'USA',          continentId: 'north-america', image: '../../../images/travel/usa.png'          },
  { id: 'canada',       name: 'Canada',       continentId: 'north-america', image: '../../../images/travel/canada.png'       },
  { id: 'mexico',       name: 'Mexico',       continentId: 'north-america', image: '../../../images/travel/mexico.png'       },
  { id: 'costa-rica',   name: 'Costa Rica',   continentId: 'north-america', image: '../../../images/travel/costa-rica.png'   },
  { id: 'cuba',         name: 'Cuba',         continentId: 'north-america', image: '../../../images/travel/cuba.png'         },

  // Asia
  { id: 'japan',        name: 'Japan',        continentId: 'asia', image: '../../../images/travel/japan.png'        },
  { id: 'thailand',     name: 'Thailand',     continentId: 'asia', image: '../../../images/travel/thailand.png'     },
  { id: 'india',        name: 'India',        continentId: 'asia', image: '../../../images/travel/india.png'        },
  { id: 'singapore',    name: 'Singapore',    continentId: 'asia', image: '../../../images/travel/singapore.png'    },
  { id: 'uae',          name: 'UAE',          continentId: 'asia', image: '../../../images/travel/uae.png'          },
  { id: 'china',        name: 'China',        continentId: 'asia', image: '../../../images/travel/china.png'        },
  { id: 'south-korea',  name: 'South Korea',  continentId: 'asia', image: '../../../images/travel/south_korea.png'  },
  { id: 'bali',         name: 'Bali',         continentId: 'asia', image: '../../../images/travel/bali.png'         },

  // South America
  { id: 'brazil',       name: 'Brazil',       continentId: 'south-america', image: '../../../images/travel/brazil.png'       },
  { id: 'argentina',    name: 'Argentina',    continentId: 'south-america', image: '../../../images/travel/argentina.png'    },
  { id: 'colombia',     name: 'Colombia',     continentId: 'south-america', image: '../../../images/travel/colombia.png'     },
  { id: 'chile',        name: 'Chile',        continentId: 'south-america', image: '../../../images/travel/chile.png'        },
  { id: 'peru',         name: 'Peru',         continentId: 'south-america', image: '../../../images/travel/peru.png'         },

  // Oceania
  { id: 'australia',    name: 'Australia',    continentId: 'australia', image: '../../../images/travel/australia-c.png' },
  { id: 'new-zealand',  name: 'New Zealand',  continentId: 'australia', image: '../../../images/travel/new_zealand.png'       },
  { id: 'fiji',         name: 'Fiji',         continentId: 'australia', image: '../../../images/travel/fiji.png'               },

  // Africa
  { id: 'south-africa', name: 'South Africa', continentId: 'africa', image: '../../../images/travel/south_africa.png' },
  { id: 'kenya',        name: 'Kenya',        continentId: 'africa', image: '../../../images/travel/kenya.png'        },
  { id: 'morocco',      name: 'Morocco',      continentId: 'africa', image: '../../../images/travel/morocco.png'      },
  { id: 'egypt',        name: 'Egypt',        continentId: 'africa', image: '../../../images/travel/egypt.png'        },
  { id: 'tanzania',     name: 'Tanzania',     continentId: 'africa', image: '../../../images/travel/tanzania.png'     },
  { id: 'ghana',        name: 'Ghana',        continentId: 'africa', image: '../../../images/travel/ghana.png'        },
];

// All country content — requirements, documentation, tips
export const COUNTRY_CONTENT: CountryContent[] = [

  // FRANCE 
  {
    countryId: 'france',
    intro: 'France is part of the EU Pet Travel Scheme. Entry is well-organised but requires preparation at least 3 weeks before travel.',
    requirements: [
      {
        title: 'Microchip',
        body: 'Your dog must have an ISO 11784/11785 compliant 15-digit microchip implanted before the rabies vaccination. Without this, the vaccination is invalid.',
      },
      {
        title: 'Rabies Vaccination',
        body: 'Your dog must be vaccinated against rabies by a vet. The dog must be at least 12 weeks old before vaccination. If it\'s the first rabies shot, you must wait at least 21 days after vaccination before travel.',
      },
      {
        title: 'Tapeworm Treatment',
        body: 'Dogs entering France from the UK must be treated for tapeworm (Echinococcus multilocularis) by a vet 1–5 days before arrival. This must be recorded in the health certificate.',
      },
      {
        title: 'Up-to-date Boosters',
        body: 'Rabies vaccination must be in date. If the booster was given before the expiry of the previous vaccination, no waiting period applies. Always check the expiry date on your certificate.',
      },
    ],
    documentation: [
      {
        title: 'Animal Health Certificate (AHC)',
        body: 'Since Brexit, UK pets travelling to EU countries need an Animal Health Certificate instead of an EU Pet Passport. This is issued by an Official Veterinarian (OV) and is valid for 10 days for entry, then 4 months for re-entry to the UK.',
      },
      {
        title: 'Finding an Official Vet',
        body: 'Only RCVS-registered vets who are also approved as Official Veterinarians can sign the AHC. Book an appointment at least 2 weeks before travel as availability can be limited.',
      },
      {
        title: 'Approved Routes',
        body: 'You must use an approved route and carrier (e.g. Eurostar, P&O, DFDS). Check with your carrier in advance as each has its own pet booking requirements and fees.',
      },
    ],
    tips: [
      {
        title: 'Book the vet early',
        body: 'OV appointments fill up quickly, especially in summer. Book 3–4 weeks before your trip to avoid last-minute stress.',
      },
      {
        title: 'Carry a copy of everything',
        body: 'Keep a photo of your AHC, vaccination records and microchip number on your phone. Border staff occasionally ask for additional verification.',
      },
      {
        title: 'Dog-friendly France',
        body: 'France is very dog-friendly — dogs are welcome in many restaurants, cafés and shops. Always carry water and check local leash laws in parks.',
      },
      {
        title: 'Summer heat',
        body: 'Southern France gets extremely hot in July and August. Never leave your dog in a parked car and walk early morning or evening to avoid heatstroke.',
      },
    ],
  },

  // GERMANY
  {
    countryId: 'germany',
    intro: 'Germany follows EU pet travel rules and is generally very dog-friendly, with excellent infrastructure for travelling with pets.',
    requirements: [
      {
        title: 'Microchip',
        body: 'An ISO-compliant microchip is mandatory and must be implanted before the rabies vaccination to be valid.',
      },
      {
        title: 'Rabies Vaccination',
        body: 'A valid rabies vaccination is required. First-time vaccinations require a 21-day wait. Booster vaccines given before the previous one expires have no waiting period.',
      },
      {
        title: 'Tapeworm Treatment',
        body: 'Dogs must be treated against tapeworm 1–5 days before entering Germany from the UK. The treatment must be administered by a vet and recorded officially.',
      },
      {
        title: 'Breed Restrictions',
        body: 'Some German states (Bundesländer) restrict or ban certain breeds such as Staffordshire Bull Terriers, American Pit Bull Terriers and Rottweilers. Check your destination state\'s rules before travelling.',
      },
    ],
    documentation: [
      {
        title: 'Animal Health Certificate (AHC)',
        body: 'Required for all UK pets entering Germany. Must be issued by an Official Vet within 10 days of travel. The AHC covers entry and is valid for onward EU travel for 4 months.',
      },
      {
        title: 'State-specific Declarations',
        body: 'Certain states may require additional breed declarations or proof of liability insurance. Check the rules for Bavaria, North Rhine-Westphalia and Berlin specifically.',
      },
    ],
    tips: [
      {
        title: 'Dogs on public transport',
        body: 'Dogs are allowed on most German trains (Deutsche Bahn) but require a separate half-price ticket. Small dogs in carriers often travel free.',
      },
      {
        title: 'Off-leash areas',
        body: 'Germany has many designated Hundewiesen (dog meadows) where dogs can run off-lead. Look for signs in city parks.',
      },
      {
        title: 'Tick prevention',
        body: 'Germany has a high tick population especially in forests and southern regions. Use a vet-approved tick treatment before and during your trip.',
      },
    ],
  },

  // SPAIN 
  {
    countryId: 'spain',
    intro: 'Spain is one of Europe\'s most dog-welcoming countries. Entry follows standard EU pet travel rules from the UK.',
    requirements: [
      {
        title: 'Microchip',
        body: 'ISO 15-digit microchip required and must precede the rabies vaccination.',
      },
      {
        title: 'Rabies Vaccination',
        body: 'Valid rabies vaccination required. 21-day wait applies after first vaccination. Boosters given before expiry carry no waiting period.',
      },
      {
        title: 'Tapeworm Treatment',
        body: 'Must be administered 1–5 days before arrival by a licensed vet and documented in the Animal Health Certificate.',
      },
      {
        title: 'Leishmaniasis Awareness',
        body: 'Spain has a high prevalence of Leishmaniasis, transmitted by sandflies. While not a border requirement, a preventative vaccine or repellent collar is strongly recommended, especially in southern Spain.',
      },
    ],
    documentation: [
      {
        title: 'Animal Health Certificate',
        body: 'Required from an Official Vet within 10 days of travel. Keep the original with you — photocopies are not accepted at border crossings.',
      },
      {
        title: 'Regional Rules',
        body: 'Some Spanish regions (comunidades autónomas) have additional rules. Check rules for the Canary Islands separately as they have stricter entry requirements.',
      },
    ],
    tips: [
      {
        title: 'Canary Islands differ',
        body: 'The Canary Islands require separate documentation and an additional health check on arrival. Plan an extra 2–3 weeks of preparation if visiting.',
      },
      {
        title: 'Heat and beaches',
        body: 'Most Spanish beaches ban dogs during summer (June–September). Look for perro-friendly beach sections. Always bring shade and fresh water.',
      },
      {
        title: 'Leash laws',
        body: 'Dogs must be on a lead in public spaces in most Spanish cities. Muzzles are required for certain breeds. Check local bylaws for your specific destination.',
      },
    ],
  },

  // ITALY 
  {
    countryId: 'italy',
    intro: 'Italy is part of the EU pet travel scheme. Italians are generally very welcoming towards dogs in public spaces.',
    requirements: [
      {
        title: 'Microchip',
        body: 'ISO 11784/11785 compliant microchip is required. It must be implanted before the rabies vaccine for the vaccination to count.',
      },
      {
        title: 'Rabies Vaccination',
        body: 'Your dog must be vaccinated against rabies by a vet. The dog must be at least 12 weeks old before vaccination. First rabies vaccinations require a 21-day wait period before travel.',
      },
      {
        title: 'Tapeworm Treatment',
        body: 'Treatment against Echinococcus multilocularis must be given by a vet 1–5 days before entry from the UK and recorded in the AHC.',
      },
      {
        title: 'Tick & Flea Prevention',
        body: 'Italy, particularly the south, has a significant tick population. Treating your dog with a vet-approved tick and flea preventative before departure is strongly advised.',
      },
    ],
    documentation: [
      {
        title: 'Animal Health Certificate',
        body: 'Signed by an Official Vet, valid for 10 days from issue to entry. After entry, the AHC is valid for 4 months of travel within the EU.',
      },
      {
        title: 'Pet Registration',
        body: 'Italy maintains a national dog registry (Anagrafe canina). While tourists are not required to register, keeping your microchip documentation on hand is advised if asked.',
      },
    ],
    tips: [
      {
        title: 'Dogs in restaurants',
        body: 'Many Italian restaurants allow dogs on terraces. Indoor policies vary. Calling ahead is always appreciated.',
      },
      {
        title: 'Train travel',
        body: 'Dogs under 10kg in a carrier travel free on Trenitalia. Larger dogs pay a flat fee and must be muzzled and on a leash on trains.',
      },
      {
        title: 'Heatstroke risk',
        body: 'Italian summers are intense. Schedule walks for early morning and after 6pm. Never leave your dog in the car — Italy has strict animal cruelty laws.',
      },
      {
        title: 'Water safety',
        body: 'Avoid letting your dog drink from stagnant water sources, particularly in rural areas, due to the risk of Leptospirosis.',
      },
    ],
  },

  // PORTUGAL
  {
    countryId: 'portugal',
    intro: 'Portugal is extremely dog-friendly and follows standard EU entry requirements for UK pets.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required before rabies vaccination.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required. 21-day waiting period after first dose.' },
      { title: 'Tapeworm Treatment', body: 'Vet-administered tapeworm treatment required 1–5 days before travel from the UK.' },
      { title: 'Leishmaniasis Prevention', body: 'Portugal has high Leishmaniasis risk, especially in the Alentejo and Algarve. Consult your vet about preventative treatment before the trip.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate', body: 'Required from an Official Vet, valid 10 days from issue. The AHC replaces the old EU Pet Passport for UK residents since Brexit.' },
    ],
    tips: [
      { title: 'Dog-friendly Algarve', body: 'Many Algarve beaches have dog-friendly sections, especially outside July–August. Look for signs marked "Praia com Cão".' },
      { title: 'Avoid midday heat', body: 'Temperatures can exceed 40°C in summer. Walk your dog on grass rather than pavement, which can burn paws.' },
    ],
  },

  // NETHERLANDS
  {
    countryId: 'netherlands',
    intro: 'The Netherlands is one of the most dog-friendly countries in Europe, with excellent public transport access and off-lead areas.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip mandatory, implanted before rabies vaccination.' },
      { title: 'Rabies Vaccination', body: 'Valid and in-date rabies vaccination required. 21-day wait after first vaccination.' },
      { title: 'Tapeworm Treatment', body: 'Must be given 1–5 days before travel from UK and recorded by an official vet.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate', body: 'Required since Brexit. Book with an Official Vet well in advance. Valid 10 days from issue for entry into the EU.' },
    ],
    tips: [
      { title: 'Bikes and dogs', body: 'The Dutch often cycle with small dogs in front baskets. Larger dogs run alongside or travel in cargo bikes — a charming local experience.' },
      { title: 'Dogs on trains', body: 'Dogs travel for a small daily fee on NS trains. They must be on a leash and well-behaved. Avoid peak hours.' },
    ],
  },

  // SWITZERLAND 
  {
    countryId: 'switzerland',
    intro: 'Switzerland is not in the EU but follows similar rules to the EU Pet Travel Scheme. It is extremely dog-welcoming.',
    requirements: [
      { title: 'Microchip', body: 'ISO 15-digit microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination is required. Switzerland aligns with EU rules: 21-day wait for first-time vaccinations.' },
      { title: 'No Tapeworm Requirement', body: 'Switzerland does not require tapeworm treatment for entry, unlike most EU countries. However, treatment is still recommended.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate', body: 'An AHC is required for UK pets entering Switzerland. Must be issued by an Official Vet within 10 days of travel.' },
      { title: 'Dog Tax (Hundesteuer)', body: 'Switzerland charges an annual dog tax. As a tourist, you are exempt, but having proof of your stay can help if questioned.' },
    ],
    tips: [
      { title: 'Dogs on public transport', body: 'Dogs are accepted on all SBB trains and most buses with a half-fare dog ticket. They must be on a leash and muzzled on public transport.' },
      { title: 'Mountain safety', body: 'If hiking in the Alps, be aware of livestock guardian dogs protecting sheep. Keep your dog on a leash around flocks.' },
      { title: 'Water quality', body: 'Swiss tap water is among the cleanest in the world. Dogs can safely drink from most public fountains.' },
    ],
  },

  // POLAND
  {
    countryId: 'poland',
    intro: 'Poland follows EU pet travel rules. It is increasingly dog-friendly, particularly in larger cities.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip implanted before rabies vaccination.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required. 21-day wait applies after first vaccination.' },
      { title: 'Tapeworm Treatment', body: 'Required 1–5 days before entry from the UK, documented by a vet.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate', body: 'Required since Brexit. Official Vet signature needed. Valid for 10 days from issue.' },
    ],
    tips: [
      { title: 'Tick risk', body: 'Poland has a high tick population, especially in forests and national parks. Use tick prevention treatment and check your dog daily.' },
      { title: 'Warsaw & Kraków are pet-friendly', body: 'Both cities have dedicated dog parks and many café terraces welcome dogs. Polish people are generally very fond of dogs.' },
    ],
  },

  // GREECE
  {
    countryId: 'greece',
    intro: 'Greece follows EU pet entry rules. The summer heat and stray dog population are key considerations.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required with the standard 21-day wait for first doses.' },
      { title: 'Tapeworm Treatment', body: 'Vet-administered treatment required 1–5 days before travel from the UK.' },
      { title: 'Leishmaniasis Risk', body: 'Greece has a significant risk of Leishmaniasis, especially on the islands and mainland coastal areas. Preventative treatment is strongly recommended.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate', body: 'AHC required, issued by an Official Vet within 10 days of travel.' },
    ],
    tips: [
      { title: 'Stray dogs', body: 'Greece has a large population of street dogs (strays). Keep your dog on a leash to prevent contact and potential disease transmission.' },
      { title: 'Island ferries', body: 'Ferry operators have varying pet policies. Always book pet-friendly cabins in advance and confirm pet acceptance directly with the ferry company.' },
      { title: 'Extreme heat', body: 'Greek summers are intense. Schedule all outdoor activity for early morning or evening. Paw protection is advisable on hot pavement.' },
    ],
  },

  // IRELAND
  {
    countryId: 'ireland',
    intro: 'Ireland has its own strict pet entry rules separate from the EU, focused on rabies prevention.',
    requirements: [
      { title: 'Microchip', body: 'ISO microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required.' },
      { title: 'Tapeworm Treatment', body: 'Treatment must be given 1–5 days before travel and recorded by a vet.' },
      { title: 'Approved Routes Only', body: 'You must travel via an approved route. Currently, the only approved land/sea route is through Great Britain. Direct flights may have different rules.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate', body: 'AHC required, issued by an Official Vet. Ireland follows GB/EU-style AHC requirements.' },
    ],
    tips: [
      { title: 'Check ferry pet policies', body: 'Irish Ferries and Stena Line allow pets in kennels or on certain pet-friendly decks. Book well in advance, especially in summer.' },
      { title: 'Ireland is very dog-friendly', body: 'Rural Ireland especially welcomes dogs. Many pubs in the countryside allow dogs inside. Always ask first in cities.' },
    ],
  },

  // USA
  {
    countryId: 'usa',
    intro: 'The USA has specific CDC import requirements for dogs that changed significantly in 2023. Careful preparation is essential.',
    requirements: [
      {
        title: 'Microchip',
        body: 'An ISO 11784/11785-compliant microchip is required for all dogs entering the US.',
      },
      {
        title: 'Rabies Vaccination',
        body: 'Dogs must be vaccinated against rabies. The vaccine must be administered at least 30 days before arrival in the USA and must be in date at time of entry.',
      },
      {
        title: 'CDC Dog Import Form',
        body: 'All dogs entering the US must have a completed CDC Dog Import Form submitted online before travel. You will receive a unique DOI number that must be presented at the port of entry.',
      },
      {
        title: 'Screwworm-free Declaration',
        body: 'Dogs must not show signs of screwworm infestation. A vet examination within 10 days of travel is recommended to confirm this.',
      },
    ],
    documentation: [
      {
        title: 'CDC Dog Import Form',
        body: 'Submit at least 2–3 days before travel at dogs.cdc.gov. You will need your dog\'s microchip number, vaccination records and travel itinerary.',
      },
      {
        title: 'USDA Health Certificate',
        body: 'Some states require a USDA-endorsed health certificate. The UK vet must issue an AHC which is then endorsed by APHIS (Animal and Plant Health Inspection Service). Check your destination state requirements.',
      },
      {
        title: 'Airline-specific Forms',
        body: 'Most US-bound airlines require their own pet health forms completed within 10 days of travel. Check with your airline directly.',
      },
    ],
    tips: [
      {
        title: 'Start the CDC form early',
        body: 'The online CDC form system can be slow. Complete it 3–5 days before travel to allow processing time.',
      },
      {
        title: 'Airline cargo vs cabin',
        body: 'Most large dogs travel as checked baggage or cargo. Policies vary significantly by airline. American Airlines, Delta and United have different breed and size restrictions.',
      },
      {
        title: 'State-level restrictions',
        body: 'Some US states have breed-specific legislation. Hawaii has its own strict quarantine rules — check separately before visiting.',
      },
      {
        title: 'Pet-friendly accommodation',
        body: 'Use BringFido or Petswelcome.com to find pet-friendly hotels. Many charge a nightly or one-time pet fee.',
      },
    ],
  },

  // CANADA
  {
    countryId: 'canada',
    intro: 'Canada has straightforward pet import rules for UK dogs, especially compared to many other non-EU destinations.',
    requirements: [
      { title: 'Rabies Vaccination', body: 'Dogs 3 months and older must be vaccinated against rabies. The certificate must be in English or French and include the vaccine type, date and expiry.' },
      { title: 'Microchip', body: 'Not legally required by CBSA (Canada Border Services Agency) but strongly recommended and required by most airlines.' },
      { title: 'Age Requirement', body: 'Puppies under 3 months old have separate entry requirements. They must be in good health and may require a health certificate.' },
    ],
    documentation: [
      { title: 'Rabies Certificate', body: 'The original vaccination certificate signed by a vet must be presented at the border. It should include the dog\'s description, vaccine brand, date given and expiry date.' },
      { title: 'Vet Health Certificate', body: 'While not always legally required, most airlines and some provinces require a vet health certificate issued within 10 days of travel.' },
    ],
    tips: [
      { title: 'Province rules vary', body: 'Quebec, Ontario and British Columbia are very dog-friendly. Some provinces have BSL (Breed Specific Legislation) — check before you travel.' },
      { title: 'Wildlife awareness', body: 'Canada has bears, porcupines and coyotes. Keep dogs on a leash in national parks and be bear-aware in wilderness areas.' },
      { title: 'Cold weather', body: 'If visiting in winter, be aware that road salt and sub-zero temperatures can damage paw pads. Dog boots and paw balm are useful.' },
    ],
  },

  // AUSTRALIA 
  {
    countryId: 'australia',
    intro: 'Australia has some of the strictest pet import regulations in the world. Preparation must begin at least 6 months before travel.',
    requirements: [
      {
        title: 'Rabies Vaccination',
        body: 'Dogs must complete a full rabies vaccination course. The primary course must be completed at least 180 days before travel.',
      },
      {
        title: 'Rabies Neutralising Antibody Test (RNAT)',
        body: 'A blood test confirming sufficient rabies antibody levels must be carried out at an approved laboratory. Results must be received at least 180 days before departure.',
      },
      {
        title: 'Mandatory Quarantine',
        body: 'All dogs entering Australia must complete a minimum 10-day government-managed quarantine at the Eastern Creek facility in Sydney. This cannot be waived.',
      },
      {
        title: 'Parasite Treatments',
        body: 'Dogs must receive treatments for tapeworm, heartworm, ticks, fleas and other parasites in the weeks before travel. Exact treatments and timing are specified by the Department of Agriculture.',
      },
    ],
    documentation: [
      {
        title: 'Import Permit',
        body: 'You must apply for a permit to import a dog from the Department of Agriculture before making any travel arrangements. Processing can take several weeks.',
      },
      {
        title: 'Official Health Certificate',
        body: 'An official health certificate endorsed by the UK\'s Animal and Plant Health Agency (APHA) is required. This must follow Australia\'s template exactly.',
      },
      {
        title: 'Approved Country Status',
        body: 'The UK is on Australia\'s approved country list, which simplifies some steps, but all other requirements still apply in full.',
      },
    ],
    tips: [
      {
        title: 'Start 9–12 months before travel',
        body: 'The timeline for Australian pet import is extremely long. Begin the RNAT testing, vaccinations and permit applications at least 9 months before your planned travel date.',
      },
      {
        title: 'Quarantine costs',
        body: 'Quarantine costs are paid by the owner and can exceed £2,000–£3,000 AUD. Factor this into your travel budget.',
      },
      {
        title: 'Use a pet relocation specialist',
        body: 'Given the complexity, many owners use a professional pet relocation service for Australia. Companies like Dogtainers and Jetpets specialise in this.',
      },
    ],
  },

  // NEW ZEALAND
  {
    countryId: 'new-zealand',
    intro: 'New Zealand is biosecurity-strict. Like Australia, it requires significant advance preparation.',
    requirements: [
      { title: 'Rabies Vaccination & RNAT Test', body: 'Full vaccination course plus a blood antibody test at least 180 days before travel.' },
      { title: 'Quarantine', body: 'Dogs must complete at least 10 days in a MPI-approved managed isolation facility. This is mandatory and cannot be shortened.' },
      { title: 'Parasite Treatments', body: 'Specific vet-administered treatments against internal and external parasites are required before travel, documented precisely.' },
    ],
    documentation: [
      { title: 'Import Permit', body: 'Apply through MPI (Ministry for Primary Industries) well in advance. Permits specify exact requirements for your dog\'s country of origin.' },
      { title: 'Health Certificate', body: 'Official APHA-endorsed health certificate required following NZ\'s exact template.' },
    ],
    tips: [
      { title: 'Allow 12 months of preparation', body: 'New Zealand is one of the most complex countries to bring a pet to. Start the process a full year before your travel date.' },
      { title: 'NZ is very dog-friendly once you arrive', body: 'New Zealand\'s national parks, beaches and cafés are generally very welcoming to dogs. The effort is worth it for long-term relocation.' },
    ],
  },

  // JAPAN
  {
    countryId: 'japan',
    intro: 'Japan has strict biosecurity rules. Entry requires advance planning of at least 6–7 months.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required, implanted before any vaccinations.' },
      { title: 'Rabies Vaccination', body: 'Two valid rabies vaccinations required, given at least 30 days apart and at least 180 days before arrival.' },
      { title: 'RNAT Test', body: 'Rabies Neutralising Antibody Titre Test required. Blood must be taken at least 180 days before entry and tested at a MAFF-approved laboratory.' },
      { title: 'Waiting Period', body: 'After a passing RNAT result, there is a mandatory 180-day waiting period before arrival. Dogs arriving early will be quarantined at the owner\'s expense.' },
    ],
    documentation: [
      { title: 'Advance Notification', body: 'You must notify Japan\'s Animal Quarantine Service (AQS) at least 40 days before arrival by submitting an advance notification form.' },
      { title: 'Health Certificate', body: 'Official health certificate signed by an official government vet (not just any RCVS vet) is required. The format must match AQS requirements exactly.' },
    ],
    tips: [
      { title: 'Start at least 7 months early', body: 'The Japan timeline is one of the longest in the world due to the 180-day waiting period after RNAT. Begin immediately if you\'re planning to move.' },
      { title: 'Quarantine on arrival', body: 'Even with perfect documentation, dogs may be held at the airport for inspection. The usual time is under 12 hours, but non-compliant paperwork leads to longer holds.' },
      { title: 'Dogs in Japan', body: 'Japan is increasingly dog-friendly in cities, with many dog cafés, parks and even dog-friendly ryokans (traditional inns). The effort is rewarding for long-term residents.' },
    ],
  },

  // THAILAND
  {
    countryId: 'thailand',
    intro: 'Thailand has manageable but specific requirements for importing dogs from the UK.',
    requirements: [
      { title: 'Microchip', body: 'ISO microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination is required. Must be given at least 30 days before arrival and be in date.' },
      { title: 'Health Certificate', body: 'Official health certificate issued within 10 days of travel, endorsed by APHA.' },
      { title: 'Import Permit', body: 'An import permit from the Thai Department of Livestock Development (DLD) is required before travel. Apply at least 4 weeks in advance.' },
    ],
    documentation: [
      { title: 'DLD Import Permit', body: 'Apply via the Thai Embassy or directly through the DLD. You will need proof of microchip, vaccination records and vet health certificate.' },
      { title: 'APHA-endorsed Certificate', body: 'The UK health certificate must be officially endorsed by APHA before travel. Allow 5–10 working days for processing.' },
    ],
    tips: [
      { title: 'Tropical disease prevention', body: 'Thailand has heartworm, Ehrlichia, and other vector-borne diseases. Consult your vet about preventatives before and during the trip.' },
      { title: 'Heat and humidity', body: 'Thailand\'s climate is extremely hot and humid year-round. Brachycephalic (flat-faced) breeds are particularly at risk and may not be suitable for air travel to Thailand.' },
      { title: 'Bangkok quarantine', body: 'Dogs may be inspected at Suvarnabhumi Airport on arrival. Having all documents well-organised speeds up the process significantly.' },
    ],
  },

  // UAE
  {
    countryId: 'uae',
    intro: 'The UAE (Dubai, Abu Dhabi) has clear and manageable pet entry requirements for UK dogs.',
    requirements: [
      { title: 'Microchip', body: 'ISO 15-digit microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination given at least 30 days before arrival and not more than 1 year before (or per the vaccine\'s validity period).' },
      { title: 'Internal Parasite Treatment', body: 'Treatment against internal parasites required within 14 days of travel.' },
      { title: 'External Parasite Treatment', body: 'Treatment against fleas and ticks required within 14 days of travel.' },
    ],
    documentation: [
      { title: 'Health Certificate', body: 'Official vet health certificate endorsed by APHA required. Must be translated into Arabic by an approved translator for some emirates.' },
      { title: 'Import Permit (Dubai)', body: 'Dubai Municipality requires a pet import permit. Apply via the Dubai Pet Import portal at least 14 days before travel.' },
      { title: 'Abu Dhabi Requirements', body: 'Abu Dhabi requires prior approval from the Abu Dhabi Agriculture and Food Safety Authority (ADAFSA). Requirements are slightly different from Dubai\'s.' },
    ],
    tips: [
      { title: 'Extreme heat', body: 'UAE summers (May–September) are extremely dangerous for dogs, with temperatures exceeding 45°C. Most expats restrict outdoor activity for dogs to 6–8am and after 8pm.' },
      { title: 'Dog-friendly areas', body: 'Several areas in Dubai (JBR, City Walk, Business Bay) are increasingly dog-friendly. Check individual venue policies as rules change frequently.' },
      { title: 'Breed restrictions', body: 'The UAE bans certain breeds including Pit Bulls, Rottweilers, Dobermans and Mastiffs. Check the full list before booking.' },
    ],
  },

  // BRAZIL
  {
    countryId: 'brazil',
    intro: 'Brazil requires official health certification and specific parasite treatments for imported dogs.',
    requirements: [
      { title: 'Microchip', body: 'ISO microchip strongly recommended and required by MAPA (Ministry of Agriculture).' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required. Must be given between 30 days and 12 months before entry.' },
      { title: 'Distemper, Hepatitis, Parvovirus', body: 'Up-to-date core vaccines (DHPPi) required. These must be documented and in date.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 10 days of travel.' },
    ],
    documentation: [
      { title: 'Zoossanitary Certificate (ZC)', body: 'An official health certificate following MAPA\'s format must be issued by an official UK vet and endorsed by APHA. This is your primary entry document.' },
      { title: 'Translation', body: 'The health certificate may need to be translated into Portuguese. Check with the Brazilian consulate for the latest requirements.' },
    ],
    tips: [
      { title: 'Tropical disease risk', body: 'Brazil has significant risk of Leishmaniasis, Babesiosis and heartworm. Consult a vet specialising in tropical animal medicine before travelling.' },
      { title: 'São Paulo and Rio', body: 'Major Brazilian cities are becoming more dog-friendly, with dedicated parks and pet-friendly restaurants. Smaller towns vary widely in their attitudes.' },
    ],
  },

  // SOUTH AFRICA
  {
    countryId: 'south-africa',
    intro: 'South Africa has clear import requirements and a developing pet-friendly culture in major cities.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination given at least 30 days before arrival.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis, Parvovirus and Bordetella vaccines must be current.' },
      { title: 'Tick & Internal Parasite Treatment', body: 'Vet-administered treatments required within 10 days of travel.' },
    ],
    documentation: [
      { title: 'Veterinary Health Certificate', body: 'Issued by an Official Vet and endorsed by APHA. Must follow DALRRD (Department of Agriculture, Land Reform and Rural Development) format.' },
      { title: 'Import Permit', body: 'Required from DALRRD. Apply at least 3–4 weeks before travel.' },
    ],
    tips: [
      { title: 'Wildlife areas', body: 'Never allow your dog off-lead near game reserves. Dogs can be attacked by wild animals and may disturb wildlife significantly.' },
      { title: 'Tick-borne disease', body: 'South Africa has Babesiosis (biliary), a serious tick-borne disease fatal to dogs. Use the highest-rated tick prevention and check your dog daily.' },
      { title: 'Cape Town is dog-friendly', body: 'Cape Town has many dog-friendly beaches, restaurants and parks. Johannesburg\'s northern suburbs also have excellent dog-friendly options.' },
    ],
  },

  // KENYA
  {
    countryId: 'kenya',
    intro: 'Kenya has specific requirements for pet imports, with applications managed through the Kenya Veterinary Authority.',
    requirements: [
      { title: 'Microchip', body: 'ISO microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, administered at least 30 days but not more than 12 months before travel.' },
      { title: 'Core Vaccines', body: 'Distemper, Parvovirus, Hepatitis and Leptospirosis vaccines must be current.' },
      { title: 'Parasite Treatments', body: 'Treatments against roundworm, tapeworm, ticks and fleas required and documented within 14 days of travel.' },
    ],
    documentation: [
      { title: 'KVA Import Permit', body: 'Apply to the Kenya Veterinary Authority at least 2 months before travel. Permits specify entry point and are issued for specific dates.' },
      { title: 'Official Health Certificate', body: 'APHA-endorsed certificate following Kenya\'s required format.' },
    ],
    tips: [
      { title: 'Disease risk is high', body: 'Kenya has heartworm, Ehrlichia, Babesiosis and other serious conditions. Discuss comprehensive preventative treatments with your vet.' },
      { title: 'Not recommended for short trips', body: 'Given the complexity and disease risk, bringing a dog to Kenya is best suited for longer relocations, not short holidays.' },
    ],
  },

  // MOROCCO
  {
    countryId: 'morocco',
    intro: 'Morocco has moderate entry requirements but cultural attitudes to dogs vary significantly. Plan carefully.',
    requirements: [
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required and must be in date at time of entry.' },
      { title: 'Microchip', body: 'ISO microchip required.' },
      { title: 'Core Vaccines', body: 'Distemper, Parvovirus and Hepatitis vaccines must be documented and current.' },
    ],
    documentation: [
      { title: 'Official Health Certificate', body: 'International health certificate issued by a vet and endorsed by APHA. Must be presented at the point of entry.' },
    ],
    tips: [
      { title: 'Cultural attitudes', body: 'Dogs are not traditionally welcomed in many parts of Morocco, particularly in medinas and souks. Be respectful and keep your dog contained in tourist areas.' },
      { title: 'Riad accommodation', body: 'Many riads do not accept dogs. Check pet policies carefully before booking. Boutique hotels outside city centres are more likely to be pet-friendly.' },
      { title: 'Stray dogs', body: 'Morocco has a large population of stray dogs. Keep your dog on a leash to avoid altercations and potential disease exposure.' },
    ],
  },

  // SINGAPORE
  {
    countryId: 'singapore',
    intro: 'Singapore has a controlled list of approved dog breeds and strict import requirements.',
    requirements: [
      { title: 'Approved Breed', body: 'Singapore only permits 62 approved dog breeds. Many common breeds like Huskies are on the list, but many "dangerous" breeds are banned. Check the AVS approved breed list before planning.' },
      { title: 'Microchip', body: 'ISO microchip required.' },
      { title: 'Rabies & Core Vaccines', body: 'Valid rabies vaccination plus distemper, hepatitis, parvovirus and leptospirosis vaccines required.' },
      { title: 'Rabies Titre Test (RNAT)', body: 'UK is a Category A country so RNAT may not be required, but always verify current requirements with AVS as rules change.' },
    ],
    documentation: [
      { title: 'AVS Import Licence', body: 'Apply to the Animal & Veterinary Service (AVS) of Singapore before travel. Processing takes 3–4 weeks.' },
      { title: 'APHA Health Certificate', body: 'Official health certificate endorsed by APHA is required.' },
    ],
    tips: [
      { title: 'Quarantine on arrival', body: 'Dogs from the UK are typically subject to 10-day quarantine at AVS-approved facilities. Budget for this in your plans.' },
      { title: 'Heat and humidity', body: 'Singapore is equatorial — hot and humid year-round. Acclimatise your dog slowly and avoid outdoor activity in the midday heat.' },
    ],
  },

  // INDIA
  {
    countryId: 'india',
    intro: 'India has relatively straightforward import rules but the local environment presents significant health challenges for imported dogs.',
    requirements: [
      { title: 'Microchip', body: 'ISO microchip recommended and required by most airlines.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, not given more than 12 months before travel.' },
      { title: 'Core Vaccines', body: 'Distemper, Parvovirus, Hepatitis vaccines must be documented and current.' },
    ],
    documentation: [
      { title: 'Health Certificate', body: 'Official health certificate endorsed by APHA. Must be presented at customs on arrival.' },
      { title: 'No Import Permit Required', body: 'India does not currently require a prior import permit for pet dogs, but this should be verified with the Indian High Commission before travel.' },
    ],
    tips: [
      { title: 'Disease risk is very high', body: 'India has very high risk of Rabies, Leptospirosis, Canine Distemper and tick-borne diseases. Consult a tropical vet before and after travel.' },
      { title: 'Stray dog population', body: 'India has the world\'s largest population of free-roaming dogs. Fights, disease transmission and injuries are real risks. Keep your dog on a leash at all times.' },
      { title: 'Not recommended for short stays', body: 'The health risks and logistics make bringing a dog to India unsuitable for holidays. Consider this only for longer relocations with proper veterinary support in place.' },
    ],
  },
  {
    countryId: 'uk',
    intro: 'Entering the UK with a pet requires meeting APHIS/DEFRA rules. The UK has its own strict biosecurity requirements separate from the EU.',
    requirements: [
      {
        title: 'Microchip',
        body: 'Your dog must be microchipped with an ISO 11784/11785-compliant 15-digit chip. This must be done before the rabies vaccination for it to be valid.',
      },
      {
        title: 'Rabies Vaccination',
        body: 'A valid rabies vaccination is required. If it is your dog\'s first rabies vaccine, you must wait 21 days before travel. Boosters given before the previous one expires have no waiting period.',
      },
      {
        title: 'Tapeworm Treatment',
        body: 'Dogs entering the UK must be treated for tapeworm (Echinococcus multilocularis) by a vet 1–5 days before arrival. This must be recorded in the health certificate. This does not apply if travelling from Finland, Ireland, Northern Ireland, Norway or Malta.',
      },
      {
        title: 'No Quarantine',
        body: 'Dogs that meet all UK entry requirements do not need to go into quarantine. Failure to meet requirements can result in mandatory quarantine at the owner\'s expense.',
      },
    ],
    documentation: [
      {
        title: 'Animal Health Certificate (AHC)',
        body: 'Most countries require an AHC issued by an official government vet in your country of origin. This replaces the old EU Pet Passport for travel into the UK. It is valid for 10 days from issue.',
      },
      {
        title: 'Approved Routes',
        body: 'You must travel via an approved route and approved carrier. Check the UK government\'s approved routes list before booking — not all ports and carriers are approved for pet travel.',
      },
      {
        title: 'GB Pet Health Certificate',
        body: 'If travelling from Great Britain (England, Scotland, Wales), a GB Pet Health Certificate signed by an official vet is required. This is different from the AHC used by non-GB countries.',
      },
    ],
    tips: [
      {
        title: 'Check your specific country\'s rules',
        body: 'UK entry rules vary depending on which country you are travelling from. The UK government website (gov.uk/bring-pet-to-great-britain) has a country-by-country tool — always verify before booking.',
      },
      {
        title: 'Book vet appointments early',
        body: 'Official vets who can issue AHCs are in high demand. Book your appointment 3–4 weeks before travel, especially during school holidays and summer.',
      },
      {
        title: 'Northern Ireland is different',
        body: 'Northern Ireland follows different pet travel rules to Great Britain. Dogs travelling to Northern Ireland from EU countries follow EU pet travel rules, not GB rules.',
      },
      {
        title: 'Pet-friendly UK',
        body: 'The UK is very dog-friendly. Most national parks, many pubs and a large number of holiday cottages welcome dogs. Always check individual venue policies.',
      },
    ],
  },
];



// Fallback content for countries without specific data
export const DEFAULT_CONTENT: Omit<CountryContent, 'countryId'> = {
  intro: 'This destination requires careful preparation. Always check the latest government guidance before travelling with your dog.',
  requirements: [
    { title: 'Microchip', body: 'An ISO 11784/11785-compliant 15-digit microchip is required for most international pet travel. Ensure it is implanted before any vaccinations.' },
    { title: 'Rabies Vaccination', body: 'A valid rabies vaccination is required for entry into most countries. Check the specific timing requirements for your destination.' },
    { title: 'Parasite Treatment', body: 'Many countries require documented tapeworm, tick and flea treatments administered by a vet within a set window before travel.' },
    { title: 'General Health', body: 'Your dog should be in good general health before international travel. A vet check-up within 2–4 weeks of departure is always advisable.' },
  ],
  documentation: [
    { title: 'Animal Health Certificate', body: 'UK pets require an Animal Health Certificate (AHC) signed by an Official Veterinarian for most international travel following Brexit. Book your OV appointment well in advance.' },
    { title: 'APHA Endorsement', body: 'Some destinations require the AHC to be endorsed by the Animal and Plant Health Agency (APHA). Allow 5–10 working days for this process.' },
    { title: 'Keep originals with you', body: 'Always carry original documents — photocopies are usually not accepted at border crossings. Keep digital backups on your phone as a secondary copy.' },
  ],
  tips: [
    { title: 'Start preparation early', body: 'International pet travel preparation can take anything from 3 weeks (EU) to 12 months (Australia/New Zealand/Japan). Research your destination requirements as early as possible.' },
    { title: 'Use a specialist vet', body: 'Not all vets are approved as Official Veterinarians. Find one registered to issue AHCs through the RCVS directory.' },
    { title: 'Check the latest rules', body: 'Pet travel rules change frequently. Always verify current requirements with the destination country\'s official government website or embassy before booking.' },
    { title: 'Consider pet travel insurance', body: 'International pet travel insurance covers vet costs abroad, emergency repatriation and can provide peace of mind for the whole trip.' },
  ],
};

// Helper to get content for a country, falling back to defaults
export function getCountryContent(countryId: string): Omit<CountryContent, 'countryId'> {
  const found = COUNTRY_CONTENT.find(c => c.countryId === countryId);
  return found ?? { ...DEFAULT_CONTENT };
}