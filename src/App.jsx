import Header from "./components/Header";
import Subheader from "./components/Subheader";
import ChatSidebar from "./components/ChatSidebar";
import HomePage from "./components/HomePage";
import LoadingScreen from "./components/LoadingScreen";

export default function App() {
  return (
    <>
      <div className="app-background fixed inset-0 size-full bg-linear-to-br from-[#131C2F] to-[#212A53] z-0" />
      <main className="relative z-1">
        <Header />
        <Subheader />
        <ChatSidebar />
        <HomePage />
      </main>
      <LoadingScreen />
    </>
  );
}
