import { useEffect, useState, useRef, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { profileGames, ProfileGameIcon } from "./ProfileGameDropdown";

const formatNumber = (value, maximumFractionDigits = 2) =>
  Number(value || 0).toLocaleString("en-US", { maximumFractionDigits });

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const gameMap = profileGames.reduce((acc, game) => {
  acc[game.id] = game;
  return acc;
}, {});

const filterOptions = [
  { id: "all", label: "Games" },
  ...profileGames.map((g) => ({ id: g.id, label: g.label })),
];

function GameIcon({ game, className }) {
  const profile = gameMap[game] || profileGames[3];
  return <ProfileGameIcon game={profile} className={className} />;
}

function GameLabel({ game }) {
  const profile = gameMap[game];
  const label = profile ? profile.label : game.charAt(0).toUpperCase() + game.slice(1);
  return <span className="font-medium text-white">{label}</span>;
}

function StatusBadge({ status }) {
  const won = status === "won";
  return (
    <div
      className={`inline-flex items-center px-2.75 py-1.25 rounded-lg text-sm font-semibold ${
        won ? "bg-[#5CDF9A]/6 text-[#5CDF9A]" : "bg-[#DF5C5C]/6 text-[#DF5C5C]"
      }`}
    >
      <p>{won ? "WON" : "LOST"}</p>
    </div>
  );
}

function CoinAmount({ value, className = "" }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <img src="/coin.webp" alt="" className="bg-cover bg-center size-5 shrink-0" />
      <span className="tabular-nums font-medium text-white">{formatNumber(value)}</span>
    </div>
  );
}

function ProfitBadge({ profit }) {
  const positive = profit > 0;
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.25 py-1.25 rounded-lg text-sm font-semibold ${
        positive ? "bg-[#5CDF9A]/6 text-[#5CDF9A]" : "bg-accent/5 text-accent"
      }`}
    >
      <img src="/coin.webp" alt="" className="bg-cover bg-center size-5 shrink-0" />
      <span>
        <span>{positive ? "+" : "-"}</span>
        <span className="tabular-nums">{formatNumber(Math.abs(profit))}</span>
      </span>
    </div>
  );
}

function ExternalLinkIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="size-5">
      <g fill="currentColor">
        <path d="M6.22 8.72a.75.75 0 0 0 1.06 1.06l5.22-5.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0 0 1.5h1.69z" />
        <path d="M3.5 6.75c0-.69.56-1.25 1.25-1.25H7A.75.75 0 0 0 7 4H4.75A2.75 2.75 0 0 0 2 6.75v4.5A2.75 2.75 0 0 0 4.75 14h4.5A2.75 2.75 0 0 0 12 11.25V9a.75.75 0 0 0-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-4.5c-.69 0-1.25-.56-1.25-1.25z" />
      </g>
    </svg>
  );
}

function FilterDropdown({ style, selectedFilter, onSelect }) {
  return (
    <div data-reka-popper-content-wrapper="" style={style}>
      <div
        className="relative max-h-[calc(min(384px,var(--reka-popper-available-height)))] overflow-hidden text-popover-foreground shadow-md bg-[#263457] flex flex-col gap-1.5 rounded-lg p-1 outline-none z-9999 min-w-(--reka-select-trigger-width)"
        role="listbox"
        data-state="open"
        dir="ltr"
      >
        <div
          data-reka-select-viewport=""
          role="presentation"
          className="w-full min-w-[--reka-select-trigger-width]"
          style={{ position: "relative", flex: "1 1 0%", overflow: "hidden auto" }}
        >
          {filterOptions.map((option) => {
            const checked = option.id === selectedFilter.id;
            return (
              <div
                key={option.id}
                className="flex cursor-default select-none items-center outline-none group/dropdown-item h-9.5 w-full shrink-0 relative"
                role="option"
                aria-selected={checked}
                data-state={checked ? "checked" : "unchecked"}
                tabIndex={-1}
                onClick={() => onSelect(option)}
              >
                <div className="absolute top-1/3 left-0 right-0 bottom-0 group-data-[state=checked]/dropdown-item:bg-[#344986] group-hover/dropdown-item:bg-[#344986] transition-colors duration-100 rounded-lg" />
                <div className="group-data-[state=checked]/dropdown-item:bg-[#57689A] group-hover/dropdown-item:bg-[#57689A] h-[calc(100%-3px)] *:drop-shadow-[0_2px_0_#223364] flex items-center gap-2 select-none rounded-lg px-2.5 text-sm font-medium transition-colors duration-100 outline-none cursor-pointer w-full relative">
                  <div className="w-max">
                    <button
                      className={`cursor-pointer peer shrink-0 rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 size-5 text-[#1D284E] ${
                        checked ? "bg-[#F2BE66]" : "bg-[#0F1222]/55"
                      }`}
                      role="checkbox"
                      type="button"
                      aria-checked={checked}
                      data-state={checked ? "checked" : "unchecked"}
                    >
                      {checked && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-full">
                          <path fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="font-semibold text-accent group-data-[state=checked]/dropdown-item:text-white group-hover/dropdown-item:text-white transition-colors duration-100">
                    {option.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function GameHistoryPanel() {
  const [bets, setBets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDropdownStyle, setFilterDropdownStyle] = useState({});
  const filterTriggerRef = useRef(null);

  const loadBets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        perPage: String(perPage),
        game: selectedFilter.id,
      });
      const response = await fetch(`/api/bets?${params}`);
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Could not load bet history.");
      }
      const payload = await response.json();
      setBets(payload.bets || []);
      setTotal(payload.total || 0);
      setTotalPages(payload.totalPages || 1);
    } catch (err) {
      setError(err.message);
      setBets([]);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, selectedFilter]);

  useEffect(() => {
    loadBets();
  }, [loadBets]);

  const positionFilterDropdown = useCallback(() => {
    const trigger = filterTriggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setFilterDropdownStyle({
      position: "fixed",
      left: "0px",
      top: "0px",
      transform: `translate(${rect.left}px, ${rect.bottom}px)`,
      minWidth: `${rect.width}px`,
      "--reka-popper-transform-origin": "0% 0px",
      zIndex: 9999,
      "--reka-popper-available-width": `${window.innerWidth - rect.left}px`,
      "--reka-popper-available-height": `${Math.max(0, window.innerHeight - rect.bottom)}px`,
      "--reka-popper-anchor-width": `${rect.width}px`,
      "--reka-popper-anchor-height": `${rect.height}px`,
    });
  }, []);

  useLayoutEffect(() => {
    if (!isFilterOpen) return undefined;
    positionFilterDropdown();
    const update = () => positionFilterDropdown();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [isFilterOpen, positionFilterDropdown]);

  useEffect(() => {
    if (!isFilterOpen) return undefined;
    const closeOnOutsidePress = (event) => {
      if (
        filterTriggerRef.current?.contains(event.target) ||
        event.target.closest?.("[data-reka-popper-content-wrapper]")
      )
        return;
      setIsFilterOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsFilterOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isFilterOpen]);

  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  return (
    <div className="relative">
      <div className="flex flex-col gap-4">
        {/* Game filter dropdown */}
        <div className="flex justify-end">
          <div className="h-11 relative group/button w-full sm:w-auto min-w-[280px]">
            <div className="absolute top-1/2 left-0 right-0 bottom-0 bg-[#223364] rounded-lg" />
            <button
              ref={filterTriggerRef}
              className="ring-offset-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap [&>span]:line-clamp-1 min-w-40 w-full h-[calc(100%-3px)] bg-[#57689A] group-hover/button:-translate-y-0.5 group-data-[state=open]/button:translate-y-0 transition-transform duration-125 text-white [&>*]:drop-shadow-[0_2px_0_#223364] rounded-lg px-4 flex items-center outline-none cursor-pointer group relative"
              role="combobox"
              type="button"
              aria-expanded={isFilterOpen}
              aria-autocomplete="none"
              dir="ltr"
              data-state={isFilterOpen ? "open" : "closed"}
              onClick={() => setIsFilterOpen((open) => !open)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-5.25 mr-2 shrink-0"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              >
                <path fill="none" stroke="currentColor" d="M2 5h20M6 12h12m-9 7h6" />
              </svg>
              <p className="font-semibold uppercase">{selectedFilter.label}</p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180 ml-auto"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              >
                <path fill="none" stroke="currentColor" d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bets table */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="bg-[#283562]/65 rounded-xl p-5">
              <p className="text-sm font-medium text-accent">Loading bet history…</p>
            </div>
          ) : error ? (
            <div className="bg-[#283562]/65 rounded-xl p-5">
              <p className="text-sm font-medium text-[#DF5C5C]">{error}</p>
            </div>
          ) : bets.length === 0 ? (
            <div className="bg-[#283562]/65 rounded-xl p-5">
              <p className="text-sm font-medium text-accent">No bets found.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              <div dir="ltr" className="overflow-hidden" style={{ position: "relative" }}>
                <div
                  data-reka-scroll-area-viewport=""
                  className="size-full"
                  tabIndex={0}
                  style={{ overflow: "scroll hidden" }}
                >
                  <div style={{ minWidth: "fit-content" }}>
                    <table
                      className="border-separate w-full border-spacing-y-2 table-fixed"
                      style={{ minWidth: "64rem" }}
                    >
                      <thead>
                        <tr className="align-middle outline-none text-left text-sm text-accent font-medium border-none">
                          <th className="pb-2 pl-4" style={{ width: "18%" }}>
                            <div className="flex items-center text-sm font-medium">GAMEMODE</div>
                          </th>
                          <th className="pb-2" style={{ width: "14%" }}>
                            <div className="flex items-center text-sm font-medium">STATUS</div>
                          </th>
                          <th className="pb-2" style={{ width: "15%" }}>
                            <div className="flex items-center text-sm font-medium">AMOUNT</div>
                          </th>
                          <th className="pb-2" style={{ width: "15%" }}>
                            <div className="flex items-center text-sm font-medium">PROFIT</div>
                          </th>
                          <th className="pb-2" style={{ width: "13%" }}>
                            <div className="flex items-center text-sm font-medium">MULTIPLIER</div>
                          </th>
                          <th className="pb-2" style={{ width: "20%" }}>
                            <div className="flex items-center text-sm font-medium">DATE</div>
                          </th>
                          <th className="pb-2 pr-4" style={{ width: "5%" }}>
                            <div className="flex items-center text-sm font-medium" />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {bets.map((bet) => (
                          <tr
                            key={bet.id}
                            className="align-middle outline-none text-left text-sm border-none [&_td]:bg-[#2F3F71]/50 hover:[&_td]:bg-[#28386A]/40 [&_td]:transition-colors [&_td]:duration-75 cursor-pointer group"
                          >
                            <td className="py-3 pl-4 rounded-l-xl">
                              <div
                                className="flex items-center gap-1.5"
                                style={{
                                  filter:
                                    "drop-shadow(rgba(255, 216, 150, 0.34) 0px 0px 12.3px) drop-shadow(rgb(52, 73, 134) 0px 2px 0px)",
                                }}
                              >
                                <GameIcon
                                  game={bet.game}
                                  className="size-4.5 shrink-0 text-[#FFD896]"
                                />
                                <GameLabel game={bet.game} />
                              </div>
                            </td>
                            <td className="py-3">
                              <StatusBadge status={bet.status} />
                            </td>
                            <td className="py-3">
                              <CoinAmount value={bet.amount} />
                            </td>
                            <td className="">
                              <ProfitBadge profit={bet.profit} />
                            </td>
                            <td className="py-3">
                              <p className="font-medium text-accent">
                                {formatNumber(bet.multiplier)}x
                              </p>
                            </td>
                            <td className="py-3">
                              <p className="font-medium text-accent">{formatDate(bet.date)}</p>
                            </td>
                            <td className="py-3 pr-4 rounded-r-xl">
                              <div className="flex items-center justify-end">
                                <div className="text-accent group-hover:text-primary flex items-center justify-center transition-colors">
                                  <ExternalLinkIcon />
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Pagination footer */}
              <div className="flex items-center justify-end gap-5 py-3 px-4 bg-[#28386A] rounded-xl">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium text-accent">Rows per page:</p>
                  <div className="flex flex-col">
                    <button
                      className="ring-offset-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap [&>span]:line-clamp-1 rounded-[10px] flex items-center justify-between cursor-pointer outline-none group relative bg-transparent h-auto px-0"
                      role="combobox"
                      type="button"
                      aria-expanded={false}
                      aria-autocomplete="none"
                      dir="ltr"
                      data-state="closed"
                      onClick={() => {
                        const next = perPage === 10 ? 20 : perPage === 20 ? 50 : 10;
                        setPerPage(next);
                        setPage(1);
                      }}
                    >
                      <div className="absolute inset-0.25 ring-2 ring-transparent rounded-[10px] transition-shadow pointer-events-none" />
                      <div className="inline-flex items-center gap-1">
                        <span className="text-white font-medium text-sm">{perPage}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="size-4 transition-transform"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path fill="none" stroke="currentColor" d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium text-accent">
                    {start} - {end} of {formatNumber(total, 0)}
                  </p>
                  <div className="flex items-center">
                    <button
                      className="p-0 disabled:opacity-40 transition-opacity"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="size-4"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path fill="none" stroke="currentColor" d="m15 18-6-6 6-6" />
                      </svg>
                    </button>
                    <button
                      className="p-0 disabled:opacity-40 transition-opacity"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="size-4"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path fill="none" stroke="currentColor" d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isFilterOpen &&
        createPortal(
          <FilterDropdown
            style={filterDropdownStyle}
            selectedFilter={selectedFilter}
            onSelect={(option) => {
              setSelectedFilter(option);
              setIsFilterOpen(false);
              setPage(1);
            }}
          />,
          document.body,
        )}
    </div>
  );
}
