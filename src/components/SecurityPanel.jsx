import { useEffect, useState, useCallback } from "react";

const truncateIp = (ip, max = 18) => {
  if (!ip) return "—";
  return ip.length > max ? `${ip.slice(0, max)}…` : ip;
};

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

function RevokeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 16" className="size-5">
      <path
        fill="currentColor"
        d="M12.665 11.517a1 1 0 0 1 .008 1.414 6.963 6.963 0 0 1-4.986 2.082 6.967 6.967 0 0 1-4.96-2.054A6.967 6.967 0 0 1 .674 8c0-1.873.73-3.635 2.055-4.96A6.967 6.967 0 0 1 7.687.988c1.888 0 3.658.739 4.986 2.082a1 1 0 0 1-1.422 1.406 4.977 4.977 0 0 0-3.564-1.488A5.02 5.02 0 0 0 2.673 8a5.02 5.02 0 0 0 5.014 5.013c1.35 0 2.615-.528 3.564-1.488a1 1 0 0 1 1.414-.008Zm3.37-4.224L14.07 5.33a1 1 0 1 0-1.414 1.414l.256.256H7.687a1 1 0 1 0 0 2h5.226l-.256.256a1 1 0 1 0 1.414 1.414l1.963-1.963a1 1 0 0 0 0-1.414Z"
      />
    </svg>
  );
}

function FlagIcon({ countryCode, countryName }) {
  const code = (countryCode || "us").toLowerCase();
  return (
    <img
      src={`https://flagcdn.com/w20/${code}.png`}
      alt={countryName || countryCode}
      className="w-5 h-auto rounded-[3px]"
    />
  );
}

export default function SecurityPanel() {
  const [sessions, setSessions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), perPage: String(perPage) });
      const response = await fetch(`/api/sessions?${params}`);
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Could not load sessions.");
      }
      const payload = await response.json();
      setSessions(payload.sessions || []);
      setTotal(payload.total || 0);
      setTotalPages(payload.totalPages || 1);
    } catch (err) {
      setError(err.message);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  return (
    <div className="relative">
      <div className="flex flex-col gap-4">
        {/* 2FA section */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col">
            <h5 className="font-semibold">Two-Factor Authentication (2FA)</h5>
            <p className="text-accent text-sm font-medium">
              Add an extra layer of security to your account with an authenticator app.
            </p>
          </div>
          <button className="relative cursor-pointer outline-none flex select-none transition-opacity group/button h-11 shrink-0">
            <div
              className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none"
              style={{ top: "var(--sb-shadow-size,3px)", backgroundColor: "rgb(211, 133, 2)" }}
            />
            <div
              className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 w-full sm:w-auto px-3 whitespace-nowrap"
              style={{
                height: "calc(100% - var(--sb-shadow-size,3px))",
                backgroundColor: "rgb(243, 178, 57)",
                color: "rgb(58, 56, 105)",
              }}
            >
              <div
                className="transition-opacity flex items-center justify-center size-full"
                style={{ filter: "drop-shadow(rgb(211, 133, 2) 0px 2px 0px)" }}
              >
                ENABLE 2FA
              </div>
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="bg-accent/15 rounded-full h-0.5" />

        {/* Sessions table */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="bg-[#283562]/65 rounded-xl p-5">
              <p className="text-sm font-medium text-accent">Loading sessions…</p>
            </div>
          ) : error ? (
            <div className="bg-[#283562]/65 rounded-xl p-5">
              <p className="text-sm font-medium text-[#DF5C5C]">{error}</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-[#283562]/65 rounded-xl p-5">
              <p className="text-sm font-medium text-accent">No sessions found.</p>
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
                            <div className="flex items-center text-sm font-medium">BROWSER</div>
                          </th>
                          <th className="pb-2" style={{ width: "18%" }}>
                            <div className="flex items-center text-sm font-medium">IP ADDRESS</div>
                          </th>
                          <th className="pb-2" style={{ width: "18%" }}>
                            <div className="flex items-center text-sm font-medium">LOCATION</div>
                          </th>
                          <th className="pb-2" style={{ width: "25%" }}>
                            <div className="flex items-center text-sm font-medium">LAST ACTIVE</div>
                          </th>
                          <th className="pb-2 pr-4" style={{ width: "14%" }}>
                            <div className="flex items-center text-sm font-medium" />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map((session) => (
                          <tr
                            key={session.id}
                            className="align-middle outline-none text-left text-sm border-none [&_td]:bg-[#2F3F71]/50 hover:[&_td]:bg-[#28386A]/40 [&_td]:transition-colors [&_td]:duration-75"
                          >
                            <td className="py-4.25 pl-4 rounded-l-xl">
                              <p className="font-medium">
                                <span className="text-white">{session.browser}</span>
                                <span className="text-accent"> ({session.os})</span>
                              </p>
                            </td>
                            <td className="py-4.25">
                              <p className="font-medium text-white" title={session.ipAddress}>{truncateIp(session.ipAddress)}</p>
                            </td>
                            <td className="py-4.25">
                              <div className="flex items-center gap-2">
                                <FlagIcon
                                  countryCode={session.countryCode}
                                  countryName={session.countryName}
                                />
                                <p className="font-medium text-white">
                                  {session.countryName}, {session.countryCode?.toUpperCase()}
                                </p>
                              </div>
                            </td>
                            <td className="py-4.25">
                              {session.isCurrent ? (
                                <p className="font-medium" style={{ color: "rgb(92, 223, 154)" }}>
                                  Current Session
                                </p>
                              ) : (
                                <p className="font-medium text-white">
                                  {formatDate(session.lastActive)}
                                </p>
                              )}
                            </td>
                            <td className="py-4.25 pr-4 rounded-r-xl">
                              <div className="flex items-center justify-end">
                                <button
                                  className="text-[#DF5C5C] disabled:opacity-50 transition-opacity flex items-center justify-center hover:opacity-80"
                                  disabled={session.isCurrent}
                                >
                                  <RevokeIcon />
                                </button>
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
                      data-state="closed"
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
                    {start} - {end} of {total}
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
    </div>
  );
}
