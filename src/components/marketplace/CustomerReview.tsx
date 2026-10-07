/**
 * One real customer recommendation, in two sizes.
 *
 * Kept in a single file so the quote, the name and the month can never drift
 * between the places it appears — a review that reads differently on two pages
 * of the same site stops looking like a review.
 *
 * `full` is for a page someone is reading; `compact` rides alongside the
 * booking form, where it has to reassure without competing with the thing the
 * customer is trying to do.
 */
export const REVIEW = {
  stars: 5,
  quote:
    "Just had my living room, stairs and landing done with Simon. Really chatty and professional. Carpets smell really fresh and they look so much better from the usual wear and tear of a family of 4! Would recommend!",
  name: "Kayleigh Louise Rowlands",
  where: "Recommended us on Facebook",
  when: "September 2026",
};

function Stars({ className = "" }: { className?: string }) {
  return (
    <div
      className={`tracking-[0.2em] text-amber-500 ${className}`}
      aria-label={`${REVIEW.stars} out of 5`}
    >
      {"★".repeat(REVIEW.stars)}
    </div>
  );
}

export default function CustomerReview({
  variant = "full",
  className = "",
}: {
  variant?: "full" | "compact";
  className?: string;
}) {
  if (variant === "compact") {
    return (
      <figure
        className={`rounded-2xl border border-amber-200 bg-amber-50/60 p-4 ${className}`}
      >
        <Stars className="text-sm" />
        <blockquote className="mt-2 text-sm leading-relaxed text-slate-700">
          &ldquo;{REVIEW.quote}&rdquo;
        </blockquote>
        <figcaption className="mt-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-900">{REVIEW.name}</span> ·{" "}
          {REVIEW.where}, {REVIEW.when}
        </figcaption>
      </figure>
    );
  }

  return (
    <figure
      className={`rounded-2xl bg-slate-900 px-6 py-10 text-center sm:px-10 ${className}`}
    >
      <Stars className="text-2xl" />
      <blockquote className="mx-auto mt-5 max-w-2xl text-xl font-medium leading-relaxed text-white sm:text-2xl">
        &ldquo;{REVIEW.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-5 text-sm text-slate-400">
        <span className="font-semibold text-white">{REVIEW.name}</span>
        <span className="mt-1 block">
          {REVIEW.where}, {REVIEW.when}
        </span>
      </figcaption>
    </figure>
  );
}
