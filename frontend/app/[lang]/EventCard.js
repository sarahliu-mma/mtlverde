import { tField, eventTitle, eventDescription } from "./eventData";

// match badge with dictionary
const BADGE_KEY = {
  "Green Leader": "greenLeader",
  "Eco-Friendly": "ecoFriendly",
  "Getting There": "gettingThere",
};

// A single event card: title, borough, dates, description, category tags, and a
// "read more" link. Rendered on the home list and the saved-events page, so the
// markup lives here to keep the two views identical.
//
// `selected` toggles the map-highlight ring; `onSelect` fires when the card is
// clicked. `saved` / `onToggleSave` drive the heart button (guest bookmarks);
// they're optional so the card still renders anywhere the feature isn't wired.
// No "use client" directive -- this component is only ever rendered inside
// client components, so it inherits their client boundary.
export default function EventCard({ event, lang, dict, selected, onSelect, saved, onToggleSave }) {
  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-xl shadow p-5 hover:shadow-md transition cursor-pointer ${
        selected ? "ring-2 ring-green-500" : ""
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-gray-800">{eventTitle(event, lang)}</h2>
          <p className="text-sm text-gray-500 mt-1">{event.arrondissement}</p>
          <p className="text-sm text-gray-400 mt-1">{event.date_debut} → {event.date_fin}</p>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">{eventDescription(event, lang)}</p>
          {event.url_fiche && (
            <a
              href={event.url_fiche}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-green-700 hover:underline mt-2 inline-block"
            >
              {dict.event.readMore}
            </a>
          )}
        </div>
        <div className="ml-4 mt-1 shrink-0 flex flex-col items-end gap-2">
          <div className="flex gap-2">
            {event.type_evenement && (
              <span className="whitespace-nowrap text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                {tField("type_evenement", event.type_evenement, lang)}
              </span>
            )}
            {event.public_cible && (
              <span className="whitespace-nowrap text-xs font-semibold px-3 py-1 rounded-full bg-pink-100 text-pink-700">
                {tField("public_cible", event.public_cible, lang)}
              </span>
            )}
            <span className={`whitespace-nowrap text-xs font-semibold px-3 py-1 rounded-full ${
              event.cout === "Gratuit"
                ? "bg-blue-100 text-blue-700"
                : "bg-amber-100 text-amber-700"
            }`}>
              {tField("cout", event.cout, lang)}
            </span>
          </div>
          {/* When click the badge, move to Sustainability page */}
          {(event.badge || event.wheelchair_metro_accessible) && (
            <div className="flex gap-2 mt-1">
              {event.badge && (
                <a
                  href={`/${lang}/sustainability`}
                  onClick={(e) => e.stopPropagation()}
                  title={dict.badge?.learnMore ?? "How we score"}
                  className="whitespace-nowrap text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800 hover:bg-green-200 transition"
                >
                  {event.badge_icon} {dict.badge?.[BADGE_KEY[event.badge]] ?? event.badge}
                </a>
              )}
              {event.wheelchair_metro_accessible && (
                <span
                  title={dict.badge?.wheelchairAccessible ?? "Wheelchair-accessible metro nearby"}
                  aria-label={dict.badge?.wheelchairAccessible ?? "Wheelchair-accessible metro nearby"}
                  className="whitespace-nowrap text-xs font-semibold px-3 py-1 rounded-full bg-sky-100 text-sky-800"
                >
                  ♿
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      {onToggleSave && (
        <div className="flex justify-end mt-3">
          <button
            type="button"
            aria-label={saved ? dict.event.unsave : dict.event.save}
            aria-pressed={saved}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            className="text-red-500 hover:text-red-600 transition"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill={saved ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
