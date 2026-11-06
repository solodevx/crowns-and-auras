"use client";

import { NOTE_LIMIT, getNoteName, noteSlugs } from "@/config/notes";

type NotesPickerProps = {
  value: string[];
  onChange: (notes: string[]) => void;
  error?: string;
};

export default function NotesPicker({
  value,
  onChange,
  error,
}: NotesPickerProps) {
  const full = value.length >= NOTE_LIMIT;

  function toggle(note: string) {
    onChange(
      value.includes(note)
        ? value.filter((item) => item !== note)
        : [...value, note],
    );
  }

  return (
    <fieldset>
      <legend className="text-sm font-medium">
        Notes{" "}
        <span className="font-normal text-ink/70">
          (small pictures on the product page, up to {NOTE_LIMIT})
        </span>
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {noteSlugs.map((note) => {
          const checked = value.includes(note);
          return (
            <label
              key={note}
              className={`flex h-11 cursor-pointer items-center gap-2 rounded-full border border-ink/20 px-4 text-sm has-checked:border-ink has-checked:bg-ink has-checked:text-cream ${
                !checked && full ? "cursor-not-allowed opacity-40" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={!checked && full}
                onChange={() => toggle(note)}
              />
              {getNoteName(note)}
            </label>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-ink/70">
        {value.length} of {NOTE_LIMIT} chosen. They show in the order you tick
        them.
      </p>
      {error && (
        <p id="notes-error" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </fieldset>
  );
}