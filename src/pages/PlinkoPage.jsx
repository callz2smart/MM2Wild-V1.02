import { useEffect, useMemo, useRef, useState } from "react";

const DIFFICULTIES = {
  easy: { label: "Easy", color: "92, 223, 154" },
  medium: { label: "Medium", color: "223, 197, 92" },
  hard: { label: "Hard", color: "223, 92, 92" },
};

const EASY_MULTIPLIERS = {
  8: [5.2, 2, 1, 0.9, 0.5, 0.9, 1, 2, 5.2],
  9: [5.2, 1.9, 1.5, 0.9, 0.7, 0.7, 0.9, 1.5, 1.9, 5.2],
  10: [8.3, 2.8, 1.3, 1, 0.9, 0.5, 0.9, 1, 1.3, 2.8, 8.3],
  11: [7.8, 2.8, 1.8, 1.2, 0.9, 0.7, 0.7, 0.9, 1.2, 1.8, 2.8, 7.8],
  12: [9.3, 2.8, 1.5, 1.3, 1, 0.9, 0.5, 0.9, 1, 1.3, 1.5, 2.8, 9.3],
  13: [7.5, 3.7, 2.8, 1.8, 1.1, 0.8, 0.7, 0.7, 0.8, 1.1, 1.8, 2.8, 3.7, 7.5],
  14: [6.6, 3.7, 1.8, 1.3, 1.2, 1, 0.9, 0.5, 0.9, 1, 1.2, 1.3, 1.8, 3.7, 6.6],
  15: [14, 7.4, 2.8, 1.9, 1.4, 1, 0.9, 0.7, 0.7, 0.9, 1, 1.4, 1.9, 2.8, 7.4, 14],
  16: [15, 8.4, 1.9, 1.3, 1.3, 1.1, 1, 0.9, 0.5, 0.9, 1, 1.1, 1.3, 1.3, 1.9, 8.4, 15],
};

const MULTIPLIER_OVERRIDES = {
  medium: { 8: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13] },
  hard: { 8: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29] },
};

const BUCKET_PALETTE = {
  green: ["34, 172, 100", "92, 223, 154"],
  cyan: ["34, 172, 158", "92, 223, 201"],
  blue: ["34, 115, 172", "92, 158, 223"],
  violet: ["100, 34, 172", "158, 92, 223"],
  pink: ["172, 34, 158", "223, 92, 210"],
  yellow: ["172, 158, 34", "223, 201, 92"],
  gold: ["172, 136, 34", "223, 178, 92"],
  orange: ["172, 115, 34", "223, 153, 92"],
  red: ["172, 73, 34", "223, 129, 92"],
};

const BUCKET_COLOR_KEYS = {
  8: ["green", "cyan", "yellow", "orange", "red", "orange", "yellow", "cyan", "green"],
  9: ["green", "cyan", "yellow", "orange", "red", "red", "orange", "yellow", "cyan", "green"],
  10: ["green", "cyan", "blue", "yellow", "orange", "red", "orange", "yellow", "blue", "cyan", "green"],
  11: ["green", "cyan", "blue", "yellow", "orange", "red", "red", "orange", "yellow", "blue", "cyan", "green"],
  12: ["green", "cyan", "blue", "yellow", "gold", "orange", "red", "orange", "gold", "yellow", "blue", "cyan", "green"],
  13: ["green", "cyan", "blue", "yellow", "gold", "orange", "red", "red", "orange", "gold", "yellow", "blue", "cyan", "green"],
  14: ["green", "cyan", "blue", "pink", "yellow", "gold", "orange", "red", "orange", "gold", "yellow", "pink", "blue", "cyan", "green"],
  15: ["green", "cyan", "blue", "pink", "yellow", "gold", "orange", "red", "red", "orange", "gold", "yellow", "pink", "blue", "cyan", "green"],
  16: ["green", "cyan", "blue", "violet", "pink", "yellow", "gold", "orange", "red", "orange", "gold", "yellow", "pink", "violet", "blue", "cyan", "green"],
};

function getMultipliers(rows, difficulty) {
  const easy = EASY_MULTIPLIERS[rows];
  const override = MULTIPLIER_OVERRIDES[difficulty]?.[rows];
  if (difficulty === "easy" || !difficulty) return easy;
  if (override) return override;
  return easy.map((value) => {
    const adjusted = difficulty === "hard"
      ? value >= 1 ? value * 2.1 : value * 0.55
      : value >= 1 ? value * 1.45 : value * 0.8;
    return Math.round(adjusted * 10) / 10;
  });
}

const HISTORY = [
  { player: "mahmoud666541", time: "20:17:34", amount: 8, multiplier: 0, profit: -8, avatar: "52342EB50D9E1B55616DEF5BF5439FEE" },
  { player: "mahmoud666541", time: "20:17:26", amount: 8, multiplier: 0, profit: -8, avatar: "52342EB50D9E1B55616DEF5BF5439FEE" },
  { player: "mahmoud666541", time: "20:17:16", amount: 8, multiplier: 0, profit: -8, avatar: "52342EB50D9E1B55616DEF5BF5439FEE" },
  { player: "ARQUAM_7777", time: "20:16:39", amount: 12, multiplier: 0, profit: -12, avatar: "509B650E7B6A683CED1F0A996E5E334A" },
  { player: "ARQUAM_7777", time: "20:15:39", amount: 1, multiplier: 4.5, profit: 3, avatar: "509B650E7B6A683CED1F0A996E5E334A" },
  { player: "harelggpoi", time: "20:15:18", amount: 4, multiplier: 0, profit: -4, avatar: "978C31AD264CDE4738A074E455B6E434" },
];

function SoundIcon({ muted }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4.5" aria-hidden="true">
      {muted ? (
        <path fill="currentColor" d="m3.3 2 18.7 18.7-1.3 1.3-5.05-5.05A7.9 7.9 0 0 1 14 17.7v-2.05q.1-.025.2-.075L9 10.375V20l-5-5H1V9h3l.5-.5L2 3.3zm15.15 11.15A6 6 0 0 0 14 6.35V4.3A8 8 0 0 1 20.5 14.9z" />
      ) : (
        <path fill="currentColor" d="M14 20.725v-2.05q2.25-.65 3.625-2.5t1.375-4.2-1.375-4.2T14 5.275v-2.05q3.1.7 5.05 3.138T21 11.975t-1.95 5.613T14 20.725M3 15V9h4l5-5v16l-5-5zm11 1V7.95q1.175.55 1.838 1.65T16.5 12q0 1.275-.663 2.363T14 16" />
      )}
    </svg>
  );
}

function FairnessIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 21 20" className="size-5 sm:mr-1.25" aria-hidden="true">
      <path fill="currentColor" d="M8.912 11.375a.53.53 0 0 0-.53-.53h-.184L6.384 6.753c-.348.091-.698.171-1.05.24l1.706 3.852H3.372l1.684-3.8c-.41.074-.822.133-1.236.177l-1.606 3.623H2.03a.53.53 0 0 0-.529.53c-.008 1.82 1.933 3.04 3.706 3 1.772.041 3.714-1.181 3.706-3ZM18.972 10.845h-.185l-1.605-3.623a17.132 17.132 0 0 1-1.236-.176l1.683 3.8h-3.667l1.707-3.852a17.11 17.11 0 0 1-1.052-.241l-1.813 4.092h-.185a.53.53 0 0 0-.53.53c0 .827.404 1.596 1.136 2.165 1.364 1.106 3.777 1.106 5.142 0 .732-.57 1.135-1.338 1.135-2.165a.53.53 0 0 0-.53-.53ZM2.03 6.257c1.453 0 2.9-.197 4.3-.586a15.584 15.584 0 0 1 8.34 0c1.4.389 2.847.586 4.3.586.6 0 .737-.842.168-1.032a23.547 23.547 0 0 1-3.98-1.75l-.836-.465a7.892 7.892 0 0 0-3.292-.972v-.546c-.026-.701-1.034-.7-1.06 0v.546a7.892 7.892 0 0 0-3.292.972l-.837.465a23.543 23.543 0 0 1-3.979 1.75c-.57.19-.433 1.032.168 1.032ZM12.617 16.916H8.38c-.877 0-1.588.711-1.588 1.588 0 .293.237.53.53.53h6.352a.53.53 0 0 0 .53-.53c0-.877-.711-1.588-1.588-1.588Z" />
      <path fill="currentColor" d="M9.969 15.857h1.059V6.171a14.236 14.236 0 0 0-1.06 0v9.686Z" />
    </svg>
  );
}

function PlinkoBoard({ rows, difficulty, drop }) {
  const canvasRef = useRef(null);
  const [hoveredMultiplier, setHoveredMultiplier] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext("2d");
    let frame = 0;
    let start = 0;

    const draw = (timestamp = 0) => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const width = Math.max(bounds.width, 1);
      const height = width * 0.75;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      const top = height * 0.063;
      const usableWidth = width * 0.863158;
      const pegRadius = rows === 9
        ? Math.max(4, width * 0.01067)
        : Math.max(3.6, width * 0.011 * (8 / rows));
      const bottom = rows === 9
        ? height - width * 0.0335
        : rows === 16
          ? height * 0.95
          : height - pegRadius * 3.35;
      const rowGap = (bottom - top) / Math.max(rows - 1, 1);

      context.shadowColor = "rgba(255,255,255,.18)";
      context.shadowBlur = Math.max(2, width * 0.003);
      context.fillStyle = "#fff";
      for (let row = 0; row < rows; row += 1) {
        const pegCount = row + 3;
        const rowWidth = usableWidth * ((row + 2) / (rows + 1));
        const startX = (width - rowWidth) / 2;
        const gap = rowWidth / Math.max(pegCount - 1, 1);
        for (let peg = 0; peg < pegCount; peg += 1) {
          context.beginPath();
          context.arc(startX + peg * gap, top + row * rowGap, pegRadius, 0, Math.PI * 2);
          context.fill();
        }
      }

      if (drop) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / 1300, 1);
        const y = top - 18 + progress * (bottom - top + 18);
        const wobble = Math.sin(progress * Math.PI * rows) * width * 0.018;
        context.shadowColor = "rgba(243,178,57,.8)";
        context.shadowBlur = 14;
        context.fillStyle = difficulty === "hard" ? "#df5c5c" : difficulty === "medium" ? "#dfc55c" : "#f3b239";
        context.beginPath();
        context.arc(width / 2 + wobble, y, Math.max(5, width * 0.011), 0, Math.PI * 2);
        context.fill();
        if (progress < 1) frame = window.requestAnimationFrame(draw);
      }
    };

    draw();
    const observer = new ResizeObserver(() => draw());
    observer.observe(canvas);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [rows, difficulty, drop]);

  const multipliers = getMultipliers(rows, difficulty);
  const tooltipIndex = Math.min(hoveredMultiplier ?? 0, multipliers.length - 1);
  const chanceForIndex = (index) => {
    let combinations = 1;
    for (let step = 1; step <= index; step += 1) {
      combinations = (combinations * (rows - step + 1)) / step;
    }
    return (combinations / 2 ** rows) * 100;
  };

  return (
    <div className="flex gap-5 items-center justify-center flex-1 relative rounded-2xl overflow-hidden py-12 @xl/template:text-[0.7em] @3xl/template:text-[0.9em] @5xl/template:text-[1.115em]">
      <div className="w-full max-w-164 relative z-2">
        <canvas ref={canvasRef} width="760" height="570" className="w-full" style={{ backgroundSize: "contain" }} aria-label="Plinko board" />
        <div className={`flex h-[clamp(10px,0.352px+2.609vw,16px)] w-full justify-center lg:h-7 ${rows === 8 ? "translate-y-3" : rows === 16 ? "-translate-y-0.5" : ""}`}>
          <div className="flex relative" style={{ width: "86.3158%", gap: "0.9%" }} onMouseLeave={() => setHoveredMultiplier(null)}>
            <div
              data-v-95febfa4=""
              className={`multiplier-info-tooltip bg-[#3A4B84] p-3.5 rounded-xl absolute left-0 right-0 bottom-full mb-3.5 z-10 flex gap-3 items-center transition-opacity duration-300 ease-in-out will-change-opacity ${
                hoveredMultiplier === null
                  ? "opacity-0 pointer-events-none"
                  : "opacity-100"
              }`}
              aria-hidden={hoveredMultiplier === null}
            >
                <div data-v-95febfa4="" className="flex flex-col gap-1 flex-1">
                  <p data-v-95febfa4="" className="text-[#B8CEFF] text-sm font-medium">Multiplier</p>
                  <div data-v-95febfa4="" className="bg-[#1C2955] rounded-lg p-2.5 flex items-center justify-between">
                    <p data-v-95febfa4="" className="text-sm font-medium">{multipliers[tooltipIndex].toFixed(3)}</p>
                    <p data-v-95febfa4="" className="text-[#B8CEFF] text-sm font-bold">x</p>
                  </div>
                </div>
                <div data-v-95febfa4="" className="w-0.5 h-16 rounded-full bg-[#465997]" />
                <div data-v-95febfa4="" className="flex flex-col gap-1 flex-1">
                  <p data-v-95febfa4="" className="text-[#B8CEFF] text-sm font-medium">Chance</p>
                  <div data-v-95febfa4="" className="bg-[#1C2955] rounded-lg p-2.5 flex items-center justify-between">
                    <p data-v-95febfa4="" className="text-sm font-medium">{chanceForIndex(tooltipIndex).toFixed(6)}</p>
                    <p data-v-95febfa4="" className="text-[#B8CEFF] text-sm font-bold">%</p>
                  </div>
                </div>
            </div>
            {multipliers.map((multiplier, index) => {
              const colors = BUCKET_PALETTE[BUCKET_COLOR_KEYS[rows][index]];
              const multiplierLabel = multiplier >= 10 && Number.isInteger(multiplier)
                ? String(multiplier)
                : multiplier.toFixed(1);
              return (
                <div
                  key={`${multiplier}-${index}`}
                  className="relative flex-1 min-w-0"
                  onMouseEnter={() => setHoveredMultiplier(index)}
                  onFocus={() => setHoveredMultiplier(index)}
                  onBlur={() => setHoveredMultiplier(null)}
                  tabIndex="0"
                >
                  <div className="absolute size-full cursor-pointer" style={{ bottom: "9.75px" }}>
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-full" style={{ background: `rgb(${colors[0]})`, borderRadius: 7 }}>
                      <div className="left-0 right-0 top-0 h-[calc(100%-2px)] rounded-lg absolute" style={{ background: `rgb(${colors[1]})` }} />
                    </div>
                    <p className="text-[#1B2649] absolute left-1/2 top-1/2 -translate-1/2 text-[clamp(6px,2.784px+0.87vw,8px)] font-bold lg:text-[clamp(10px,-16.944px+1.5vw,12px)]">{multiplierLabel}×</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="hidden sm:block bg-[#141C34] rounded-[.7em] p-[.5em] w-[3.5em] h-[14em] z-2 absolute top-1/2 -translate-y-1/2 right-8 overflow-hidden transition-opacity opacity-0">
        <div className="bg-linear-to-b from-transparent to-[#141C34] absolute bottom-0 left-0 right-0 h-10 z-2 no-interaction" />
        <div className="h-full overflow-hidden"><div className="flex flex-col gap-[.5em]" /></div>
      </div>
      <img
        src="/plinko/plinko-illustration.webp"
        alt="Board"
        className="absolute inset-0 size-full object-cover object-center no-interaction"
      />
    </div>
  );
}

function HistoryRow({ entry, index }) {
  const won = entry.profit > 0;
  return (
    <div className={`flex text-left text-sm font-medium py-2.5 h-[56px] rounded-xl transition-all duration-300 ease-out cursor-pointer hover:opacity-80 ${index % 2 ? "bg-[#17203c]/75" : "bg-[#263462]/75"}`}>
      <div className="pl-4 flex items-center" style={{ width: "15%" }}>
        <div className="flex gap-2 items-center" style={{ filter: "drop-shadow(rgba(255,216,150,.34) 0 0 12.3px) drop-shadow(rgb(52,73,134) 0 2px 0)" }}>
          <span className="size-5 rounded-full bg-[#FFD896] text-[#263462] flex items-center justify-center text-[10px] font-bold">●</span>
          <span className="uppercase text-white">Plinko</span>
        </div>
      </div>
      <div className="text-white flex items-center gap-2" style={{ width: "24%" }}>
        <div className="size-8 flex flex-col items-center relative bg-linear-to-b from-[#26293a] to-[#F3B239] rounded-lg p-0.5">
          <div className="rounded-[6px] size-full flex items-center justify-center bg-[#1A2339]">
            <img src={`https://tr.rbxcdn.com/30DAY-AvatarHeadshot-${entry.avatar}-Png/180/180/AvatarHeadshot/Webp/noFilter`} className="size-9/12 object-contain object-center rounded-[5px]" alt={entry.player} loading="lazy" />
          </div>
        </div>
        <span className="font-medium">{entry.player}</span>
      </div>
      <div className="text-accent flex items-center" style={{ width: "11%" }}>{entry.time}</div>
      <div className="flex items-center" style={{ width: "20%" }}><div className="flex items-center gap-2"><img src="/coin.webp" className="bg-cover bg-center size-5" alt="" /><span className="tabular-nums">{entry.amount}</span></div></div>
      <div className="text-accent flex items-center" style={{ width: "15%" }}>x{entry.multiplier.toFixed(2)}</div>
      <div className="pr-4 flex items-center justify-end" style={{ width: "15%" }}>
        <div className={`flex items-center justify-center gap-2 py-1.5 px-2.5 rounded-lg min-w-23 w-max ${won ? "bg-[#5CDF9A]/9 text-[#5CDF9A]" : "bg-accent/9 text-accent"}`}>
          <img src="/coin.webp" className="bg-cover bg-center size-5" alt="" />
          <span>{won ? "+" : ""}<span className="tabular-nums">{entry.profit}</span></span>
        </div>
      </div>
    </div>
  );
}

export default function PlinkoPage({ selectedBalanceType = "mm2" }) {
  const [betAmount, setBetAmount] = useState("100");
  const [difficulty, setDifficulty] = useState("easy");
  const [rows, setRows] = useState(8);
  const [balances, setBalances] = useState({ mm2: 0, crypto: 0 });
  const [muted, setMuted] = useState(false);
  const [drop, setDrop] = useState(0);
  const [historyTab, setHistoryTab] = useState("All Bets");
  const [historyLimit, setHistoryLimit] = useState(10);
  const [limitOpen, setLimitOpen] = useState(false);

  const visibleHistory = useMemo(() => HISTORY.slice(0, historyLimit), [historyLimit]);
  const selectedBalance = balances[selectedBalanceType] ?? 0;
  const canBet = Number(betAmount) > 0 && selectedBalance > 0;

  useEffect(() => {
    const controller = new AbortController();

    const loadBalances = async (event) => {
      const eventMm2Balance = Number(event?.detail?.mm2Balance);
      const eventCryptoBalance = Number(event?.detail?.cryptoBalance);
      if (Number.isFinite(eventMm2Balance) || Number.isFinite(eventCryptoBalance)) {
        setBalances((current) => ({
          mm2: Number.isFinite(eventMm2Balance) ? eventMm2Balance : current.mm2,
          crypto: Number.isFinite(eventCryptoBalance) ? eventCryptoBalance : current.crypto,
        }));
        return;
      }

      try {
        const response = await fetch("/api/session", { signal: controller.signal });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.user) return;
        setBalances({
          mm2: Number(payload.user.mm2_balance) || 0,
          crypto: Number(payload.user.crypto_balance) || 0,
        });
      } catch {
      }
    };

    loadBalances();
    window.addEventListener("mm2wild:balance-updated", loadBalances);
    return () => {
      controller.abort();
      window.removeEventListener("mm2wild:balance-updated", loadBalances);
    };
  }, []);

  const adjustBet = (factor) => {
    const amount = Number(betAmount) || 0;
    setBetAmount(String(Math.max(0, Math.round(amount * factor * 100) / 100)));
  };

  return (
    <div className="site-content">
      <div className="max-w-[1296px] mx-auto flex flex-col @container/content px-0 sm:px-4 md:px-12 min-h-[calc(100dvh-var(--layout-top))]">
        <div className="page-content pt-6 sm:pt-12 pb-6 flex flex-col gap-6">
          <div className="flex flex-col px-4 sm:px-0 gap-3 sm:gap-0 sm:flex-row justify-between items-center">
            <h1 className="text-2xl font-bold">PLINKO</h1>
            <div className="flex justify-between items-center gap-2 w-full sm:w-auto">
              <button type="button" onClick={() => setMuted((value) => !value)} aria-pressed={muted} aria-label={muted ? "Unmute Plinko" : "Mute Plinko"} className="text-accent size-10 flex items-center justify-center rounded-lg bg-[#202D57] hover:bg-[#2D3D73] transition-colors cursor-pointer"><SoundIcon muted={muted} /></button>
              <a href="/fairness" className="text-accent bg-[#202D57] hover:bg-[#2D3D73] rounded-lg h-10 px-2.5 sm:px-3 text-sm font-medium flex items-center justify-center transition-colors cursor-pointer"><FairnessIcon /><span className="hidden sm:inline">FAIRNESS</span></a>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 px-4 sm:px-0">
            <div className="w-full lg:w-[340px] order-2 lg:order-1">
              <div className="bg-[#1B294C] rounded-2xl px-4 py-5 w-full lg:w-82 flex flex-col gap-5 h-full">
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium text-accent">Bet Amount</p>
                  <div className="bg-[#121C33] rounded-xl px-3 py-2 flex items-center gap-2">
                    <img src="/coin.webp" className="bg-cover bg-center size-5 shrink-0" alt="" />
                    <div className="w-full relative flex group rounded-lg items-center justify-center">
                      <div className="absolute inset-0.25 ring-2 ring-transparent rounded-lg transition-shadow pointer-events-none" />
                      <input type="text" value={betAmount} onChange={(event) => setBetAmount(event.target.value.replace(/[^0-9.]/g, ""))} className="flex-1 bg-transparent text-white outline-none text-sm font-medium min-w-0 size-full peer text-[15px] placeholder:text-accent" placeholder="0" inputMode="decimal" aria-label="Bet amount" />
                    </div>
                    <button type="button" onClick={() => adjustBet(0.5)} className="text-sm font-medium text-accent bg-[#203059] rounded-md px-1.5 py-1.25 hover:bg-[#2D3D73] transition-colors cursor-pointer">1/2</button>
                    <button type="button" onClick={() => adjustBet(2)} className="text-sm font-medium text-accent bg-[#203059] rounded-md px-1.5 py-1.25 hover:bg-[#2D3D73] transition-colors cursor-pointer">2X</button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 transition-opacity">
                  <p className="text-sm font-medium text-accent">Difficulty</p>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(DIFFICULTIES).map(([id, option]) => (
                      <button key={id} type="button" onClick={() => setDifficulty(id)} className="rounded-lg py-2.5 group relative overflow-hidden font-medium text-sm cursor-pointer" style={{ color: `rgb(${option.color})` }}>
                        <div className="bg-linear-to-br rounded-lg absolute inset-0 transition-opacity" style={{ backgroundImage: `linear-gradient(to right bottom, rgb(${option.color}), rgba(${option.color}, .15))`, opacity: difficulty === id ? 1 : 0 }} />
                        <div className="bg-[#203059] group-hover:bg-[#253867] rounded-[6px] absolute inset-0.5 transition-colors" />
                        <p className="relative">{option.label}</p>
                        <div className="absolute size-8 -bottom-6 blur-[30px] rounded-lg" style={{ background: `rgb(${option.color})` }} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 transition-opacity">
                  <p className="text-sm font-medium text-accent">Rows ({rows})</p>
                  <div className="bg-[#121C33] rounded-xl p-3 flex items-center gap-2">
                    <div className="bg-[#203059] rounded-lg size-7.5 flex items-center justify-center shrink-0"><p className="font-semibold text-accent text-sm">8</p></div>
                    <input className="plinko-range relative w-full" type="range" min="8" max="16" value={rows} onChange={(event) => setRows(Number(event.target.value))} style={{ "--plinko-value": rows }} aria-label="Plinko rows" />
                    <div className="bg-[#203059] rounded-lg size-7.5 flex items-center justify-center shrink-0"><p className="font-semibold text-accent text-sm leading-none">16</p></div>
                  </div>
                </div>

                <div className="h-0.5 bg-accent/10" />
                <button type="button" disabled={!canBet} onClick={() => setDrop((value) => value + 1)} className={`relative cursor-pointer outline-none flex select-none transition-opacity group/button h-11 ${canBet ? "" : "opacity-40 pointer-events-none"}`}>
                  <div className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none" style={{ top: "var(--sb-shadow-size,3px)", backgroundColor: "rgb(211, 133, 2)" }} />
                  <div className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0" style={{ height: "calc(100% - var(--sb-shadow-size,3px))", backgroundColor: "rgb(243, 178, 57)", color: "rgb(58, 56, 105)" }}>
                    <div className="transition-opacity flex items-center justify-center size-full" style={{ filter: "drop-shadow(rgb(211, 133, 2) 0 2px 0)" }}>PLACE BET</div>
                  </div>
                </button>
              </div>
            </div>
            <div className="flex-1 min-w-0 order-1 lg:order-2"><PlinkoBoard rows={rows} difficulty={difficulty} drop={drop} /></div>
          </div>

          <div className="px-4 sm:px-0">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between gap-4 max-[530px]:flex-col max-[530px]:items-stretch">
                <div className="relative flex bg-[#2F3F71] p-1.5 rounded-[10px] w-max gap-0 max-[530px]:w-full max-[530px]:flex-wrap">
                  {["All Bets", "My Bets", "High Rollers", "Lucky Wins"].map((tab) => (
                    <button key={tab} type="button" onClick={() => setHistoryTab(tab)} className={`relative z-10 px-4 py-2 text-sm font-semibold text-center whitespace-nowrap transition-colors max-[530px]:w-1/2 rounded-lg ${historyTab === tab ? "bg-primary text-[#3A3869] shadow-[0_3px_0_#D38502]" : "text-white hover:bg-white/5"}`}>{tab}</button>
                  ))}
                </div>
                <div className="flex flex-col shrink-0 max-[530px]:w-full relative">
                  <button type="button" onClick={() => setLimitOpen((open) => !open)} className="flex items-center cursor-pointer outline-none group relative bg-[#2F3F71] rounded-[10px] h-10 px-3.5 min-w-0 justify-center gap-1.5 text-sm max-[530px]:w-full" role="combobox" aria-expanded={limitOpen} data-state={limitOpen ? "open" : "closed"}>
                    <div className="absolute inset-0.25 ring-2 ring-transparent rounded-[10px] transition-shadow pointer-events-none" />
                    <span className="text-left truncate flex-1 min-w-0 font-medium">{historyLimit}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4 transition-transform group-data-[state=open]:rotate-180" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path fill="none" stroke="currentColor" d="m6 9 6 6 6-6" /></svg>
                  </button>
                  {limitOpen ? (
                    <div className="absolute right-0 top-12 z-20 min-w-full rounded-lg bg-[#263457] p-1.5 shadow-md">
                      {[10, 25, 50].map((limit) => <button key={limit} type="button" onClick={() => { setHistoryLimit(limit); setLimitOpen(false); }} className={`h-9 w-full rounded-md px-2.5 text-left text-sm font-semibold ${historyLimit === limit ? "bg-[#57689A] text-white" : "text-accent hover:bg-[#57689A] hover:text-white"}`}>{limit}</button>)}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="overflow-hidden" data-reka-scroll-area-viewport="">
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="w-full min-w-[880px]">
                    <div className="flex text-left text-sm pb-3 text-accent/70 font-medium">
                      <div className="pl-4" style={{ width: "15%" }}>GAME</div><div style={{ width: "24%" }}>PLAYER</div><div style={{ width: "11%" }}>DATE</div><div style={{ width: "20%" }}>AMOUNT</div><div style={{ width: "15%" }}>MULTIPLIER</div><div className="pr-4 text-right" style={{ width: "15%" }}>PROFIT</div>
                    </div>
                    <div className="flex flex-col gap-2" style={{ maskImage: "linear-gradient(rgb(0,0,0) 70%, rgba(0,0,0,0))" }}>
                      {visibleHistory.map((entry, index) => <HistoryRow key={`${entry.player}-${entry.time}`} entry={entry} index={index} />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
