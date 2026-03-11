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
export const STATE_CITIES: Record<StateCode, string[]> = {
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

