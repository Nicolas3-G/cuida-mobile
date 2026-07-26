// English strings — source of truth for all UI text.
// Keys are grouped by screen/component. {placeholders} are interpolated via t(key, params).
export const en = {
  common: {
    and: 'and',
  },
  onboarding: {
    welcomeTitle: 'Welcome to Cuida',
    welcomeSubtitle: 'To get started, please select your preferred language.',
    backToLanguage: 'Back to Language',
    setLocationTitle: 'Set Your Location',
    setLocationSubtitle: 'Cuida relies on your location to provide relevant alerts and resources. (US Only)',
    earlyAccessHintPrefix: 'During early access, city-level alerts are available in {count} cities: ',
    earlyAccessHintSuffix: '. Everywhere else gets state-level coverage.',
    usStateLabel: 'US State',
    statePlaceholder: 'Type your state (e.g. California)',
    useMyLocation: 'Use my location',
    selectStateHint: 'Select a US state from the list to continue.',
    yourSelection: 'Your selection',
    stateLevelAlertsChip: '{state} — state-level alerts',
    noCityCoverage: 'No city-level coverage in {state} yet.',
    cityOptions: 'City options',
    cityInfoText: 'We currently only support these cities. If you prefer state-wide data, you can choose "State level only" instead.',
    stateLevelOnly: 'State level only',
    finishSetup: 'Finish Setup',
    locationPermissionTitle: 'Location permission required',
    locationPermissionBody: 'Please enable location access to use this feature.',
    locationDetectFailTitle: 'Unable to detect location',
    locationDetectFailBody: 'Please try again or enter your state manually.',
    stateDetectFailTitle: 'Unable to detect state',
    stateDetectFailBody: 'We could not match your state. Please enter it manually.',
    locationErrorTitle: 'Error',
    locationErrorBody: 'Something went wrong while detecting your location.',
  },
  home: {
    yourArea: 'your area',
    activityNearYou: 'Activity near you',
    categoryLocal: 'Local Coverage',
    categoryStatewide: 'Statewide coverage',
    categoryNational: 'National Update',
    sourceLocal: 'Local Source',
    sourceStatewide: 'Statewide source',
    sourceNationwide: 'Nationwide',
    noRecentActivity: 'No recent activity found — check back later.',
    eventNearYou: 'Event near you',
    more: 'More',
    showLess: 'Show less',
    summaryFor: 'Summary for {location}',
    live: 'LIVE',
    enforcementExpected: 'Increased enforcement expected soon in {location}',
    enforcementTargeting: 'Increased enforcement targeting {location}',
    noRecentAlerts: 'No recent alerts for {location}.',
    nearYouBadge: 'Near you',
    inYourStateBadge: 'In your state',
    moreArrow: 'More ›',
    organizations: 'Organizations',
    eventsNearYou: 'Events Near You',
    eventsSubtitle: 'Protests & events happening near you',
    eventsEmpty: 'No upcoming events found for your area. Check back soon.',
    eventsStatePrompt: 'Choose a city to see the latest events near you.',
    knowYourRightsTitle: 'Know Your Rights',
    knowYourRightsSubtitle: 'Tap here to learn what to do when confronted by immigration officials.',
    volunteerTitle: 'Volunteer',
    volunteerSubtitle: 'Find organizations that need help or join our list to be contacted!',
  },
  orgs: {
    nationwide: 'Nationwide',
    acluDesc: 'Defends civil liberties and fights immigration rights abuses in court.',
    nilcDesc: 'National Immigration Law Center — policy & legal defense for immigrants.',
    unidosDesc: "The nation's largest Latino civil rights & advocacy organization.",
    ilrcDesc: 'Immigrant Legal Resource Center — legal training & educational materials.',
  },
  articles: {
    relatedArticles: 'Related Articles',
    readFullCoverage: 'Read full coverage',
    noArticles: 'No specific articles found for this snippet.',
  },
  settings: {
    title: 'Settings',
    preferences: 'Preferences',
    language: 'Language',
    location: 'Location',
    notSet: 'Not Set',
    usStateLabel: 'US State',
    statePlaceholder: 'Type your state (e.g. California)',
    useMyLocation: 'Use my location',
    selectStateHint: 'Select a US state from the list to save.',
    earlyAccessHintPrefix: 'During early access, city-level alerts are available in {count} cities: ',
    earlyAccessHintSuffix: '. Everywhere else gets state-level coverage.',
    yourSelection: 'Your selection',
    stateLevelAlertsChip: '{state} — state-level alerts',
    noCityCoverage: 'No city-level coverage in {state} yet.',
    cityOptions: 'City options',
    cityInfoText: 'We currently only support these cities. If you prefer state-wide data, you can choose "State level only" instead.',
    stateLevelOnly: 'State level only',
    update: 'Update',
    vibration: 'Vibrations',
    on: 'ON',
    off: 'OFF',
    refreshData: 'Refresh data',
    resetOnboarding: 'Reset onboarding',
    sendFeedback: 'Send feedback',
    supportText: 'Cuida is a free platform built by a solo immigrant developer. Your support helps keep it running.',
    supportButton: 'Support the project',
    version: 'Cuida App Version {version}',
    devModeTitle: 'Dev mode',
    devModeEnabled: 'Dev mode enabled',
    devModeDisabled: 'Dev mode disabled',
    linkErrorTitle: 'Unable to open link',
    linkErrorBody: 'Please try again later.',
  },
  volunteer: {
    headerTitle: 'Volunteer Network',
    joinTitle: 'Join the Network',
    joinSubtitle: "Sign up to be part of the Cuida Volunteer Network. We'll match you with organizations in your area that need help.",
    alreadyTitle: "You're already in the network!",
    alreadyBody: 'You’ve already signed up, but you can sign up again if you want to update your info or add someone else :)',
    fullName: 'Full Name',
    namePlaceholder: 'Enter your name',
    phoneNumber: 'Phone Number',
    phonePlaceholder: '(555) 000-0000',
    phoneInvalid: 'The phone number is not valid.',
    zipCode: 'Zip Code (Optional)',
    zipPlaceholder: 'e.g. 10001',
    signMeUp: 'Sign Me Up',
    signUpAnyway: 'Sign up anyway',
    or: 'OR',
    nearbyTitle: 'Places near you that need volunteers',
    nearbyEmpty: "We couldn’t find any organizations near you that are actively looking for volunteers right now. Check back soon! We're always updating this list!",
    learnMore: 'Learn more',
    successTitle: "You're in the Network!",
    successBody: "Thank you for stepping up. You're now part of the Cuida Volunteer Network, and organizations in your area will be able to reach out to you when help is needed. Want to start right away? Check out the places near you that need volunteers on the signup page.",
    backToHome: 'Back to Home',
  },
  feedback: {
    title: 'Send feedback',
    intro: 'Cuida is still in its early days. Share ideas, bugs, or anything that would make it more useful for you and your community.',
    typeLabel: 'Type of feedback',
    typeIdea: 'Idea',
    typeBug: 'Bug',
    typeOther: 'Other',
    ratingLabel: 'Rate your experience (optional)',
    subjectLabel: 'Subject (optional)',
    subjectPlaceholder: 'Short summary (e.g. “Bug in volunteer signup”)',
    messageLabel: 'What’s going on?',
    messagePlaceholder: 'Tell me what happened, what you were trying to do, or what you’d love Cuida to do.',
    submit: 'Send feedback',
    sending: 'Sending…',
    successTitle: 'Thank you!',
    successBody: 'Your feedback was sent.',
    ok: 'OK',
    errorTitle: 'Could not send feedback',
    errorBody: 'Please try again in a moment.',
  },
  kyr: {
    step: 'Step {current} of {total}',
    back: '← Back',
    next: 'Next →',
    done: 'Done ✓',
    website: 'Website',
  },
};

export type TranslationTree = typeof en;

// Know Your Rights slide content (icons/colors/ids stay in the component and
// are merged by index). Safety-critical legal rights content — translations
// must preserve legal meaning exactly.
export interface KyrResource {
  name: string;
  description: string;
  url: string;
}

export interface KyrSlideContent {
  title: string;
  points: string[];
  subPoints?: string[];
  resources?: KyrResource[];
}

export const kyrSlides: KyrSlideContent[] = [
  {
    title: 'You Have Rights',
    points: [
      'You have constitutional rights regardless of your immigration status.',
      'These rights apply to everyone in the United States, citizen or not.',
      'Knowing your rights before an encounter can protect you and your family.',
    ],
    subPoints: [
      'You have the right to remain silent.',
      'You have the right to an attorney.',
      'You have the right against unreasonable searches and seizures.',
      'You have the right to record interactions with law enforcement.',
    ],
  },
  {
    title: 'Right to Remain Silent',
    points: [
      'You have the right to remain silent. You do not have to answer questions about where you were born or how you entered the US.',
      'Clearly state: "I am exercising my right to remain silent."',
      'Do not lie to officials, silence is safer than a false statement.',
    ],
  },
  {
    title: 'If an Agent Comes to Your Door',
    points: [
      'You do not have to open the door unless they have a signed judicial warrant.',
      'Ask them to slide the warrant under the door or hold it to the window.',
      'An ICE administrative warrant does NOT give them the right to enter your home.',
    ],
  },
  {
    title: 'If You Are Stopped in Public',
    points: [
      'Stay calm. Do not run or resist, even if you believe the stop is unlawful.',
      'You can ask: "Am I free to go?" If yes, calmly walk away.',
      'If detained, clearly say: "I do not consent to a search, and I do not wish to answer any questions."',
    ],
  },
  {
    title: 'If You Are Arrested',
    points: [
      'Say clearly: "I want to speak to a lawyer.", do not answer any questions.',
      'Do not sign any documents without speaking to an attorney first.',
      'You have the right to ask that your consulate be notified.',
      'A consular officer can help you get a lawyer, contact your family, and visit you in detention.',
    ],
  },
  {
    title: 'Protect Your Family',
    points: [
      'Create a family safety plan and make sure everyone knows it.',
      'Designate a trusted person who can care for your children if you are detained.',
      "Keep an emergency contact card with your immigration attorney's phone number.",
      'Share this brief course with your family members.',
    ],
  },
  {
    title: 'Learn more',
    points: [],
    resources: [
      {
        name: 'National Immigration Law Center',
        description: 'Offers guides, policy updates, legal assistance, and “know your rights” resources about immigration law & enforcement.',
        url: 'https://www.nilc.org/',
      },
      {
        name: 'ACLU: Know Your Rights',
        description: 'Comprehensive know your rights information and other resources.',
        url: 'https://www.aclu.org/know-your-rights',
      },
      {
        name: 'Immigrant Legal Resource Center',
        description: 'Provides immigration legal resources, training, and guides to help immigrants, lawyers, and community organizations.',
        url: 'https://www.ilrc.org/',
      },
    ],
  },
];
