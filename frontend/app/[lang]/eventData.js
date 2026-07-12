// English labels for the (French) category values that come from the City of
// Montréal open data. Titles, descriptions, and borough names are handled
// elsewhere; these are the small fixed vocabularies used by the filters.
//
// tField() returns the English label in English mode, and always falls back to
// the original French value if a value isn't mapped — so a new/unmapped value
// can never render blank.
const EVENT_VALUE_EN = {
  type_evenement: {
    "Art de la parole": "Spoken word",
    "Art et artisanat": "Arts & crafts",
    "Cinéma": "Cinema",
    "Cirque": "Circus",
    "Club de lecture et littérature": "Book club & literature",
    "Cuisine": "Cooking",
    "Danse": "Dance",
    "Exposition": "Exhibition",
    "Fête et marché": "Festivals and markets",
    "Heure du conte": "Storytime",
    "Humour": "Comedy",
    "Jardinage": "Gardening",
    "Jeux": "Games",
    "Musique": "Music",
    "Science et techno": "Science & tech",
    "Sport et plein air": "Sports & outdoors",
    "Théâtre": "Theatre",
  },
  public_cible: {
    "Adolescents": "Teens",
    "Adultes": "Adults",
    "Enfants": "Children",
    "Enfants d'âge préscolaire": "Preschoolers",
    "Famille": "Family",
    "Personnes aînées": "Seniors",
    "Pour tous": "All ages",
  },
  cout: {
    "Gratuit": "Free",
    "Payant": "Paid",
  },
  inscription: {
    "Avec billet": "With ticket",
    "Entrée libre": "Free entry",
    "Sur inscription": "Registration required",
  },
  emplacement: {
    "En salle": "Indoors",
    "À l'extérieur": "Outdoors",
  },
};

// Translate a single category value for display. French mode (and any unmapped
// value) returns the value unchanged.
export function tField(field, value, lang) {
  if (lang !== "en" || value == null) return value;
  return EVENT_VALUE_EN[field]?.[value] ?? value;
}

// Description in the active language: English when available, else French.
export function eventDescription(event, lang) {
  if (lang === "en") return event.description_en || event.description;
  return event.description;
}
