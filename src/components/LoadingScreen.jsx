import { useEffect, useState } from "react";

const minimumVisibleTime = 900;
const fadeDuration = 300;

export default function LoadingScreen() {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const startedAt = performance.now();
    let fadeTimer;
    let removeTimer;
    let readinessTimer;
    let firstPaintFrame;
    let secondPaintFrame;
    let windowLoadHandler;
    let cancelled = false;

    const finishLoading = () => {
      const remainingTime = Math.max(
        0,
        minimumVisibleTime - (performance.now() - startedAt),
      );

      fadeTimer = window.setTimeout(() => {
        if (cancelled) return;
        setIsClosing(true);
        removeTimer = window.setTimeout(
          () => {
            if (!cancelled) setIsVisible(false);
          },
          fadeDuration,
        );
      }, remainingTime);
    };

    const waitForWindowLoad = new Promise((resolve) => {
      if (document.readyState === "complete") resolve();
      else {
        windowLoadHandler = resolve;
        window.addEventListener("load", windowLoadHandler, { once: true });
      }
    });

    const waitForImages = () => {
      const images = [...document.images].filter((image) => {
        if (image.closest('[aria-label="Loading MM2Wild"]')) return false;
        if (image.loading !== "lazy") return true;
        const rect = image.getBoundingClientRect();
        return (
          rect.bottom > 0 &&
          rect.right > 0 &&
          rect.top < window.innerHeight &&
          rect.left < window.innerWidth
        );
      });

      return Promise.allSettled(
        images.map((image) => {
          if (image.complete) {
            return typeof image.decode === "function"
              ? image.decode().catch(() => {})
              : Promise.resolve();
          }
          return new Promise((resolve) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", resolve, { once: true });
          });
        }),
      );
    };

    const waitForPaint = () =>
      new Promise((resolve) => {
        firstPaintFrame = window.requestAnimationFrame(() => {
          secondPaintFrame = window.requestAnimationFrame(resolve);
        });
      });

    const prepareApp = async () => {
      await waitForWindowLoad;
      const visualAssetsReady = Promise.allSettled([
        document.fonts?.ready ?? Promise.resolve(),
        waitForImages(),
      ]);
      const readinessTimeout = new Promise((resolve) => {
        readinessTimer = window.setTimeout(resolve, 8000);
      });
      await Promise.race([visualAssetsReady, readinessTimeout]);
      window.clearTimeout(readinessTimer);
      await waitForPaint();
      if (!cancelled) finishLoading();
    };

    prepareApp();

    return () => {
      cancelled = true;
      if (windowLoadHandler) {
        window.removeEventListener("load", windowLoadHandler);
      }
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
      window.clearTimeout(readinessTimer);
      window.cancelAnimationFrame(firstPaintFrame);
      window.cancelAnimationFrame(secondPaintFrame);
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
      <img
        src="/landscape.avif"
        alt=""
        className="absolute inset-0 size-full opacity-50 object-cover select-none pointer-events-none transition-opacity duration-300"
      />
      <video
        loop
        playsInline
        autoPlay
        muted
        preload="auto"
        className="w-[180px] md:w-[320px] relative z-1"
        aria-label="MM2Wild"
      >
        <source
          src="/loading-logo.webm"
          type='video/webm; codecs="vp8, vorbis"'
        />
      </video>
    </div>
  );
}
