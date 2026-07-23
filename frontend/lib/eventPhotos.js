// Thumbnail photo per event category (raw French `type_evenement` value), used
// on the event-list cards. Shared so the home and saved pages show the same
// images. Falls back to a generic photo for unmapped types.
export const EVENT_PHOTOS = {
  "Musique":                        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&q=80",
  "Initiation à la musique":        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=120&q=80",
  "Art et artisanat":               "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=120&q=80",
  "Art de la parole":               "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=120&q=80",
  "Cinéma":                         "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=120&q=80",
  "Cirque":                         "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=120&q=80",
  "Danse":                          "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=120&q=80",
  "Théâtre":                        "https://images.unsplash.com/photo-1503095396549-807759245b35?w=120&q=80",
  "Humour":                         "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=120&q=80",
  "Exposition":                     "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=120&q=80",
  "Sport et plein air":             "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=120&q=80",
  "Jardinage":                      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=120&q=80",
  "Cuisine":                        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=120&q=80",
  "Bien-être":                      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=120&q=80",
  "Jeux":                           "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=120&q=80",
  "Heure du conte":                 "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=120&q=80",
  "Club de lecture et littérature": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=120&q=80",
  "Langues":                        "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&q=80",
  "Informatique":                   "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=120&q=80",
  "Science et techno":              "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=120&q=80",
  "Société et histoire":            "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=120&q=80",
  "Soutien et échange":             "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=120&q=80",
  "Fête et marché":                 "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&q=80",
  "default":                        "https://images.unsplash.com/photo-1519098635131-4c8f806d1e82?w=120&q=80",
};

export const getEventPhoto = (type) => EVENT_PHOTOS[type] || EVENT_PHOTOS["default"];
