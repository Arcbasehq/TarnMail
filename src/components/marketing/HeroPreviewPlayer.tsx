import Image from "next/image";

/**
 * Hero product preview — a looping GIF rendered from the Remotion
 * `HeroPreview` composition (see src/remotion). Served as a static asset so
 * the Remotion runtime stays out of the client bundle. Regenerate with
 * `npm run remotion:render` and re-export to public/HeroPreview.gif.
 */
export default function HeroPreviewPlayer() {
  return (
    <div
      className="rise relative w-full overflow-hidden rounded-xl shadow-xl ring-1 ring-slate-200 lg:translate-x-2"
      style={{ animationDelay: "260ms", aspectRatio: "1280 / 800" }}
    >
      <Image
        src="/HeroPreview.gif"
        alt="Preview of the tarnmail unified inbox"
        width={1280}
        height={800}
        unoptimized
        priority
        className="h-full w-full object-cover"
      />
    </div>
  );
}
