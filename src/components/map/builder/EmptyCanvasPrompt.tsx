/**
 * A subtle animated hint shown on an empty canvas when Draw tool is active.
 * Disappears once the writer makes their first stroke.
 */
const EmptyCanvasPrompt = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
    <div className="flex flex-col items-center gap-3">
      <svg
        viewBox="0 0 200 140"
        className="w-48 h-auto animate-pulse"
        style={{ opacity: 0.2 }}
      >
        {/* Simple island outline in dashed stroke */}
        <path
          d="M40 90 Q30 60 50 45 Q70 25 100 30 Q130 20 155 40 Q175 55 170 80 Q165 100 140 105 Q115 115 90 110 Q60 108 40 90Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="5 4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground"
        />
      </svg>
      <span className="text-[12px] text-muted-foreground/40 font-medium">
        Start drawing your world's outline here
      </span>
    </div>
  </div>
);

export default EmptyCanvasPrompt;
