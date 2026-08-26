import { useEffect, useRef, useState } from "react";

const users = {
  Itz_NinjaPlayzz: {
    level: 1,
    color: "#BEBEBE",
    avatar:
      "https://tr.rbxcdn.com/30DAY-AvatarHeadshot-9E12919EC1A578390B1018D597D9FC67-Png/180/180/AvatarHeadshot/Webp/noFilter",
  },
  "31K_BakonQ": {
    level: 26,
    color: "#F36D39",
    avatar:
      "https://tr.rbxcdn.com/30DAY-AvatarHeadshot-8BAFC2064D05A2CD35FEE4D3E3AE37AE-Png/180/180/AvatarHeadshot/Webp/noFilter",
  },
  PROSERMKAN: {
    level: 8,
    color: "#BEBEBE",
    avatar:
      "https://tr.rbxcdn.com/30DAY-AvatarHeadshot-4547327319F0885FB946AEB58B6B2F27-Png/180/180/AvatarHeadshot/Webp/noFilter",
  },
  DSDARK45: {
    level: 28,
    color: "#F36D39",
    avatar:
      "https://tr.rbxcdn.com/30DAY-AvatarHeadshot-DE28DD0B1AF3A8C9EF3D80F3C80C121F-Png/180/180/AvatarHeadshot/Webp/noFilter",
  },
  MM2_DBA: {
    level: 28,
    color: "#F36D39",
    avatar:
      "https://tr.rbxcdn.com/30DAY-AvatarHeadshot-E325AAD5E16DED0DE78FA96EBF5F0972-Png/180/180/AvatarHeadshot/Webp/noFilter",
  },
  Berkeoyundaaaaa: {
    level: 31,
    color: "#F33972",
    avatar:
      "https://tr.rbxcdn.com/30DAY-AvatarHeadshot-4143BBD1EACAA16430FB70781F890029-Png/180/180/AvatarHeadshot/Webp/noFilter",
  },
};

const initialMessages = [
  ["Itz_NinjaPlayzz", "some1 please tip me man", "21:09"],
  ["31K_BakonQ", "Sa", "21:09"],
  ["PROSERMKAN", "gel dark", "21:09"],
  ["Itz_NinjaPlayzz", "i rlly want to get started", "21:09"],
  ["DSDARK45", "helal sermkan", "21:09"],
  ["MM2_DBA", "As", "21:09"],
  ["PROSERMKAN", "yaz dark", "21:09"],
  ["Berkeoyundaaaaa", "Bako", "21:09"],
  ["PROSERMKAN", "dark sarı bas", "21:10"],
  ["DSDARK45", "Hw", "21:10"],
  ["Itz_NinjaPlayzz", "please tip me", "21:10"],
  ["MM2_DBA", "Benim monthly geliyor", "21:10"],
  ["MM2_DBA", "77 gelcek", "21:10"],
];

function ChatIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      className="size-5"
    >
      <path
        fill="currentColor"
        d="M1 6a5 5 0 1 1 2.59 4.382l-1.944.592a.5.5 0 0 1-.624-.624l.592-1.947A5 5 0 0 1 1 6m3-.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 0-1h-3a.5.5 0 0 0-.5.5M4.5 7a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1z"
      />
    </svg>
  );
}

function RainPot() {
  return (
    <div
      className="flex flex-col top-0 left-3 right-3 rounded-xl absolute z-10 overflow-hidden p-3.5 shadow-xl min-h-[80px]"
      style={{
        background:
          "radial-gradient(84% 582% at 100% 50%, rgba(229,173,78,.45) 0%, rgba(54,70,119,0) 100%), rgb(54,70,119)",
        boxShadow: "rgba(0,0,0,.3) 0 10px 12.8px, rgb(34,50,101) 0 4px 0",
      }}
    >
      <img
        src="/falling-coins.webp"
        alt=""
        className="size-28 object-contain absolute right-0 -top-1 pointer-events-none"
      />
      <div className="left-0 right-0 absolute bottom-0 h-1 bg-[#667297] z-10">
        <div
          className="bg-[#E5AD4E] h-full transition-[width] duration-1000"
          style={{ width: "74.7759%" }}
        />
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-2 z-20">
        <div className="bg-[#223263] px-1.5 py-1 text-xs font-medium rounded-md flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="size-4"
          >
            <path
              fill="currentColor"
              d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2m4.2 14.2L11 13V7h1.5v5.2l4.5 2.7z"
            />
          </svg>
          <p>43:44</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 relative z-10">
        <p className="text-sm font-semibold text-white">RAIN POT</p>
        <div className="flex gap-2">
          <div className="h-8.5 relative">
            <div className="absolute top-1/2 left-0 right-0 bottom-0 bg-[#191840] rounded-lg" />
            <div className="flex items-center gap-1.5 px-3 py-1.5 h-[calc(100%-3px)] bg-[#27376A] text-white text-sm rounded-lg relative">
              <img
                src="/coin.webp"
                alt=""
                className="bg-cover bg-center size-4.5"
              />
              <span className="font-semibold">257</span>
            </div>
          </div>
          <button
            type="button"
            className="relative cursor-pointer outline-none flex select-none transition-opacity group/button w-7.75 h-8.5"
            aria-label="Join rain pot"
          >
            <div
              className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none"
              style={{
                top: "var(--sb-shadow-size,3px)",
                backgroundColor: "rgb(15,195,101)",
              }}
            />
            <div
              className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0"
              style={{
                height: "calc(100% - var(--sb-shadow-size,3px))",
                backgroundColor: "rgb(92,223,154)",
                color: "rgb(58,56,105)",
              }}
            >
              <div
                className="transition-opacity flex items-center justify-center size-full"
                style={{ filter: "drop-shadow(rgb(15,195,101) 0 2px 0)" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="size-5"
                >
                  <path
                    fill="currentColor"
                    d="M16 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5m5.45 5.6c-.39-.4-.88-.6-1.45-.6h-7l-2.08-.73.33-.94L13 16h2.8c.35 0 .63-.14.86-.37s.34-.51.34-.82c0-.54-.26-.91-.78-1.12L8.95 11H7v9l7 2 8.03-3c.01-.53-.19-1-.58-1.4M5 11H.984v11H5z"
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ name, body, time }) {
  const user = users[name] ?? users.Itz_NinjaPlayzz;
  return (
    <div
      className="relative flex flex-col group/message"
      data-highlight="false"
    >
      <div className="flex gap-1.75 relative group z-1">
        <div
          className="size-10 rounded-[9px] cursor-pointer flex shrink-0 flex-col items-center relative bg-linear-to-b from-[#1D2A53] from-5% p-0.5"
          style={{ "--tw-gradient-to": user.color }}
        >
          <div className="size-full flex items-center justify-center rounded-[7px] bg-[#1A2339]">
            <img
              src={user.avatar}
              className="size-9/12 object-contain object-center no-interaction rounded"
              alt=""
              loading="lazy"
            />
          </div>
        </div>
        <div className="flex flex-col flex-1 min-w-0 gap-0.75">
          <div className="flex items-center min-w-0">
            <div
              className="p-0.5 rounded-[5px]"
              style={{
                background: `linear-gradient(${user.color}55, ${user.color})`,
              }}
            >
              <div
                className="flex items-center justify-center font-medium !leading-none px-1 py-0.25 text-[11px] rounded-[3px] bg-[#263457]"
                style={{ color: user.color }}
              >
                {user.level}
              </div>
            </div>
            <span className="font-semibold text-[13px] ml-1 cursor-pointer truncate">
              {name}
            </span>
            <p className="text-[13px] font-semibold ml-auto pl-1 text-accent">
              {time}
            </p>
          </div>
          <div className="message-body p-1.75 rounded-lg bg-[#223263]">
            <div className="text-sm font-medium text-accent [word-break:break-word]">
              <span>{body}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          aria-label={`Reply to ${name}`}
          className="cursor-pointer flex items-center justify-center group-hover:opacity-100 group-hover:translate-x-0 translate-x-2 opacity-0 transition-all duration-175 bg-[#31478D] hover:bg-[#3B54A4] size-6.5 rounded-md absolute right-0 top-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="size-4 text-accent"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          >
            <g fill="none" stroke="currentColor">
              <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
              <path d="m9 17-5-5 5-5" />
            </g>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function ChatSidebar() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const viewportRef = useRef(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [messages]);

  const sendMessage = (event) => {
    event.preventDefault();
    const body = message.trim();
    if (!body) return;
    setMessages((current) => [...current, ["Itz_NinjaPlayzz", body, "NOW"]]);
    setMessage("");
  };

  return (
    <aside className="fixed bottom-0 left-0 top-20 z-110 hidden w-[var(--layout-left)] flex-col overflow-hidden bg-linear-to-r from-[#152340] to-[#212A53] lg:flex">
      <div className="flex flex-col flex-1 min-h-0 gap-3.5 pt-3.5 relative">
        <div className="flex gap-2 px-3.5">
          <div className="h-10.5 relative flex-1">
            <div className="absolute top-1/2 left-0 right-0 bottom-0 bg-[#27376A] rounded-lg" />
            <div className="h-[calc(100%-3px)] bg-[#364677] px-3 rounded-lg flex items-center relative transition-opacity">
              <ChatIcon />
              <p className="font-semibold ml-2">Chat</p>
            </div>
          </div>
          <div className="h-10.5 relative">
            <div className="absolute top-1/2 left-0 right-0 bottom-0 bg-[#18295E] rounded-lg" />
            <div className="h-[calc(100%-3px)] bg-[#27376A] px-3.5 rounded-lg flex items-center relative">
              <span className="relative flex size-2.5">
                <span className="animate-ping absolute inline-flex size-full rounded bg-[#5CDF9A]/75" />
                <span className="relative inline-flex rounded size-full bg-[#5CDF9A]" />
              </span>
              <p className="text-sm font-semibold ml-2">55</p>
            </div>
          </div>
        </div>

        <div className="flex relative flex-1 min-h-0">
          <RainPot />
          <div className="flex flex-col justify-end flex-1 relative min-h-0">
            <div
              className="z-2 absolute top-0 left-0 right-1 h-20 bg-linear-to-r from-[#152340] to-[#212A53] pointer-events-none"
              style={{
                maskImage: "linear-gradient(rgb(0,0,0), rgba(0,0,0,0))",
              }}
            />
            <div
              ref={viewportRef}
              className="chat-scrollbar size-full overflow-y-auto outline-none pt-[108px] pb-3"
              tabIndex={0}
            >
              <div className="flex-1 flex flex-col gap-5 px-3.5">
                {messages.map(([name, body, time], index) => (
                  <ChatMessage
                    key={`${name}-${index}-${body}`}
                    name={name}
                    body={body}
                    time={time}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-linear-to-r from-[#203665] to-[#303C71]">
          <form
            onSubmit={sendMessage}
            className="bg-[#1D2A53] flex items-center py-2.5 pl-3.5 pr-2 gap-2.25 rounded-xl relative"
          >
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="flex-1 min-w-0 bg-transparent outline-none border-none font-medium text-sm text-white placeholder:text-accent"
              placeholder="Enter a message.."
            />
            <button
              type="button"
              className="shrink-0 cursor-pointer text-accent hover:text-accent-light transition-colors"
              aria-label="Choose emoji"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="size-5.5"
              >
                <path
                  fill="currentColor"
                  d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512m-91.9-186.5C182 346.2 212.6 368 256 368s74-21.8 91.9-42.5c5.8-6.7 15.9-7.4 22.6-1.6s7.4 15.9 1.6 22.6c-22.3 25.6-61 53.5-116.1 53.5s-93.8-27.9-116.1-53.5c-5.8-6.7-5.1-16.8 1.6-22.6s16.8-5.1 22.6 1.6M144.4 208a32 32 0 1 1 64 0 32 32 0 1 1-64 0m192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64"
                />
              </svg>
            </button>
            <button
              type="submit"
              className="relative cursor-pointer outline-none flex select-none transition-opacity group/button h-8"
            >
              <div
                className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none"
                style={{
                  top: "var(--sb-shadow-size,3px)",
                  backgroundColor: "rgb(15,195,101)",
                }}
              />
              <div
                className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 px-2.75"
                style={{
                  height: "calc(100% - var(--sb-shadow-size,3px))",
                  backgroundColor: "rgb(92,223,154)",
                  color: "rgb(58,56,105)",
                }}
              >
                <div
                  className="transition-opacity flex items-center justify-center size-full"
                  style={{ filter: "drop-shadow(rgb(15,195,101) 0 2px 0)" }}
                >
                  SEND
                </div>
              </div>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
