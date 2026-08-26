import { useEffect, useState } from "react";

const banners = [
  {
    desktop: "/banner-release.webp",
    mobile: "/banner-release.webp",
    alt: "Banner",
  },
  {
    desktop: "/banner-discord.webp",
    mobile: "/banner-discord.webp",
    alt: "Discord Banner",
  },
  {
    desktop: "/banner-leaderboards.webp",
    mobile: "/banner-leaderboards.webp",
    alt: "Leaderboards Banner",
  },
];

const games = [
  {
    slug: "battles",
    title: "Battles",
    subtitle: "Battle & win",
    color: "243, 57, 57",
    overlay: "size-[180%] -rotate-10 top-4/5 left-3/5",
  },
  {
    slug: "cases",
    title: "Cases",
    subtitle: "Unbox skins",
    color: "243, 178, 57",
    overlay: "size-[180%] -rotate-8 top-4/5 left-2/5",
  },
  {
    slug: "coinflip",
    title: "Coinflip",
    subtitle: "Flip for double",
    color: "130, 164, 255",
    overlay: "size-[160%] top-4/5 left-1/2",
  },
  {
    slug: "roulette",
    title: "Roulette",
    subtitle: "Pick your luck",
    color: "78, 229, 226",
    overlay: "size-[170%] top-4/5 left-1/2",
  },
  {
    slug: "upgrader",
    title: "Upgrader",
    subtitle: "Get better items",
    color: "118, 229, 78",
    overlay: "size-[180%] -rotate-10 top-4/5 left-3/5",
  },
  {
    slug: "mines",
    title: "Mines",
    subtitle: "Find the gems",
    color: "78, 116, 229",
    overlay: "size-[180%] -rotate-10 top-4/5 left-3/5",
  },
  {
    slug: "plinko",
    title: "Plinko",
    subtitle: "Big drop wins",
    color: "255, 172, 104",
    overlay: "size-[210%] top-8/12 left-3/5",
  },
];

const bets = [
  ["Battles", "TRslaxy1", "21:32:49", "2,650", "x6.13", "+13,594", true],
  ["Upgrader", "Kudurotacapter", "21:32:53", "25", "x0.00", "-25", false],
  ["Coinflip", "Itz_NinjaPlayzz", "21:32:51", "1,250", "x2.00", "+1,250", true],
  ["Upgrader", "g3nb4d", "21:32:50", "2", "x0.00", "-2", false],
  ["Roulette", "MM2_DBA", "21:32:46", "480", "x3.50", "+1,200", true],
  ["Mines", "Berkeoyundaaaaa", "21:32:42", "120", "x0.00", "-120", false],
];

function BannerCarousel() {
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setActiveBanner((current) => (current + 1) % banners.length),
      6000,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col relative">
      <div className="rounded-xl md:rounded-2xl lg:rounded-3xl overflow-hidden relative bg-[#253665]">
        <section
          className="carousel is-ltr is-effect-slide"
          dir="ltr"
          aria-label="Gallery"
          tabIndex={0}
        >
          <div className="overflow-hidden">
            <ol
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeBanner * 100}%)` }}
            >
              {banners.map((banner) => (
                <li
                  key={banner.desktop}
                  className="min-w-full"
                  style={{ width: "100%" }}
                >
                  <picture className="no-interaction block aspect-[4/1]">
                    <source media="(max-width: 699px)" srcSet={banner.mobile} />
                    <source
                      media="(min-width: 700px)"
                      srcSet={banner.desktop}
                    />
                    <img
                      src={banner.desktop}
                      alt={banner.alt}
                      className="size-full object-cover rounded-xl md:rounded-2xl lg:rounded-3xl"
                    />
                  </picture>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <div className="flex gap-1 justify-center absolute bottom-4 left-0 right-0 z-10">
          {banners.map((banner, index) => (
            <button
              key={banner.desktop}
              type="button"
              aria-label={`Show banner ${index + 1}`}
              data-active={activeBanner === index}
              className={`rounded-full h-[5px] transition-[width,background] duration-200 origin-center ${activeBanner === index ? "bg-white w-10 shadow-[0_0_35px_5px_rgba(243,178,57,0.35)]" : "w-3 bg-white/20"}`}
              onClick={() => setActiveBanner(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function GameCard({ game }) {
  return (
    <a
      href={`/games/${game.slug}`}
      className="home-game-card pb-5 rounded-xl shadow-[0px_16px_25px_rgba(0,0,0,0.12)] relative overflow-hidden"
      style={{
        "--game-color": game.color,
        background: `radial-gradient(141.46% 89% at 50% 106.33%, rgba(${game.color}, .65) 0%, rgba(34,47,89,0) 100%), linear-gradient(0deg, rgba(${game.color},.05), rgba(${game.color},.05)), #222f59`,
      }}
    >
      <div className="glow" />
      <div className="flex items-center relative">
        <div className="flex-1 pb-[100%]" />
        <img
          src={`/${game.slug}.webp`}
          alt="Game"
          className="game-image"
        />
      </div>
      <img
        src={`/${game.slug}.webp`}
        alt=""
        className={`game-image-overlay -translate-1/2 ${game.overlay}`}
      />
      <div className="flex flex-col items-center game-text">
        <h3 className="font-bold text-2xl uppercase">{game.title}</h3>
        <h4 className="text-[#EEF2FB]/70 font-semibold text-[13px] uppercase">
          {game.subtitle}
        </h4>
      </div>
    </a>
  );
}

function LiveBets() {
  const [tab, setTab] = useState("All Bets");
  const shownBets =
    tab === "Lucky Wins"
      ? bets.filter((bet) => bet[6])
      : tab === "High Rollers"
        ? bets.filter((bet) => Number(bet[3].replace(",", "")) >= 1000)
        : bets;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 max-[530px]:flex-col max-[530px]:items-stretch">
        <div className="relative flex bg-[#2F3F71] p-1.5 rounded-[10px] w-max gap-0 max-[530px]:w-full max-[530px]:flex-wrap">
          {["All Bets", "High Rollers", "Lucky Wins"].map((label) => (
            <button
              key={label}
              type="button"
              className={`relative z-10 px-4 py-2 text-sm font-semibold text-center whitespace-nowrap transition-colors max-[530px]:w-1/2 rounded-lg ${tab === label ? "bg-primary text-[#3A3869] shadow-[0_3px_0_#D38502]" : "text-white"}`}
              onClick={() => setTab(label)}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="bg-[#2F3F71] rounded-[10px] h-10 px-3.5 min-w-0 flex items-center justify-center gap-1.5 text-sm max-[530px]:w-full"
        >
          <span className="text-left truncate flex-1 min-w-0 font-medium">
            10
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="size-4"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path fill="none" stroke="currentColor" d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
      <div className="overflow-x-auto chat-scrollbar">
        <div className="w-full min-w-[880px]">
          <div className="flex text-left text-sm pb-3 text-accent/70 font-medium">
            <div className="pl-4 w-[15%]">GAME</div>
            <div className="w-[24%]">PLAYER</div>
            <div className="w-[11%]">DATE</div>
            <div className="w-[20%]">AMOUNT</div>
            <div className="w-[15%]">MULTIPLIER</div>
            <div className="pr-4 w-[15%] text-right">PROFIT</div>
          </div>
          <div
            className="flex flex-col gap-2"
            style={{ maskImage: "linear-gradient(#000 70%, transparent)" }}
          >
            {shownBets.map((bet, index) => (
              <div
                key={`${bet[1]}-${index}`}
                className={`flex text-left text-sm font-medium py-2.5 h-[56px] rounded-xl transition-all duration-300 ease-out cursor-pointer hover:opacity-80 ${index % 2 ? "bg-[#17203c]/75" : "bg-[#263462]/75"}`}
              >
                <div className="pl-4 flex items-center w-[15%]">
                  <span className="uppercase text-white font-semibold text-[#FFD896]">
                    {bet[0]}
                  </span>
                </div>
                <div className="text-white flex items-center gap-2 w-[24%]">
                  <div className="size-8 rounded-lg p-0.5 bg-linear-to-b from-[#343756] to-[#F33939]">
                    <div className="rounded-[6px] size-full flex items-center justify-center bg-[#1A2339] text-xs font-bold">
                      {bet[1][0]}
                    </div>
                  </div>
                  <span className="font-medium">{bet[1]}</span>
                </div>
                <div className="text-accent flex items-center w-[11%]">
                  {bet[2]}
                </div>
                <div className="flex items-center w-[20%]">
                  <div className="flex items-center gap-2">
                    <img src="/coin.webp" alt="" className="size-5" />
                    <span className="tabular-nums">{bet[3]}</span>
                  </div>
                </div>
                <div className="text-accent flex items-center w-[15%]">
                  {bet[4]}
                </div>
                <div className="pr-4 flex items-center justify-end w-[15%]">
                  <div
                    className={`flex items-center justify-center gap-2 py-1.5 px-2.5 rounded-lg min-w-23 w-max ${bet[6] ? "bg-[#5CDF9A]/9 text-[#5CDF9A]" : "bg-accent/9 text-accent"}`}
                  >
                    <img src="/coin.webp" alt="" className="size-5" />
                    <span className="tabular-nums">{bet[5]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  const linkClass =
    "text-sm text-accent hover:text-accent-light transition-colors font-medium";
  return (
    <footer
      className="flex flex-col md:flex-row gap-8 md:gap-4 justify-between p-10 relative"
      style={{
        background:
          "radial-gradient(100% 189% at 100% 100%, rgba(243,178,57,.1) 0%, rgba(32,44,84,0) 100%), radial-gradient(48.14% 138.34% at 12% 207.44%, rgba(201,126,0,.74) 0%, rgba(201,126,0,0) 100%), linear-gradient(0deg,#212E5B,#212E5B),#182245",
      }}
    >
      <div className="flex flex-col gap-4 max-w-140">
        <p className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-[#B6CEFF] via-white to-[#FFCD79]">
          MM2WILD
        </p>
        <p className="text-sm text-accent font-medium">
          MM2Wild is an independent platform and is not affiliated with,
          endorsed by, or connected to Roblox Corporation, its subsidiaries, or
          affiliates in any manner.
        </p>
        <div className="flex gap-3">
          {["TWITTER", "DISCORD", "KICK"].map((social) => (
            <a
              key={social}
              href={
                social === "TWITTER"
                  ? "https://x.com/mm2wild"
                  : social === "DISCORD"
                    ? "https://discord.gg/mm2wild"
                    : "https://kick.com/mm2wild"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="h-10.5 rounded-lg px-3 flex items-center bg-[#34447C] text-sm font-bold hover:-translate-y-0.5 transition-transform"
            >
              {social}
            </a>
          ))}
        </div>
        <p className="text-sm text-accent font-medium">
          Get started &amp; explore our many free play options! Find out more{" "}
          <a href="/" className="text-primary hover:underline">
            here
          </a>
          .
        </p>
        <p className="text-sm text-accent font-medium">
          © 2025 MM2Wild.com. All Rights Reserved.
        </p>
      </div>
      <div className="flex justify-between flex-wrap gap-15">
        <div className="flex flex-col gap-4">
          <p className="text-primary font-semibold">GAMEMODES</p>
          <div className="flex flex-col gap-2">
            {games.slice(0, 6).map((game) => (
              <a
                key={game.slug}
                href={`/games/${game.slug}`}
                className={linkClass}
              >
                {game.slug === "battles" ? "Case Battles" : game.title}
              </a>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-primary font-semibold">LINKS</p>
          <div className="flex flex-col gap-2">
            <a href="/fairness" className={linkClass}>
              Provably Fair
            </a>
            <a href="/terms" className={linkClass}>
              TOS
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-primary font-semibold">SUPPORT</p>
          <div className="flex flex-col gap-2">
            <button type="button" className={`${linkClass} text-left`}>
              Live Support
            </button>
            <a href="https://discord.gg/mm2wild" className={linkClass}>
              Discord
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <div className="site-content">
      <div className="max-w-[1296px] mx-auto flex flex-col px-4 md:px-12 min-h-[calc(100dvh-var(--layout-top))]">
        <div className="page-content home-page py-6 flex flex-col gap-12.5">
          <BannerCarousel />
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">OUR GAMES</h2>
              <div className="h-0.5 flex-1 bg-linear-to-r from-accent/25 to-[#E5AD4E]/0" />
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-4">
              {games.map((game) => (
                <GameCard key={game.slug} game={game} />
              ))}
            </div>
          </div>
          <LiveBets />
        </div>
      </div>
      <Footer />
    </div>
  );
}
