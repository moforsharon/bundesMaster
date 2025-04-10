// Predefined word lists with their correct articles and multilingual translations
export type WordItem = {
    word: string
    translations: {
      en: string
      fr: string
    }
    correctArticle: "der" | "die" | "das"
  }
  
  export type WordCategory = {
    name: {
      en: string
      fr: string
    }
    words: WordItem[]
  }
  
  export const wordCategories: WordCategory[] = [
    {
      name: {
        en: "Nature",
        fr: "Nature"
      },
      words: [
        { word: "Baum", translations: { en: "tree", fr: "arbre" }, correctArticle: "der" },
        { word: "Blume", translations: { en: "flower", fr: "fleur" }, correctArticle: "die" },
        { word: "Meer", translations: { en: "sea", fr: "mer" }, correctArticle: "das" },
        { word: "Wald", translations: { en: "forest", fr: "forêt" }, correctArticle: "der" },
        { word: "Sonne", translations: { en: "sun", fr: "soleil" }, correctArticle: "die" },
        { word: "Wasser", translations: { en: "water", fr: "eau" }, correctArticle: "das" },
        { word: "Berg", translations: { en: "mountain", fr: "montagne" }, correctArticle: "der" },
        { word: "Wiese", translations: { en: "meadow", fr: "prairie" }, correctArticle: "die" },
        { word: "Tal", translations: { en: "valley", fr: "vallée" }, correctArticle: "das" },
        { word: "Fluss", translations: { en: "river", fr: "rivière" }, correctArticle: "der" },
        { word: "Wolke", translations: { en: "cloud", fr: "nuage" }, correctArticle: "die" },
        { word: "Feuer", translations: { en: "fire", fr: "feu" }, correctArticle: "das" },
        { word: "Wind", translations: { en: "wind", fr: "vent" }, correctArticle: "der" },
        { word: "Erde", translations: { en: "earth", fr: "terre" }, correctArticle: "die" },
        { word: "Blatt", translations: { en: "leaf", fr: "feuille" }, correctArticle: "das" },
        // { word: "Himmel", translations: { en: "sky", fr: "ciel" }, correctArticle: "der" },
        // { word: "Pflanze", translations: { en: "plant", fr: "plante" }, correctArticle: "die" },
        // { word: "Gras", translations: { en: "grass", fr: "herbe" }, correctArticle: "das" },
        // { word: "Stern", translations: { en: "star", fr: "étoile" }, correctArticle: "der" },
        // { word: "Natur", translations: { en: "nature", fr: "nature" }, correctArticle: "die" },
      ],
    },
    {
      name: {
        en: "Career",
        fr: "Carrière"
      },
      words: [
        { word: "Beruf", translations: { en: "profession", fr: "profession" }, correctArticle: "der" },
        { word: "Arbeit", translations: { en: "work", fr: "travail" }, correctArticle: "die" },
        { word: "Büro", translations: { en: "office", fr: "bureau" }, correctArticle: "das" },
        { word: "Chef", translations: { en: "boss", fr: "patron" }, correctArticle: "der" },
        { word: "Karriere", translations: { en: "career", fr: "carrière" }, correctArticle: "die" },
        { word: "Gehalt", translations: { en: "salary", fr: "salaire" }, correctArticle: "das" },
        { word: "Kollege", translations: { en: "colleague", fr: "collègue" }, correctArticle: "der" },
        { word: "Firma", translations: { en: "company", fr: "entreprise" }, correctArticle: "die" },
        { word: "Team", translations: { en: "team", fr: "équipe" }, correctArticle: "das" },
        { word: "Vertrag", translations: { en: "contract", fr: "contrat" }, correctArticle: "der" },
        { word: "Position", translations: { en: "position", fr: "poste" }, correctArticle: "die" },
        { word: "Projekt", translations: { en: "project", fr: "projet" }, correctArticle: "das" },
        { word: "Termin", translations: { en: "appointment", fr: "rendez-vous" }, correctArticle: "der" },
        { word: "Bewerbung", translations: { en: "application", fr: "candidature" }, correctArticle: "die" },
        { word: "Interview", translations: { en: "interview", fr: "entretien" }, correctArticle: "das" },
        // { word: "Erfolg", translations: { en: "success", fr: "succès" }, correctArticle: "der" },
        // { word: "Erfahrung", translations: { en: "experience", fr: "expérience" }, correctArticle: "die" },
        // { word: "Zeugnis", translations: { en: "certificate", fr: "certificat" }, correctArticle: "das" },
        // { word: "Lebenslauf", translations: { en: "resume", fr: "CV" }, correctArticle: "der" },
        // { word: "Ausbildung", translations: { en: "education", fr: "formation" }, correctArticle: "die" },
      ],
    },
    {
      name: {
        en: "Health",
        fr: "Santé"
      },
      words: [
        { word: "Arzt", translations: { en: "doctor", fr: "médecin" }, correctArticle: "der" },
        { word: "Gesundheit", translations: { en: "health", fr: "santé" }, correctArticle: "die" },
        { word: "Krankenhaus", translations: { en: "hospital", fr: "hôpital" }, correctArticle: "das" },
        { word: "Körper", translations: { en: "body", fr: "corps" }, correctArticle: "der" },
        { word: "Medizin", translations: { en: "medicine", fr: "médecine" }, correctArticle: "die" },
        { word: "Herz", translations: { en: "heart", fr: "cœur" }, correctArticle: "das" },
        { word: "Patient", translations: { en: "patient", fr: "patient" }, correctArticle: "der" },
        { word: "Krankheit", translations: { en: "illness", fr: "maladie" }, correctArticle: "die" },
        { word: "Blut", translations: { en: "blood", fr: "sang" }, correctArticle: "das" },
        { word: "Kopf", translations: { en: "head", fr: "tête" }, correctArticle: "der" },
        { word: "Apotheke", translations: { en: "pharmacy", fr: "pharmacie" }, correctArticle: "die" },
        { word: "Medikament", translations: { en: "medication", fr: "médicament" }, correctArticle: "das" },
        { word: "Schmerz", translations: { en: "pain", fr: "douleur" }, correctArticle: "der" },
        { word: "Therapie", translations: { en: "therapy", fr: "thérapie" }, correctArticle: "die" },
        { word: "Fieber", translations: { en: "fever", fr: "fièvre" }, correctArticle: "das" },
        // { word: "Muskel", translations: { en: "muscle", fr: "muscle" }, correctArticle: "der" },
        // { word: "Ernährung", translations: { en: "nutrition", fr: "nutrition" }, correctArticle: "die" },
        // { word: "Gehirn", translations: { en: "brain", fr: "cerveau" }, correctArticle: "das" },
        // { word: "Sport", translations: { en: "sports", fr: "sport" }, correctArticle: "der" },
        // { word: "Diät", translations: { en: "diet", fr: "régime" }, correctArticle: "die" },
      ],
    },
  ]
  
  // Utility function to shuffle an array
  export function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }
  