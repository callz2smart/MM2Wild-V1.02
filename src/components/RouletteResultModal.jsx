import { useCallback, useEffect, useRef, useState } from "react";

function fallbackRoundNumber(result) {
  const timestamp = result.time instanceof Date ? result.time.getTime() : Date.now();
  return String(timestamp).slice(-6).padStart(6, "0");
}

export default function RouletteResultModal({ result, resultIcon, onClose }) {
  const [dialogState, setDialogState] = useState("open");
  const closeTimerRef = useRef(null);
  const roundNumber = result.roundNumber ?? fallbackRoundNumber(result);
  const playerCount = Number(result.players || 0);

  const requestClose = useCallback(() => {
    if (dialogState === "closed") return;
    setDialogState("closed");
    closeTimerRef.current = window.setTimeout(onClose, 200);
  }, [dialogState, onClose]);

  useEffect(() => {
    const closeOnEscape = (event) => event.key === "Escape" && requestClose();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
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
      onPointerDown={(event) => event.target === event.currentTarget && requestClose()}
    >
      <div
        data-dismissable-layer=""
        tabIndex={-1}
        className="dialog-content fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full outline-none flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
        role="dialog"
        aria-describedby="roulette-result-description"
        aria-labelledby="roulette-result-title"
        data-state={dialogState}
        style={{
          maxWidth: "min(100dvw - 24px, 560px)",
          maxHeight: "calc(100% - 24px)",
          zIndex: 9999,
          pointerEvents: "auto",
        }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="bg-[#1D284E] rounded-2xl flex flex-col gap-5.5 max-h-[calc(100vh-24px)] overflow-hidden">
          <div className="relative flex flex-col gap-5.5 max-h-full overflow-y-auto p-4.5 sm:p-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-primary/80">
            <h2 id="roulette-result-title" className="sr-only">ROULETTE #{roundNumber}</h2>
            <button type="button" className="text-accent absolute top-4 right-4 cursor-pointer" onClick={requestClose} aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
                <path fill="none" stroke="currentColor" d="M20 4 4 20M4 4l16 16" />
              </svg>
            </button>
            <div
              className="rounded-xl size-24 flex items-center justify-center mx-auto"
              style={{ background: result.color.gradient, boxShadow: "rgba(0, 0, 0, 0.25) 0px -4px 0px inset, rgba(255, 255, 255, 0.25) 0px 2.5px 0px inset" }}
            >
              {resultIcon}
            </div>
            <div className="flex items-center justify-between text-sm font-medium text-accent">
              <p>ROULETTE #{roundNumber}</p>
              <p>{playerCount} {playerCount === 1 ? "PLAYER" : "PLAYERS"}</p>
            </div>
            <div className="bg-[#344582] h-0.5 rounded-full" />
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-center py-5 bg-[#344582]/30 rounded-xl">
                <p id="roulette-result-description" className="text-center text-sm font-medium text-accent">No bets placed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
