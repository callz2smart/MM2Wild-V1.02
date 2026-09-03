import { useCallback, useEffect, useRef, useState } from "react";

export default function TripleGreenJackpotModal({ onClose }) {
  const [dialogState, setDialogState] = useState("open");
  const closeTimerRef = useRef(null);

  const requestClose = useCallback(() => {
    if (dialogState === "closed") return;
    setDialogState("closed");
    closeTimerRef.current = window.setTimeout(onClose, 200);
  }, [dialogState, onClose]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") requestClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
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
        aria-labelledby="triple-green-jackpot-title"
        data-state={dialogState}
        style={{
          maxWidth: "min(100dvw - 24px, 560px)",
          maxHeight: "calc(100% - 24px)",
          zIndex: 9999,
          pointerEvents: "auto",
        }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="bg-[#1D284E] rounded-2xl shadow-lg overflow-hidden relative max-h-full">
          <div className="flex flex-col gap-5.5 max-h-full overflow-y-auto p-4.5 sm:p-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-primary/80">
          <div
            className="absolute top-0 left-0 right-0 h-0.75"
            style={{ background: "linear-gradient(270deg, rgba(36, 38, 81, 0.25) 0%, rgba(92, 223, 154, 0.65) 25%, rgb(92, 223, 154) 49.52%, rgba(92, 223, 154, 0.65) 74.52%, rgba(36, 38, 81, 0.25) 100%)" }}
          />
          <div className="bg-[#5CDF9A]/80 absolute -top-6 left-1/2 -translate-x-1/2 w-9/12 h-20 rounded-full blur-[90px] pointer-events-none" />
          <button type="button" className="text-accent absolute top-4 right-4 cursor-pointer" onClick={requestClose} aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
              <path fill="none" stroke="currentColor" d="M20 4 4 20M4 4l16 16" />
            </svg>
          </button>
          <img
            src="/roulette/triple-jackpot-ilustration.webp"
            alt="Triple Green"
            width="202"
            height="107"
            className="mx-auto opacity-0 transition-opacity"
            style={{ opacity: 1 }}
          />
          <h2 id="triple-green-jackpot-title" className="flex flex-col gap-1">
            <p className="font-bold text-2xl text-center">TRIPLE GREEN</p>
            <p className="text-5xl font-bold bg-linear-to-br from-[#FFD896] from-25% via-white to-50% to-[#FFD896] bg-clip-text text-transparent drop-shadow-[0px_6px_0px_rgba(147,120,13,0.49)] text-center">JACKPOT</p>
          </h2>
          <div className="bg-[#33447F]/95 h-0.5 rounded-full" />
          <p className="text-accent text-[15px] font-medium">
            0.5% of all plays from each Roulette round will be added into the pot.<br /><br />
            The pot will be won any time that three green coins hit in a row - everyone who played the green coin during any of these 3 rounds will take a split of the pot.<br /><br />
            The pot will be split into three, and the winnings from each third will be shared with the players from each round proportionate to their plays.
          </p>
          <div className="p-3 bg-[#283564] rounded-[10px]">
            <p className="text-accent text-[15px] font-medium">
              Example:<br />
              You played 100 coins in one of the 3 rounds, and the total of that round was 200 coins - you'll receive 50% of 1/3rd of the total pot!
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
