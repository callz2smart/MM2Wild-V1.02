"use client";

import { FormEvent, useState } from "react";
import sidebarBanner from "./image.png";

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    battles: <><path d="m4 4 16 16M14 4l2 2-9 9-3 1 1-3 9-9ZM10 18l-2 2-4-4 2-2" /><path d="m18 14 2 2-4 4-2-2" /></>,
    cases: <><path d="M4 6h16v14H4z" /><path d="M8 6V4h8v2M9 12h6v4H9z" /></>,
    mines: <><circle cx="11" cy="13" r="7" /><path d="m15 7 2-3 3 2-3 3M8 13h.01M12 16h.01" /></>,
    upgrader: <><path d="m4 14 8-7 8 7-3 3-5-4-5 4z" /><path d="m4 8 8-7 8 7" /></>,
    coinflip: <><path d="M5 19 16 8l3 3L8 22H5z" /><circle cx="17" cy="7" r="4" /></>,
    referral: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
    claims: <><path d="M4 9h16v11H4zM3 6h18v4H3zM12 6v14" /><path d="M12 6c-4 0-5-4-2-4 2 0 2 4 2 4Zm0 0c4 0 5-4 2-4-2 0-2 4-2 4Z" /></>,
    affiliates: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></>,
    race: <><path d="M5 21V4" /><path d="M6 5h10l-2 3 2 3H6" /></>,
    profile: <><circle cx="12" cy="7" r="3" /><path d="M5 20c.5-4 2.5-6 7-6s6.5 2 7 6Z" /></>,
    support: <><path d="M4 13a8 8 0 0 1 16 0v5h-4v-6h4M4 12v6h4v-6H4Z" /><path d="M16 19c-1 2-3 2-5 2" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function SocialIcons() {
  return <span className="social-icons" aria-label="Social links">
    <button aria-label="Discord"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.32 4.37A19.8 19.8 0 0 0 15.43 2.9l-.61 1.25a18.3 18.3 0 0 0-5.63 0L8.57 2.9a19.7 19.7 0 0 0-4.89 1.48C.59 8.94-.25 13.39.17 17.77a19.9 19.9 0 0 0 6 3.03l1.46-2a12.8 12.8 0 0 1-2.3-1.1l.57-.44c4.44 2.06 9.25 2.06 13.64 0l.58.44c-.74.43-1.51.8-2.3 1.1l1.46 2a19.8 19.8 0 0 0 6-3.03c.5-5.08-.85-9.49-3.96-13.4ZM8.02 15.09c-1.33 0-2.43-1.22-2.43-2.72s1.07-2.72 2.43-2.72 2.45 1.23 2.43 2.72c0 1.5-1.08 2.72-2.43 2.72Zm7.97 0c-1.34 0-2.43-1.22-2.43-2.72s1.07-2.72 2.43-2.72 2.45 1.23 2.43 2.72c0 1.5-1.07 2.72-2.43 2.72Z" /></svg></button>
    <button aria-label="X"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.24 2h3.31l-7.23 8.26L22.82 22h-6.65l-5.21-6.82L5 22H1.69l7.72-8.82L1.26 2h6.82l4.71 6.23L18.24 2Zm-1.16 17.93h1.83L7.08 3.96H5.11l11.97 15.97Z" /></svg></button>
    <button aria-label="Community"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18V6h3.1l5.9 7.1L17.9 6H21v12h-3.2v-7.1L12 17.7l-5.8-6.8V18H3Z" /></svg></button>
  </span>;
}

const sideGroups = [
  { title: "GAMES", items: [["battles", "Case battles"], ["cases", "Cases"], ["mines", "Mines"], ["upgrader", "Upgrader"], ["coinflip", "Coinflip"]] },
  { title: "REWARDS", items: [["referral", "Referral"], ["claims", "Claims"], ["affiliates", "Affiliates"]] },
  { title: "MORE", items: [["race", "100k Race"], ["profile", "Profile"], ["support", "Support"]] },
];
const games = [["⚔", "CASE BATTLES"], ["▣", "CASES"], ["●", "MINES"], ["◆", "UPGRADER"], ["◒", "COINFLIP"]];
const initialMessages = [
  ["🧑🏽", "50", "ASAP189", "can i get some of my loss back?"],
  ["🧑🏻‍🦳", "87", "ASAP189", "Is there any way i can get the giveaway now? please i really need it"],
  ["🧑🏽", "32", "ASAP189", "BRO! why am i losing so much this shit is so rigged fuck.."],
  ["🧙🏻", "65", "ASAP189", "You are just too bad at playing LMAO, keep cryin lil bro. and yeah this is not rigged at all i won so much from this site LOL!"],
  ["🥷", "65", "ASAP189", "@Bigbetguy which game did you lose in tho?"],
  ["🧑🏽", "65", "ASAP189", "This guy loses in all games dont waste your time on him"],
  ["🦊", "65", "ASAP189", "OMG Bro i won like 3 bands from 50 bucks next person to msg gets a tip from me 😭"],
];
const bets = Array.from({ length: 5 }, (_, index) => ({ game: index === 4 ? "Case battles" : "Coinflip", user: index === 2 ? "BIGBETGUY" : "ASAP189", amount: index === 4 ? "6,420.00" : "10,843.00", multiplier: index === 4 ? "X14.50" : "X25.00" }));

export default function Home() {
  const [betFilter, setBetFilter] = useState("All Bets");
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  function sendMessage(event: FormEvent) { event.preventDefault(); if (!message.trim()) return; setMessages((current) => [...current, ["👾", "65", "YOU", message.trim()]]); setMessage(""); }

  return <div className="site-shell">
    <aside className="sidebar">
      <img className="sidebar-banner" src={sidebarBanner.src} alt="RBXSOUL" />
      <nav className="side-nav" aria-label="Sidebar navigation">{sideGroups.map((group) => <section className="nav-group" key={group.title}>
        <div className="nav-title">{group.title}<svg viewBox="0 0 12 8" aria-hidden="true"><path d="m2 6 4-4 4 4" /></svg></div>
        {group.items.map(([icon, label], index) => <button className={`side-item ${group.title === "GAMES" && index === 0 ? "active" : ""}`} key={label}><i><NavIcon name={icon} /></i><span className="rail" />{label}</button>)}
      </section>)}</nav>
      <button className="language"><span>🇬🇧</span> English <b>⌃</b></button>
    </aside>
    <div className="top-strip"><div className="strip-links"><span>FAQ</span><span>PROVABLY FAIR</span><span>FAIRNESS</span><span>SUPPORT</span><strong>⚑ 100K RACE</strong></div><div className="online"><b>◉ 100 Online</b><i className="social-divider" /><SocialIcons /></div></div>
    <header className="header">
      <nav className="main-nav" aria-label="Primary navigation"><button className="selected"><span>⬟</span> HOME</button><button><span>♛</span> LEADERBOARD</button><button><span>⌘</span> BONUS</button></nav>
      <div className="account-actions"><button className="balance"><b>$ 745</b><small>.32</small><span>⌄</span></button><button className="wallet">Wallet</button><button className="withdraw">🛒　Withdraw</button><span className="divider" /><button className="profile"><span>👾</span>@asap189　⌄</button><button className="square">◉</button><button className="square">♟</button></div>
    </header>
    <main className="main-content">
      <section className="hero"><div className="star-field" aria-hidden="true">✦ ✧ ✦<br />✧ ✦ ✧<br />✦ ✧ ✦</div><div className="hero-copy"><h1>RBXSOUL IS NOW <em>LIVE!</em><br />START PLAYING NOW!</h1><p>JOIN OUR DISCORD SERVER FOR MORE UPDATES</p><button>JOIN DISCORD</button></div><div className="hero-art" aria-hidden="true"><div className="discord-face"><i /><i /><b>⌣</b></div><div className="case"><span>RBX</span></div></div><div className="dots"><b /> <i /> <i /></div></section>
      <section className="originals"><h2><span>♨</span> Clash Originals</h2><div className="game-grid">{games.map(([icon, title]) => <button className="game-card" key={title}><b>{icon}</b> {title}<span className="ghost">◉</span></button>)}</div></section>
      <section className="history"><div className="history-head"><h2><span>◴</span> Bet History</h2><div className="filters">{["All Bets", "High Roller", "Luckiest Wins"].map((filter) => <button key={filter} onClick={() => setBetFilter(filter)} className={betFilter === filter ? "active" : ""}>{filter}</button>)}</div></div>
        <div className="bet-table"><div className="bet-row labels"><span>Game</span><span>Time</span><span>Username</span><span>Amount</span><span>Multiplier</span><span>Result</span></div>{bets.map((bet, index) => <div className="bet-row" key={index}><span><b className="purple">◒</b> {bet.game}</span><span>3 min ago</span><span>👾　{bet.user}</span><strong>{bet.amount}<small>.00</small></strong><strong>{bet.multiplier}</strong><strong className="purple">{bet.amount}</strong></div>)}</div>
      </section>
    </main>
    <aside className="chat"><div className="chat-head"><span>●　▣</span><span>🇬🇧 <b>English Chat</b>　<i>● 73</i>　⌄</span></div><div className="messages">{messages.map(([avatar, level, user, body], index) => <article className="message" key={`${user}-${index}`}><span className="avatar">{avatar}</span><div><header><i>{level}</i><b>{user}</b></header><p>{body}</p></div></article>)}</div><form className="chat-form" onSubmit={sendMessage}><label><input aria-label="Chat message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Type a message..." /><span>☻</span></label><button type="submit">SEND</button></form></aside>
  </div>;
}
