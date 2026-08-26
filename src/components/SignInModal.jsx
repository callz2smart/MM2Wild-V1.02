import { useCallback, useEffect, useRef, useState } from "react";

const verificationPhrase =
  "horse, wise able, stag, owl dolphin loom, cottage, tree duck, blossom, winter, heron harp, drum spring, vault, mountain, vibrant";

function CopyIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="currentColor"
        d="M15.24 2h-3.894c-1.764 0-3.162 0-4.255.148-1.126.152-2.037.472-2.755 1.193-.719.721-1.038 1.636-1.189 2.766C3 7.205 3 8.608 3 10.379v5.838c0 1.508.92 2.8 2.227 3.342-.067-.91-.067-2.185-.067-3.247v-5.01c0-1.281 0-2.386.118-3.27.127-.948.413-1.856 1.147-2.593s1.639-1.024 2.583-1.152c.88-.118 1.98-.118 3.257-.118h3.07c1.276 0 2.374 0 3.255.118A3.6 3.6 0 0 0 15.24 2"
      />
      <path
        fill="currentColor"
        d="M6.6 11.397c0-2.726 0-4.089.844-4.936.843-.847 2.2-.847 4.916-.847h2.88c2.715 0 4.073 0 4.917.847S21 8.671 21 11.397v4.82c0 2.726 0 4.089-.843 4.936-.844.847-2.202.847-4.917.847h-2.88c-2.715 0-4.073 0-4.916-.847-.844-.847-.844-2.21-.844-4.936z"
      />
    </svg>
  );
}

function VerificationPhrase({ user }) {
  const copyPhrase = () => navigator.clipboard.writeText(verificationPhrase);

  return (
    <div className="flex flex-col gap-5.5 h-full">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg sm:text-xl font-bold">Get Started! 👋</h2>
        <p className="text-accent font-medium text-sm">
          Log in with your Roblox username, then verify your account by putting
          a verification phrase in your Roblox bio.
        </p>
      </div>
      <div className="w-full h-0.5 bg-[#445696]/35 rounded-full" />
      <p className="text-accent font-medium text-sm">
        Verification Phrase -{" "}
        <span className="text-accent/70">
          Please copy this phrase into your roblox bio.
        </span>
      </p>
      <div className="bg-[#283564] rounded-lg p-3 gap-3 justify-between flex items-center">
        <p className="text-accent font-medium text-sm">{verificationPhrase}</p>
        <button
          type="button"
          className="relative cursor-pointer outline-none flex select-none text-accent hover:bg-accent/10 hover:text-accent-light rounded-full size-8 shrink-0 transition-colors"
          onClick={copyPhrase}
          aria-label="Copy verification phrase"
        >
          <div className="transition-opacity flex items-center justify-center size-full">
            <CopyIcon className="size-4" />
          </div>
        </button>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          className="relative cursor-pointer outline-none flex select-none transition-opacity bg-[#364677] hover:bg-[#475992] h-11 flex-1 rounded-lg text-sm font-medium"
          onClick={copyPhrase}
        >
          <div className="transition-opacity flex items-center justify-center size-full">
            <CopyIcon className="size-4.5 mr-1.5" />
            Copy Phrase
          </div>
        </button>
        <a
          href={`https://www.roblox.com/users/${user.id}/profile`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#283564] hover:bg-[#334279] h-11 flex-1 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 no-underline transition-colors"
        >
          My Roblox Profile
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="size-4 rotate-90"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          >
            <path fill="none" stroke="currentColor" d="m18 15-6-6-6 6" />
          </svg>
        </a>
      </div>
      <button
        type="button"
        className="relative cursor-pointer outline-none flex select-none transition-opacity group/button h-10.5 w-full mt-auto"
      >
        <div
          className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none"
          style={{
            top: "var(--sb-shadow-size,3px)",
            backgroundColor: "rgb(211, 133, 2)",
          }}
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
            I&apos;ve entered the phrase
          </div>
        </div>
      </button>
    </div>
  );
}

export default function SignInModal({ onClose }) {
  const [agreed, setAgreed] = useState(false);
  const [username, setUsername] = useState("");
  const [hasResolvedUser, setHasResolvedUser] = useState(false);
  const [resolvedUser, setResolvedUser] = useState(null);
  const [lookupError, setLookupError] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [dialogState, setDialogState] = useState("open");
  const isClosingRef = useRef(false);
  const closeTimerRef = useRef(null);

  const requestClose = useCallback(() => {
    if (isClosingRef.current) return;

    isClosingRef.current = true;
    setDialogState("closed");
    closeTimerRef.current = window.setTimeout(onClose, 200);
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event) => {
      if (event.key === "Escape") requestClose();
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      window.clearTimeout(closeTimerRef.current);
    };
  }, [requestClose]);

  const resolveRobloxUser = async (event) => {
    event.preventDefault();
    if (isResolving || isContinuing) return;

    if (hasResolvedUser) {
      setIsContinuing(true);
      await new Promise((resolve) => window.setTimeout(resolve, 650));
      setIsContinuing(false);
      setShowVerification(true);
      return;
    }

    if (username.trim().length < 3) {
      setLookupError("Minimum 3 characters.");
      return;
    }

    if (!agreed) return;

    setLookupError("");
    setIsResolving(true);
    const loadingStartedAt = performance.now();
    try {
      const response = await fetch(
        `/api/roblox-user?username=${encodeURIComponent(username.trim())}`,
      );
      const payload = await response.json();
      if (!response.ok || !payload.avatarUrl) {
        throw new Error(payload.error || "Roblox user could not be loaded.");
      }

      setUsername(payload.name);
      setResolvedUser(payload);
      setHasResolvedUser(true);
    } catch (error) {
      setResolvedUser(null);
      setHasResolvedUser(false);
      setLookupError(error.message || "Roblox user could not be loaded.");
    } finally {
      const remainingLoadingTime = Math.max(
        0,
        650 - (performance.now() - loadingStartedAt),
      );
      if (remainingLoadingTime > 0) {
        await new Promise((resolve) =>
          window.setTimeout(resolve, remainingLoadingTime),
        );
      }
      setIsResolving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9998] bg-[#0C1535]/80 transition-opacity duration-200 data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0"
      data-state={dialogState}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div
        data-v-8ead2f23=""
        data-dismissable-layer=""
        tabIndex={-1}
        className="dialog-content fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full outline-none flex flex-col duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
        id=""
        role="dialog"
        aria-modal="true"
        aria-describedby="reka-dialog-description-v-13"
        aria-labelledby="reka-dialog-title-v-12"
        data-state={dialogState}
        style={{
          maxWidth: "min(100dvw - 24px, 780px)",
          maxHeight: "calc(100% - 24px)",
          zIndex: 9999,
          pointerEvents: "auto",
        }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div
          data-v-8ead2f23=""
          className="bg-[#1D284E] rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="flex flex-col-reverse sm:flex-row">
            <div className="flex flex-col gap-5.5 relative shrink p-6">
              <div className="bg-[#FFC055]/80 absolute -bottom-4.5 sm:-bottom-6 left-1/2 -translate-x-1/2 w-6/12 h-10 rounded-full blur-[84px] pointer-events-none" />
              {showVerification && resolvedUser ? (
                <VerificationPhrase user={resolvedUser} />
              ) : (
                <form
                  className="flex flex-col gap-5.5 relative flex-1"
                  onSubmit={resolveRobloxUser}
                >
                <div className="flex flex-col gap-2">
                  <h2
                    id="reka-dialog-title-v-12"
                    className="text-lg sm:text-xl font-bold"
                  >
                    Get Started! 👋
                  </h2>
                  <p
                    id="reka-dialog-description-v-13"
                    className="text-accent font-medium text-sm"
                  >
                    Log in with your Roblox username, then verify your account
                    by putting a verification phrase in your Roblox bio.
                  </p>
                </div>
                <div className="w-full h-0.5 bg-[#445696]/35 rounded-full" />
                <div>
                  <label
                    htmlFor="v-1-0"
                    className="mb-1.75 block w-fit text-sm font-medium text-accent uppercase"
                  >
                    ROBLOX USERNAME
                  </label>
                  <div className="w-full relative flex group rounded-lg items-center justify-center bg-[#0F1222]/55 h-11.5 px-2.25">
                    <div
                      className={`absolute inset-0.25 ring-2 rounded-lg transition-shadow pointer-events-none ${
                        lookupError ? "ring-error/50" : "ring-transparent"
                      }`}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-6.5"
                    >
                      <path
                        fill="currentColor"
                        d="M12 4a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4"
                      />
                    </svg>
                    <input
                      id="v-1-0"
                      name="username"
                      placeholder="Enter your roblox username..."
                      className="bg-transparent outline-none size-full font-medium peer text-[15px] placeholder:text-accent px-2"
                      value={username}
                      onChange={(event) => {
                        setUsername(event.target.value);
                        setLookupError("");
                        if (hasResolvedUser) {
                          setResolvedUser(null);
                          setHasResolvedUser(false);
                        }
                      }}
                      autoFocus
                    />
                  </div>
                  {lookupError ? (
                    <p className="font-medium transition-colors duration-150 mt-1 text-[13px] text-error">
                      {lookupError}
                    </p>
                  ) : null}
                </div>
                {hasResolvedUser && resolvedUser ? (
                  <div className="bg-[#283564]/85 rounded-lg p-3 gap-3 flex items-center mt-2">
                    <div className="size-16 rounded-lg overflow-hidden bg-[#1D284E] flex justify-center items-end">
                      <img
                        src={resolvedUser.avatarUrl}
                        alt={`${resolvedUser.name} Roblox avatar`}
                        className="w-13 h-16 object-contain object-bottom"
                      />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-white font-medium text-[15px]">
                        {resolvedUser.displayName}
                      </p>
                      <p className="text-accent font-medium text-sm">
                        @{resolvedUser.name}
                      </p>
                    </div>
                  </div>
                ) : null}
                <div className={`w-full ${hasResolvedUser ? "hidden" : ""}`}>
                  <div className="flex items-center gap-2">
                    <button
                      className="cursor-pointer peer shrink-0 rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-[#0F1222]/55 data-[state=checked]:bg-[#F2BE66] size-5 data-[state=checked]:text-[#1D284E]"
                      id="v-1-1"
                      role="checkbox"
                      type="button"
                      aria-checked={agreed}
                      aria-required="false"
                      data-state={agreed ? "checked" : "unchecked"}
                      aria-label=" I agree to all Terms & Conditions and I'm over 18 years of age. "
                      onClick={() => setAgreed((checked) => !checked)}
                    >
                      {agreed ? (
                        <span
                          data-state="checked"
                          className="flex h-full w-full items-center justify-center text-current"
                          style={{ pointerEvents: "none" }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="size-[60%]"
                            strokeWidth="4.5"
                          >
                            <path
                              fill="none"
                              stroke="currentColor"
                              d="M20 6 9 17l-5-5"
                            />
                          </svg>
                        </span>
                      ) : null}
                    </button>
                    <label
                      htmlFor="v-1-1"
                      className="text-sm font-semibold cursor-pointer text-accent"
                    >
                      I agree to all{" "}
                      <a
                        href="/terms"
                        rel="noopener noreferrer"
                        target="_blank"
                        className="text-[#F2BE66] underline decoration-[#F2BE66]/40 hover:decoration-[#F2BE66]/80 duration-100 transition-colors"
                      >
                        Terms &amp; Conditions
                      </a>{" "}
                      and I&apos;m over 18 years of age.
                    </label>
                  </div>
                </div>
                <div
                  className={`flex gap-3 mt-auto ${
                    isResolving || isContinuing
                      ? "opacity-40 pointer-events-none"
                      : ""
                  }`}
                >
                  <button
                    type="submit"
                    disabled={isResolving || isContinuing}
                    aria-busy={isResolving || isContinuing}
                    className={`relative cursor-pointer outline-none flex select-none transition-opacity group/button h-10.5 w-full ${
                      isResolving || isContinuing
                        ? "opacity-40 pointer-events-none"
                        : ""
                    }`}
                  >
                    <div
                      className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none"
                      style={{
                        top: "var(--sb-shadow-size,3px)",
                        backgroundColor: "rgb(211, 133, 2)",
                      }}
                    />
                    <div
                      className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0"
                      style={{
                        height: "calc(100% - var(--sb-shadow-size,3px))",
                        backgroundColor: "rgb(243, 178, 57)",
                        color: "rgb(58, 56, 105)",
                      }}
                    >
                      {isResolving || isContinuing ? (
                        <svg
                          className="ring-loader absolute top-1/2 left-1/2 -translate-1/2 size-5.5 [--uib-speed:1.5s]"
                          viewBox="0 0 40 40"
                          strokeWidth="5"
                          aria-hidden="true"
                        >
                          <circle
                            className="track"
                            cx="20"
                            cy="20"
                            r="17.5"
                            pathLength="100"
                            fill="none"
                          />
                          <circle
                            className="car"
                            cx="20"
                            cy="20"
                            r="17.5"
                            pathLength="100"
                            fill="none"
                          />
                        </svg>
                      ) : null}
                      <div
                        className={`transition-opacity flex items-center justify-center size-full ${
                          isResolving || isContinuing
                            ? "opacity-0 pointer-events-none"
                            : ""
                        }`}
                        style={{
                          filter:
                            "drop-shadow(rgb(211, 133, 2) 0px 2px 0px)",
                        }}
                      >
                        <span>Continue</span>
                      </div>
                    </div>
                  </button>
                  {hasResolvedUser && !isContinuing ? (
                    <button
                      type="button"
                      className="relative cursor-pointer outline-none flex select-none transition-opacity group/button h-10.5 w-full"
                      onClick={() => {
                        setResolvedUser(null);
                        setHasResolvedUser(false);
                      }}
                    >
                      <div
                        className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none"
                        style={{
                          top: "var(--sb-shadow-size,3px)",
                          backgroundColor: "rgb(34, 51, 100)",
                        }}
                      />
                      <div
                        className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0"
                        style={{
                          height: "calc(100% - var(--sb-shadow-size,3px))",
                          backgroundColor: "rgb(87, 104, 154)",
                          color: "rgb(255, 255, 255)",
                        }}
                      >
                        <div
                          className="transition-opacity flex items-center justify-center size-full"
                          style={{
                            filter: "drop-shadow(rgb(34, 51, 100) 0px 2px 0px)",
                          }}
                        >
                          <span>Go Back</span>
                        </div>
                      </div>
                    </button>
                  ) : null}
                </div>
                </form>
              )}
            </div>
            <div className="aspect-[740/304] relative sm:static sm:aspect-[216/452] shrink-0 sm:max-w-[238px] w-full">
              <div className="fixed aspect-[740/277] rounded-t-[11px] sm:aspect-[238/506] -left-4.5 -right-4.5 -top-4.5 sm:left-auto sm:right-0 sm:top-0 sm:bottom-0 sm:rounded-xl overflow-hidden bg-[#2d3965]">
                <picture>
                  <source
                    srcSet="/signup-banner.webp"
                    media="(min-width: 640px)"
                  />
                  <img
                    src="/mobile-signup-banner.webp"
                    alt="Signup Banner"
                    className="no-interaction opacity-0 transition-opacity size-full object-cover duration-500"
                    style={{ opacity: 1 }}
                  />
                </picture>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
