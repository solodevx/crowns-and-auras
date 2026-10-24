export default function SectionHeading({ title }: { title: string }) {
  return (
    <div className="text-center">
      <h2 className="font-serif text-lg uppercase tracking-[0.25em] md:text-xl">
        {title}
      </h2>
      <div
        aria-hidden="true"
        className="mx-auto mt-3 flex w-24 items-center gap-2"
      >
        <span className="h-px flex-1 bg-gold" />
        <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
        <span className="h-px flex-1 bg-gold" />
      </div>
    </div>
  );
}