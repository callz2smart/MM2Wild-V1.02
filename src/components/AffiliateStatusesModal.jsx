import { useCallback, useEffect, useRef, useState } from "react";

function SquircleLoader() {
  return (
    <svg
      data-v-eaf09615=""
      data-v-8ead2f23=""
      className="squircle-loader text-primary size-9 [--uib-speed:0.5s] [--uib-stroke:6px] [--uib-bg-opacity:0.1]"
      x="0px"
      y="0px"
      viewBox="0 0 37 37"
      height="37"
      width="37"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Loading"
    >
      <path className="track" fill="none" strokeWidth="5" pathLength="100" d="M0.37 18.5 C0.37 5.772 5.772 0.37 18.5 0.37 S36.63 5.772 36.63 18.5 S31.228 36.63 18.5 36.63 S0.37 31.228 0.37 18.5" />
      <path className="car" fill="none" strokeWidth="5" pathLength="100" d="M0.37 18.5 C0.37 5.772 5.772 0.37 18.5 0.37 S36.63 5.772 36.63 18.5 S31.228 36.63 18.5 36.63 S0.37 31.228 0.37 18.5" />
    </svg>
  );
}

export default function AffiliateStatusesModal({ onClose }) {
  const [dialogState, setDialogState] = useState("open");
  const [loading, setLoading] = useState(true);
  const closeTimerRef = useRef(null);

  const requestClose = useCallback(() => {
    if (dialogState === "closed") return;
    setDialogState("closed");
    closeTimerRef.current = window.setTimeout(onClose, 200);
  }, [dialogState, onClose]);

  useEffect(() => {
    const loadingTimer = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(loadingTimer);
  }, []);

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
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full outline-none flex flex-col duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
        role="dialog"
        aria-modal="true"
        aria-labelledby="affiliate-statuses-title"
        data-state={dialogState}
        style={{
          maxWidth: "min(100dvw - 24px, 680px)",
          maxHeight: "calc(100% - 24px)",
          zIndex: 9999,
          pointerEvents: "auto",
        }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        {loading ? (
          <div className="min-h-44 flex items-center justify-center">
            <SquircleLoader />
          </div>
        ) : (
          <div data-v-8ead2f23="" className="bg-[#1D284E] rounded-2xl shadow-lg flex flex-col gap-5.5 max-h-[calc(100vh-24px)] overflow-hidden relative">
            <div className="relative flex flex-col gap-4 max-h-full overflow-y-auto p-4.5 sm:p-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-primary/80">
              <div
                className="absolute top-0 left-0 right-0 h-0.75"
                style={{ background: "linear-gradient(270deg, rgba(36, 38, 81, 0.22) 0%, rgba(243, 178, 57, 0.65) 25%, rgb(243, 178, 57) 49.52%, rgba(243, 178, 57, 0.65) 74.52%, rgba(36, 38, 81, 0.29) 100%)" }}
              />
              <button type="button" aria-label="Close" className="text-accent absolute top-4 right-4 cursor-pointer" onClick={requestClose}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
                  <path fill="none" stroke="currentColor" d="M20 4 4 20M4 4l16 16" />
                </svg>
              </button>
              <div><h2 id="affiliate-statuses-title" className="text-[20px] font-bold uppercase">User Statuses</h2></div>
              <div className="bg-[#24305B]/70 rounded-xl p-4 flex flex-col gap-1.5">
                <p className="font-semibold text-[15px]">Active</p>
                <p className="font-medium text-accent text-sm">Users in this status currently have your affiliate code applied and have made at least one deposit while your code was active on their account.</p>
              </div>
              <div className="bg-[#24305B]/70 rounded-xl p-4 flex flex-col gap-1.5">
                <p className="font-semibold text-[15px]">Inactive</p>
                <p className="font-medium text-accent text-sm">These users were previously active and deposited under your code, but they currently have no code applied. The last code they used was yours, and they have not entered another one since it expired.</p>
              </div>
              <div className="bg-[#24305B]/70 rounded-xl p-4 flex flex-col gap-1.5">
                <p className="font-semibold text-[15px]">Stolen</p>
                <p className="font-medium text-accent text-sm">These users were once active under your code and made a deposit, but later switched and applied a different affiliate code.</p>
              </div>
              <div className="bg-[#24305B]/70 rounded-xl p-4 flex flex-col gap-1.5">
                <p className="font-semibold text-[15px]">Unconverted</p>
                <p className="font-medium text-accent text-sm">This status is for users who currently use your code, or used it before, but have never completed a deposit while your code was applied.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
