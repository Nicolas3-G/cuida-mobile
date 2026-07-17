export type StateCode =
  | 'AL'
  | 'AK'
  | 'AZ'
  | 'AR'
  | 'CA'
  | 'CO'
  | 'CT'
  | 'DE'
  | 'FL'
  | 'GA'
  | 'HI'
  | 'ID'
  | 'IL'
  | 'IN'
  | 'IA'
  | 'KS'
  | 'KY'
  | 'LA'
  | 'ME'
  | 'MD'
  | 'MA'
  | 'MI'
  | 'MN'
  | 'MS'
  | 'MO'
  | 'MT'
  | 'NE'
  | 'NV'
  | 'NH'
  | 'NJ'
  | 'NM'
  | 'NY'
  | 'NC'
  | 'ND'
  | 'OH'
  | 'OK'
  | 'OR'
  | 'PA'
  | 'RI'
  | 'SC'
  | 'SD'
  | 'TN'
  | 'TX'
  | 'UT'
  | 'VT'
  | 'VA'
  | 'WA'
  | 'WV'
  | 'WI'
  | 'WY';

// Hardcoded list of available cities per state.
// For now this is just the state capital for each state,
// except California which also includes Los Angeles and San Francisco.
export const ALL_STATE_CITIES: Record<StateCode, string[]> = {
  AL: ['Montgomery'],
  AK: ['Juneau'],
  AZ: ['Phoenix'],
  AR: ['Little Rock'],
  CA: ['Sacramento', 'Los Angeles', 'San Francisco'],
  CO: ['Denver'],
  CT: ['Hartford'],
  DE: ['Dover'],
  FL: ['Tallahassee'],
  GA: ['Atlanta'],
  HI: ['Honolulu'],
  ID: ['Boise'],
  IL: ['Springfield'],
  IN: ['Indianapolis'],
  IA: ['Des Moines'],
  KS: ['Topeka'],
  KY: ['Frankfort'],
  LA: ['Baton Rouge'],
  ME: ['Augusta'],
  MD: ['Annapolis'],
  MA: ['Boston'],
  MI: ['Lansing'],
  MN: ['Saint Paul'],
  MS: ['Jackson'],
  MO: ['Jefferson City'],
  MT: ['Helena'],
  NE: ['Lincoln'],
  NV: ['Carson City'],
  NH: ['Concord'],
  NJ: ['Trenton'],
  NM: ['Santa Fe'],
  NY: ['Albany'],
  NC: ['Raleigh'],
  ND: ['Bismarck'],
  OH: ['Columbus'],
  OK: ['Oklahoma City'],
  OR: ['Salem'],
  PA: ['Harrisburg'],
  RI: ['Providence'],
  SC: ['Columbia'],
  SD: ['Pierre'],
  TN: ['Nashville'],
  TX: ['Austin'],
  UT: ['Salt Lake City'],
  VT: ['Montpelier'],
  VA: ['Richmond'],
  WA: ['Olympia'],
  WV: ['Charleston'],
  WI: ['Madison'],
  WY: ['Cheyenne'],
};

// Alpha release list: only these cities get city-level data (snippets,
// events, organizations). States with an empty array fall back to
// state-level data only.
export const ALPHA_STATE_CITIES: Record<StateCode, string[]> = {
  AL: [],
  AK: [],
  AZ: ['Phoenix'],
  AR: [],
  CA: ['Los Angeles', 'San Francisco'],
  CO: [],
  CT: [],
  DE: [],
  FL: ['Miami'],
  GA: [],
  HI: [],
  ID: [],
  IL: ['Chicago'],
  IN: [],
  IA: [],
  KS: [],
  KY: [],
  LA: [],
  ME: [],
  MD: [],
  MA: [],
  MI: [],
  MN: ['Minneapolis'],
  MS: [],
  MO: [],
  MT: [],
  NE: [],
  NV: [],
  NH: [],
  NJ: [],
  NM: [],
  NY: [],
  NC: [],
  ND: [],
  OH: [],
  OK: [],
  OR: [],
  PA: [],
  RI: [],
  SC: [],
  SD: [],
  TN: [],
  TX: ['Houston'],
  UT: [],
  VT: [],
  VA: [],
  WA: [],
  WV: [],
  WI: [],
  WY: [],
};

// The active list used across the app (onboarding + settings pickers).
// Switch between ALPHA_STATE_CITIES and ALL_STATE_CITIES here.
export const STATE_CITIES = ALPHA_STATE_CITIES;

// True while the alpha list is active. Drives alpha-only UI hints
// (e.g. the supported-cities notice on the location pickers).
export const IS_ALPHA_RELEASE = STATE_CITIES === ALPHA_STATE_CITIES;

// Flat list of every supported city in the active list.
export const SUPPORTED_CITIES: string[] = Object.values(STATE_CITIES).flat();

