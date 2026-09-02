import { useMemo, useState } from "react";

const CASES = [
  ["royal-reserve", "Royal Reserve", 21008, 1, 63.5],
  ["royal-relic", "Royal Relic", 14467, 1, 65.8],
  ["liberty-lockbox", "Liberty Lockbox", 10050, 2, 70.4],
  ["chroma-jackpot", "Chroma Jackpot", 7119, 1, 66.1],
  ["bay-harbor-butcher", "Bay Harbor Butcher", 5895, 2, 75.6],
  ["voodoo", "Voodoo", 4704, 1, 45.9],
  ["pharaoh", "Pharaoh", 4114, 1, 49.8],
  ["desert-dominion", "Desert Dominion", 3978, 1, 52],
  ["solar-fury", "Solar Fury", 3855, 1, 50],
  ["cosmic-cradle", "Cosmic Cradle", 3701, 1, 50.2],
  ["comp-mode", "Comp Mode", 3500, 1, 49.3],
  ["sandy-shores", "Sandy Shores", 3233, 2, 70],
  ["hollow-bounty", "Hollow Bounty", 3040, 1, 37.2],
  ["venom-strike", "Venom Strike", 2707, 1, 47.6],
  ["royal-bloodshed", "Royal Bloodshed", 2604, 1, 52.2],
  ["travelers-curse", "Traveler's Curse", 2500, 1, 57.6, "travellers-curse"],
  ["storm-chaser", "Storm Chaser", 2401, 1, 53.3],
  ["cosmic-vault", "Cosmic Vault", 2277, 1, 45],
  ["love-loot", "Love Loot", 2026, 1, 56.8],
  ["icebound-riches", "Icebound Riches", 1908, 1, 52.7],
  ["orbit-vault", "Orbit Vault", 1809, 1, 52.2],
  ["rip-my-granny", "RIP My Granny", 1709, 1, 45.4],
  ["evil-craft", "Evil Craft", 1615, 1, 48],
  ["metro-fortune", "Metro Fortune", 1517, 1, 64.1],
  ["cookie-fortress", "Cookie Fortress", 1402, 1, 60.2],
  ["lucky-tune", "Lucky Tune", 1314, 1, 66.1, "luckytune"],
  ["spectral-depths", "Spectral Depths", 1212, 1, 61.5],
  ["phantom-pantry", "Phantom Pantry", 1111, 1, 63.4],
  ["concrete-chaos", "Concrete Chaos", 1040, 2, 76.8],
  ["cherry-blossom", "Cherry Blossom", 948, 2, 67.9],
  ["sunset-paradise", "Sunset Paradise", 828, 1, 58.3],
  ["alien-anomaly", "Alien Anomaly", 785, 1, 49.7],
  ["ishowwild", "IShowWild", 777, 1, 59],
  ["winter-wonderland", "Winter Wonderland", 686, 1, 65.3],
  ["verges-curse", "Verge's Curse", 666, 1, 44.1],
  ["jails-last-wish", "Jail's Last Wish", 512, 1, 64.9, "jailslastwish"],
  ["e-girl-energy", "E-Girl Energy", 468, 1, 43.2],
  ["cloud-nine", "Cloud Nine", 355, 2, 79.3],
  ["vampires-lair", "Vampire's Lair", 313, 1, 52],
  ["toxic-hazard", "Toxic Hazard", 280, 1, 33.6],
  ["red-front", "Red Front", 258, 1, 43.2],
  ["turkey-day", "Turkey Day", 255, 1, 51.6],
  ["shadow-realm", "Shadow Realm", 245, 1, 49.8],
  ["sugar-rush", "Sugar Rush", 128, 1, 61.3],
  ["elderwood-roots", "Elderwood Roots", 121, 1, 36.9],
  ["oceans-depths", "Ocean's Depths", 93, 1, 52.5],
  ["noobs-luck", "Noob's Luck", 82, 1, 49.3],
  ["10-icepiercer", "10% Icepiercer", 69, 2, 67.7],
  ["67", "67", 67, 1, 55.8],
  ["burning-chaos", "Burning Chaos", 50, 1, 43.1],
  ["neon-strike", "Neon Strike", 47, 2, 75.6],
  ["luger-vault", "Luger Vault", 39, 1, 36.9],
  ["seers-vision", "Seer's Vision", 11, 1, 54, "seersvision"],
].map(([slug, name, price, risk, marker, asset = slug]) => ({ slug, name, price, risk, marker, asset }));

const SORTS = [
  { id: "highest", label: "Highest Price" },
  { id: "lowest", label: "Lowest Price" },
  { id: "name", label: "Name" },
];

const RISK_COLORS = ["rgb(92, 223, 154)", "rgb(223, 138, 92)", "rgb(223, 92, 92)"];

function SortIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5.25 mr-2 shrink-0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <path fill="none" stroke="currentColor" d="M2 5h20M6 12h12m-9 7h6" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180 ml-2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
      <path fill="none" stroke="currentColor" d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CaseCard({ caseItem }) {
  return (
    <a href={`/games/cases/${caseItem.slug}`} className="flex flex-col bg-[#202D57] p-4 pt-5 max-w-full relative group/case rounded-xl cursor-pointer outline-none overflow-hidden h-60">
      <img src="/leafs.png" alt="Blades" className="object-contain size-[145%] absolute left-1/2 -translate-x-7/12 -top-[14%] pointer-events-none max-w-none select-none" />
      <div className="h-full mx-auto aspect-square relative">
        <div className="absolute -translate-1/2 left-1/2 top-1/2 size-43 mt-3">
          <img src={`/cases/${caseItem.asset}.webp`} alt={caseItem.name} className="absolute inset-0 size-full object-contain opacity-0 transition-opacity duration-300 group-hover/case:opacity-90! blur-[32px] no-interaction" style={{ opacity: 0.6 }} />
          <img src={`/cases/${caseItem.asset}.webp`} alt={caseItem.name} className="absolute inset-0 size-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction" style={{ opacity: 1 }} />
        </div>
      </div>
      <div className="flex flex-col items-center gap-3.5">
        <div className="h-8.5 relative w-max">
          <div className="absolute top-1/2 left-0 right-0 bottom-0 bg-[#293A6C] rounded-lg" />
          <div className="w-full h-[calc(100%-3px)] bg-[#364677] px-4 flex justify-center items-center gap-1.5 *:drop-shadow-[0_2px_0_#293A6C] rounded-lg relative">
            <img src="/coin.webp" alt="" className="bg-cover bg-center size-4.5" />
            <span className="tabular-nums font-medium text-sm">{caseItem.price.toLocaleString("en-US")}</span>
          </div>
        </div>
        <p className="font-medium truncate text-center leading-none">{caseItem.name}</p>
        <div className="relative flex w-full gap-1 h-1.5">
          {RISK_COLORS.map((color, index) => (
            <div key={color} className="flex-1" style={{ backgroundColor: color, opacity: caseItem.risk === index ? 1 : 0.15 }} />
          ))}
          <div className="absolute top-1/2 h-2.5 w-0.75 -translate-1/2 bg-white" style={{ left: `${caseItem.marker}%` }} />
        </div>
      </div>
    </a>
  );
}

export default function CasesPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("highest");
  const [sortOpen, setSortOpen] = useState(false);

  const visibleCases = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    const filtered = normalizedSearch
      ? CASES.filter((caseItem) => caseItem.name.toLocaleLowerCase().includes(normalizedSearch))
      : [...CASES];
    if (sort === "lowest") return filtered.sort((a, b) => a.price - b.price);
    if (sort === "name") return filtered.sort((a, b) => a.name.localeCompare(b.name));
    return filtered.sort((a, b) => b.price - a.price);
  }, [search, sort]);

  const selectedSort = SORTS.find((option) => option.id === sort) || SORTS[0];

  return (
    <div className="site-content">
      <div className="max-w-[1296px] mx-auto flex flex-col @container/content px-4 md:px-12 min-h-[calc(100dvh-var(--layout-top))]">
        <div className="page-content cases-list-page py-6 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 text-2xl font-bold">
              <h1>CASES</h1>
            </div>
            <div className="flex flex-col @[820px]/content:flex-row justify-between gap-4 mt-6">
              <div className="w-full @[820px]/content:w-[238px] @[820px]/content:flex-none min-w-0">
                <div className="w-full relative flex group rounded-lg items-center justify-center bg-[#0F1222]/55 h-12 px-3.5">
                  <div className="absolute inset-0.25 ring-2 ring-transparent rounded-lg transition-shadow pointer-events-none" />
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4 shrink-0 my-auto text-accent" strokeWidth="2.5">
                    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607" />
                  </svg>
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search for cases..." className="bg-transparent outline-none size-full peer placeholder:text-accent px-2 font-medium text-sm" />
                </div>
              </div>
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-4 min-w-0">
                <div className="flex flex-col relative w-full @[820px]/content:w-[282px]">
                  <div className="h-11 relative group/button">
                    <div className="absolute top-1/2 left-0 right-0 bottom-0 bg-[#223364] rounded-lg" />
                    <button
                      className="ring-offset-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap [&>span]:line-clamp-1 w-full h-[calc(100%-3px)] bg-[#57689A] group-hover/button:-translate-y-0.5 data-[state=open]:translate-y-0 transition-transform duration-125 text-white [&>*]:drop-shadow-[0_2px_0_#223364] rounded-lg px-4 flex items-center outline-none cursor-pointer group relative"
                      type="button"
                      aria-expanded={sortOpen}
                      data-state={sortOpen ? "open" : "closed"}
                      onClick={() => setSortOpen((open) => !open)}
                    >
                      <SortIcon />
                      <span className="text-left truncate flex-1 min-w-0 font-semibold uppercase">SORT BY: {selectedSort.label}</span>
                      <ChevronIcon />
                    </button>
                  </div>
                  {sortOpen && (
                    <div className="absolute top-[calc(100%+6px)] right-0 z-20 min-w-full p-1.5 rounded-lg bg-[#344677] shadow-xl">
                      {SORTS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold whitespace-nowrap hover:bg-[#57689A] transition-colors cursor-pointer"
                          onClick={() => {
                            setSort(option.id);
                            setSortOpen(false);
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
              {visibleCases.map((caseItem) => <CaseCard key={caseItem.slug} caseItem={caseItem} />)}
            </div>
            <div className="flex justify-center items-center" />
          </div>
        </div>
      </div>
    </div>
  );
}
