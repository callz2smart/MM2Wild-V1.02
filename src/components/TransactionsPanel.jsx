import { useEffect, useState, useRef, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";

const formatNumber = (value, maximumFractionDigits = 2) =>
  Number(value || 0).toLocaleString("en-US", { maximumFractionDigits });

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const methodOptions = [
  { id: "all", label: "Methods" },
  { id: "rakeback", label: "Rakeback" },
  { id: "mm2_deposit", label: "MM2 Deposit" },
  { id: "mm2_withdraw", label: "MM2 Withdraw" },
  { id: "crypto_deposit", label: "Crypto Deposit" },
  { id: "crypto_withdraw", label: "Crypto Withdraw" },
  { id: "tip_sent", label: "Tip Sent" },
  { id: "tip_received", label: "Tip Received" },
  { id: "affiliate", label: "Affiliate" },
];

const methodLabels = {
  rakeback: "Rakeback",
  mm2_deposit: "MM2 Deposit",
  mm2_withdraw: "MM2 Withdraw",
  crypto_deposit: "Crypto Deposit",
  crypto_withdraw: "Crypto Withdraw",
  tip_sent: "Tip Sent",
  tip_received: "Tip Received",
  affiliate: "Affiliate",
};

// Crypto icons — Solana, Litecoin, Bitcoin, Ethereum
const cryptoIcons = ["solana", "litecoin", "bitcoin", "ethereum"];

function SolanaIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30" className="size-5">
      <circle cx="15" cy="15" r="15" fill="#0D192B" />
      <path fill="url(#sol-a)" d="M8.956 18.19a.612.612 0 0 1 .411-.164h14.292a.291.291 0 0 1 .21.494l-2.805 2.823a.585.585 0 0 1-.411.174H6.334a.292.292 0 0 1-.2-.5l2.822-2.826Z" />
      <path fill="url(#sol-b)" d="M8.954 7.655a.585.585 0 0 1 .411-.174h14.291a.292.292 0 0 1 .21.5l-2.805 2.825a.575.575 0 0 1-.41.164H6.33a.292.292 0 0 1-.2-.485l2.823-2.83Z" />
      <path fill="url(#sol-c)" d="M21.063 12.892a.585.585 0 0 0-.411-.175H6.334a.293.293 0 0 0-.2.5l2.824 2.824c.109.11.256.173.411.174h14.29a.292.292 0 0 0 .21-.5l-2.806-2.823Z" />
      <defs>
        <linearGradient id="sol-a" x1="22.302" x2="21.922" y1="24.324" y2="5.179" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00FFA3" />
          <stop offset="1" stopColor="#DC1FFF" />
        </linearGradient>
        <linearGradient id="sol-b" x1="17.959" x2="17.579" y1="26.565" y2="7.44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00FFA3" />
          <stop offset="1" stopColor="#DC1FFF" />
        </linearGradient>
        <linearGradient id="sol-c" x1="20.123" x2="19.742" y1="25.45" y2="6.319" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00FFA3" />
          <stop offset="1" stopColor="#DC1FFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function LitecoinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="size-5">
      <g fill="none" fillRule="evenodd">
        <circle cx="16" cy="16" r="16" fill="#bfbbbb" />
        <path fill="#fff" d="M10.427 19.214 9 19.768l.688-2.759 1.444-.58L13.213 8h5.129l-1.519 6.196 1.41-.571-.68 2.75-1.427.571-.848 3.483H23L22.127 24H9.252z" />
      </g>
    </svg>
  );
}

function BitcoinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="size-5">
      <circle cx="16" cy="16" r="16" fill="#F7931A" />
      <path fill="#fff" d="M23.189 14.02c.314-2.096-1.283-3.223-3.466-3.976l.708-2.836-1.728-.43-.69 2.76c-.454-.114-.92-.22-1.385-.326l.694-2.78L15.59 4l-.708 2.836c-.376-.086-.746-.17-1.108-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.23c.048.012.11.03.18.057l-.183-.045-1.13 4.524c-.086.213-.303.532-.793.411.018.026-1.256-.313-1.256-.313l-.86 1.984 2.25.561c.418.105.828.214 1.232.317l-.715 2.867 1.727.43.708-2.836c.472.128.93.247 1.378.359l-.706 2.822 1.728.43.715-2.86c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.384-1.588-4.192 1.13-.26 1.983-1.002 2.217-2.538zm-3.973 5.557c-.533 2.146-4.148.986-5.32.696l.948-3.797c1.172.293 4.929.873 4.372 3.101zm.534-5.572c-.487 1.953-3.495.96-4.472.716l.86-3.445c.977.244 4.118.7 3.612 2.729z" />
    </svg>
  );
}

function EthereumIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="size-5">
      <circle cx="16" cy="16" r="16" fill="#627EEA" />
      <g fill="#fff" fillRule="nonzero">
        <path fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z" />
        <path d="M16.498 4L9 16.22l7.498-3.35z" />
        <path fillOpacity=".602" d="M16.498 21.968v6.027L24 17.616z" />
        <path d="M16.498 27.995v-6.028L9 17.616z" />
        <path fillOpacity=".2" d="M16.498 20.573l7.497-4.353-7.497-3.348z" />
        <path fillOpacity=".602" d="M9 16.22l7.498 4.353v-7.701z" />
      </g>
    </svg>
  );
}

const cryptoIconComponents = {
  solana: SolanaIcon,
  litecoin: LitecoinIcon,
  bitcoin: BitcoinIcon,
  ethereum: EthereumIcon,
};

// Deterministically pick a crypto icon from the transaction id
function pickCryptoIcon(id) {
  const hash = (id || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return cryptoIcons[hash % cryptoIcons.length];
}

function MethodIcon({ method, id }) {
  if (method === "crypto_deposit" || method === "crypto_withdraw") {
    const Icon = cryptoIconComponents[pickCryptoIcon(id)];
    return Icon ? <Icon /> : null;
  }
  // Default: coin icon for rakeback, mm2, tips, affiliate
  return <img src="/coin.webp" alt="" className="bg-cover bg-center size-5" />;
}

function MethodLabel({ method }) {
  const label = methodLabels[method] || method.charAt(0).toUpperCase() + method.slice(1);
  return <p className="font-medium text-white uppercase">{label}</p>;
}

function StatusBadge({ status }) {
  const completed = status === "completed";
  const pending = status === "pending";
  const failed = status === "failed" || status === "declined";
  const cls = completed
    ? "bg-[#5CDF9A]/10 text-[#5CDF9A]"
    : pending
      ? "bg-[#F2BE66]/10 text-[#F2BE66]"
      : "bg-[#DF5C5C]/10 text-[#DF5C5C]";
  const text = completed ? "COMPLETED" : pending ? "PENDING" : failed ? "DECLINED" : status.toUpperCase();
  return (
    <div className={`inline-flex items-center px-2.75 py-1.25 rounded-[10px] text-sm font-semibold ${cls}`}>
      {text}
    </div>
  );
}

function ExternalLinkIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="size-5 text-accent group-hover:text-primary ml-auto">
      <g fill="currentColor">
        <path d="M6.22 8.72a.75.75 0 0 0 1.06 1.06l5.22-5.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0 0 1.5h1.69z" />
        <path d="M3.5 6.75c0-.69.56-1.25 1.25-1.25H7A.75.75 0 0 0 7 4H4.75A2.75 2.75 0 0 0 2 6.75v4.5A2.75 2.75 0 0 0 4.75 14h4.5A2.75 2.75 0 0 0 12 11.25V9a.75.75 0 0 0-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-4.5c-.69 0-1.25-.56-1.25-1.25z" />
      </g>
    </svg>
  );
}

function MethodFilterDropdown({ style, selectedFilter, onSelect }) {
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
          {methodOptions.map((option) => {
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

export default function TransactionsPanel() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(methodOptions[0]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDropdownStyle, setFilterDropdownStyle] = useState({});
  const filterTriggerRef = useRef(null);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        perPage: String(perPage),
        method: selectedFilter.id,
      });
      const response = await fetch(`/api/transactions?${params}`);
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Could not load transaction history.");
      }
      const payload = await response.json();
      setTransactions(payload.transactions || []);
      setTotal(payload.total || 0);
      setTotalPages(payload.totalPages || 1);
    } catch (err) {
      setError(err.message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, selectedFilter]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

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
        {/* Method filter dropdown */}
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

        {/* Transactions table */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="bg-[#283562]/65 rounded-xl p-5">
              <p className="text-sm font-medium text-accent">Loading transactions…</p>
            </div>
          ) : error ? (
            <div className="bg-[#283562]/65 rounded-xl p-5">
              <p className="text-sm font-medium text-[#DF5C5C]">{error}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="bg-[#283562]/65 rounded-xl p-5">
              <p className="text-sm font-medium text-accent">No transactions found.</p>
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
                          <th className="pb-2 pl-4" style={{ width: "25%" }}>
                            <div className="flex items-center text-sm font-medium">METHOD</div>
                          </th>
                          <th className="pb-2" style={{ width: "15%" }}>
                            <div className="flex items-center text-sm font-medium">STATUS</div>
                          </th>
                          <th className="pb-2" style={{ width: "20%" }}>
                            <div className="flex items-center text-sm font-medium">AMOUNT</div>
                          </th>
                          <th className="pb-2" style={{ width: "25%" }}>
                            <div className="flex items-center text-sm font-medium">DATE</div>
                          </th>
                          <th className="pb-2 pr-4" style={{ width: "15%" }}>
                            <div className="flex items-center text-sm font-medium" />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((tx) => (
                          <tr
                            key={tx.id}
                            className="align-middle outline-none text-left text-sm border-none [&_td]:bg-[#2F3F71]/50 hover:[&_td]:bg-[#28386A]/40 [&_td]:transition-colors [&_td]:duration-75 cursor-pointer group"
                          >
                            <td className="py-3 pl-4 rounded-l-xl">
                              <div className="flex items-center gap-2">
                                <div className="size-5 flex items-center justify-center shrink-0">
                                  <MethodIcon method={tx.method} id={tx.id} />
                                </div>
                                <MethodLabel method={tx.method} />
                              </div>
                            </td>
                            <td className="py-3">
                              <StatusBadge status={tx.status} />
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-1.5">
                                <img src="/coin.webp" alt="" className="bg-cover bg-center size-5 shrink-0" />
                                <span className="tabular-nums font-medium text-white">
                                  {formatNumber(tx.amount)}
                                </span>
                              </div>
                            </td>
                            <td className="py-3">
                              <p className="font-medium text-accent">{formatDate(tx.date)}</p>
                            </td>
                            <td className="py-3 pr-4 rounded-r-xl">
                              <div className="flex items-center justify-end">
                                <ExternalLinkIcon />
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
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path fill="none" stroke="currentColor" d="m15 18-6-6 6-6" />
                      </svg>
                    </button>
                    <button
                      className="p-0 disabled:opacity-40 transition-opacity"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
          <MethodFilterDropdown
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
