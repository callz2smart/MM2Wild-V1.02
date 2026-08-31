import { useCallback, useEffect, useState, startTransition } from "react";
import Header from "./components/Header";
import Subheader from "./components/Subheader";
import ChatSidebar from "./components/ChatSidebar";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import TermsPage from "./pages/TermsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import FairnessPage from "./pages/FairnessPage";
import RewardsPage from "./pages/RewardsPage";
import LoadingScreen from "./components/LoadingScreen";
import AffiliatesPage from "./pages/AffiliatesPage";
import NotificationCenter from "./components/NotificationCenter";
import CoinflipPage from "./pages/CoinflipPage";

export default function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [isHeaderReady, setIsHeaderReady] = useState(false);
  const [isChatPresenceReady, setIsChatPresenceReady] = useState(false);
  const [selectedBalanceType, setSelectedBalanceType] = useState(() => (
    localStorage.getItem("mm2wild_balance_type") === "crypto" ? "crypto" : "mm2"
  ));

  const markHeaderReady = useCallback(() => setIsHeaderReady(true), []);
  const markChatPresenceReady = useCallback(() => setIsChatPresenceReady(true), []);
  const selectBalanceType = useCallback((balanceType) => {
    const nextBalanceType = balanceType === "crypto" ? "crypto" : "mm2";
    localStorage.setItem("mm2wild_balance_type", nextBalanceType);
    setSelectedBalanceType(nextBalanceType);
  }, []);

  useEffect(() => {
    const updateRoute = () => {
      startTransition(() => setPathname(window.location.pathname));
    };

    const handleInternalNavigation = (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const link = event.target.closest("a[href]");
      if (
        !link ||
        link.target === "_blank" ||
        link.hasAttribute("download") ||
        link.getAttribute("rel")?.includes("external")
      ) {
        return;
      }

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;

      event.preventDefault();

      const nextLocation = `${destination.pathname}${destination.search}${destination.hash}`;
      const currentLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (nextLocation === currentLocation) return;

      window.history.pushState({}, "", nextLocation);
      updateRoute();
      window.scrollTo({ top: 0, behavior: "instant" });
    };

    document.addEventListener("click", handleInternalNavigation);
    window.addEventListener("popstate", updateRoute);

    return () => {
      document.removeEventListener("click", handleInternalNavigation);
      window.removeEventListener("popstate", updateRoute);
    };
  }, []);

  const isAccountPage = pathname.startsWith("/account/");
  const activeTab = pathname.replace("/account/", "");
  const isTermsPage = pathname === "/terms";
  const isLeaderboardPage = pathname === "/leaderboard";
  const isFairnessPage = pathname === "/fairness";
  const isRewardsPage = pathname === "/rewards";
  const isAffiliatesPage = pathname === "/affiliates";
  const isCoinflipPage = pathname === "/games/coinflip";

  return (
    <>
      <div className="app-background fixed inset-0 size-full bg-linear-to-br from-[#131C2F] to-[#212A53] z-0" />
      <main className="relative z-1">
        <Header
          onInitialRenderReady={markHeaderReady}
          selectedBalanceType={selectedBalanceType}
          onBalanceTypeChange={selectBalanceType}
        />
        <Subheader />
        <ChatSidebar
          onInitialRenderReady={markChatPresenceReady}
          selectedBalanceType={selectedBalanceType}
        />
        {isAccountPage ? (
          <ProfilePage activeTab={activeTab} />
        ) : isTermsPage ? (
          <TermsPage />
        ) : isLeaderboardPage ? (
          <LeaderboardPage />
        ) : isFairnessPage ? (
          <FairnessPage />
        ) : isRewardsPage ? (
          <RewardsPage />
        ) : isAffiliatesPage ? (
          <AffiliatesPage />
        ) : isCoinflipPage ? (
          <CoinflipPage />
        ) : (
          <HomePage />
        )}
      </main>
      <NotificationCenter />
      <LoadingScreen appReady={isHeaderReady && isChatPresenceReady} />
    </>
  );
}
