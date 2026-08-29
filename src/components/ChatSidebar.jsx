import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { showNotification } from "./NotificationCenter";

const TURNSTILE_PRODUCTION_SITE_KEY = "0x4AAAAAACO5aJWBw_BqLmoe";
const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";
let turnstileScriptPromise;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstileScriptPromise) return turnstileScriptPromise;

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-mm2wild-turnstile="true"]');
    const script = existingScript || document.createElement("script");
    const handleLoad = () => window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile failed to initialize"));
    const handleError = () => reject(new Error("Turnstile failed to load"));

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!existingScript) {
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.mm2wildTurnstile = "true";
      document.head.appendChild(script);
    }
  });

  return turnstileScriptPromise;
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
      <path fill="none" stroke="currentColor" d="M20 4 4 20M4 4l16 16" />
    </svg>
  );
}

function TipIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4.5 mr-1.5">
      <path fill="currentColor" d="M16 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5m5.45 5.6c-.39-.4-.88-.6-1.45-.6h-7l-2.08-.73.33-.94L13 16h2.8c.35 0 .63-.14.86-.37s.34-.51.34-.82c0-.54-.26-.91-.78-1.12L8.95 11H7v9l7 2 8.03-3c.01-.53-.19-1-.58-1.4M5 11H.984v11H5z" />
    </svg>
  );
}

function ProfileModal({ user, name, onClose, closing }) {
  if (!user) return null;
  const profile = user;

  const backdropClass = closing
    ? "fixed inset-0 bg-[#151D3E]/70 flex items-center justify-center [animation:fadeOut_0.1s_ease_forwards]"
    : "fixed inset-0 bg-[#151D3E]/70 flex items-center justify-center [animation:fadeIn_0.1s_ease_forwards]";

  const dialogClass = closing
    ? "fixed left-1/2 top-1/2 w-full outline-none flex flex-col [animation:zoomOut_0.1s_ease_forwards]"
    : "fixed left-1/2 top-1/2 w-full outline-none flex flex-col [animation:zoomIn_0.1s_ease_forwards]";

  return createPortal(
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes zoomIn { from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        @keyframes zoomOut { from { opacity: 1; transform: translate(-50%, -50%) scale(1); } to { opacity: 0; transform: translate(-50%, -50%) scale(0.95); } }
        .profile-dialog { transform: translate(-50%, -50%); }
      `}</style>
      <div
        className={backdropClass}
        style={{ zIndex: 9998, pointerEvents: "auto" }}
        onClick={onClose}
      />
      <div
        className={`${dialogClass} profile-dialog`}
        style={{
          maxWidth: "min(100dvw - 24px, 560px)",
          maxHeight: "calc(100% - 24px)",
          zIndex: 9999,
          pointerEvents: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#1D284E] rounded-2xl shadow-lg flex flex-col gap-5.5 max-h-[calc(100vh-24px)] overflow-hidden">
          <div className="relative flex flex-col gap-5.5 max-h-full overflow-y-auto p-4.5 sm:p-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-primary/80">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold flex items-center gap-2">USER PROFILE</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-accent ml-auto cursor-pointer hover:text-white transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Divider */}
            <div className="w-full h-0.5 bg-[#2F3C68] rounded-full shrink-0" />

            {/* Avatar + name + tip button */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div
                className="size-27 p-0.75 rounded-3xl flex flex-col items-center relative bg-linear-to-b from-(--level-border-start) from-5% to-(--level-border-end)"
                style={{
                  "--level-border-start": "#27243c",
                  "--level-border-end": profile.color || "#F33939",
                  "--level-text": profile.color || "#F33939",
                }}
              >
                <div
                  className="size-full flex items-center justify-center rounded-[21px]"
                  style={{ backgroundColor: "rgb(26, 34, 60)" }}
                >
                  <img
                    src={profile.avatar}
                    className="size-9/12 object-contain object-center no-interaction rounded-xl"
                    alt=""
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="flex flex-col flex-1 justify-center gap-3 w-full sm:w-auto">
                <div className="flex flex-col gap-0.5 items-center sm:items-start">
                  <p className="text-sm font-medium text-accent leading-none">Profile Of</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="bg-gradient-to-b from-(--level-border-start) to-(--level-border-end) p-0.5 rounded-lg"
                      style={{
                        "--level-border-start": "#343656",
                        "--level-border-end": profile.color || "#F33939",
                        "--level-text": profile.color || "#F33939",
                      }}
                    >
                      <div
                        className="size-full flex items-center justify-center font-medium !leading-none text-(--level-text) px-1.25 py-0.75 text-sm rounded-md"
                        style={{ backgroundColor: "rgb(38, 52, 87)" }}
                      >
                        {profile.level}
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold leading-none">{name}</h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="relative cursor-pointer outline-none flex select-none transition-opacity group/button h-10.5 flex-1">
                    <div
                      className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none"
                      style={{ top: "var(--sb-shadow-size,3px)", backgroundColor: "rgb(211, 133, 2)" }}
                    />
                    <div
                      className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0"
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
                        <TipIcon />
                        <span>TIP USER</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#283562] rounded-xl p-4 px-5 flex flex-col gap-0.5 shadow-[0_6px_0_#1B2440]">
                <p className="text-sm font-medium text-accent">Total Bets</p>
                <p className="text-lg font-semibold leading-none">0</p>
              </div>
              <div className="bg-[#283562] rounded-xl p-4 px-5 flex flex-col gap-0.5 shadow-[0_6px_0_#1B2440]">
                <p className="text-sm font-medium text-accent">Games Won</p>
                <p className="text-lg font-semibold leading-none">0</p>
              </div>
              <div className="bg-[#283562] rounded-xl p-4 px-5 flex flex-col gap-0.5 shadow-[0_6px_0_#1B2440]">
                <p className="text-sm font-medium text-accent">Total Deposited</p>
                <div className="flex items-center gap-1.5">
                  <img src="/coin.webp" className="bg-cover bg-center size-4.5" />
                  <span className="tabular-nums text-lg font-semibold leading-none">0</span>
                </div>
              </div>
              <div className="bg-[#283562] rounded-xl p-4 px-5 flex flex-col gap-0.5 shadow-[0_6px_0_#1B2440]">
                <p className="text-sm font-medium text-accent">Total Wagered</p>
                <div className="flex items-center gap-1.5">
                  <img src="/coin.webp" className="bg-cover bg-center size-4.5" />
                  <span className="tabular-nums text-lg font-semibold leading-none">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

function ChatIcon({ className = "size-5" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      className={className}
    >
      <path
        fill="currentColor"
        d="M1 6a5 5 0 1 1 2.59 4.382l-1.944.592a.5.5 0 0 1-.624-.624l.592-1.947A5 5 0 0 1 1 6m3-.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 0-1h-3a.5.5 0 0 0-.5.5M4.5 7a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1z"
      />
    </svg>
  );
}

function TipRainModal({ onClose, onSubmit }) {
  const [dialogState, setDialogState] = useState("open");
  const [amount, setAmount] = useState("");
  const closeTimerRef = useRef(null);

  const requestClose = useCallback(() => {
    if (dialogState === "closed") return;
    setDialogState("closed");
    closeTimerRef.current = window.setTimeout(onClose, 200);
  }, [dialogState, onClose]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const value = parseInt(amount, 10);
    if (!value || value <= 0) return;
    onSubmit(value);
    requestClose();
  };

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [requestClose]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    },
    [],
  );

  return (
    <div
      className="fixed inset-0 z-[9998] bg-[#0C1535]/65 transition-opacity duration-200 data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0"
      data-state={dialogState}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div
        data-dismissable-layer=""
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tip-rain-dialog-title"
        data-state={dialogState}
        className="dialog-content fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full outline-none flex flex-col duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
        style={{
          maxWidth: "min(100dvw - 24px, 480px)",
          maxHeight: "calc(100% - 24px)",
          zIndex: 9999,
          pointerEvents: "auto",
        }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div data-v-8ead2f23="" className="bg-[#1D284E] rounded-2xl shadow-lg flex flex-col gap-5.5 max-h-[calc(100vh-24px)] overflow-hidden relative">
          <form
            className="flex flex-col items-center gap-5.5 max-h-full overflow-y-auto p-4.5 sm:p-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-primary/80"
            onSubmit={handleSubmit}
          >
            <div className="absolute left-1/2 h-12 w-32 blur-3xl -translate-x-1/2 -top-3 rounded-lg bg-[#FFC055]/70" />
            <div className="size-17 bg-[#FFC055]/10 text-[#FFC055] flex items-center justify-center rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-10 drop-shadow-[0_2px_0_#826432]">
                <path fill="currentColor" d="M16 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5m5.45 5.6c-.39-.4-.88-.6-1.45-.6h-7l-2.08-.73.33-.94L13 16h2.8c.35 0 .63-.14.86-.37s.34-.51.34-.82c0-.54-.26-.91-.78-1.12L8.95 11H7v9l7 2 8.03-3c.01-.53-.19-1-.58-1.4M5 11H.984v11H5z" />
              </svg>
            </div>
            <h2 id="tip-rain-dialog-title" className="text-xl font-bold">Tip Rain</h2>
            <div className="w-full h-0.75 bg-[#445696]/35 rounded-full" />
            <div className="w-full">
              <label htmlFor="tip-rain-amount" className="text-sm font-semibold text-accent mb-1.75 block w-fit uppercase">AMOUNT</label>
              <div className="w-full relative flex group rounded-lg items-center justify-center bg-[#0F1222]/55 h-11 px-3">
                <div className="absolute inset-0.25 ring-2 ring-transparent rounded-lg transition-shadow pointer-events-none" />
                <img src="/coin.webp" alt="" className="bg-cover bg-center size-5 shrink-0 my-auto" />
                <input
                  id="tip-rain-amount"
                  type="text"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value.replace(/[^0-9.]/g, ""))}
                  placeholder="Enter amount..."
                  className="bg-transparent outline-none size-full font-medium peer text-[15px] placeholder:text-accent pl-2"
                  inputMode="decimal"
                />
              </div>
            </div>
            <button type="submit" className="relative cursor-pointer outline-none flex select-none transition-opacity group/button h-10.5 w-full">
              <div className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none" style={{ top: "var(--sb-shadow-size,3px)", backgroundColor: "rgb(211, 133, 2)" }} />
              <div className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0" style={{ height: "calc(100% - var(--sb-shadow-size,3px))", backgroundColor: "rgb(243, 178, 57)", color: "rgb(58, 56, 105)" }}>
                <div className="transition-opacity flex items-center justify-center size-full" style={{ filter: "drop-shadow(rgb(211, 133, 2) 0px 2px 0px)" }}>TIP RAIN</div>
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function RainVerificationModal({ onClose, onVerified }) {
  const [dialogState, setDialogState] = useState("open");
  const [challengeError, setChallengeError] = useState(false);
  const challengeRef = useRef(null);
  const widgetIdRef = useRef(null);
  const closeTimerRef = useRef(null);
  const isClosingRef = useRef(false);

  const requestClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setDialogState("closed");
    closeTimerRef.current = window.setTimeout(onClose, 200);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    const hostname = window.location.hostname;
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
    const sitekey = import.meta.env.CLOUDFLARED_TURNSTILE_SITE_KEY || (isLocal ? TURNSTILE_TEST_SITE_KEY : TURNSTILE_PRODUCTION_SITE_KEY);

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !challengeRef.current) return;
        widgetIdRef.current = turnstile.render(challengeRef.current, {
          sitekey,
          action: "rain_join",
          theme: "dark",
          size: "flexible",
          callback: (token) => {
            if (cancelled || isClosingRef.current) return;
            onVerified(token);
            requestClose();
          },
          "error-callback": () => setChallengeError(true),
          "expired-callback": () => setChallengeError(false),
        });
      })
      .catch(() => {
        if (!cancelled) setChallengeError(true);
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      window.clearTimeout(closeTimerRef.current);
    };
  }, [onVerified, requestClose]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [requestClose]);

  return (
    <div
      className="fixed inset-0 z-[9998] bg-[#0C1535]/65 transition-opacity duration-200 data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0"
      data-state={dialogState}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rain-verification-dialog-title"
        data-state={dialogState}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full outline-none flex flex-col duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
        style={{ maxWidth: "min(100dvw - 24px, 440px)", maxHeight: "calc(100% - 24px)", zIndex: 9999 }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="bg-[#1D284E] rounded-2xl shadow-lg max-h-[calc(100vh-24px)] overflow-hidden relative">
          <div className="relative flex flex-col gap-5.5 max-h-full overflow-y-auto p-4.5 sm:p-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-primary/80">
            <div className="flex items-center justify-between gap-2">
              <h2 id="rain-verification-dialog-title" className="text-xl font-bold flex items-center gap-2">Verify you are human</h2>
              <button type="button" className="text-accent ml-auto cursor-pointer" aria-label="Close" onClick={requestClose}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
                  <path fill="none" stroke="currentColor" d="M20 4 4 20M4 4l16 16" />
                </svg>
              </button>
            </div>
            <div className="flex justify-center">
              <div className="h-16 rounded-xl bg-[#28386A]/30 w-full flex items-center justify-center overflow-hidden">
                <div ref={challengeRef} className="text-center w-full" />
              </div>
            </div>
            {challengeError && <p role="alert" className="text-sm font-medium text-error text-center">Unable to load verification. Please try again.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function RainPot({ onTip, onJoin, rain }) {
  const isJoining = rain.phase === "joining";
  return (
    <div
      className="flex flex-col top-0 left-3 right-3 rounded-xl absolute z-10 overflow-hidden p-3.5 shadow-xl min-h-[80px]"
      style={{
        background:
          "radial-gradient(84% 582% at 100% 50%, rgba(229,173,78,.45) 0%, rgba(54,70,119,0) 100%), rgb(54,70,119)",
        boxShadow: "rgba(0,0,0,.3) 0 10px 12.8px, rgb(34,50,101) 0 4px 0",
      }}
    >
      <img
        src="/falling-coins.webp"
        alt=""
        className="size-28 object-contain absolute right-0 -top-1 pointer-events-none"
      />
      <img
        src="/simple-leafs.webp"
        alt=""
        className="size-38 object-contain absolute right-6 -bottom-12 pointer-events-none"
      />
      <div className="left-0 right-0 absolute bottom-0 h-1 bg-[#667297] z-10">
        <div
          className="bg-[#E5AD4E] h-full transition-[width] duration-1000"
          style={{ width: `${rain.progress}%` }}
        />
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-2 z-20">
        {isJoining && (
          <div className="bg-[#223263] px-1.5 py-1 text-xs font-medium rounded-md flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4">
              <path fill="currentColor" d="M12 4a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4" />
            </svg>
            <p>{rain.participantCount ?? 0}</p>
          </div>
        )}
        <div className="bg-[#223263] px-1.5 py-1 text-xs font-medium rounded-md flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="size-4"
          >
            <path
              fill="currentColor"
              d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2m4.2 14.2L11 13V7h1.5v5.2l4.5 2.7z"
            />
          </svg>
          <p>{rain.countdown}</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 relative z-10">
        <p className="text-sm font-semibold text-white">{isJoining ? "IT'S RAINING!" : "RAIN POT"}</p>
        <div className="flex gap-2">
          <div className="h-8.5 relative">
            <div className="absolute top-1/2 left-0 right-0 bottom-0 bg-[#191840] rounded-lg" />
            <div className="flex items-center gap-1.5 px-3 py-1.5 h-[calc(100%-3px)] bg-[#27376A] text-white text-sm rounded-lg relative">
              <img
                src="/coin.webp"
                alt=""
                className="bg-cover bg-center size-4.5"
              />
              <span className="font-semibold">{rain.pool}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onTip}
            className="relative cursor-pointer outline-none flex select-none transition-opacity group/button w-7.75 h-8.5"
            aria-label="Tip rain"
          >
            <div
              className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none"
              style={{
                top: "var(--sb-shadow-size,3px)",
                backgroundColor: "rgb(15,195,101)",
              }}
            />
            <div
              className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0"
              style={{
                height: "calc(100% - var(--sb-shadow-size,3px))",
                backgroundColor: "rgb(92,223,154)",
                color: "rgb(58,56,105)",
              }}
            >
              <div
                className="transition-opacity flex items-center justify-center size-full"
                style={{ filter: "drop-shadow(rgb(15,195,101) 0 2px 0)" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="size-5"
                >
                  <path
                    fill="currentColor"
                    d="M16 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5m5.45 5.6c-.39-.4-.88-.6-1.45-.6h-7l-2.08-.73.33-.94L13 16h2.8c.35 0 .63-.14.86-.37s.34-.51.34-.82c0-.54-.26-.91-.78-1.12L8.95 11H7v9l7 2 8.03-3c.01-.53-.19-1-.58-1.4M5 11H.984v11H5z"
                  />
                </svg>
              </div>
            </div>
          </button>
          {isJoining && (
            <button
              type="button"
              onClick={onJoin}
              disabled={rain.joined}
              className="relative cursor-pointer disabled:cursor-default outline-none flex select-none transition-opacity group/button h-8.5"
            >
              <div
                className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none"
                style={{
                  top: "var(--sb-shadow-size,3px)",
                  backgroundColor: "rgb(15,195,101)",
                }}
              />
              <div
                className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 px-3"
                style={{
                  height: "calc(100% - var(--sb-shadow-size,3px))",
                  backgroundColor: "rgb(92,223,154)",
                  color: "rgb(58,56,105)",
                }}
              >
                <div
                  className="transition-opacity flex items-center justify-center size-full"
                  style={{ filter: "drop-shadow(rgb(15,195,101) 0 2px 0)" }}
                >
                  {rain.joined ? "JOINED" : "JOIN"}
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatMessage({
  name,
  body,
  time,
  user,
  reply,
  onProfileClick,
  onReply,
  animate = false,
}) {
  if (!user) return null;
  const profile = user;
  return (
    <div
      className={`relative flex flex-col group/message ${
        animate ? "chat-message-enter" : ""
      }`}
      data-highlight="false"
    >
      <div className="flex gap-1.75 relative group z-1">
        <div
          className="size-10 rounded-[9px] cursor-pointer flex shrink-0 flex-col items-center relative bg-linear-to-b from-[#1D2A53] from-5% p-0.5"
          style={{ "--tw-gradient-to": profile.color }}
          onClick={() => onProfileClick?.(name, user)}
        >
          <div className="size-full flex items-center justify-center rounded-[7px] bg-[#1A2339]">
            <img
              src={profile.avatar}
              className="size-9/12 object-contain object-center no-interaction rounded"
              alt=""
              loading="lazy"
            />
          </div>
        </div>
        <div className="flex flex-col flex-1 min-w-0 gap-0.75">
          <div className="flex items-center min-w-0">
            <div
              className="p-0.5 rounded-[5px]"
              style={{
                background: `linear-gradient(${profile.color}55, ${profile.color})`,
              }}
            >
              <div
                className="flex items-center justify-center font-medium !leading-none px-1 py-0.25 text-[11px] rounded-[3px] bg-[#263457]"
                style={{ color: profile.color }}
              >
                {profile.level}
              </div>
            </div>
            <span
              className="font-semibold text-[13px] ml-1 cursor-pointer truncate hover:text-primary transition-colors"
              onClick={() => onProfileClick?.(name, user)}
            >
              {name}
            </span>
            <p className="text-[13px] font-semibold ml-auto pl-1 text-accent">
              {time}
            </p>
          </div>
          <div className="message-body p-1.75 rounded-lg bg-[#223263]">
            {reply && (
              <div className="mb-1 flex min-w-0 items-center gap-1 text-[11px] text-accent/75">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="size-3.5 -scale-x-100 shrink-0 text-primary"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                >
                  <g fill="none" stroke="currentColor">
                    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                    <path d="m9 17-5-5 5-5" />
                  </g>
                </svg>
                <p className="min-w-0 truncate font-medium">
                  <span className="font-semibold text-white">@{reply.name}:</span>{" "}
                  {reply.body}
                </p>
              </div>
            )}
            <div className="text-sm font-medium text-accent [word-break:break-word]">
              <span>{body}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          aria-label={`Reply to ${name}`}
          onClick={() => onReply?.({ name, body })}
          className="cursor-pointer flex items-center justify-center group-hover:opacity-100 group-hover:translate-x-0 translate-x-2 opacity-0 transition-all duration-175 bg-[#31478D] hover:bg-[#3B54A4] size-6.5 rounded-md absolute right-0 top-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="size-4 text-accent"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          >
            <g fill="none" stroke="currentColor">
              <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
              <path d="m9 17-5-5 5-5" />
            </g>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function ChatSidebar() {
  const [message, setMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineCount, setOnlineCount] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isTipRainOpen, setIsTipRainOpen] = useState(false);
  const [isRainVerificationOpen, setIsRainVerificationOpen] = useState(false);
  const [profileModal, setProfileModal] = useState(null);
  const [modalClosing, setModalClosing] = useState(false);
  const [rainState, setRainState] = useState({
    pool: 300,
    countdown: "58:30",
    progress: 100,
    phase: "active",
    participantCount: 0,
    joined: false,
  });
  const socketRef = useRef(null);
  const viewportRef = useRef(null);
  const inputRef = useRef(null);

  useLayoutEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const updateLayout = () => {
      document.documentElement.style.setProperty(
        "--layout-left",
        desktopQuery.matches && isChatOpen ? "320px" : "0px",
      );
    };

    updateLayout();
    desktopQuery.addEventListener("change", updateLayout);
    return () => {
      desktopQuery.removeEventListener("change", updateLayout);
      document.documentElement.style.removeProperty("--layout-left");
    };
  }, [isChatOpen]);

  const showSlowModeNotification = useCallback(() => {
    showNotification({
      type: "error",
      title: "Uh-oh, Error!",
      message: "Slow mode is enabled. Please wait before sending another message",
      duration: 6000,
    });
  }, []);

  const closeRainVerification = useCallback(() => {
    setIsRainVerificationOpen(false);
  }, []);

  const completeRainVerification = useCallback((turnstileToken) => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "rain_join", turnstileToken }));
    }
  }, []);

  const openProfile = (name, user) => {
    if (!user) return;
    setModalClosing(false);
    setProfileModal({ name, user });
  };

  const closeProfile = () => {
    if (!profileModal || modalClosing) return;
    setModalClosing(true);
    setTimeout(() => {
      setProfileModal(null);
      setModalClosing(false);
    }, 100);
  };

  useEffect(() => {
    if (!profileModal) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeProfile();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [profileModal, modalClosing]);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const clientIdKey = "mm2wild_chat_client_id";
    let clientId = sessionStorage.getItem(clientIdKey);
    if (!clientId) {
      clientId = crypto.randomUUID();
      sessionStorage.setItem(clientIdKey, clientId);
    }
    const socketUrl = `${protocol}//${window.location.host}/api/chat?clientId=${encodeURIComponent(clientId)}`;
    let disposed = false;
    let reconnectTimer = null;

    const handleMessage = (event) => {
      let payload;
      try {
        payload = JSON.parse(event.data);
      } catch {
        return;
      }
      if (payload.type === "init") {
        setMessages(payload.messages || []);
        setOnlineCount(payload.online ?? 0);
        if (payload.rain) setRainState(payload.rain);
      } else if (payload.type === "rain") {
        setRainState((current) => ({
          ...payload,
          joined: payload.rainId === current.rainId ? current.joined : false,
        }));
      } else if (payload.type === "rain_joined") {
        setRainState((current) =>
          current.rainId === payload.rainId ? { ...current, joined: true } : current,
        );
      } else if (payload.type === "chat") {
        setMessages((current) => [
          ...current,
          {
            name: payload.name,
            body: payload.body,
            time: payload.time,
            user: payload.user,
            reply: payload.reply,
            animate: true,
          },
        ]);
      } else if (payload.type === "presence") {
        setOnlineCount(payload.online ?? 0);
      } else if (payload.type === "error") {
        setMessage("");
        const errorMessage = (payload.error || "").toLowerCase();
        if (
          errorMessage.includes("slow mode") ||
          errorMessage.includes("slow down")
        ) {
          showSlowModeNotification();
          return;
        }
        const input = document.activeElement;
        if (input && input.placeholder !== undefined) {
          const original = input.placeholder;
          input.placeholder = payload.error || "Something went wrong.";
          setTimeout(() => {
            if (input) input.placeholder = original;
          }, 2500);
        }
      }
    };

    const connect = () => {
      if (disposed) return;
      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.addEventListener("open", () => setConnected(true));
      socket.addEventListener("message", handleMessage);
      socket.addEventListener("close", () => {
        setConnected(false);
        if (socketRef.current === socket) socketRef.current = null;
        if (!disposed) reconnectTimer = setTimeout(connect, 1500);
      });
      socket.addEventListener("error", () => {
        // The close event always fires after an error, which handles cleanup.
      });
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      const socket = socketRef.current;
      if (socket) socket.close();
      socketRef.current = null;
    };
  }, [showSlowModeNotification]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [messages]);

  const sendMessage = (event) => {
    event.preventDefault();
    const body = message.trim();
    if (!body) return;
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "chat",
          body,
          ...(replyingTo ? { reply: replyingTo } : {}),
        }),
      );
      setReplyingTo(null);
    }
    setMessage("");
  };

  const startReply = (reply) => {
    setReplyingTo(reply);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <>
    <aside
      aria-hidden={!isChatOpen}
      className={`fixed bottom-0 left-0 top-20 z-110 hidden w-80 flex-col overflow-hidden bg-linear-to-r from-[#152340] to-[#212A53] lg:flex ease-in-out transition-transform duration-200 will-change-transform ${
        isChatOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col flex-1 min-h-0 gap-3.5 pt-3.5 relative">
        <div className="flex gap-2 px-3.5">
          <div className="h-10.5 relative flex-1">
            <div className="absolute top-1/2 left-0 right-0 bottom-0 bg-[#27376A] rounded-lg" />
            <div className="h-[calc(100%-3px)] bg-[#364677] px-3 rounded-lg flex items-center relative transition-opacity">
              <ChatIcon />
              <p className="font-semibold ml-2">Chat</p>
            </div>
          </div>
          <div className="h-10.5 w-16 shrink-0 relative">
            <div className="absolute top-1/2 left-0 right-0 bottom-0 bg-[#18295E] rounded-lg" />
            <div className="h-[calc(100%-3px)] bg-[#27376A] rounded-lg flex items-center justify-center relative">
              <span className="relative flex size-2.5">
                <span
                  className={`animate-ping absolute inline-flex size-full rounded ${
                    onlineCount === null
                      ? "bg-accent/35"
                      : onlineCount > 0
                        ? "bg-[#5CDF9A]/75"
                        : "bg-[#F36D39]/75"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded size-full ${
                    onlineCount === null
                      ? "bg-accent/60"
                      : onlineCount > 0
                        ? "bg-[#5CDF9A]"
                        : "bg-[#F36D39]"
                  }`}
                />
              </span>
              <p className="text-sm font-semibold ml-2">{onlineCount ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="flex relative flex-1 min-h-0">
          <RainPot
            onTip={() => setIsTipRainOpen(true)}
            onJoin={() => setIsRainVerificationOpen(true)}
            rain={rainState}
          />
          <div className="flex flex-col justify-end flex-1 relative min-h-0">
            <div
              className="z-2 absolute top-0 left-0 right-1 h-20 bg-linear-to-r from-[#152340] to-[#212A53] pointer-events-none"
              style={{
                maskImage: "linear-gradient(rgb(0,0,0), rgba(0,0,0,0))",
              }}
            />
            <div
              ref={viewportRef}
              className="chat-scrollbar size-full overflow-y-auto outline-none pt-[108px] pb-3"
              tabIndex={0}
            >
              <div className="flex-1 flex flex-col gap-5 px-3.5">
                {messages.map((entry, index) => (
                  <ChatMessage
                    key={`${entry.name}-${index}-${entry.body}`}
                    name={entry.name}
                    body={entry.body}
                    time={entry.time}
                    user={entry.user}
                    reply={entry.reply}
                    animate={entry.animate}
                    onProfileClick={openProfile}
                    onReply={startReply}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-linear-to-r from-[#203665] to-[#303C71]">
          {replyingTo && (
            <div className="bg-[#17203F] -mb-3 p-2 pb-5 text-xs flex items-center justify-between rounded-t-lg gap-2.5 animate-in fade-in-0 slide-in-from-bottom-3">
              <div className="flex items-center gap-1 min-w-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="size-4 text-primary -scale-x-100 shrink-0"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                >
                  <g fill="none" stroke="currentColor">
                    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                    <path d="m9 17-5-5 5-5" />
                  </g>
                </svg>
                <p className="font-medium text-accent truncate min-w-0">
                  <span className="text-white font-semibold">@{replyingTo.name}:</span>{" "}
                  {replyingTo.body}
                </p>
              </div>
              <button
                type="button"
                className="cursor-pointer text-accent"
                aria-label="Cancel reply"
                onClick={() => setReplyingTo(null)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="size-2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3.5"
                >
                  <path fill="none" stroke="currentColor" d="M20 4 4 20M4 4l16 16" />
                </svg>
              </button>
            </div>
          )}
          <form
            onSubmit={sendMessage}
            className="bg-[#1D2A53] flex items-center py-2.5 pl-3.5 pr-2 gap-2.25 rounded-xl relative"
          >
            <input
              ref={inputRef}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape" && replyingTo) setReplyingTo(null);
              }}
              disabled={!connected}
              className="flex-1 min-w-0 bg-transparent outline-none border-none font-medium text-sm text-white placeholder:text-accent disabled:opacity-60"
              placeholder={connected ? "Enter a message.." : "Connecting…"}
            />
            <button
              type="button"
              className="shrink-0 cursor-pointer text-accent hover:text-accent-light transition-colors"
              aria-label="Choose emoji"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="size-5.5"
              >
                <path
                  fill="currentColor"
                  d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512m-91.9-186.5C182 346.2 212.6 368 256 368s74-21.8 91.9-42.5c5.8-6.7 15.9-7.4 22.6-1.6s7.4 15.9 1.6 22.6c-22.3 25.6-61 53.5-116.1 53.5s-93.8-27.9-116.1-53.5c-5.8-6.7-5.1-16.8 1.6-22.6s16.8-5.1 22.6 1.6M144.4 208a32 32 0 1 1 64 0 32 32 0 1 1-64 0m192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64"
                />
              </svg>
            </button>
            <button
              type="submit"
              className="relative cursor-pointer outline-none flex select-none transition-opacity group/button h-8"
            >
              <div
                className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none"
                style={{
                  top: "var(--sb-shadow-size,3px)",
                  backgroundColor: "rgb(15,195,101)",
                }}
              />
              <div
                className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 px-2.75"
                style={{
                  height: "calc(100% - var(--sb-shadow-size,3px))",
                  backgroundColor: "rgb(92,223,154)",
                  color: "rgb(58,56,105)",
                }}
              >
                <div
                  className="transition-opacity flex items-center justify-center size-full"
                  style={{ filter: "drop-shadow(rgb(15,195,101) 0 2px 0)" }}
                >
                  SEND
                </div>
              </div>
            </button>
          </form>
        </div>
      </div>

      {profileModal && (
        <ProfileModal
          user={profileModal.user}
          name={profileModal.name}
          onClose={closeProfile}
          closing={modalClosing}
        />
      )}
    </aside>
    <button
      type="button"
      aria-label={isChatOpen ? "Close chat" : "Open chat"}
      aria-expanded={isChatOpen}
      onClick={() => setIsChatOpen((current) => !current)}
      className="bg-[#202D57] hover:bg-[#273669] cursor-pointer z-40 flex items-center justify-center rounded-xl size-12 fixed bottom-[calc(var(--layout-bottom,0px)+16px)] left-[calc(var(--layout-left,0px)+16px)] ease-in-out transition-[background-color,left] duration-200"
    >
      <ChatIcon className="size-5.5 text-accent" />
    </button>
    {isTipRainOpen
      ? createPortal(
          <TipRainModal
            onClose={() => setIsTipRainOpen(false)}
            onSubmit={(value) => {
              const socket = socketRef.current;
              if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: "rain_tip", amount: value }));
              }
            }}
          />,
          document.body,
        )
      : null}
    {isRainVerificationOpen
      ? createPortal(
          <RainVerificationModal
            onClose={closeRainVerification}
            onVerified={completeRainVerification}
          />,
          document.body,
        )
      : null}
    </>
  );
}
