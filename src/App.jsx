import Header from "./components/Header";
import Subheader from "./components/Subheader";
import ChatSidebar from "./components/ChatSidebar";
import HomePage from "./components/HomePage";
import ProfilePage from "./components/ProfilePage";

export default function App() {
  const pathname = window.location.pathname;
  const isAccountPage = pathname.startsWith("/account/");
  const activeTab = pathname.replace("/account/", "");

  return (
    <>
      <div className="app-background fixed inset-0 size-full bg-linear-to-br from-[#131C2F] to-[#212A53] z-0" />
      <main className="relative z-1">
        <Header />
        <Subheader />
        <ChatSidebar />
        {isAccountPage ? <ProfilePage activeTab={activeTab} /> : <HomePage />}
      </main>
    </>
  );
}
