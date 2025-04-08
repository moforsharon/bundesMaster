import "server-only"
import type { Locale } from "@/i18n-config"

// Define the dictionary structure
// Update the Dictionary type to include all new strings
export type Dictionary = {
  common: {
    languageName: string
    changeLanguage: string
  }
  home: {
    title: string
    description: string
    startGame: string
    practiceGenders: string
  }
  challenge: {
    title: string
    preTest: string
    challenge: string
    prizes: string
    welcome: string
    passedPreTest: string
    testDescription: string
    practiceWhileWaiting: string
    passPreTest: string
    eligible: string
    startPreTest: string
    practiceNow: string
    loading: string
    somethingWrong: string
    tryAgain: string
    timeRemaining: string
    challengeEnded: string
    challengeCompleted: string
    calculatingResults: string
    yourScore: string
    yourPosition: string
    challengeHasEnded: string
  }
  game: {
    whatIsGender: string
    hint: string
    nextWord: string
    correct: string
    wrong: string
    tryAgain: string
    levelComplete: string
    levelFailed: string
    greatJob: string
    levelFailedDetails: string
    claimGift: string
    nextLevel: string
    progress: string
    words: string
    correctAnswers: string
    login: string
    challengeEnded: string
    thankYou: string
    nextChallenge: string
    userRegistration: {
      claimGiftTitle: string
      claimGiftDescription: string
      welcomeBackTitle: string
      welcomeBackDescription: string
      name: string
      email: string
      phone: string
      processing: string
      getGift: string
      continueLearning: string
      personalizationNote: string
      welcomeBackNote: string
    }
    correctAnswerIs: string
    wrongAnswer: string
    startChallenge: string
    noActiveChallenge: string
  }
  admin: {
    challengeAdmin: string
    challengeList: string
    createChallenge: string
    editChallenge: string
    allChallenges: string
    refresh: string
    noChallenges: string
    edit: string
    delete: string
    createNew: string
    fillOutForm: string
    title: string
    description: string
    startDate: string
    endDate: string
    pickDate: string
    rules: string
    prizeDescription: string
    updateChallenge: string
    saveChanges: string
  }
  errors: {
    nameRequired: string
    nameMinLength: string
    emailRequired: string
    emailInvalid: string
    phoneRequired: string
    phoneInvalid: string
    phoneCameroon: string
    genericError: string
    registrationFailed: string
    loginFailed: string
    downloadFailed: string
    progressLoadFailed: string
    progressSaveFailed: string
    aiCommunicationError: string
    noInternet: string
    userIdNotStored: string
  }
  form: {
    placeholders: {
      name: string
      email: string
      phone: string
    }
  }
  login: {
    joinChallenge: string
    welcomeBack: string
    registerDescription: string
    loginDescription: string
    alreadyAccount: string
    clickToLogin: string
  }
}

// Define dictionaries for each locale
// const dictionaries = {
//   en: () => import("@/dictionaries/en.json").then((module) => module.default as Dictionary),
//   fr: () => import("@/dictionaries/fr.json").then((module) => module.default as Dictionary),
// }

// export const getDictionary = async (locale: Locale) => dictionaries[locale]()

const dictionaries = {
  en: () => import("@/dictionaries/en.json").then((module) => module.default),
  fr: () => import("@/dictionaries/fr.json").then((module) => module.default),
}

// export const getDictionary = async (locale: Locale) => {
//   // Validate locale exists
//   if (!(locale in dictionaries)) {
//     throw new Error(`Locale ${locale} not found in dictionaries`)
//   }

//   try {
//     const dictionary = await dictionaries[locale]()
//     return dictionary
//   } catch (error) {
//     console.error(`Failed to load dictionary for locale ${locale}:`, error)
//     throw new Error(`Failed to load dictionary for locale ${locale}`)
//   }
// }

export const getDictionary = async (locale: Locale) => {
  // Validate locale is a valid locale string before proceeding
  if (!locale || typeof locale !== "string") {
    console.error(`Invalid locale provided: ${locale}`)
    // Fallback to default locale
    locale = "en" as Locale
  }

  // Validate locale exists in dictionaries
  if (!(locale in dictionaries)) {
    console.error(`Locale ${locale} not found in dictionaries, falling back to en`)
    locale = "en" as Locale
  }

  try {
    const dictionary = await dictionaries[locale]()
    return dictionary
  } catch (error) {
    console.error(`Failed to load dictionary for locale ${locale}:`, error)
    // Fallback to English dictionary instead of throwing
    if (locale !== "en") {
      return dictionaries["en"]()
    }
    throw new Error(`Failed to load dictionary for locale ${locale}`)
  }
}
