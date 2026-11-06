import { getNoteImage, getNoteName, type NoteSlug } from "@/config/notes";

export default function ProductNotes({ notes }: { notes: NoteSlug[] }) {
  if (notes.length === 0) return null;

  return (
    <section aria-labelledby="notes-heading" className="mt-8">
      <h2
        id="notes-heading"
        className="flex items-center gap-3 text-sm text-ink/70"
      >
        <span aria-hidden="true" className="h-px w-4 bg-ink/40" />
        Notes
      </h2>
      <ul className="mt-5 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-5">
        {notes.map((note) => (
          <li key={note} className="flex flex-col items-center text-center">
            <span className="relative block h-16 w-16 overflow-hidden rounded-full bg-blush ring-1 ring-ink/10 sm:h-18 sm:w-18">
              {/* Shows the first letter until the picture exists */}
              <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center font-serif text-xl text-ink/50"
              >
                {getNoteName(note).charAt(0)}
              </span>
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${getNoteImage(note)})` }}
              />
            </span>
            <span className="mt-2 text-xs leading-tight text-ink/80">
              {getNoteName(note)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}