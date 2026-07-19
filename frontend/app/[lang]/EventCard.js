import { tField, eventTitle, eventDescription } from "./eventData";

// A single event card: title, borough, dates, description, category tags, and a
// "read more" link. Rendered on the home list and (later) the saved-events page,
// so the markup lives here to keep the two views identical.
//
// `selected` toggles the map-highlight ring; `onSelect` fires when the card is
// clicked. No "use client" directive -- this component is only ever rendered
// inside client components, so it inherits their client boundary.
export default function EventCard({ event, lang, dict, selected, onSelect }) {
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
        <div className="ml-4 mt-1 shrink-0 flex gap-2">
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
      </div>
    </div>
  );
}
