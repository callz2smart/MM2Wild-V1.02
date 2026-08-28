import { useEffect, useState } from "react";
import LineWobbleLoader from "./LineWobbleLoader";

const minimumVisibleTime = 900;
const fadeDuration = 300;

export default function LoadingScreen() {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const startedAt = performance.now();
    let fadeTimer;
    let removeTimer;

    const finishLoading = () => {
      const remainingTime = Math.max(
        0,
        minimumVisibleTime - (performance.now() - startedAt),
      );

      fadeTimer = window.setTimeout(() => {
        setIsClosing(true);
        removeTimer = window.setTimeout(
          () => setIsVisible(false),
          fadeDuration,
        );
      }, remainingTime);
    };

    if (document.readyState === "complete") {
      finishLoading();
    } else {
      window.addEventListener("load", finishLoading, { once: true });
    }

    return () => {
      window.removeEventListener("load", finishLoading);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 bg-linear-to-br from-[#131C2F] to-[#212A53] z-[99999998] flex items-center justify-center transition-opacity duration-300 ${
        isClosing ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-label="Loading MM2Wild"
      aria-busy={!isClosing}
    >
      <LineWobbleLoader />
    </div>
  );
}
