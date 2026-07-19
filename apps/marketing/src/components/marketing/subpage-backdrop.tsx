export function SubpageBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute -right-48 -top-52 size-[38rem] rounded-full border-[7rem] border-dunlo/10 md:-right-24 md:size-[48rem] md:border-[9rem]" />
      <div className="absolute -bottom-72 left-[44%] size-[34rem] rounded-full border-[6rem] border-white/[0.035]" />
      <svg
        viewBox="0 0 640 640"
        className="absolute -right-36 top-16 size-[34rem] text-dunlo/36 md:right-0 md:size-[42rem]"
        fill="none"
      >
        <path
          d="M48 94C48 202 388 166 388 306C388 446 96 404 96 530"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <circle cx="48" cy="94" r="9" fill="currentColor" />
        <circle cx="388" cy="306" r="9" fill="currentColor" />
        <path
          d="M78 510L98 532L76 552"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}
