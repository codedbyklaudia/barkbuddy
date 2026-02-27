export type TravelDirection = 'from-uk' | 'to-uk';

export type StepId =
  | 'continent'
  | 'country'
  | 'requirements'
  | 'documentation'
  | 'tips'
  | 'download';

export interface Step {
  id: StepId;
  label: string;
}

export interface Continent {
  id: string;
  name: string;
  image: string;
}

export interface Country {
  id: string;
  name: string;
  continentId: string;
  image: string;
}

export interface ContentCard {
  title: string;
  body: string;
}

export interface CountryContent {
  countryId: string;
  intro: string;
  requirements: ContentCard[];
  documentation: ContentCard[];
  tips: ContentCard[];
}

export const STEPS: Step[] = [
  { id: 'continent',     label: 'Choose continent'               },
  { id: 'country',       label: 'Country'                        },
  { id: 'requirements',  label: 'Requirements'                   },
  { id: 'documentation', label: 'Documentation'                  },
  { id: 'tips',          label: 'Useful tips'                    },
  { id: 'download',      label: 'Download your Checklist' },
];

export const CONTINENTS: Continent[] = [
  { id: 'europe',        name: 'Europe',        image: '../../../images/travel/europe.png'        },
  { id: 'north-america', name: 'North America', image: '../../../images/travel/north_america.png' },
  { id: 'asia',          name: 'Asia',          image: '../../../images/travel/asia.png'          },
  { id: 'south-america', name: 'South America', image: '../../../images/travel/south_america.png' },
  { id: 'australia',     name: 'Oceania',       image: '../../../images/travel/australia.png'     },
  { id: 'africa',        name: 'Africa',        image: '../../../images/travel/africa.png'        },
];