import { useCallback, useEffect, useRef, useState } from "react";

const mm2Path =
  "m1.194 0 .597.107.163.86 5.212 2.9.434.215.706-.161 2.443 1.504.597-.108.76.43.217.376 2.117 1.181 1.086.108.325.322.055.537.38.215.434.161.109-.268.271-.054 1.737.913.163.698-.109.376-.597.43-1.248 2.148.054.483.271.269-.108.322-1.412-.752-.705.322-.543.484-.38 1.128v2.793l-.272 1.503-1.031 1.504-.597.054-4.017-1.772-.217-.591.922-1.934.978-2.9.38-.322.108-.645-.271-.537-1.846-.805-.76-.913-.054-1.02.163-.645-.543-.323-.435-.644-.162-.59v-.645l.542-1.02-.108-.484-5.429-3.062-.434-.053L.054 1.45 0 .967.326.322 1.194 0Zm6.677 9.614.055.913.705.806 1.358.537.38-.645-.218-.967-2.117-1.074-.163.43Z";

const cryptoPath =
  "M8.262 5.142c.167-1.137-.693-1.743-1.879-2.155l.384-1.532-.936-.233-.374 1.494-.747-.178.379-1.505L4.153.8l-.385 1.537-.595-.14V2.19l-1.294-.324-.25 1s.694.164.683.169c.379.097.444.346.433.541l-.434 1.754.098.033-.102-.022-.612 2.452c-.044.114-.162.287-.428.216.011.017-.676-.162-.676-.162L.125 8.915l1.218.303.666.173-.39 1.554.936.233.38-1.538.752.195-.384 1.532.936.233.384-1.554c1.597.303 2.8.184 3.303-1.261.406-1.164-.022-1.83-.86-2.274.611-.135 1.07-.541 1.19-1.37h.006ZM6.123 8.14c-.287 1.164-2.247.53-2.88.378l.514-2.062c.633.162 2.67.47 2.366 1.678v.006Zm.287-3.016c-.26 1.056-1.895.52-2.42.39l.465-1.867c.531.13 2.231.379 1.955 1.477Z";

function CheckItem({ children, color = "#5CDF9A" }) {
  return (
    <div className="flex items-center gap-2 text-[15px]">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="size-5.5"
        style={{ color }}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      >
        <path fill="none" stroke="currentColor" d="M20 6 9 17l-5-5" />
      </svg>
      <p className="font-medium">{children}</p>
    </div>
  );
}

export default function WhatIsThisModal({ onClose }) {
  const [dialogState, setDialogState] = useState("open");
  const closeTimerRef = useRef(null);

  const requestClose = useCallback(() => {
    if (dialogState === "closed") return;
    setDialogState("closed");
    closeTimerRef.current = window.setTimeout(onClose, 200);
  }, [dialogState, onClose]);

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
        id="reka-dialog-content-v-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reka-dialog-title-v-8"
        data-state={dialogState}
        style={{
          maxWidth: "min(100dvw - 24px, 520px)",
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
              style={{
                background:
                  "linear-gradient(270deg, rgba(36, 38, 81, 0.22) 0%, rgba(243, 178, 57, 0.65) 25%, rgb(243, 178, 57) 49.52%, rgba(243, 178, 57, 0.65) 74.52%, rgba(36, 38, 81, 0.29) 100%)",
              }}
            />
            <div className="bg-primary/80 absolute -top-6 left-1/2 -translate-x-1/2 w-9/12 h-20 rounded-full blur-[90px] pointer-events-none" />
            <button
              type="button"
              aria-label="Close"
              className="text-accent absolute top-4 right-4 cursor-pointer"
              onClick={requestClose}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              >
                <path fill="none" stroke="currentColor" d="M20 4 4 20M4 4l16 16" />
              </svg>
            </button>
            <img
              src="/floating-coins-hq.webp"
              alt="Floating Coins"
              width="134"
              height="112"
              className="mx-auto opacity-0 transition-opacity"
              style={{ opacity: 1 }}
            />
            <h2
              id="reka-dialog-title-v-8"
              className="text-[22px] font-bold text-center"
            >
              WHY DO WE HAVE{" "}
              <span className="bg-linear-to-br from-[#FFD896] from-25% via-white to-50% to-[#FFD896] bg-clip-text text-transparent">
                2 BALANCES?
              </span>
            </h2>
            <p className="font-medium text-accent text-center">
              We use MBX Coins for everything, but we split balances into
              Crypto/Card deposits and MM2 Items deposits. This is to prevent
              users from abusing our items selling feature.
            </p>
            <div className="bg-[#24305B]/70 rounded-xl p-2.5">
              <p className="font-medium text-accent text-center">
                Both balances are the same value{" "}
                <span className="text-[#E5AD4E]">(100 MBX = $1).</span>
              </p>
            </div>
            <div className="flex flex-col">
              <div
                className="rounded-t-xl p-3 flex items-center gap-2.5"
                style={{
                  background:
                    "radial-gradient(100% 177.56% at 100% 50.48%, rgba(59, 252, 255, 0.45) 0%, rgba(32, 48, 89, 0) 100%), rgb(50, 68, 113)",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 19 21"
                  className="text-[#3BFCFF] size-5.5"
                >
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d={mm2Path}
                    clipRule="evenodd"
                    opacity=".99"
                  />
                </svg>
                <p className="font-medium">MM2 ITEMS</p>
              </div>
              <div className="rounded-b-xl p-4 flex flex-col gap-2.5 bg-[#283564]/60">
                <CheckItem>Free MM2 withdrawals</CheckItem>
                <CheckItem color="#F2BE66">
                  <span className="text-[#F2BE66]">20% fee</span> if withdrawing
                  to crypto
                </CheckItem>
              </div>
            </div>
            <div className="flex flex-col">
              <div
                className="rounded-t-xl p-3 flex items-center gap-2.5"
                style={{
                  background:
                    "radial-gradient(100% 177.56% at 100% 50.48%, rgba(255, 134, 59, 0.45) 0%, rgba(32, 48, 89, 0) 100%), rgb(50, 68, 113)",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 9 12"
                  className="text-[#FF863B] size-5.5"
                >
                  <path fill="currentColor" d={cryptoPath} />
                </svg>
                <p className="font-medium">CRYPTO</p>
              </div>
              <div className="rounded-b-xl p-4 flex flex-col sm:flex-row justify-between gap-2.5 bg-[#283564]/60">
                <CheckItem>Free MM2 withdrawals</CheckItem>
                <CheckItem>Free crypto withdrawals</CheckItem>
              </div>
            </div>
            <p className="font-medium text-accent text-center">
              You can withdraw crypto with both balances but mm2 items to crypto
              withdrawal will be subject to 20% fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
