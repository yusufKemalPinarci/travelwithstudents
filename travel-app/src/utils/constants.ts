// Tour Categories - Used across the application
export const TOUR_CATEGORIES = [
  'Walking',
  'Food & Drink',
  'Nightlife',
  'History',
  'Art & Culture',
  'Nature',
  'Photography',
  'Shopping',
  'Museums',
  'Architecture'
] as const;

// Languages
export const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Turkish',
  'Dutch',
  'Chinese',
  'Japanese',
  'Korean',
  'Russian',
  'Arabic'
] as const;

// Tour Duration Options (in hours)
export const DURATION_OPTIONS = [
  { value: 1, label: '1 hour' },
  { value: 2, label: '2 hours' },
  { value: 3, label: '3 hours' },
  { value: 4, label: '4 hours' },
  { value: 6, label: '6 hours' },
  { value: 8, label: '8 hours (Full day)' }
] as const;

// Currency Options
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' }
] as const;

// Countries and Cities - Used for location filters and profile setup
export const COUNTRIES = [
  'Turkey',
  'Spain', 
  'Italy',
  'France',
  'Germany',
  'United Kingdom',
  'United States'
] as const;

export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'Turkey': ['Istanbul', 'Ankara', 'Izmir', 'Antalya'],
  'Spain': ['Barcelona', 'Madrid', 'Valencia', 'Seville'],
  'Italy': ['Rome', 'Milan', 'Florence', 'Venice'],
  'France': ['Paris', 'Lyon', 'Marseille', 'Nice'],
  'Germany': ['Berlin', 'Munich', 'Hamburg', 'Frankfurt'],
  'United Kingdom': ['London', 'Manchester', 'Edinburgh', 'Liverpool'],
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Boston']
};

// All cities flat list
export const ALL_CITIES = Object.values(CITIES_BY_COUNTRY).flat();

export type TourCategory = typeof TOUR_CATEGORIES[number];
export type Language = typeof LANGUAGES[number];
