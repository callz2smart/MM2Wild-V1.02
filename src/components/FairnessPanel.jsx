import { useEffect, useState } from "react";

let cachedFairnessData = null;
let fairnessDataRequest = null;

async function requestFairnessData(force = false) {
  if (!force && cachedFairnessData) return cachedFairnessData;
  if (!force && fairnessDataRequest) return fairnessDataRequest;

  fairnessDataRequest = fetch("/api/fairness")
    .then(async (response) => {
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Could not load fairness data.");
      }
      return response.json();
    })
    .then((payload) => {
      cachedFairnessData = payload;
      return payload;
    })
    .finally(() => {
      fairnessDataRequest = null;
    });

  return fairnessDataRequest;
}

export function preloadFairnessData() {
  return requestFairnessData();
}

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be blocked; silently ignore.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="relative cursor-pointer outline-none flex select-none transition-opacity group/button w-7.75 h-8.5 ml-auto"
      aria-label="Copy to clipboard"
    >
      <div
        className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none"
        style={{ top: "var(--sb-shadow-size,3px)", backgroundColor: "rgb(15, 195, 101)" }}
      />
      <div
        className="font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 rounded-[7px]"
        style={{
          height: "calc(100% - var(--sb-shadow-size,3px))",
          backgroundColor: "rgb(92, 223, 154)",
          color: "rgb(58, 56, 105)",
        }}
      >
        <div
          className="transition-opacity flex items-center justify-center size-full"
          style={{ filter: "drop-shadow(rgb(15, 195, 101) 0px 2px 0px)" }}
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5">
              <path
                fill="currentColor"
                d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
              />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5">
              <g fill="none">
                <path d="m12.593 23.258-.011.002-.071.035-.02.004-.014-.004-.071-.035q-.016-.005-.024.005l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427q-.004-.016-.017-.018m.265-.113-.013.002-.185.093-.01.01-.003.011.018.43.005.012.008.007.201.093q.019.005.029-.008l.004-.014-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014-.034.614q.001.018.017.024l.015-.002.201-.093.01-.008.004-.011.017-.43-.003-.012-.01-.01z" />
                <path
                  fill="currentColor"
                  d="M19 2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2V4a2 2 0 0 1 2-2zm-9 13H8a1 1 0 0 0-.117 1.993L8 17h2a1 1 0 0 0 .117-1.993zm9-11H9v2h6a2 2 0 0 1 2 2v8h2zm-7 7H8a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2"
                />
              </g>
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}

function ReadOnlyField({ label, value, mono = false, tall = false }) {
  return (
    <div className="flex flex-col flex-1">
      <p className="font-medium text-sm text-accent mb-1.75">{label}</p>
      <div
        className={`bg-[#151C35] rounded-[10px] p-2 pl-3 flex items-center gap-2 min-w-0 max-w-full ${
          tall ? "h-12.5" : ""
        }`}
      >
        <input
          className={`font-medium text-sm flex-1 min-w-0 max-w-full outline-none bg-transparent ${
            mono ? "font-mono" : ""
          }`}
          readOnly
          value={value || ""}
        />
        <CopyButton value={value} />
      </div>
    </div>
  );
}

function GoldButton({ children, onClick, disabled, fullWidth }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative cursor-pointer outline-none flex select-none transition-opacity group/button h-11 shrink-0 ${
        disabled ? "pointer-events-none opacity-50" : ""
      } ${fullWidth ? "w-full sm:w-auto" : ""}`}
    >
      <div
        className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none"
        style={{ top: "var(--sb-shadow-size,3px)", backgroundColor: "rgb(211, 133, 2)" }}
      />
      <div
        className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 px-3 whitespace-nowrap"
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
          {children}
        </div>
      </div>
    </button>
  );
}

export default function FairnessPanel() {
  const [data, setData] = useState(() => cachedFairnessData);
  const [loading, setLoading] = useState(() => !cachedFairnessData);
  const [error, setError] = useState("");
  const [newClientSeed, setNewClientSeed] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const loadFairness = async (force = false) => {
    setLoading(true);
    try {
      const payload = await requestFairnessData(force);
      setData(payload);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!data) loadFairness();
  }, []);

  const handleChangeClientSeed = async (event) => {
    event.preventDefault();
    const trimmed = newClientSeed.trim();
    if (trimmed.length < 4) return;
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      const response = await fetch("/api/fairness/client-seed", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clientSeed: trimmed }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "Could not change client seed.");
      setData((current) => {
        const nextData = { ...current, ...payload };
        cachedFairnessData = nextData;
        return nextData;
      });
      setNewClientSeed("");
      setActionSuccess("Client seed updated.");
      setTimeout(() => setActionSuccess(""), 2500);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRotateServerSeed = async () => {
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      const response = await fetch("/api/fairness/rotate", { method: "POST" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "Could not rotate server seed.");
      cachedFairnessData = payload;
      setData(payload);
      setActionSuccess("Server seed rotated. The previous seed is now revealed.");
      setTimeout(() => setActionSuccess(""), 3500);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const canChangeSeed =
    newClientSeed.trim().length >= 4 && !loading && !actionLoading;

  return (
    <div className="bg-[#283562]/65 rounded-xl p-5 flex flex-col gap-4">
      {/* Current seed information */}
      <div className="flex flex-col gap-4">
        <ReadOnlyField
          label="SERVER SEED (HASHED)"
          value={data?.serverSeedHash || ""}
          mono
          tall
        />
        <div className="flex flex-col sm:flex-row gap-4">
          <ReadOnlyField label="CLIENT SEED" value={data?.clientSeed || ""} mono />
          <ReadOnlyField
            label="GAMES PLAYED WITH THIS SEED"
            value={String(data?.gamesPlayed ?? 0)}
            tall
          />
        </div>
      </div>

      {/* Change client seed */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col">
          <h5 className="font-semibold">NEW CLIENT SEED</h5>
          <p className="text-accent text-sm font-medium">
            Change the outcome of rolls generated with your server seed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#151C35] w-full sm:w-auto rounded-[10px] p-2 pl-3 flex items-center gap-2 min-w-0 max-w-full h-12">
            <input
              value={newClientSeed}
              onChange={(event) => setNewClientSeed(event.target.value)}
              className="font-medium text-sm flex-1 min-w-0 sm:min-w-64 max-w-full outline-none bg-transparent placeholder:text-accent/50"
              placeholder="Enter a new client seed (min 4 characters)"
              maxLength={64}
            />
          </div>
          <GoldButton onClick={handleChangeClientSeed} disabled={!canChangeSeed}>
            CHANGE
          </GoldButton>
        </div>
      </div>

      <div className="bg-accent/15 rounded-full h-0.5" />

      {/* Rotate server seed */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col">
          <h5 className="font-semibold">Rotate server seed</h5>
          <p className="text-accent text-sm font-medium">
            You can do this to reveal the non-hashed server seed in your previous games.
          </p>
        </div>
        <GoldButton
          onClick={handleRotateServerSeed}
          disabled={loading || actionLoading}
          fullWidth
        >
          ROTATE SERVER SEED
        </GoldButton>
      </div>

      {/* Previous (revealed) seed */}
      {data?.previousSeed && (
        <div className="flex flex-col gap-4 pt-2">
          <div className="bg-accent/15 rounded-full h-0.5" />
          <div className="flex flex-col gap-2">
            <h5 className="font-semibold text-[#E5AD4E]">PREVIOUS SEED (REVEALED)</h5>
            <p className="text-accent text-sm font-medium">
              You can verify that the hashed server seed matched this revealed seed.
            </p>
          </div>
          <ReadOnlyField
            label="SERVER SEED (REVEALED)"
            value={data.previousSeed.serverSeed}
            mono
            tall
          />
          <div className="flex flex-col sm:flex-row gap-4">
            <ReadOnlyField
              label="SERVER SEED HASH"
              value={data.previousSeed.serverSeedHash}
              mono
            />
            <ReadOnlyField
              label="GAMES PLAYED"
              value={String(data.previousSeed.gamesPlayed ?? 0)}
              tall
            />
          </div>
        </div>
      )}

      {/* Status messages */}
      {(error || actionError || actionSuccess) && (
        <p
          className={`text-sm font-medium ${
            error || actionError ? "text-[#DF5C5C]" : "text-[#5CDF9A]"
          }`}
        >
          {error || actionError || actionSuccess}
        </p>
      )}
      {error && (
        <GoldButton onClick={() => loadFairness(true)} disabled={loading}>
          RETRY
        </GoldButton>
      )}
    </div>
  );
}
