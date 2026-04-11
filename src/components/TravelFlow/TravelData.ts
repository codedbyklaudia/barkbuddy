import type { Country, CountryContent } from './types';

// All countries
export const COUNTRIES: Country[] = [
  // UK & Ireland (used for to-uk flow)
  { id: 'uk',           name: 'United Kingdom', continentId: 'uk-ireland', image: '../../../images/travel/uk.png'           },
  { id: 'ireland',      name: 'Ireland',        continentId: 'uk-ireland', image: '../../../images/travel/ireland.png'      },

  // Europe
  { id: 'france',         name: 'France',          continentId: 'europe', image: '../../../images/travel/france.png'         },
  { id: 'germany',        name: 'Germany',         continentId: 'europe', image: '../../../images/travel/germany.png'        },
  { id: 'spain',          name: 'Spain',           continentId: 'europe', image: '../../../images/travel/spain.png'          },
  { id: 'italy',          name: 'Italy',           continentId: 'europe', image: '../../../images/travel/italy.png'          },
  { id: 'portugal',       name: 'Portugal',        continentId: 'europe', image: '../../../images/travel/portugal.png'       },
  { id: 'netherlands',    name: 'Netherlands',     continentId: 'europe', image: '../../../images/travel/netherlands.png'    },
  { id: 'belgium',        name: 'Belgium',         continentId: 'europe', image: '../../../images/travel/belgium.png'        },
  { id: 'switzerland',    name: 'Switzerland',     continentId: 'europe', image: '../../../images/travel/switzerland.png'    },
  { id: 'austria',        name: 'Austria',         continentId: 'europe', image: '../../../images/travel/austria.png'        },
  { id: 'poland',         name: 'Poland',          continentId: 'europe', image: '../../../images/travel/poland.png'         },
  { id: 'czech',          name: 'Czech Republic',  continentId: 'europe', image: '../../../images/travel/czech.png'          },
  { id: 'croatia',        name: 'Croatia',         continentId: 'europe', image: '../../../images/travel/croatia.png'        },
  { id: 'greece',         name: 'Greece',          continentId: 'europe', image: '../../../images/travel/greece.png'         },
  { id: 'sweden',         name: 'Sweden',          continentId: 'europe', image: '../../../images/travel/sweden.png'         },
  { id: 'norway',         name: 'Norway',          continentId: 'europe', image: '../../../images/travel/norway.png'         },
  { id: 'denmark',        name: 'Denmark',         continentId: 'europe', image: '../../../images/travel/denmark.png'        },
  { id: 'hungary',        name: 'Hungary',         continentId: 'europe', image: '../../../images/travel/hungary.png'        },
  { id: 'romania',        name: 'Romania',         continentId: 'europe', image: '../../../images/travel/romania.png'        },
  { id: 'turkey',         name: 'Turkey',          continentId: 'europe', image: '../../../images/travel/turkey.png'         },
  // { id: 'finland',        name: 'Finland',         continentId: 'europe', image: '../../../images/travel/finland.png'        },
  // { id: 'iceland',        name: 'Iceland',         continentId: 'europe', image: '../../../images/travel/iceland.png'        },
  // { id: 'slovakia',       name: 'Slovakia',        continentId: 'europe', image: '../../../images/travel/slovakia.png'       },
  // { id: 'slovenia',       name: 'Slovenia',        continentId: 'europe', image: '../../../images/travel/slovenia.png'       },
  // { id: 'bulgaria',       name: 'Bulgaria',        continentId: 'europe', image: '../../../images/travel/bulgaria.png'       },
  // { id: 'serbia',         name: 'Serbia',          continentId: 'europe', image: '../../../images/travel/serbia.png'         },
  // { id: 'malta',          name: 'Malta',           continentId: 'europe', image: '../../../images/travel/malta.png'          },
  // { id: 'cyprus',         name: 'Cyprus',          continentId: 'europe', image: '../../../images/travel/cyprus.png'         },

  // North America
  { id: 'usa',            name: 'USA',             continentId: 'north-america', image: '../../../images/travel/usa.png'            },
  { id: 'canada',         name: 'Canada',          continentId: 'north-america', image: '../../../images/travel/canada.png'         },
  { id: 'mexico',         name: 'Mexico',          continentId: 'north-america', image: '../../../images/travel/mexico.png'         },
  { id: 'costa-rica',     name: 'Costa Rica',      continentId: 'north-america', image: '../../../images/travel/costa-rica.png'     },
  { id: 'cuba',           name: 'Cuba',            continentId: 'north-america', image: '../../../images/travel/cuba.png'           },
  // { id: 'jamaica',        name: 'Jamaica',         continentId: 'north-america', image: '../../../images/travel/jamaica.png'        },
  // { id: 'dominican-rep',  name: 'Dominican Rep.',  continentId: 'north-america', image: '../../../images/travel/dominican_rep.png'  },
  // { id: 'panama',         name: 'Panama',          continentId: 'north-america', image: '../../../images/travel/panama.png'         },

  // Asia
  { id: 'japan',          name: 'Japan',           continentId: 'asia', image: '../../../images/travel/japan.png'          },
  { id: 'thailand',       name: 'Thailand',        continentId: 'asia', image: '../../../images/travel/thailand.png'       },
  { id: 'india',          name: 'India',           continentId: 'asia', image: '../../../images/travel/india.png'          },
  { id: 'singapore',      name: 'Singapore',       continentId: 'asia', image: '../../../images/travel/singapore.png'      },
  { id: 'uae',            name: 'UAE',             continentId: 'asia', image: '../../../images/travel/uae.png'            },
  { id: 'china',          name: 'China',           continentId: 'asia', image: '../../../images/travel/china.png'          },
  { id: 'south-korea',    name: 'South Korea',     continentId: 'asia', image: '../../../images/travel/south_korea.png'    },
  { id: 'bali',           name: 'Bali',            continentId: 'asia', image: '../../../images/travel/bali.png'           },
  { id: 'philippines',    name: 'Philippines',     continentId: 'asia', image: '../../../images/travel/philippines.png'    },
  // { id: 'vietnam',        name: 'Vietnam',         continentId: 'asia', image: '../../../images/travel/vietnam.png'        },
  // { id: 'malaysia',       name: 'Malaysia',        continentId: 'asia', image: '../../../images/travel/malaysia.png'       },
  // { id: 'indonesia',      name: 'Indonesia',       continentId: 'asia', image: '../../../images/travel/indonesia.png'      },
  // { id: 'sri-lanka',      name: 'Sri Lanka',       continentId: 'asia', image: '../../../images/travel/sri_lanka.png'      },
  // { id: 'nepal',          name: 'Nepal',           continentId: 'asia', image: '../../../images/travel/nepal.png'          },
  // { id: 'israel',         name: 'Israel',          continentId: 'asia', image: '../../../images/travel/israel.png'         },
  // { id: 'jordan',         name: 'Jordan',          continentId: 'asia', image: '../../../images/travel/jordan.png'         },

  // South America
  { id: 'brazil',         name: 'Brazil',          continentId: 'south-america', image: '../../../images/travel/brazil.png'         },
  { id: 'argentina',      name: 'Argentina',       continentId: 'south-america', image: '../../../images/travel/argentina.png'      },
  { id: 'colombia',       name: 'Colombia',        continentId: 'south-america', image: '../../../images/travel/colombia.png'       },
  { id: 'chile',          name: 'Chile',           continentId: 'south-america', image: '../../../images/travel/chile.png'          },
  { id: 'peru',           name: 'Peru',            continentId: 'south-america', image: '../../../images/travel/peru.png'           },
  // { id: 'ecuador',        name: 'Ecuador',         continentId: 'south-america', image: '../../../images/travel/ecuador.png'        },
  // { id: 'bolivia',        name: 'Bolivia',         continentId: 'south-america', image: '../../../images/travel/bolivia.png'        },
  // { id: 'uruguay',        name: 'Uruguay',         continentId: 'south-america', image: '../../../images/travel/uruguay.png'        },

  // Oceania
  { id: 'australia',      name: 'Australia',       continentId: 'australia', image: '../../../images/travel/australia-c.png'   },
  { id: 'new-zealand',    name: 'New Zealand',     continentId: 'australia', image: '../../../images/travel/new_zealand.png'   },
  { id: 'fiji',           name: 'Fiji',            continentId: 'australia', image: '../../../images/travel/fiji.png'          },
  // { id: 'papua-ng',       name: 'Papua New Guinea',continentId: 'australia', image: '../../../images/travel/papua_ng.png'      },

  // Africa
  { id: 'south-africa',   name: 'South Africa',    continentId: 'africa', image: '../../../images/travel/south_africa.png'   },
  { id: 'kenya',          name: 'Kenya',           continentId: 'africa', image: '../../../images/travel/kenya.png'          },
  { id: 'morocco',        name: 'Morocco',         continentId: 'africa', image: '../../../images/travel/morocco.png'        },
  { id: 'egypt',          name: 'Egypt',           continentId: 'africa', image: '../../../images/travel/egypt.png'          },
  { id: 'tanzania',       name: 'Tanzania',        continentId: 'africa', image: '../../../images/travel/tanzania.png'       },
  { id: 'ghana',          name: 'Ghana',           continentId: 'africa', image: '../../../images/travel/ghana.png'          },
  // { id: 'nigeria',        name: 'Nigeria',         continentId: 'africa', image: '../../../images/travel/nigeria.png'        },
  // { id: 'ethiopia',       name: 'Ethiopia',        continentId: 'africa', image: '../../../images/travel/ethiopia.png'       },
  // { id: 'uganda',         name: 'Uganda',          continentId: 'africa', image: '../../../images/travel/uganda.png'         },
  // { id: 'namibia',        name: 'Namibia',         continentId: 'africa', image: '../../../images/travel/namibia.png'        },
  // { id: 'senegal',        name: 'Senegal',         continentId: 'africa', image: '../../../images/travel/senegal.png'        },
];

export const COUNTRY_CONTENT: CountryContent[] = [
  // FRANCE 
  {
    countryId: 'france',
    intro: 'France is part of the EU Pet Travel Scheme. Entry is well-organised but requires preparation at least 3 weeks before travel.',
    requirements: [
      { title: 'Microchip', body: 'Your dog must have an ISO 11784/11785 compliant 15-digit microchip implanted before the rabies vaccination. Without this, the vaccination is invalid.' },
      { title: 'Rabies Vaccination', body: 'Your dog must be vaccinated against rabies by a vet. The dog must be at least 12 weeks old before vaccination. If it\'s the first rabies shot, you must wait at least 21 days after vaccination before travel.' },
      { title: 'Tapeworm Treatment', body: 'Dogs entering France from the UK must be treated for tapeworm (Echinococcus multilocularis) by a vet 1–5 days before arrival. This must be recorded in the health certificate.' },
      { title: 'Up-to-date Boosters', body: 'Rabies vaccination must be in date. If the booster was given before the expiry of the previous vaccination, no waiting period applies. Always check the expiry date on your certificate.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate (AHC)', body: 'Since Brexit, UK pets travelling to EU countries need an Animal Health Certificate instead of an EU Pet Passport. This is issued by an Official Veterinarian (OV) and is valid for 10 days for entry, then 4 months for re-entry to the UK.' },
      { title: 'Finding an Official Vet', body: 'Only RCVS-registered vets who are also approved as Official Veterinarians can sign the AHC. Book an appointment at least 2 weeks before travel as availability can be limited.' },
      { title: 'Approved Routes', body: 'You must use an approved route and carrier (e.g. Eurostar, P&O, DFDS). Check with your carrier in advance as each has its own pet booking requirements and fees.' },
    ],
    tips: [
      { title: 'Book the vet early', body: 'OV appointments fill up quickly, especially in summer. Book 3–4 weeks before your trip to avoid last-minute stress.' },
      { title: 'Carry a copy of everything', body: 'Keep a photo of your AHC, vaccination records and microchip number on your phone. Border staff occasionally ask for additional verification.' },
      { title: 'Dog-friendly France', body: 'France is very dog-friendly — dogs are welcome in many restaurants, cafés and shops. Always carry water and check local leash laws in parks.' },
      { title: 'Summer heat', body: 'Southern France gets extremely hot in July and August. Never leave your dog in a parked car and walk early morning or evening to avoid heatstroke.' },
    ],
  },

  // GERMANY
  {
    countryId: 'germany',
    intro: 'Germany follows EU pet travel rules and is generally very dog-friendly, with excellent infrastructure for travelling with pets.',
    requirements: [
      { title: 'Microchip', body: 'An ISO-compliant microchip is mandatory and must be implanted before the rabies vaccination to be valid.' },
      { title: 'Rabies Vaccination', body: 'A valid rabies vaccination is required. First-time vaccinations require a 21-day wait. Booster vaccines given before the previous one expires have no waiting period.' },
      { title: 'Tapeworm Treatment', body: 'Dogs must be treated against tapeworm 1–5 days before entering Germany from the UK. The treatment must be administered by a vet and recorded officially.' },
      { title: 'Breed Restrictions', body: 'Some German states restrict or ban certain breeds such as Staffordshire Bull Terriers, American Pit Bull Terriers and Rottweilers. Check your destination state\'s rules before travelling.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate (AHC)', body: 'Required for all UK pets entering Germany. Must be issued by an Official Vet within 10 days of travel. The AHC covers entry and is valid for onward EU travel for 4 months.' },
      { title: 'State-specific Declarations', body: 'Certain states may require additional breed declarations or proof of liability insurance. Check the rules for Bavaria, North Rhine-Westphalia and Berlin specifically.' },
    ],
    tips: [
      { title: 'Dogs on public transport', body: 'Dogs are allowed on most German trains (Deutsche Bahn) but require a separate half-price ticket. Small dogs in carriers often travel free.' },
      { title: 'Off-leash areas', body: 'Germany has many designated Hundewiesen (dog meadows) where dogs can run off-lead. Look for signs in city parks.' },
      { title: 'Tick prevention', body: 'Germany has a high tick population especially in forests and southern regions. Use a vet-approved tick treatment before and during your trip.' },
    ],
  },

  // ── SPAIN ─────────────────────────────────────────────────────────────────
  {
    countryId: 'spain',
    intro: 'Spain is one of Europe\'s most dog-welcoming countries. Entry follows standard EU pet travel rules from the UK.',
    requirements: [
      { title: 'Microchip', body: 'ISO 15-digit microchip required and must precede the rabies vaccination.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required. 21-day wait applies after first vaccination. Boosters given before expiry carry no waiting period.' },
      { title: 'Tapeworm Treatment', body: 'Must be administered 1–5 days before arrival by a licensed vet and documented in the Animal Health Certificate.' },
      { title: 'Leishmaniasis Awareness', body: 'Spain has a high prevalence of Leishmaniasis, transmitted by sandflies. A preventative vaccine or repellent collar is strongly recommended, especially in southern Spain.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate', body: 'Required from an Official Vet within 10 days of travel. Keep the original with you — photocopies are not accepted at border crossings.' },
      { title: 'Regional Rules', body: 'Some Spanish regions have additional rules. Check rules for the Canary Islands separately as they have stricter entry requirements.' },
    ],
    tips: [
      { title: 'Canary Islands differ', body: 'The Canary Islands require separate documentation and an additional health check on arrival. Plan an extra 2–3 weeks of preparation if visiting.' },
      { title: 'Heat and beaches', body: 'Most Spanish beaches ban dogs during summer (June–September). Look for perro-friendly beach sections. Always bring shade and fresh water.' },
      { title: 'Leash laws', body: 'Dogs must be on a lead in public spaces in most Spanish cities. Muzzles are required for certain breeds. Check local bylaws for your specific destination.' },
    ],
  },

  // ── ITALY ─────────────────────────────────────────────────────────────────
  {
    countryId: 'italy',
    intro: 'Italy is part of the EU pet travel scheme. Italians are generally very welcoming towards dogs in public spaces.',
    requirements: [
      { title: 'Microchip', body: 'ISO 11784/11785 compliant microchip is required. It must be implanted before the rabies vaccine for the vaccination to count.' },
      { title: 'Rabies Vaccination', body: 'Your dog must be vaccinated against rabies by a vet. The dog must be at least 12 weeks old before vaccination. First rabies vaccinations require a 21-day wait period before travel.' },
      { title: 'Tapeworm Treatment', body: 'Treatment against Echinococcus multilocularis must be given by a vet 1–5 days before entry from the UK and recorded in the AHC.' },
      { title: 'Tick & Flea Prevention', body: 'Italy, particularly the south, has a significant tick population. Treating your dog with a vet-approved tick and flea preventative before departure is strongly advised.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate', body: 'Signed by an Official Vet, valid for 10 days from issue to entry. After entry, the AHC is valid for 4 months of travel within the EU.' },
      { title: 'Pet Registration', body: 'Italy maintains a national dog registry (Anagrafe canina). While tourists are not required to register, keeping your microchip documentation on hand is advised if asked.' },
    ],
    tips: [
      { title: 'Dogs in restaurants', body: 'Many Italian restaurants allow dogs on terraces. Indoor policies vary. Calling ahead is always appreciated.' },
      { title: 'Train travel', body: 'Dogs under 10kg in a carrier travel free on Trenitalia. Larger dogs pay a flat fee and must be muzzled and on a leash on trains.' },
      { title: 'Heatstroke risk', body: 'Italian summers are intense. Schedule walks for early morning and after 6pm. Never leave your dog in the car — Italy has strict animal cruelty laws.' },
      { title: 'Water safety', body: 'Avoid letting your dog drink from stagnant water sources, particularly in rural areas, due to the risk of Leptospirosis.' },
    ],
  },

  // ── PORTUGAL ──────────────────────────────────────────────────────────────
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

  // ── NETHERLANDS ───────────────────────────────────────────────────────────
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

  // ── BELGIUM ───────────────────────────────────────────────────────────────
  {
    countryId: 'belgium',
    intro: 'Belgium follows EU pet travel rules and is a compact, dog-friendly country well-suited to travelling with pets.',
    requirements: [
      { title: 'Microchip', body: 'ISO 11784/11785-compliant 15-digit microchip required, implanted before the rabies vaccination.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required. 21-day wait applies after the first vaccination. Boosters given before expiry carry no waiting period.' },
      { title: 'Tapeworm Treatment', body: 'Vet-administered tapeworm treatment required 1–5 days before entry from the UK and documented in the AHC.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate', body: 'Required from an Official Vet within 10 days of travel. Valid for 4 months of onward EU travel after entry.' },
    ],
    tips: [
      { title: 'Dogs on public transport', body: 'Dogs are permitted on SNCB trains for a small fee. Small dogs in carriers often travel free. Brussels metro allows small dogs in carriers.' },
      { title: 'Dog-friendly cities', body: 'Brussels, Bruges and Ghent are very welcoming to dogs. Many cafés and restaurants allow dogs on terraces and even indoors.' },
      { title: 'Leash laws', body: 'Dogs must be kept on a lead in all urban public spaces. Some parks have designated off-lead areas — look for signs.' },
    ],
  },

  // ── SWITZERLAND ───────────────────────────────────────────────────────────
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

  // ── AUSTRIA ───────────────────────────────────────────────────────────────
  {
    countryId: 'austria',
    intro: 'Austria follows EU pet travel rules and is a scenic, dog-welcoming destination with excellent outdoor spaces.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required, implanted before the rabies vaccination.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required. First vaccination requires a 21-day wait before travel.' },
      { title: 'Tapeworm Treatment', body: 'Vet-administered tapeworm treatment required 1–5 days before travel from the UK, documented in the AHC.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate', body: 'Required from an Official Vet within 10 days of travel. Valid for 4 months for onward EU travel.' },
      { title: 'Dog Liability Insurance', body: 'Some Austrian states (Bundesländer) require third-party liability insurance for dogs. Vienna and Styria in particular have this requirement. Check your destination state.' },
    ],
    tips: [
      { title: 'Dogs on public transport', body: 'Dogs are allowed on Austrian Federal Railways (ÖBB) with a half-price ticket. They must be muzzled and on a leash. Vienna\'s U-Bahn also allows leashed, muzzled dogs.' },
      { title: 'Alpine hiking', body: 'Austria has thousands of kilometres of dog-friendly hiking trails. Keep dogs on a leash near livestock and wildlife areas, especially in national parks.' },
      { title: 'Tick prevention', body: 'Austria has a high tick population, particularly in forests and meadows. Use a vet-approved tick preventative and check your dog daily after outdoor activity.' },
    ],
  },

  // ── CZECH REPUBLIC ────────────────────────────────────────────────────────
  {
    countryId: 'czech',
    intro: 'The Czech Republic follows EU pet travel rules. Prague and other cities are increasingly dog-friendly.',
    requirements: [
      { title: 'Microchip', body: 'ISO 15-digit microchip required, implanted before the rabies vaccination.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required. 21-day wait after first vaccination.' },
      { title: 'Tapeworm Treatment', body: 'Tapeworm treatment required 1–5 days before travel from the UK, administered by a vet and recorded in the AHC.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate', body: 'Required from an Official Vet within 10 days of travel. Valid for 4 months of onward EU travel after entry.' },
    ],
    tips: [
      { title: 'Dogs in Prague', body: 'Prague is very dog-friendly — dogs are welcome in many pubs, cafés and even some museums. The city has several dedicated off-lead dog parks.' },
      { title: 'Tick risk', body: 'The Czech Republic has a notable tick-borne encephalitis risk in forested areas. Use tick prevention and consider a TBE vaccine for longer stays.' },
      { title: 'Public transport', body: 'Dogs are allowed on Prague\'s metro and trams for a small fee. They must be muzzled and on a leash, or in a carrier.' },
    ],
  },

  // ── CROATIA ───────────────────────────────────────────────────────────────
  {
    countryId: 'croatia',
    intro: 'Croatia follows EU pet travel rules. The Adriatic coastline and national parks make it a beautiful destination for dogs.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required before the rabies vaccination.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required. 21-day wait after first vaccination.' },
      { title: 'Tapeworm Treatment', body: 'Required 1–5 days before travel from the UK, documented by a vet.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate', body: 'Required from an Official Vet within 10 days of travel. Valid for onward EU travel for 4 months.' },
    ],
    tips: [
      { title: 'Dog-friendly beaches', body: 'Many Croatian beaches have designated dog-friendly sections. Look for "pas dopušten" signs. Avoid the peak summer crowds by visiting in May or September.' },
      { title: 'National parks', body: 'Plitvice Lakes and Krka National Parks have restricted areas for dogs. Check each park\'s specific policy before visiting.' },
      { title: 'Tick and sandfly risk', body: 'Croatia has ticks in forested and rural areas, and sandfly-borne Leishmaniasis along the coast. Use appropriate preventative treatments before travel.' },
    ],
  },

  // ── GREECE ────────────────────────────────────────────────────────────────
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
      { title: 'Stray dogs', body: 'Greece has a large population of street dogs. Keep your dog on a leash to prevent contact and potential disease transmission.' },
      { title: 'Island ferries', body: 'Ferry operators have varying pet policies. Always book pet-friendly cabins in advance and confirm pet acceptance directly with the ferry company.' },
      { title: 'Extreme heat', body: 'Greek summers are intense. Schedule all outdoor activity for early morning or evening. Paw protection is advisable on hot pavement.' },
    ],
  },

  // ── SWEDEN ────────────────────────────────────────────────────────────────
  {
    countryId: 'sweden',
    intro: 'Sweden follows EU pet travel rules and is one of the most dog-friendly countries in the world.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required, implanted before the rabies vaccination.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required. 21-day wait after first vaccination.' },
      { title: 'Tapeworm Treatment', body: 'Required 1–5 days before travel from the UK, administered by a vet and documented in the AHC.' },
      { title: 'Echinococcus-free Declaration', body: 'Sweden requires documentation confirming tapeworm treatment due to its strict biosecurity policies. This is recorded in the AHC.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate', body: 'Required from an Official Vet within 10 days of travel. Valid for 4 months for onward EU travel.' },
    ],
    tips: [
      { title: 'Allemansrätten', body: 'Sweden\'s "Right to Roam" law allows access to most land, but dogs must be kept on a leash during wildlife nesting season (1 March to 20 August) in most areas.' },
      { title: 'Tick risk', body: 'Sweden has a high tick population in summer, particularly in coastal areas and forests. Use tick prevention and check your dog daily.' },
      { title: 'Dog-friendly culture', body: 'Dogs are widely accepted in Swedish shops, restaurants and public transport. Stockholm is particularly dog-welcoming.' },
    ],
  },

  // ── NORWAY ────────────────────────────────────────────────────────────────
  {
    countryId: 'norway',
    intro: 'Norway is not in the EU but follows similar pet entry rules. It is an extremely dog-friendly country with stunning nature.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required. 21-day wait after first vaccination. Norway aligns closely with EU rules.' },
      { title: 'Tapeworm Treatment', body: 'Norway does not require tapeworm treatment for dogs entering from the UK (the UK is on Norway\'s tapeworm-exempt list). Verify this is still current before travel.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate', body: 'Required from an Official Vet within 10 days of travel. Norway accepts the standard EU-format AHC.' },
    ],
    tips: [
      { title: 'Fjord hiking', body: 'Norway has thousands of dog-friendly trails including fjord hikes. Dogs must be on a leash in national parks and near livestock at all times.' },
      { title: 'Wildlife encounters', body: 'Norwegian forests have moose, reindeer and bears. Keep your dog close and on a leash in rural and wilderness areas.' },
      { title: 'Midnight sun', body: 'The continuous daylight in summer can disrupt your dog\'s sleep patterns. Bring blackout travel covers for their sleeping area if needed.' },
    ],
  },

  // ── DENMARK ───────────────────────────────────────────────────────────────
  {
    countryId: 'denmark',
    intro: 'Denmark follows EU pet travel rules and is a compact, extremely dog-friendly country.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required before the rabies vaccination.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required. 21-day wait after first vaccination.' },
      { title: 'Tapeworm Treatment', body: 'Required 1–5 days before travel from the UK, documented by a vet in the AHC.' },
      { title: 'Breed Restrictions', body: 'Denmark bans 13 specific breeds including Pit Bull Terriers, Tosa Inu and Dogo Argentino. Check the full list before travelling — banned breeds face confiscation at the border.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate', body: 'Required from an Official Vet within 10 days of travel. Valid for 4 months for onward EU travel.' },
    ],
    tips: [
      { title: 'Dogs on trains', body: 'Dogs are allowed on DSB trains for a small fee. They must be on a leash; small dogs in carriers often travel free.' },
      { title: 'Dog-friendly Copenhagen', body: 'Copenhagen is one of Europe\'s most dog-friendly capitals, with off-lead parks, dog-friendly cafés and even dog-friendly museums.' },
      { title: 'Beaches', body: 'Many Danish beaches have seasonal dog restrictions (June–September). Outside these months, dogs are widely welcomed. Check local signs.' },
    ],
  },

  // ── HUNGARY ───────────────────────────────────────────────────────────────
  {
    countryId: 'hungary',
    intro: 'Hungary follows EU pet travel rules. Budapest is increasingly dog-friendly and the countryside offers beautiful hiking terrain.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required before the rabies vaccination.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required. 21-day wait after first vaccination.' },
      { title: 'Tapeworm Treatment', body: 'Vet-administered tapeworm treatment required 1–5 days before travel from the UK, documented in the AHC.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate', body: 'Required from an Official Vet within 10 days of travel. Valid for 4 months for onward EU travel.' },
    ],
    tips: [
      { title: 'Budapest parks', body: 'Budapest has numerous dog parks (kutyafuttató) where dogs can run off-lead. Margaret Island and City Park both have designated dog areas.' },
      { title: 'Tick risk', body: 'Hungary has significant tick populations in forested and rural areas. Use tick prevention and check your dog after walks.' },
      { title: 'Public transport', body: 'Dogs are permitted on Budapest\'s metro and trams for a fare. They must be muzzled and on a leash, or in a carrier.' },
    ],
  },

  // ── ROMANIA ───────────────────────────────────────────────────────────────
  {
    countryId: 'romania',
    intro: 'Romania follows EU pet travel rules. The Carpathian mountains and rural landscapes offer incredible walking for dogs.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required before the rabies vaccination.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required. 21-day wait after first vaccination. Romania has a higher rabies risk than Western Europe — ensure vaccinations are fully up to date.' },
      { title: 'Tapeworm Treatment', body: 'Required 1–5 days before travel from the UK, documented by a vet.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate', body: 'Required from an Official Vet within 10 days of travel. Valid for 4 months for onward EU travel.' },
    ],
    tips: [
      { title: 'Stray dog population', body: 'Romania has a significant stray dog population, particularly outside major cities. Keep your dog on a leash to avoid altercations.' },
      { title: 'Wildlife in the Carpathians', body: 'Romania has bears, wolves and lynx in rural and forested areas. Exercise caution when hiking and keep your dog close.' },
      { title: 'Tick-borne disease', body: 'Romania has a high tick burden with risk of Lyme disease and tick-borne encephalitis. Use strong tick preventatives and check your dog daily.' },
    ],
  },

  // ── TURKEY ────────────────────────────────────────────────────────────────
  {
    countryId: 'turkey',
    intro: 'Turkey has its own entry requirements outside the EU framework. Major cities are home to a unique culture of community street dogs.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, administered at least 30 days before arrival and not more than 12 months before travel.' },
      { title: 'Health Certificate', body: 'Official health certificate issued within 10 days of travel, endorsed by APHA.' },
      { title: 'Import Permit', body: 'An import permit from the Turkish Ministry of Agriculture and Forestry may be required. Check with the Turkish Embassy before travel as requirements can change.' },
    ],
    documentation: [
      { title: 'APHA-endorsed Health Certificate', body: 'The UK health certificate must be endorsed by APHA. Allow 5–10 working days for processing.' },
      { title: 'Turkish Translation', body: 'Some border checkpoints may require a Turkish translation of the health certificate. Consult the Turkish Embassy for the latest requirements.' },
    ],
    tips: [
      { title: 'Community street dogs', body: 'Turkish cities are known for their well-cared-for street dogs (sokak köpekleri), often fed and vaccinated by locals. Keep your dog on a leash to avoid interactions.' },
      { title: 'Summer heat', body: 'Turkish summers are extremely hot. Walk your dog in the early morning or after sunset and always carry water.' },
      { title: 'Sandfly and tick risk', body: 'Turkey has risk of Leishmaniasis from sandflies along the coast and ticks in rural areas. Discuss preventative treatment with your vet before travel.' },
    ],
  },

  // ── POLAND ────────────────────────────────────────────────────────────────
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

  // ── USA ───────────────────────────────────────────────────────────────────
  {
    countryId: 'usa',
    intro: 'The USA has specific CDC import requirements for dogs that changed significantly in 2023. Careful preparation is essential.',
    requirements: [
      { title: 'Microchip', body: 'An ISO 11784/11785-compliant microchip is required for all dogs entering the US.' },
      { title: 'Rabies Vaccination', body: 'Dogs must be vaccinated against rabies. The vaccine must be administered at least 30 days before arrival in the USA and must be in date at time of entry.' },
      { title: 'CDC Dog Import Form', body: 'All dogs entering the US must have a completed CDC Dog Import Form submitted online before travel. You will receive a unique DOI number that must be presented at the port of entry.' },
      { title: 'Screwworm-free Declaration', body: 'Dogs must not show signs of screwworm infestation. A vet examination within 10 days of travel is recommended to confirm this.' },
    ],
    documentation: [
      { title: 'CDC Dog Import Form', body: 'Submit at least 2–3 days before travel at dogs.cdc.gov. You will need your dog\'s microchip number, vaccination records and travel itinerary.' },
      { title: 'USDA Health Certificate', body: 'Some states require a USDA-endorsed health certificate. The UK vet must issue an AHC which is then endorsed by APHIS. Check your destination state requirements.' },
      { title: 'Airline-specific Forms', body: 'Most US-bound airlines require their own pet health forms completed within 10 days of travel. Check with your airline directly.' },
    ],
    tips: [
      { title: 'Start the CDC form early', body: 'The online CDC form system can be slow. Complete it 3–5 days before travel to allow processing time.' },
      { title: 'Airline cargo vs cabin', body: 'Most large dogs travel as checked baggage or cargo. Policies vary significantly by airline. American Airlines, Delta and United have different breed and size restrictions.' },
      { title: 'State-level restrictions', body: 'Some US states have breed-specific legislation. Hawaii has its own strict quarantine rules — check separately before visiting.' },
      { title: 'Pet-friendly accommodation', body: 'Use BringFido or Petswelcome.com to find pet-friendly hotels. Many charge a nightly or one-time pet fee.' },
    ],
  },

  // ── CANADA ────────────────────────────────────────────────────────────────
  {
    countryId: 'canada',
    intro: 'Canada has straightforward pet import rules for UK dogs, especially compared to many other non-EU destinations.',
    requirements: [
      { title: 'Rabies Vaccination', body: 'Dogs 3 months and older must be vaccinated against rabies. The certificate must be in English or French and include the vaccine type, date and expiry.' },
      { title: 'Microchip', body: 'Not legally required by CBSA but strongly recommended and required by most airlines.' },
      { title: 'Age Requirement', body: 'Puppies under 3 months old have separate entry requirements. They must be in good health and may require a health certificate.' },
    ],
    documentation: [
      { title: 'Rabies Certificate', body: 'The original vaccination certificate signed by a vet must be presented at the border. It should include the dog\'s description, vaccine brand, date given and expiry date.' },
      { title: 'Vet Health Certificate', body: 'While not always legally required, most airlines and some provinces require a vet health certificate issued within 10 days of travel.' },
    ],
    tips: [
      { title: 'Province rules vary', body: 'Quebec, Ontario and British Columbia are very dog-friendly. Some provinces have BSL — check before you travel.' },
      { title: 'Wildlife awareness', body: 'Canada has bears, porcupines and coyotes. Keep dogs on a leash in national parks and be bear-aware in wilderness areas.' },
      { title: 'Cold weather', body: 'If visiting in winter, be aware that road salt and sub-zero temperatures can damage paw pads. Dog boots and paw balm are useful.' },
    ],
  },

  // ── MEXICO ────────────────────────────────────────────────────────────────
  {
    countryId: 'mexico',
    intro: 'Mexico has relatively straightforward pet entry requirements, though the tropical climate and disease environment require preparation.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip strongly recommended and required by most airlines.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given no more than 12 months before travel.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis and Parvovirus vaccines must be current and documented.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 15 days of travel, documented by a vet.' },
    ],
    documentation: [
      { title: 'Health Certificate', body: 'Official vet health certificate endorsed by APHA is required. Must be issued within 10 days of travel. Some airports require a Spanish translation.' },
      { title: 'Customs Inspection', body: 'Dogs are inspected by SENASICA (Mexico\'s agricultural inspection service) on arrival. Having all documents clearly organised speeds up the process.' },
    ],
    tips: [
      { title: 'Tropical disease risk', body: 'Mexico has heartworm, Ehrlichia and Leishmaniasis in some regions. Consult your vet about comprehensive preventative treatment before travel.' },
      { title: 'Heat and humidity', body: 'Coastal and southern Mexico is extremely hot and humid. Limit outdoor activity to early morning and evening, and always provide shade and fresh water.' },
      { title: 'Mexico City altitude', body: 'Mexico City sits at 2,240 metres altitude. Dogs, like people, may need a day or two to acclimatise. Watch for signs of altitude sickness.' },
    ],
  },

  // ── COSTA RICA ────────────────────────────────────────────────────────────
  {
    countryId: 'costa-rica',
    intro: 'Costa Rica is one of the more accessible Central American destinations for travelling with dogs, with clear government-set requirements.',
    requirements: [
      { title: 'Microchip', body: 'ISO microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given between 30 days and 12 months before arrival.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis and Parvovirus vaccines must be documented and current.' },
      { title: 'Parasite Treatment', body: 'Treatment against internal parasites required within 15 days of travel, signed by a vet.' },
    ],
    documentation: [
      { title: 'SENASA Health Certificate', body: 'An official health certificate following SENASA\'s (Costa Rica\'s National Animal Health Service) format is required. Your UK vet must complete this, endorsed by APHA.' },
      { title: 'Import Authorisation', body: 'Some importers recommend obtaining advance authorisation from SENASA before arrival. Check with the Costa Rican Embassy for the latest requirements.' },
    ],
    tips: [
      { title: 'Tropical disease risk', body: 'Costa Rica has heartworm, Leishmaniasis and tick-borne diseases. Ensure comprehensive preventative treatments are in place before travel.' },
      { title: 'Rainforest areas', body: 'Dogs are not permitted in many of Costa Rica\'s protected national parks and reserves. Plan activities accordingly.' },
      { title: 'Very dog-friendly towns', body: 'Towns like Manuel Antonio, Tamarindo and La Fortuna are very welcoming to dogs. Many hotels and restaurants in tourist areas accept pets.' },
    ],
  },

  // ── CUBA ──────────────────────────────────────────────────────────────────
  {
    countryId: 'cuba',
    intro: 'Cuba has specific entry requirements for pets managed through its state veterinary authority. Preparation should begin well in advance.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, administered at least 30 days before arrival.' },
      { title: 'Core Vaccines', body: 'Distemper, Parvovirus and Hepatitis vaccines must be documented and current.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 10 days of travel, documented by a vet.' },
    ],
    documentation: [
      { title: 'Official Health Certificate', body: 'APHA-endorsed health certificate is required. Must be translated into Spanish by an official translator before travel.' },
      { title: 'Import Permit', body: 'An import permit from Cuba\'s CENSA (National Centre for Animal and Plant Health) is required before travel. Apply through the Cuban Embassy well in advance.' },
    ],
    tips: [
      { title: 'Plan far in advance', body: 'The Cuban bureaucratic process for pet imports can be slow. Begin the permit application at least 2–3 months before travel.' },
      { title: 'Limited veterinary resources', body: 'Veterinary supplies and medications are limited in Cuba. Bring enough of your dog\'s regular medications and food for the entire trip.' },
      { title: 'Heat and humidity', body: 'Cuba is hot and humid year-round. Keep outdoor activity to early morning and evening and ensure constant access to fresh water.' },
    ],
  },

  // ── CHINA ─────────────────────────────────────────────────────────────────
  {
    countryId: 'china',
    intro: 'China has strict and detailed pet import requirements. The process is complex and requires significant advance preparation.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required, implanted before vaccinations.' },
      { title: 'Rabies Vaccination', body: 'Two rabies vaccinations required: a primary course plus a booster. The most recent must be given between 30 days and 12 months before travel.' },
      { title: 'Rabies Antibody Test (RNAT)', body: 'A blood test confirming adequate rabies antibody levels is required from an approved laboratory. The sample must be taken at least 30 days after the last vaccination.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis, Parvovirus and Leptospirosis vaccines must be documented and current.' },
    ],
    documentation: [
      { title: 'Import Permit', body: 'Apply to China\'s GACC (General Administration of Customs) for an import permit before making travel arrangements. Processing can take several weeks.' },
      { title: 'Health Certificate', body: 'APHA-endorsed health certificate following China\'s required format. Must be issued within 10 days of travel.' },
      { title: 'Quarantine on Arrival', body: 'Dogs typically undergo a 7–30 day quarantine on arrival in China depending on the entry port. This is managed at the owner\'s expense.' },
    ],
    tips: [
      { title: 'City-specific breed limits', body: 'Many Chinese cities have breed and size restrictions for pet dogs. Shanghai, Beijing and Guangzhou each have their own rules — check your destination city before travel.' },
      { title: 'Use a pet relocation specialist', body: 'Given the complexity of Chinese pet import rules, many owners use a specialist pet relocation company. They can manage documentation and quarantine logistics.' },
      { title: 'Start 4–6 months early', body: 'Between the RNAT, permit applications and waiting periods, the China pet import process typically takes 4–6 months minimum.' },
    ],
  },

  // ── SOUTH KOREA ───────────────────────────────────────────────────────────
  {
    countryId: 'south-korea',
    intro: 'South Korea has a clear pet import framework and a rapidly growing dog-friendly culture, especially in Seoul.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required, implanted before vaccinations.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required. The UK is listed as a rabies-free country by South Korea, which simplifies some requirements — but vaccination is still mandatory.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis, Parvovirus and Leptospirosis vaccines must be documented and current.' },
    ],
    documentation: [
      { title: 'Health Certificate', body: 'APHA-endorsed health certificate following South Korea\'s APQA (Animal and Plant Quarantine Agency) format. Must be issued within 10 days of travel.' },
      { title: 'Quarantine on Arrival', body: 'Dogs from the UK are generally subject to a 1-day inspection at the airport quarantine facility. Ensure all documentation is in perfect order to avoid longer holds.' },
    ],
    tips: [
      { title: 'Seoul is very dog-friendly', body: 'Seoul has hundreds of dog cafés, dog-friendly restaurants and several large off-lead dog parks. The Han River parks are particularly welcoming to dogs.' },
      { title: 'Airline policies vary', body: 'Korean Air and Asiana have specific pet policies for in-cabin vs cargo travel. Book pet spaces well in advance as they are limited.' },
      { title: 'Heartworm prevention', body: 'South Korea has heartworm risk, especially in summer. Consult your vet about preventative medication before and during your stay.' },
    ],
  },

  // ── BALI (INDONESIA) ──────────────────────────────────────────────────────
  {
    countryId: 'bali',
    intro: 'Bringing a dog to Bali is extremely complex due to Indonesia\'s strict rabies prevention policies. This is generally not recommended for short visits.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination & RNAT Test', body: 'Full rabies vaccination course plus a blood antibody test from an approved laboratory. The RNAT result must be received at least 60 days before travel.' },
      { title: 'Import Permit', body: 'An import permit from Indonesia\'s Ministry of Agriculture (BARANTAN) is required before any other arrangements can be made.' },
      { title: 'Quarantine', body: 'Dogs are subject to quarantine on arrival — typically 14 to 30 days at a government-approved facility in Bali.' },
    ],
    documentation: [
      { title: 'BARANTAN Import Permit', body: 'Apply months in advance. The permit specifies the exact entry point (Ngurah Rai Airport) and quarantine facility.' },
      { title: 'APHA Health Certificate', body: 'Official health certificate endorsed by APHA following Indonesia\'s format exactly.' },
    ],
    tips: [
      { title: 'Not recommended for holidays', body: 'The quarantine period, cost and complexity make bringing a dog to Bali unsuitable for holidays. Consider this only for long-term relocation.' },
      { title: 'Rabies is present in Bali', body: 'Bali has active rabies in its stray dog population. Keep your dog away from stray animals at all times.' },
      { title: 'Use a pet relocation specialist', body: 'Professional pet relocation services are strongly recommended for Indonesia. The documentation requirements are highly specific and errors cause significant delays.' },
    ],
  },

  // ── ARGENTINA ─────────────────────────────────────────────────────────────
  {
    countryId: 'argentina',
    intro: 'Argentina has clear pet import requirements managed through SENASA. Buenos Aires is one of South America\'s most dog-friendly cities.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given between 30 days and 12 months before arrival.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis, Parvovirus and Leptospirosis vaccines must be documented and current.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 10 days of travel, signed by a vet.' },
    ],
    documentation: [
      { title: 'SENASA Health Certificate', body: 'An official health certificate following SENASA\'s format is required, endorsed by APHA. This is your primary entry document.' },
      { title: 'Spanish Translation', body: 'The health certificate must be accompanied by a Spanish translation certified by an official translator or the Argentine Embassy.' },
    ],
    tips: [
      { title: 'Buenos Aires is very dog-friendly', body: 'BA is one of the world\'s most dog-friendly cities with dedicated dog parks (plazas para mascotas) and widespread acceptance in restaurants and cafés.' },
      { title: 'Professional dog walkers', body: 'Argentina has a unique culture of professional dog walkers (paseadores) who walk large groups of dogs. If staying long-term, this is a normal and affordable service.' },
      { title: 'Tropical disease in the north', body: 'Northern Argentina has heartworm and Leishmaniasis risk. Consult your vet about preventatives if travelling beyond Buenos Aires.' },
    ],
  },

  // ── COLOMBIA ──────────────────────────────────────────────────────────────
  {
    countryId: 'colombia',
    intro: 'Colombia has manageable pet import requirements through ICA (Colombian Agricultural Institute). Major cities are increasingly pet-friendly.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given between 30 days and 12 months before travel.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis, Parvovirus and Bordetella vaccines must be documented and current.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 15 days of travel, signed by a vet.' },
    ],
    documentation: [
      { title: 'ICA Health Certificate', body: 'An official health certificate following ICA\'s format, endorsed by APHA and translated into Spanish by a certified translator.' },
      { title: 'ICA Import Registration', body: 'Register the import with ICA before travel. This can be done online via ICA\'s website. Retain the confirmation number for border inspection.' },
    ],
    tips: [
      { title: 'Medellín and Bogotá', body: 'Both cities have growing dog-friendly café and restaurant cultures. Zona Rosa in Bogotá and El Poblado in Medellín are particularly welcoming.' },
      { title: 'Altitude considerations', body: 'Bogotá sits at 2,600 metres. Allow your dog a day or two to acclimatise and watch for signs of altitude sickness.' },
      { title: 'Tropical disease risk', body: 'Colombia has heartworm, Ehrlichia and Leishmaniasis in coastal and lowland areas. Use comprehensive preventatives year-round.' },
    ],
  },

  // ── CHILE ─────────────────────────────────────────────────────────────────
  {
    countryId: 'chile',
    intro: 'Chile has clear pet import requirements managed through SAG (Agricultural and Livestock Service). It is one of South America\'s safer destinations for dogs.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given between 30 days and 12 months before arrival.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis, Parvovirus and Leptospirosis vaccines must be documented and current.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 10 days of travel, documented by a vet.' },
    ],
    documentation: [
      { title: 'SAG Health Certificate', body: 'Official health certificate endorsed by APHA and translated into Spanish. Must follow SAG\'s specific format.' },
      { title: 'SAG Pre-entry Registration', body: 'Notify SAG before travel using their online pet import notification system. You will receive a reference number to present at the border.' },
    ],
    tips: [
      { title: 'Santiago is pet-friendly', body: 'Santiago has many dog-friendly parks, restaurants and hotels. Parque Bicentenario and Parque Araucano have large off-lead areas.' },
      { title: 'Strict biosecurity', body: 'Chile\'s biosecurity is among the strictest in South America. Never attempt to bring in undeclared food, plants or animal products alongside your dog.' },
      { title: 'Patagonia and national parks', body: 'Dogs are restricted or banned from many Chilean national parks, including Torres del Paine. Plan activities around this restriction.' },
    ],
  },

  // ── PERU ──────────────────────────────────────────────────────────────────
  {
    countryId: 'peru',
    intro: 'Peru has straightforward pet entry requirements managed through SENASA. Lima is growing in dog-friendliness.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given between 30 days and 12 months before travel.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis and Parvovirus vaccines must be documented and current.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal parasites required within 10 days of travel, documented by a vet.' },
    ],
    documentation: [
      { title: 'SENASA Health Certificate', body: 'Official health certificate endorsed by APHA, following SENASA\'s format. A Spanish translation may be required — check with the Peruvian Embassy.' },
    ],
    tips: [
      { title: 'Altitude in Cusco', body: 'Cusco sits at 3,400 metres. High altitude is stressful for dogs. Allow several days for acclimatisation and consult your vet about altitude sickness prevention.' },
      { title: 'Machu Picchu', body: 'Dogs are not permitted in the Machu Picchu archaeological site or surrounding protected areas. Plan your visit accordingly.' },
      { title: 'Tropical disease risk', body: 'The Amazon basin has high heartworm and Leishmaniasis risk. Use comprehensive preventatives if venturing into jungle regions.' },
    ],
  },

  // ── FIJI ──────────────────────────────────────────────────────────────────
  {
    countryId: 'fiji',
    intro: 'Fiji has strict biosecurity rules to protect its rabies-free status. Pet importation requires significant advance preparation.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination & RNAT Test', body: 'Full rabies vaccination course plus a blood antibody test from an approved laboratory. Results must be received before travel.' },
      { title: 'Parasite Treatments', body: 'Detailed parasite treatment schedule required in the weeks before travel, as specified by Fiji\'s MAFF (Ministry of Agriculture).' },
      { title: 'Quarantine', body: 'All dogs entering Fiji are subject to a minimum 30-day quarantine at the government facility in Suva, regardless of documentation status.' },
    ],
    documentation: [
      { title: 'Import Permit', body: 'Apply to Fiji\'s MAFF at least 3 months before travel. The permit specifies entry conditions and quarantine requirements.' },
      { title: 'APHA Health Certificate', body: 'Official health certificate endorsed by APHA following Fiji\'s exact format requirements.' },
    ],
    tips: [
      { title: 'Not suitable for holidays', body: 'The 30-day mandatory quarantine makes bringing a dog to Fiji impractical for anything but long-term relocation.' },
      { title: 'Start 4 months early', body: 'Between the RNAT, import permit and waiting periods, the Fiji pet import process requires at least 4 months of preparation.' },
      { title: 'Tropical disease risk', body: 'Fiji has tick-borne diseases and heartworm. Comprehensive preventative treatment is essential before and during any stay.' },
    ],
  },

  // ── EGYPT ─────────────────────────────────────────────────────────────────
  {
    countryId: 'egypt',
    intro: 'Egypt has clear pet import requirements, though attitudes to dogs in public vary significantly between tourist and residential areas.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given between 30 days and 12 months before travel.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis and Parvovirus vaccines must be documented and current.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 14 days of travel, documented by a vet.' },
    ],
    documentation: [
      { title: 'Health Certificate', body: 'APHA-endorsed official health certificate. An Arabic translation may be required — check with the Egyptian Embassy before travel.' },
      { title: 'Import Permit', body: 'An import permit from Egypt\'s General Authority for Veterinary Services (GAVS) is required. Apply through the Egyptian Embassy at least 4 weeks before travel.' },
    ],
    tips: [
      { title: 'Cultural attitudes', body: 'Dogs are not traditionally kept as pets in many parts of Egypt. Keep your dog on a leash and be considerate of local customs, especially outside tourist resorts.' },
      { title: 'Extreme heat', body: 'Egypt\'s summer temperatures regularly exceed 40°C. Walk your dog only in the very early morning or after dark, and never on hot pavement or sand.' },
      { title: 'Stray dog and disease risk', body: 'Egypt has a large stray dog population. Avoid contact with strays to prevent disease transmission including rabies exposure.' },
    ],
  },

  // ── TANZANIA ──────────────────────────────────────────────────────────────
  {
    countryId: 'tanzania',
    intro: 'Tanzania has specific import requirements for dogs. The wildlife environment presents unique risks for travelling pets.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given at least 30 days before arrival.' },
      { title: 'Core Vaccines', body: 'Distemper, Parvovirus, Hepatitis and Leptospirosis vaccines must be documented and current.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 14 days of travel, documented by a vet.' },
    ],
    documentation: [
      { title: 'Tanzania Veterinary Import Permit', body: 'Apply to Tanzania\'s Ministry of Livestock and Fisheries Development before travel. Allow 4–6 weeks for processing.' },
      { title: 'APHA Health Certificate', body: 'Official health certificate endorsed by APHA following Tanzania\'s required format.' },
    ],
    tips: [
      { title: 'Not suitable for safari areas', body: 'Dogs are strictly prohibited from all national parks and game reserves in Tanzania. They cannot be taken on safari.' },
      { title: 'Disease risk is high', body: 'Tanzania has significant risk of heartworm, Babesiosis, Ehrlichia and tick-borne encephalitis. Comprehensive preventative treatment is essential.' },
      { title: 'Mainly for relocation', body: 'Given the restrictions and disease risks, bringing a dog to Tanzania is best suited for those relocating long-term rather than holidaying.' },
    ],
  },

  // ── GHANA ─────────────────────────────────────────────────────────────────
  {
    countryId: 'ghana',
    intro: 'Ghana has specific requirements for pet imports managed through the Veterinary Services Directorate. Preparation should begin well in advance.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given at least 30 days before travel.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis, Parvovirus and Leptospirosis vaccines must be documented and current.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 14 days of travel, documented by a vet.' },
    ],
    documentation: [
      { title: 'VSD Import Permit', body: 'Apply to Ghana\'s Veterinary Services Directorate (VSD) at least 6 weeks before travel. The permit specifies the approved point of entry (Kotoka International Airport).' },
      { title: 'APHA Health Certificate', body: 'Official health certificate endorsed by APHA, following Ghana\'s VSD format requirements.' },
    ],
    tips: [
      { title: 'Tropical disease risk is high', body: 'Ghana has heartworm, Babesiosis, Ehrlichia, Leishmaniasis and tick-borne diseases. A thorough preventative treatment plan is essential before travel.' },
      { title: 'Heat and humidity', body: 'Ghana is hot and humid year-round. Keep outdoor activity to early morning and evening and ensure constant access to shade and fresh water.' },
      { title: 'Accra is the most pet-friendly area', body: 'Greater Accra has the most developed pet infrastructure in Ghana, including veterinary clinics familiar with imported pets. Outside Accra, veterinary care may be very limited.' },
    ],
  },

  // ── IRELAND ───────────────────────────────────────────────────────────────
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

  // ── AUSTRALIA ─────────────────────────────────────────────────────────────
  {
    countryId: 'australia',
    intro: 'Australia has some of the strictest pet import regulations in the world. Preparation must begin at least 6 months before travel.',
    requirements: [
      { title: 'Rabies Vaccination', body: 'Dogs must complete a full rabies vaccination course. The primary course must be completed at least 180 days before travel.' },
      { title: 'Rabies Neutralising Antibody Test (RNAT)', body: 'A blood test confirming sufficient rabies antibody levels must be carried out at an approved laboratory. Results must be received at least 180 days before departure.' },
      { title: 'Mandatory Quarantine', body: 'All dogs entering Australia must complete a minimum 10-day government-managed quarantine at the Eastern Creek facility in Sydney. This cannot be waived.' },
      { title: 'Parasite Treatments', body: 'Dogs must receive treatments for tapeworm, heartworm, ticks, fleas and other parasites in the weeks before travel. Exact treatments and timing are specified by the Department of Agriculture.' },
    ],
    documentation: [
      { title: 'Import Permit', body: 'You must apply for a permit to import a dog from the Department of Agriculture before making any travel arrangements. Processing can take several weeks.' },
      { title: 'Official Health Certificate', body: 'An official health certificate endorsed by the UK\'s Animal and Plant Health Agency (APHA) is required. This must follow Australia\'s template exactly.' },
      { title: 'Approved Country Status', body: 'The UK is on Australia\'s approved country list, which simplifies some steps, but all other requirements still apply in full.' },
    ],
    tips: [
      { title: 'Start 9–12 months before travel', body: 'The timeline for Australian pet import is extremely long. Begin the RNAT testing, vaccinations and permit applications at least 9 months before your planned travel date.' },
      { title: 'Quarantine costs', body: 'Quarantine costs are paid by the owner and can exceed £2,000–£3,000 AUD. Factor this into your travel budget.' },
      { title: 'Use a pet relocation specialist', body: 'Given the complexity, many owners use a professional pet relocation service for Australia. Companies like Dogtainers and Jetpets specialise in this.' },
    ],
  },

  // ── NEW ZEALAND ───────────────────────────────────────────────────────────
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

  // ── JAPAN ─────────────────────────────────────────────────────────────────
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
      { title: 'Quarantine on arrival', body: 'Even with perfect documentation, dogs may be held at the airport for inspection. Non-compliant paperwork leads to longer holds.' },
      { title: 'Dogs in Japan', body: 'Japan is increasingly dog-friendly in cities, with many dog cafés, parks and even dog-friendly ryokans. The effort is rewarding for long-term residents.' },
    ],
  },

  // ── THAILAND ──────────────────────────────────────────────────────────────
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
      { title: 'Heat and humidity', body: 'Thailand\'s climate is extremely hot and humid year-round. Brachycephalic breeds are particularly at risk and may not be suitable for air travel to Thailand.' },
      { title: 'Bangkok quarantine', body: 'Dogs may be inspected at Suvarnabhumi Airport on arrival. Having all documents well-organised speeds up the process significantly.' },
    ],
  },

  // ── INDIA ─────────────────────────────────────────────────────────────────
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

  // ── SINGAPORE ─────────────────────────────────────────────────────────────
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

  // ── UAE ───────────────────────────────────────────────────────────────────
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
      { title: 'Abu Dhabi Requirements', body: 'Abu Dhabi requires prior approval from ADAFSA. Requirements are slightly different from Dubai\'s.' },
    ],
    tips: [
      { title: 'Extreme heat', body: 'UAE summers (May–September) are extremely dangerous for dogs, with temperatures exceeding 45°C. Most expats restrict outdoor activity to 6–8am and after 8pm.' },
      { title: 'Dog-friendly areas', body: 'Several areas in Dubai (JBR, City Walk, Business Bay) are increasingly dog-friendly. Check individual venue policies as rules change frequently.' },
      { title: 'Breed restrictions', body: 'The UAE bans certain breeds including Pit Bulls, Rottweilers, Dobermans and Mastiffs. Check the full list before booking.' },
    ],
  },

  // ── BRAZIL ────────────────────────────────────────────────────────────────
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

  // ── SOUTH AFRICA ──────────────────────────────────────────────────────────
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
      { title: 'Veterinary Health Certificate', body: 'Issued by an Official Vet and endorsed by APHA. Must follow DALRRD format.' },
      { title: 'Import Permit', body: 'Required from DALRRD. Apply at least 3–4 weeks before travel.' },
    ],
    tips: [
      { title: 'Wildlife areas', body: 'Never allow your dog off-lead near game reserves. Dogs can be attacked by wild animals and may disturb wildlife significantly.' },
      { title: 'Tick-borne disease', body: 'South Africa has Babesiosis (biliary), a serious tick-borne disease fatal to dogs. Use the highest-rated tick prevention and check your dog daily.' },
      { title: 'Cape Town is dog-friendly', body: 'Cape Town has many dog-friendly beaches, restaurants and parks. Johannesburg\'s northern suburbs also have excellent dog-friendly options.' },
    ],
  },

  // ── KENYA ─────────────────────────────────────────────────────────────────
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

  // ── MOROCCO ───────────────────────────────────────────────────────────────
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

  // ── UK ────────────────────────────────────────────────────────────────────
  {
    countryId: 'uk',
    intro: 'Entering the UK with a pet requires meeting APHIS/DEFRA rules. The UK has its own strict biosecurity requirements separate from the EU.',
    requirements: [
      { title: 'Microchip', body: 'Your dog must be microchipped with an ISO 11784/11785-compliant 15-digit chip. This must be done before the rabies vaccination for it to be valid.' },
      { title: 'Rabies Vaccination', body: 'A valid rabies vaccination is required. If it is your dog\'s first rabies vaccine, you must wait 21 days before travel. Boosters given before the previous one expires have no waiting period.' },
      { title: 'Tapeworm Treatment', body: 'Dogs entering the UK must be treated for tapeworm by a vet 1–5 days before arrival. This must be recorded in the health certificate. This does not apply if travelling from Finland, Ireland, Northern Ireland, Norway or Malta.' },
      { title: 'No Quarantine', body: 'Dogs that meet all UK entry requirements do not need to go into quarantine. Failure to meet requirements can result in mandatory quarantine at the owner\'s expense.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate (AHC)', body: 'Most countries require an AHC issued by an official government vet in your country of origin. This replaces the old EU Pet Passport for travel into the UK. It is valid for 10 days from issue.' },
      { title: 'Approved Routes', body: 'You must travel via an approved route and approved carrier. Check the UK government\'s approved routes list before booking — not all ports and carriers are approved for pet travel.' },
      { title: 'GB Pet Health Certificate', body: 'If travelling from Great Britain, a GB Pet Health Certificate signed by an official vet is required. This is different from the AHC used by non-GB countries.' },
    ],
    tips: [
      { title: 'Check your specific country\'s rules', body: 'UK entry rules vary depending on which country you are travelling from. The UK government website (gov.uk/bring-pet-to-great-britain) has a country-by-country tool — always verify before booking.' },
      { title: 'Book vet appointments early', body: 'Official vets who can issue AHCs are in high demand. Book your appointment 3–4 weeks before travel, especially during school holidays and summer.' },
      { title: 'Northern Ireland is different', body: 'Northern Ireland follows different pet travel rules to Great Britain. Dogs travelling to Northern Ireland from EU countries follow EU pet travel rules, not GB rules.' },
      { title: 'Pet-friendly UK', body: 'The UK is very dog-friendly. Most national parks, many pubs and a large number of holiday cottages welcome dogs. Always check individual venue policies.' },
    ],
  },


  // ── FINLAND ───────────────────────────────────────────────────────────────
  {
    countryId: 'finland',
    intro: 'Finland follows EU pet travel rules and is one of the most dog-friendly countries in Europe. It is also one of the few countries exempt from the UK tapeworm treatment requirement.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required before the rabies vaccination.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required. 21-day wait after first vaccination.' },
      { title: 'No Tapeworm Treatment Required', body: 'Finland is on the UK\'s tapeworm-exempt list, so dogs travelling from the UK do not need tapeworm treatment before entry. This is a significant benefit over most EU countries.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate', body: 'Required from an Official Vet within 10 days of travel. Valid for 4 months for onward EU travel.' },
    ],
    tips: [
      { title: 'Everyman\'s right', body: 'Finland\'s jokamiehenoikeus (Everyman\'s Right) allows access to most forests and nature. Dogs must be kept on a leash during the bird nesting season (April–July).' },
      { title: 'Tick risk', body: 'Finland has ticks in coastal and southern regions during summer. Use tick prevention and check your dog after forest walks.' },
      { title: 'Dog-friendly culture', body: 'Finns are very fond of dogs. Dogs are welcome in many shops, outdoor restaurant terraces and even some public saunas in rural areas.' },
    ],
  },

  // ── ICELAND ───────────────────────────────────────────────────────────────
  {
    countryId: 'iceland',
    intro: 'Iceland is not in the EU but has its own specific — and quite strict — pet import rules to protect its rabies-free status.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Two rabies vaccinations required: a primary and a booster at least 28 days later. The booster must be given between 28 days and 12 months before travel.' },
      { title: 'Tapeworm Treatment', body: 'Treatment against Echinococcus must be given 1–5 days before arrival and documented by a vet.' },
      { title: 'Advance Application', body: 'An import application must be submitted to the Icelandic Food and Veterinary Authority (MAST) at least 4 weeks before travel.' },
    ],
    documentation: [
      { title: 'MAST Import Permit', body: 'Apply via MAST\'s online system. You will receive an approval reference number that must be presented at the border.' },
      { title: 'Animal Health Certificate', body: 'APHA-endorsed health certificate following Iceland\'s format, issued within 10 days of travel.' },
    ],
    tips: [
      { title: 'Dogs in national parks', body: 'Dogs are not permitted in most of Iceland\'s protected nature reserves and national parks, including Þingvellir and Skaftafell. Plan activities carefully.' },
      { title: 'Weather preparation', body: 'Iceland\'s weather is unpredictable year-round. Pack a waterproof dog coat and booties for rough terrain hikes.' },
      { title: 'Dog-friendly Reykjavik', body: 'The capital is welcoming to dogs with several off-lead parks and dog-friendly cafés. Outside the city, check individual attraction policies.' },
    ],
  },

  // ── SLOVAKIA ──────────────────────────────────────────────────────────────
  {
    countryId: 'slovakia',
    intro: 'Slovakia follows EU pet travel rules. Bratislava and the Tatra mountains make it an appealing destination for dog owners.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required before the rabies vaccination.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required. 21-day wait after first vaccination.' },
      { title: 'Tapeworm Treatment', body: 'Vet-administered tapeworm treatment required 1–5 days before travel from the UK, documented in the AHC.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate', body: 'Required from an Official Vet within 10 days of travel. Valid for 4 months for onward EU travel.' },
    ],
    tips: [
      { title: 'Tatra hiking', body: 'The High Tatras have dog-friendly trails but some protected zones restrict dogs. Always check trail rules before setting off.' },
      { title: 'Tick risk', body: 'Slovakia has a significant tick population in forests and mountain foothills. Use tick prevention and check your dog daily.' },
      { title: 'Budget-friendly', body: 'Slovakia is one of the most affordable EU destinations. Dog-friendly accommodation is widely available and inexpensive.' },
    ],
  },

  // ── SLOVENIA ──────────────────────────────────────────────────────────────
  {
    countryId: 'slovenia',
    intro: 'Slovenia follows EU pet travel rules. It is a compact, green country with exceptional nature for dog walking.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required before the rabies vaccination.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required. 21-day wait after first vaccination.' },
      { title: 'Tapeworm Treatment', body: 'Required 1–5 days before travel from the UK, documented by a vet.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate', body: 'Required from an Official Vet within 10 days of travel. Valid for 4 months for onward EU travel.' },
    ],
    tips: [
      { title: 'Lake Bled', body: 'The area around Lake Bled is very dog-friendly with lakeside walking paths and dog-welcoming cafés and guesthouses.' },
      { title: 'Triglav National Park', body: 'Dogs are allowed on many trails in Triglav but must be kept on a leash. Some high-altitude areas restrict access — check with park authorities.' },
      { title: 'Ljubljana', body: 'Slovenia\'s capital is exceptionally dog-friendly, with dogs welcome in many restaurants, bars and even some museum courtyards.' },
    ],
  },

  // ── BULGARIA ──────────────────────────────────────────────────────────────
  {
    countryId: 'bulgaria',
    intro: 'Bulgaria follows EU pet travel rules. Its Black Sea coast and mountain ranges offer varied terrain for dogs.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required before the rabies vaccination.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required. 21-day wait after first vaccination. Bulgaria has a higher rabies risk than Western Europe — ensure vaccinations are fully up to date.' },
      { title: 'Tapeworm Treatment', body: 'Required 1–5 days before travel from the UK, documented by a vet.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate', body: 'Required from an Official Vet within 10 days of travel. Valid for 4 months for onward EU travel.' },
    ],
    tips: [
      { title: 'Stray dog population', body: 'Bulgaria has a significant stray dog population, particularly outside major cities. Keep your dog on a leash and avoid contact with strays.' },
      { title: 'Tick and Leishmaniasis risk', body: 'Bulgaria has ticks in forested areas and sandfly-borne Leishmaniasis along the southern coast. Use appropriate preventative treatments.' },
      { title: 'Black Sea coast', body: 'Many Black Sea resorts have dog-friendly beaches outside the peak summer season. Check individual beach policies before visiting.' },
    ],
  },

  // ── SERBIA ────────────────────────────────────────────────────────────────
  {
    countryId: 'serbia',
    intro: 'Serbia is not in the EU but accepts pets from the UK with standard health documentation. Belgrade is increasingly dog-friendly.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required. Must be given at least 21 days before arrival for first-time vaccinations.' },
      { title: 'Tapeworm Treatment', body: 'Vet-administered tapeworm treatment required 1–5 days before travel, documented in the health certificate.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate', body: 'Serbia accepts the standard EU-format AHC issued by an Official Vet within 10 days of travel.' },
    ],
    tips: [
      { title: 'Belgrade parks', body: 'Belgrade has several large parks where dogs are welcome, including Ada Ciganlija island park. Many cafés allow dogs on outdoor terraces.' },
      { title: 'Tick risk', body: 'Serbia has a high tick population in forested and rural areas. Use tick prevention and check your dog after every outdoor excursion.' },
      { title: 'Stray dogs', body: 'Like other Balkan countries, Serbia has stray dog populations outside major urban areas. Keep your dog on a leash to avoid interactions.' },
    ],
  },

  // ── MALTA ─────────────────────────────────────────────────────────────────
  {
    countryId: 'malta',
    intro: 'Malta follows EU pet travel rules and is one of the few countries exempt from the tapeworm treatment requirement for UK dogs.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required before the rabies vaccination.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required. 21-day wait after first vaccination.' },
      { title: 'No Tapeworm Treatment Required', body: 'Malta is on the UK\'s tapeworm-exempt list. Dogs travelling from the UK do not require tapeworm treatment before entering Malta.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate', body: 'Required from an Official Vet within 10 days of travel. Valid for 4 months of onward EU travel.' },
    ],
    tips: [
      { title: 'Leishmaniasis risk', body: 'Malta has sandfly-borne Leishmaniasis, particularly in rural and coastal areas. Consult your vet about preventative treatment before travel.' },
      { title: 'Heat', body: 'Maltese summers are very hot and dry. Walk your dog early morning or after sunset. Pavements can reach dangerous temperatures for paw pads.' },
      { title: 'Dog-friendly beaches', body: 'Several Maltese beaches have dog-friendly sections outside the main bathing season. Golden Bay and Mellieħa Bay have designated dog areas.' },
    ],
  },

  // ── CYPRUS ────────────────────────────────────────────────────────────────
  {
    countryId: 'cyprus',
    intro: 'Cyprus follows EU pet travel rules. It is a warm, relaxed island destination, though the heat requires careful management for dogs.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required before the rabies vaccination.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required. 21-day wait after first vaccination.' },
      { title: 'Tapeworm Treatment', body: 'Required 1–5 days before travel from the UK, documented by a vet.' },
    ],
    documentation: [
      { title: 'Animal Health Certificate', body: 'Required from an Official Vet within 10 days of travel. Valid for 4 months of onward EU travel.' },
    ],
    tips: [
      { title: 'Leishmaniasis risk', body: 'Cyprus has a significant Leishmaniasis risk from sandflies, especially in rural and coastal areas. Preventative treatment is strongly recommended.' },
      { title: 'Summer heat', body: 'Cyprus summers are extreme, regularly exceeding 38°C. Limit dog activity to early morning and late evening. Never leave dogs in parked vehicles.' },
      { title: 'Troodos mountains', body: 'The Troodos mountain range offers much cooler temperatures in summer and many dog-friendly trails. A great option for escaping coastal heat.' },
    ],
  },

  // ── PHILIPPINES ───────────────────────────────────────────────────────────
  {
    countryId: 'philippines',
    intro: 'The Philippines has specific import requirements managed through the Bureau of Animal Industry (BAI). The tropical environment presents significant health challenges.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required. The most recent dose must be given at least 30 days before arrival but no more than 12 months before travel.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis, Parvovirus and Leptospirosis vaccines must be documented and current.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 14 days of travel, documented by a vet.' },
    ],
    documentation: [
      { title: 'BAI Import Permit', body: 'Apply to the Bureau of Animal Industry (BAI) at least 4 weeks before travel. The permit specifies the approved port of entry (usually Ninoy Aquino International Airport, Manila).' },
      { title: 'APHA Health Certificate', body: 'Official health certificate endorsed by APHA, following the BAI\'s required format.' },
      { title: 'Quarantine on Arrival', body: 'Dogs are inspected by BAI vets on arrival. If documentation is complete, the process is usually quick. Incomplete paperwork leads to quarantine at the owner\'s expense.' },
    ],
    tips: [
      { title: 'Rabies is endemic', body: 'The Philippines has one of the highest rates of human rabies deaths in Asia. Keep your dog away from stray animals at all times and ensure vaccinations are absolutely current.' },
      { title: 'Tropical disease risk', body: 'Heartworm, Ehrlichia and tick-borne diseases are widespread. Comprehensive preventative treatment is essential before and during your stay.' },
      { title: 'Heat and humidity', body: 'The Philippines is hot and humid year-round. Limit outdoor activity to early morning and after sunset. Provide constant shade and fresh water.' },
    ],
  },

  // ── VIETNAM ───────────────────────────────────────────────────────────────
  {
    countryId: 'vietnam',
    intro: 'Vietnam has specific import requirements and a complex cultural context for dogs. Thorough preparation is essential.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given at least 30 days before arrival.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis and Parvovirus vaccines must be documented and current.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 14 days of travel, documented by a vet.' },
    ],
    documentation: [
      { title: 'Import Permit', body: 'Apply to Vietnam\'s Department of Animal Health (DAH) before travel. The permit process can take 2–4 weeks.' },
      { title: 'APHA Health Certificate', body: 'Official health certificate endorsed by APHA. A Vietnamese translation is required and must be certified by an official translator.' },
    ],
    tips: [
      { title: 'Cultural attitudes vary', body: 'Attitudes to dogs vary widely across Vietnam. Urban areas like Hanoi and Ho Chi Minh City are more accepting, but be mindful in rural areas and markets.' },
      { title: 'Rabies risk', body: 'Vietnam has significant rabies risk from stray dogs and wildlife. Keep your dog on a leash and away from all stray animals.' },
      { title: 'Tropical disease prevention', body: 'Vietnam has heartworm, tick-borne diseases and Ehrlichia. Ensure comprehensive preventative treatments are in place well before travel.' },
    ],
  },

  // ── MALAYSIA ──────────────────────────────────────────────────────────────
  {
    countryId: 'malaysia',
    intro: 'Malaysia has clear pet import requirements managed through the Department of Veterinary Services (DVS). Note that cultural attitudes to dogs vary significantly between communities.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given at least 30 days before arrival and no more than 12 months before travel.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis, Parvovirus and Leptospirosis vaccines must be documented and current.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 14 days of travel, documented by a vet.' },
    ],
    documentation: [
      { title: 'DVS Import Permit', body: 'Apply to Malaysia\'s Department of Veterinary Services at least 30 days before travel. Permits specify the approved entry point.' },
      { title: 'APHA Health Certificate', body: 'Official health certificate endorsed by APHA, following DVS format requirements.' },
    ],
    tips: [
      { title: 'Cultural sensitivity', body: 'Malaysia has a large Muslim population, and dogs are considered ritually unclean in Islamic tradition. Be respectful — keep your dog contained and avoid Malay neighbourhoods and markets.' },
      { title: 'Kuala Lumpur expat areas', body: 'Expatriate-heavy areas like Mont Kiara and Bangsar in KL are significantly more dog-friendly. Many condominiums and restaurants in these areas accept dogs.' },
      { title: 'Tropical disease risk', body: 'Malaysia has heartworm, tick-borne diseases and Leptospirosis. Comprehensive preventative treatment is essential before and during your stay.' },
    ],
  },

  // ── INDONESIA ─────────────────────────────────────────────────────────────
  {
    countryId: 'indonesia',
    intro: 'Indonesia (mainland, excluding Bali) has strict biosecurity import requirements. The process is complex and time-consuming.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination & RNAT Test', body: 'Full rabies vaccination course plus a blood antibody test from a BARANTAN-approved laboratory. Results must be received at least 60 days before travel.' },
      { title: 'Parasite Treatments', body: 'Comprehensive parasite treatment schedule required in the weeks before travel, as specified by BARANTAN.' },
      { title: 'Import Permit', body: 'An import permit from Indonesia\'s BARANTAN (Agency for Agricultural Quarantine) is required before any arrangements are made.' },
    ],
    documentation: [
      { title: 'BARANTAN Import Permit', body: 'Apply months in advance through the Indonesian Embassy or BARANTAN directly. The permit specifies the approved entry port and quarantine facility.' },
      { title: 'APHA Health Certificate', body: 'Official health certificate endorsed by APHA following Indonesia\'s exact format.' },
    ],
    tips: [
      { title: 'Use a pet relocation specialist', body: 'Indonesia\'s import requirements are highly specific. Professional pet relocation services are strongly recommended to avoid costly documentation errors.' },
      { title: 'Quarantine on arrival', body: 'Dogs are subject to quarantine at the entry port. Duration depends on documentation compliance but is typically 7–14 days.' },
      { title: 'Rabies is present', body: 'Rabies is active in many parts of Indonesia. Keep your dog away from stray animals and ensure vaccinations are completely current.' },
    ],
  },

  // ── SRI LANKA ─────────────────────────────────────────────────────────────
  {
    countryId: 'sri-lanka',
    intro: 'Sri Lanka has manageable but specific import requirements. The country has a large stray dog population and significant tropical disease risk.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given at least 30 days before arrival and no more than 12 months before travel.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis and Parvovirus vaccines must be documented and current.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 14 days of travel.' },
    ],
    documentation: [
      { title: 'Veterinary Authority Import Permit', body: 'Apply to Sri Lanka\'s Department of Animal Production and Health at least 4 weeks before travel.' },
      { title: 'APHA Health Certificate', body: 'Official health certificate endorsed by APHA. May require an official translation into Sinhala or Tamil for some entry points.' },
    ],
    tips: [
      { title: 'Rabies risk is high', body: 'Sri Lanka has significant rabies transmission from stray dogs. Keep your dog strictly away from street animals and ensure vaccinations are up to date.' },
      { title: 'Tropical disease prevention', body: 'Heartworm, tick-borne diseases and Ehrlichia are present. Comprehensive preventatives are essential before and throughout your stay.' },
      { title: 'Heat and monsoon', body: 'Sri Lanka is hot and humid. Monsoon seasons (May–August in the southwest, November–January in the northeast) bring heavy rain. Plan outdoor activity around weather patterns.' },
    ],
  },

  // ── NEPAL ─────────────────────────────────────────────────────────────────
  {
    countryId: 'nepal',
    intro: 'Nepal has relatively straightforward import requirements. Dogs are treated with reverence in Hindu culture, particularly during the Kukur Tihar festival.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given at least 30 days before arrival.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis and Parvovirus vaccines must be documented and current.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 14 days of travel, documented by a vet.' },
    ],
    documentation: [
      { title: 'Health Certificate', body: 'APHA-endorsed health certificate required. Present at the Department of Livestock Services checkpoint at Tribhuvan International Airport on arrival.' },
    ],
    tips: [
      { title: 'Altitude', body: 'Kathmandu Valley sits at 1,400 metres, but trekking areas reach 3,000–5,000+ metres. Dogs need gradual acclimatisation and should not be taken on high-altitude treks without vet guidance.' },
      { title: 'Kukur Tihar', body: 'The Tihar festival includes a day devoted to honouring dogs. If visiting in October/November, your dog may receive garlands and blessings from locals.' },
      { title: 'Stray dogs and rabies', body: 'Nepal has a significant stray dog population and active rabies transmission. Keep your dog on a leash and away from street animals at all times.' },
    ],
  },

  // ── ISRAEL ────────────────────────────────────────────────────────────────
  {
    countryId: 'israel',
    intro: 'Israel has clear pet import requirements and a thriving dog-friendly culture, particularly in Tel Aviv.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given at least 30 days before arrival. Must not have expired at time of entry.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis and Parvovirus vaccines must be documented and current.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 10 days of travel, documented by a vet.' },
    ],
    documentation: [
      { title: 'Health Certificate', body: 'APHA-endorsed health certificate issued within 10 days of travel. An official Hebrew translation may be requested at Ben Gurion Airport — check with the Israeli Embassy before travel.' },
      { title: 'Veterinary Inspection on Arrival', body: 'Dogs are inspected by Ministry of Agriculture vets on arrival. If documentation is complete, clearance is usually swift.' },
    ],
    tips: [
      { title: 'Tel Aviv is extremely dog-friendly', body: 'Tel Aviv is consistently rated one of the world\'s most dog-friendly cities, with hundreds of off-lead parks, dog-friendly beaches, restaurants and cafés.' },
      { title: 'Heat', body: 'Israeli summers are very hot and dry. Walk dogs only in the early morning or after dark. Paw pad burns from hot pavement are a real risk.' },
      { title: 'Sand fly and tick risk', body: 'Israel has Leishmaniasis from sandflies and tick-borne diseases. Use appropriate preventative treatments before and during your stay.' },
    ],
  },

  // ── JORDAN ────────────────────────────────────────────────────────────────
  {
    countryId: 'jordan',
    intro: 'Jordan has specific pet import requirements. Cultural attitudes to dogs are mixed, and preparation should be thorough.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given at least 30 days before arrival and no more than 12 months before travel.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis and Parvovirus vaccines must be documented and current.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 14 days of travel.' },
    ],
    documentation: [
      { title: 'Health Certificate', body: 'APHA-endorsed health certificate. An Arabic translation certified by an official translator is required.' },
      { title: 'Import Permit', body: 'An import permit from Jordan\'s Ministry of Agriculture is required before travel. Apply through the Jordanian Embassy at least 4 weeks in advance.' },
    ],
    tips: [
      { title: 'Cultural attitudes', body: 'Dogs are not traditionally kept as pets in many parts of Jordan. Be respectful in public spaces, particularly near mosques and markets, and keep your dog on a leash.' },
      { title: 'Petra and national sites', body: 'Dogs are not permitted in the Petra archaeological site or most protected natural areas in Jordan. Plan your sightseeing accordingly.' },
      { title: 'Extreme heat', body: 'Jordan\'s desert climate brings intense summer heat. Restrict all dog activity to early morning and after dark, and never leave dogs in vehicles.' },
    ],
  },

  // ── JAMAICA ───────────────────────────────────────────────────────────────
  {
    countryId: 'jamaica',
    intro: 'Jamaica has specific import requirements managed through the Veterinary Services Division. The tropical climate requires careful management.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given at least 30 days before arrival.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis, Parvovirus and Leptospirosis vaccines must be current.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 14 days of travel, documented by a vet.' },
    ],
    documentation: [
      { title: 'Import Permit', body: 'Apply to Jamaica\'s Veterinary Services Division at least 4 weeks before travel. The permit specifies the entry point and any inspection requirements.' },
      { title: 'APHA Health Certificate', body: 'Official health certificate endorsed by APHA, following VSD format requirements.' },
    ],
    tips: [
      { title: 'Tropical disease risk', body: 'Jamaica has heartworm and tick-borne diseases. Comprehensive preventative treatment is essential before and during your stay.' },
      { title: 'Heat and humidity', body: 'Jamaica is hot and humid year-round. Walk dogs only in early morning or evening and always provide shade and fresh water.' },
      { title: 'Hurricane season', body: 'Jamaica\'s hurricane season runs June–November. Check weather forecasts carefully when travelling during this period and have an emergency plan for your dog.' },
    ],
  },

  // ── DOMINICAN REPUBLIC ────────────────────────────────────────────────────
  {
    countryId: 'dominican-rep',
    intro: 'The Dominican Republic has relatively accessible pet import requirements for a Caribbean destination.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given between 30 days and 12 months before travel.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis and Parvovirus vaccines must be documented and current.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 15 days of travel.' },
    ],
    documentation: [
      { title: 'Health Certificate', body: 'APHA-endorsed health certificate. A certified Spanish translation is required by Dominican customs.' },
    ],
    tips: [
      { title: 'Tropical disease risk', body: 'Heartworm is endemic in the Dominican Republic. Ensure your dog is on preventative medication before and throughout the trip.' },
      { title: 'Resort policies', body: 'Most all-inclusive resorts do not accept pets. Look for private villa rentals or smaller boutique hotels that have specific pet-friendly policies.' },
      { title: 'Heat', body: 'The Dominican Republic is tropical year-round. Limit dog activity to very early morning and evening, and ensure constant access to shade and fresh water.' },
    ],
  },

  // ── PANAMA ────────────────────────────────────────────────────────────────
  {
    countryId: 'panama',
    intro: 'Panama has clear pet import requirements through MIDA (Ministry of Agricultural Development) and is one of the more dog-friendly Central American countries.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given between 30 days and 12 months before arrival.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis and Parvovirus vaccines must be documented and current.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 15 days of travel, documented by a vet.' },
    ],
    documentation: [
      { title: 'MIDA Health Certificate', body: 'Official health certificate following MIDA\'s format, endorsed by APHA and translated into Spanish by a certified translator.' },
    ],
    tips: [
      { title: 'Panama City', body: 'Panama City has a growing pet-friendly scene, particularly in the Miraflores and Casco Viejo areas. Many restaurants and parks welcome dogs.' },
      { title: 'Tropical disease risk', body: 'Panama has heartworm, Leishmaniasis and tick-borne diseases. Comprehensive preventatives are essential.' },
      { title: 'Canal Zone and national parks', body: 'Dogs are restricted from many of Panama\'s protected natural areas including national parks. Plan wildlife activities around this.' },
    ],
  },

  // ── ECUADOR ───────────────────────────────────────────────────────────────
  {
    countryId: 'ecuador',
    intro: 'Ecuador has straightforward pet import requirements through AGROCALIDAD. Quito and Cuenca are particularly dog-friendly cities.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given between 30 days and 12 months before travel.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis and Parvovirus vaccines must be documented and current.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 10 days of travel.' },
    ],
    documentation: [
      { title: 'AGROCALIDAD Health Certificate', body: 'Official health certificate following AGROCALIDAD\'s format, endorsed by APHA. A certified Spanish translation is required.' },
    ],
    tips: [
      { title: 'Altitude in Quito', body: 'Quito sits at 2,850 metres. Allow your dog several days to acclimatise and watch for signs of altitude sickness — lethargy, loss of appetite and laboured breathing.' },
      { title: 'Galápagos restriction', body: 'Dogs and other non-native animals are strictly prohibited from the Galápagos Islands to protect the unique ecosystem.' },
      { title: 'Tropical disease risk in lowlands', body: 'The Amazon basin and coastal lowlands have significant heartworm and Leishmaniasis risk. Use comprehensive preventatives year-round.' },
    ],
  },

  // ── BOLIVIA ───────────────────────────────────────────────────────────────
  {
    countryId: 'bolivia',
    intro: 'Bolivia has manageable import requirements through SENASAG. Its extreme altitude is the primary consideration for travelling with dogs.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given between 30 days and 12 months before arrival.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis and Parvovirus vaccines must be documented and current.' },
      { title: 'Parasite Treatments', body: 'Vet-administered parasite treatments required within 14 days of travel.' },
    ],
    documentation: [
      { title: 'SENASAG Health Certificate', body: 'Official health certificate following SENASAG\'s format, endorsed by APHA and translated into Spanish.' },
    ],
    tips: [
      { title: 'Extreme altitude', body: 'La Paz sits at 3,650 metres and El Alto at 4,150 metres — among the highest cities in the world. Dogs need very careful, slow acclimatisation. Consult your vet before travelling with brachycephalic breeds.' },
      { title: 'Salar de Uyuni', body: 'The salt flats are accessible with a dog but the harsh environment — extreme UV, salt and temperature swings — requires protective gear for paws and careful hydration management.' },
      { title: 'Tropical disease in lowlands', body: 'Bolivia\'s Amazon and Chaco regions have heartworm, Leishmaniasis and tick-borne diseases. Use comprehensive preventatives if venturing to lower altitudes.' },
    ],
  },

  // ── URUGUAY ───────────────────────────────────────────────────────────────
  {
    countryId: 'uruguay',
    intro: 'Uruguay is one of South America\'s most dog-friendly and progressive countries. MGAP manages pet import requirements.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given between 30 days and 12 months before travel.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis, Parvovirus and Leptospirosis vaccines must be documented and current.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 10 days of travel.' },
    ],
    documentation: [
      { title: 'MGAP Health Certificate', body: 'Official health certificate following MGAP\'s format, endorsed by APHA and translated into Spanish.' },
    ],
    tips: [
      { title: 'Montevideo is very dog-friendly', body: 'Uruguay\'s capital has a very relaxed attitude to dogs, with off-lead beach areas, dog-friendly restaurants and widespread acceptance in public spaces.' },
      { title: 'Punta del Este', body: 'Uruguay\'s famous beach resort is welcoming to dogs outside the peak summer season (December–February). Many beach rentals specifically cater to pet owners.' },
      { title: 'Relatively low disease risk', body: 'Uruguay has lower tropical disease risk than most of South America, though heartworm and tick-borne diseases are still present. Use standard preventatives.' },
    ],
  },

  // ── PAPUA NEW GUINEA ──────────────────────────────────────────────────────
  {
    countryId: 'papua-ng',
    intro: 'Papua New Guinea has strict biosecurity rules to protect its unique ecosystem. Bringing a dog here is extremely complex and generally not recommended.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination & RNAT Test', body: 'Full rabies vaccination course plus a blood antibody test from an approved laboratory. Results must be received well before travel.' },
      { title: 'Quarantine', body: 'Dogs are subject to mandatory quarantine on arrival. Duration varies but is typically 30 days at the owner\'s expense.' },
      { title: 'Import Permit', body: 'An import permit from PNG\'s National Agriculture Quarantine and Inspection Authority (NAQIA) is required before any travel is arranged.' },
    ],
    documentation: [
      { title: 'NAQIA Import Permit', body: 'Apply months in advance. The permit specifies the approved entry port and quarantine conditions.' },
      { title: 'APHA Health Certificate', body: 'Official health certificate endorsed by APHA following PNG\'s specific format.' },
    ],
    tips: [
      { title: 'Not suitable for holidays', body: 'The quarantine period, cost and logistical complexity make bringing a dog to PNG impractical for anything but long-term relocation.' },
      { title: 'Tropical disease risk is very high', body: 'PNG has some of the highest tropical disease burdens in the Pacific. Comprehensive preventative treatment and regular vet checks are essential.' },
      { title: 'Use a specialist service', body: 'A professional pet relocation service with PNG experience is strongly recommended. Documentation errors lead to significant quarantine extensions.' },
    ],
  },

  // ── NIGERIA ───────────────────────────────────────────────────────────────
  {
    countryId: 'nigeria',
    intro: 'Nigeria has specific import requirements managed through the Federal Department of Livestock and Animal Husbandry. Lagos and Abuja have growing expatriate pet communities.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given at least 30 days before arrival.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis, Parvovirus and Leptospirosis vaccines must be documented and current.' },
      { title: 'Parasite Treatments', body: 'Comprehensive parasite treatments required within 14 days of travel, documented by a vet.' },
    ],
    documentation: [
      { title: 'FDLAH Import Permit', body: 'Apply to Nigeria\'s Federal Department of Livestock and Animal Husbandry well in advance. Processing can be slow — allow 6–8 weeks.' },
      { title: 'APHA Health Certificate', body: 'Official health certificate endorsed by APHA following Nigeria\'s required format.' },
    ],
    tips: [
      { title: 'Tropical disease risk is very high', body: 'Nigeria has heartworm, Babesiosis, Ehrlichia, Leishmaniasis and tick-borne diseases. A comprehensive preventative treatment plan is essential before and during your stay.' },
      { title: 'Lagos and Abuja expat areas', body: 'The Lekki/Victoria Island area in Lagos and Maitama in Abuja have veterinary clinics experienced with imported pets and some pet-friendly venues.' },
      { title: 'Mainly for relocation', body: 'Given the disease risks, infrastructure challenges and import complexity, bringing a dog to Nigeria is best suited to long-term expatriate assignments rather than holidays.' },
    ],
  },

  // ── ETHIOPIA ──────────────────────────────────────────────────────────────
  {
    countryId: 'ethiopia',
    intro: 'Ethiopia has specific import requirements through the Ministry of Agriculture. Addis Ababa has a small but established expat pet community.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given at least 30 days before arrival.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis and Parvovirus vaccines must be documented and current.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 14 days of travel.' },
    ],
    documentation: [
      { title: 'Ministry of Agriculture Import Permit', body: 'Apply at least 4–6 weeks before travel. The permit is issued for specific entry dates and the approved port of entry (Addis Ababa Bole International Airport).' },
      { title: 'APHA Health Certificate', body: 'Official health certificate endorsed by APHA following Ethiopia\'s required format.' },
    ],
    tips: [
      { title: 'Altitude in Addis Ababa', body: 'Addis Ababa sits at 2,355 metres. Allow a couple of days for your dog to acclimatise before strenuous activity.' },
      { title: 'Disease risk is high', body: 'Ethiopia has significant risk of tick-borne diseases, Ehrlichia and Babesiosis. Rabies is also present in the stray dog population. Use comprehensive preventatives.' },
      { title: 'Mainly for relocation', body: 'Ethiopia is best suited for long-term expatriate stays. Infrastructure for pet care outside Addis Ababa is very limited.' },
    ],
  },

  // ── UGANDA ────────────────────────────────────────────────────────────────
  {
    countryId: 'uganda',
    intro: 'Uganda has specific pet import requirements. The Pearl of Africa offers incredible nature, but the disease environment for dogs is challenging.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given at least 30 days before arrival.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis, Parvovirus and Leptospirosis vaccines must be documented and current.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 14 days of travel.' },
    ],
    documentation: [
      { title: 'Ministry of Agriculture Import Permit', body: 'Apply to Uganda\'s Ministry of Agriculture, Animal Industry and Fisheries at least 4–6 weeks before travel.' },
      { title: 'APHA Health Certificate', body: 'Official health certificate endorsed by APHA.' },
    ],
    tips: [
      { title: 'National parks restrict dogs', body: 'Dogs are not permitted in any of Uganda\'s national parks or wildlife reserves, including Bwindi (gorilla trekking) and Queen Elizabeth NP.' },
      { title: 'Disease risk is high', body: 'Uganda has heartworm, Babesiosis, Ehrlichia, tick-borne diseases and Trypanosomiasis (sleeping sickness) risk. Comprehensive preventatives are essential.' },
      { title: 'Kampala expat areas', body: 'Kampala\'s Kololo, Nakasero and Muyenga neighbourhoods have the most established veterinary services and pet-friendly infrastructure.' },
    ],
  },

  // ── NAMIBIA ───────────────────────────────────────────────────────────────
  {
    countryId: 'namibia',
    intro: 'Namibia has clear import requirements and is one of Africa\'s more accessible destinations for dog owners, with stunning desert landscapes.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given at least 30 days before arrival.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis, Parvovirus and Bordetella vaccines must be current.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 10 days of travel.' },
    ],
    documentation: [
      { title: 'Veterinary Import Permit', body: 'Apply to Namibia\'s Directorate of Veterinary Services at least 4 weeks before travel.' },
      { title: 'APHA Health Certificate', body: 'Official health certificate endorsed by APHA following Namibia\'s format.' },
    ],
    tips: [
      { title: 'Etosha and national parks', body: 'Dogs are not permitted inside Etosha National Park or most wildlife conservancies. Plan all wildlife viewing around this restriction.' },
      { title: 'Desert heat', body: 'Namibia\'s Namib Desert can exceed 45°C. This is extremely dangerous for dogs. Restrict all outdoor activity to early morning and after sunset in desert areas.' },
      { title: 'Tick-borne disease', body: 'Namibia has significant tick-borne disease risk including Babesiosis. Use a high-strength tick preventative and check your dog after every outdoor excursion.' },
    ],
  },

  // ── SENEGAL ───────────────────────────────────────────────────────────────
  {
    countryId: 'senegal',
    intro: 'Senegal has specific import requirements managed through the Direction des Services Vétérinaires. Dakar has a growing expat community with pet infrastructure.',
    requirements: [
      { title: 'Microchip', body: 'ISO-compliant microchip required.' },
      { title: 'Rabies Vaccination', body: 'Valid rabies vaccination required, given at least 30 days before arrival.' },
      { title: 'Core Vaccines', body: 'Distemper, Hepatitis and Parvovirus vaccines must be documented and current.' },
      { title: 'Parasite Treatments', body: 'Treatment against internal and external parasites required within 14 days of travel.' },
    ],
    documentation: [
      { title: 'DSV Import Permit', body: 'Apply to Senegal\'s Direction des Services Vétérinaires at least 4 weeks before travel. Documentation should be in French.' },
      { title: 'APHA Health Certificate', body: 'Official health certificate endorsed by APHA. A certified French translation is required.' },
    ],
    tips: [
      { title: 'Cultural attitudes', body: 'Senegal has a predominantly Muslim population. Dogs may be viewed negatively in traditional areas. Be respectful and keep your dog contained, particularly near mosques.' },
      { title: 'Tropical disease risk', body: 'Senegal has heartworm, Ehrlichia, tick-borne diseases and Leishmaniasis. Comprehensive preventatives are essential before and during your stay.' },
      { title: 'Dakar', body: 'The Plateau and Almadies areas of Dakar are the most dog-friendly parts of the city, with veterinary clinics experienced with expatriate pets.' },
    ],
  },
]

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