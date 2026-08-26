export default function Subheader() {
  return (
    <div className="fixed z-100 top-20 left-0 right-0 bg-linear-to-r from-[#131C2F] to-[#141E4C] pr-6 gap-4.5 lg:gap-5 items-center font-semibold hidden md:flex h-10 pl-[calc(var(--layout-left,0px)+24px)] ease-in-out transition-[padding-left] duration-200">
      <a
        href="/affiliates"
        className="text-[#8894AF] hover:text-[#a2adc7] transition-colors flex items-center gap-1.5"
      >
        <p className="text-[13px]">AFFILIATES</p>
      </a>
      <a
        href="/terms"
        className="text-[#8894AF] hover:text-[#a2adc7] transition-colors flex items-center gap-1.5"
      >
        <p className="text-[13px]">TOS</p>
      </a>
      <a
        href="/fairness"
        className="text-[#8894AF] hover:text-[#a2adc7] transition-colors flex items-center gap-1.5"
      >
        <p className="text-[13px]">FAIRNESS</p>
      </a>
      <a
        href="/leaderboard"
        className="text-transparent bg-clip-text bg-linear-to-br from-[#FFD896] from-35% via-white to-[#FFD896] to-65% flex items-center gap-1.5 relative overflow-hidden h-10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 18 14"
          className="size-4"
        >
          <path
            fill="url(#i-2123118793__a)"
            d="M9.754 10.705v1.547h3.75v1.5h-9v-1.5h3.75v-1.547a6 6 0 0 1-5.25-5.953v-4.5h12v4.5a6 6 0 0 1-5.25 5.953Zm-9-8.953h1.5v3h-1.5v-3Zm15 0h1.5v3h-1.5v-3Z"
          />
          <defs>
            <linearGradient
              id="i-2123118793__a"
              x1=".754"
              x2="26.789"
              y1=".252"
              y2="-1.588"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset=".338" stopColor="#FFD896" />
              <stop offset=".495" stopColor="#fff" />
              <stop offset=".67" stopColor="#FFD896" />
            </linearGradient>
          </defs>
        </svg>
        <p className="text-[13px]">75K RACE</p>
        <div className="bg-[#E5AD4E] rounded-full absolute left-1/2 -bottom-4 -translate-x-1/2 size-5 blur-[14px]" />
      </a>
    </div>
  );
}
