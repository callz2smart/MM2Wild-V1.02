"use client";

import { FormEvent, useState } from "react";

const sideGroups = [
  { title: "GAMES", items: [["⚔", "Case battles"], ["▣", "Cases"], ["●", "Mines"], ["◆", "Upgrader"], ["◒", "Coinflip"]] },
  { title: "REWARDS", items: [["★", "Referral"], ["▣", "Claims"], ["◎", "Affiliates"]] },
  { title: "MORE", items: [["⚑", "100k Race"], ["♟", "Profile"], ["◉", "Support"]] },
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
      <div className="brand"><span className="brand-mark">◉</span> RBX<span>SOUL</span></div>
      <div className="brand-pattern" aria-hidden="true">◔　　◔<br />　◔　　　◔</div>
      <nav className="side-nav" aria-label="Sidebar navigation">{sideGroups.map((group) => <section className="nav-group" key={group.title}>
        <div className="nav-title">{group.title}<span>⌃</span></div>
        {group.items.map(([icon, label], index) => <button className={`side-item ${group.title === "GAMES" && index === 0 ? "active" : ""}`} key={label}><i>{icon}</i><span className="rail" />{label}</button>)}
      </section>)}</nav>
      <button className="language"><span>🇬🇧</span> English <b>⌃</b></button>
    </aside>
    <div className="top-strip"><div className="strip-links"><span>FAQ</span><span>PROVABLY FAIR</span><span>FAIRNESS</span><span>SUPPORT</span><strong>⚑ 100K RACE</strong></div><div className="online">◉ 100 Online <span>|　♟　✕　▮</span></div></div>
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
