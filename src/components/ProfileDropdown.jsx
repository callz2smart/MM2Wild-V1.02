const navItems = [
  {
    href: "/account/profile",
    label: "Profile",
    viewBox: "0 0 24 24",
    path: "M12 4a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4",
  },
  {
    href: "/account/transactions",
    label: "Transactions",
    viewBox: "0 0 24 24",
    path: "M16.5 19q1.05 0 1.775-.725T19 16.5t-.725-1.775T16.5 14t-1.775.725T14 16.5t.725 1.775T16.5 19m5.8 3.3q-.275.275-.7.275t-.7-.275l-2-2q-.525.35-1.137.525T16.5 21q-1.875 0-3.187-1.312T12 16.5t1.313-3.187T16.5 12t3.188 1.313T21 16.5q0 .65-.175 1.263T20.3 18.9l2 2q.275.275.275.7t-.275.7M5 22q-.825 0-1.412-.587T3 20V4q0-.825.588-1.412T5 2h7.175q.4 0 .763.15t.637.425l4.85 4.85q.275.275.425.638t.15.762v.45q0 .45-.363.725t-.812.15q-.325-.075-.65-.113T16.5 10q-1.4 0-2.613.525T11.8 12H8q-.425 0-.712.288T7 13t.288.713T8 14h2.5q-.2.475-.312.975T10.025 16H8q-.425 0-.712.288T7 17t.288.713T8 18h2.175q.175.775.525 1.463t.85 1.262q.35.375.163.825t-.638.45zm7-18v4q0 .425.288.713T13 9h4zl5 5z",
  },
  {
    href: "/account/bets",
    label: "Game History",
    viewBox: "0 0 24 24",
    path: "M12 21q-3.15 0-5.575-1.912T3.275 14.2q-.1-.375.15-.687t.675-.363q.4-.05.725.15t.45.6q.6 2.25 2.475 3.675T12 19q2.925 0 4.963-2.037T19 12t-2.037-4.962T12 5q-1.725 0-3.225.8T6.25 8H8q.425 0 .713.288T9 9t-.288.713T8 10H4q-.425 0-.712-.288T3 9V5q0-.425.288-.712T4 4t.713.288T5 5v1.35q1.275-1.6 3.113-2.475T12 3q1.875 0 3.513.713t2.85 1.924 1.925 2.85T21 12t-.712 3.513-1.925 2.85-2.85 1.925T12 21m1-9.4 2.5 2.5q.275.275.275.7t-.275.7-.7.275-.7-.275l-2.8-2.8q-.15-.15-.225-.337T11 11.975V8q0-.425.288-.712T12 7t.713.288T13 8z",
  },
  {
    href: "/affiliates",
    label: "Affiliates",
    viewBox: "0 0 36 36",
    paths: [
      "M12 16.14h-.87a8.67 8.67 0 0 0-6.43 2.52l-.24.28v8.28h4.08v-4.7l.55-.62.25-.29a11 11 0 0 1 4.71-2.86A6.6 6.6 0 0 1 12 16.14",
      "M31.34 18.63a8.67 8.67 0 0 0-6.43-2.52 11 11 0 0 0-1.09.06 6.6 6.6 0 0 1-2 2.45 10.9 10.9 0 0 1 5 3l.25.28.54.62v4.71h3.94v-8.32Z",
      "M11.1 14.19h.31a6.45 6.45 0 0 1 3.11-6.29 4.09 4.09 0 1 0-3.42 6.33Z",
      "M24.43 13.44a7 7 0 0 1 0 .69 4 4 0 0 0 .58.05h.19A4.09 4.09 0 1 0 21.47 8a6.53 6.53 0 0 1 2.96 5.44",
      "M18.11 20.3A9.7 9.7 0 0 0 11 23l-.25.28v6.33a1.57 1.57 0 0 0 1.6 1.54h11.49a1.57 1.57 0 0 0 1.6-1.54V23.3l-.24-.3a9.58 9.58 0 0 0-7.09-2.7",
    ],
    circle: true,
  },
];

function MenuIcon({ item }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={item.viewBox}
      className="size-5 mr-1.5 transition-colors group-hover:text-primary"
    >
      {item.paths ? (
        <>
          {item.paths.map((path) => (
            <path key={path} fill="currentColor" d={path} />
          ))}
          {item.circle && <circle cx="17.87" cy="13.45" r="4.47" fill="currentColor" />}
          <path fill="none" d="M0 0h36v36H0z" />
        </>
      ) : (
        <path fill="currentColor" d={item.path} />
      )}
    </svg>
  );
}

function MenuLink({ item }) {
  return (
    <a
      href={item.href}
      className="group px-2 py-1.5 flex items-center justify-start rounded-lg hover:bg-[#283364] text-accent hover:text-white *:drop-shadow-[0_2px_0_#0000001F] font-medium transition-colors"
      type="button"
    >
      <MenuIcon item={item} />
      <span>{item.label}</span>
    </a>
  );
}

export default function ProfileDropdown({ style, user, onLogout }) {
  const level = Number(user.level || 1);
  const levelColor = level === 1 ? "#BEBEBE" : "#F33939";
  const xp = Number(user.xp || 0);
  const requiredXp = Number(user.required_xp || 120000);
  const progress = Math.min(100, Math.max(0, (xp / requiredXp) * 100));
  const sharedLevelStyle = {
    "--level-border-start": "#222a3f",
    "--level-border-end": levelColor,
    "--level-text": levelColor,
  };

  return (
    <div data-reka-popper-content-wrapper="" data-profile-dropdown="" style={style}>
      <div
        data-dismissable-layer=""
        tabIndex={-1}
        className="shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 bg-[#222C57] rounded-xl p-2.5 z-100 min-w-64 max-w-68"
        id="reka-popover-content-v-0-147"
        data-state="open"
        aria-labelledby="reka-popover-trigger-v-0-144"
        role="dialog"
        data-side="bottom"
        data-align="end"
        style={{
          "--reka-popover-content-transform-origin":
            "var(--reka-popper-transform-origin)",
          "--reka-popover-content-available-width":
            "var(--reka-popper-available-width)",
          "--reka-popover-content-available-height":
            "var(--reka-popper-available-height)",
          "--reka-popover-trigger-width": "var(--reka-popper-anchor-width)",
          "--reka-popover-trigger-height": "var(--reka-popper-anchor-height)",
        }}
      >
        <div className="flex flex-col gap-2">
          <a
            href="/account/profile"
            className="px-2 py-1.5 flex flex-col gap-2 rounded-lg font-medium transition-all [--profile-bg:#283364] hover:[--profile-bg:#333F71]"
            type="button"
            style={{
              "--level-glow": "rgba(190, 190, 190, 0.2)",
              background:
                "radial-gradient(135% 100% at 50% 0%, var(--level-glow) 0%, rgba(34, 44, 87, 0) 82.73%), var(--profile-bg)",
            }}
          >
            <div className="flex items-center gap-1 w-full pr-2">
              <div
                className="size-9 shrink-0 flex flex-col items-center relative bg-linear-to-b from-(--level-border-start) from-5% to-(--level-border-end) rounded-lg p-0.5"
                style={sharedLevelStyle}
              >
                <div
                  className="rounded-[6px] size-full flex items-center justify-center"
                  style={{ backgroundColor: "rgb(26, 35, 57)" }}
                >
                  <img
                    src={user.avatar_headshot}
                    className="size-9/12 object-contain object-center rounded-[5px] ease-in-out transition-opacity no-interaction"
                    alt={user.avatar_headshot}
                    loading="lazy"
                    fetchPriority="low"
                  />
                </div>
              </div>
              <div
                className="bg-gradient-to-b from-(--level-border-start) to-(--level-border-end) p-0.5 rounded-md shrink-0"
                style={sharedLevelStyle}
              >
                <div
                  className="rounded-sm size-full flex items-center justify-center py-0.5 text-[10px] font-medium !leading-none text-(--level-text) px-1"
                  style={{ backgroundColor: "rgb(26, 35, 57)" }}
                >
                  {level}
                </div>
              </div>
              <p className="font-medium text-white truncate min-w-0 text-sm">
                {user.username}
              </p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-4.5 ml-auto shrink-0 text-white"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              >
                <path fill="none" stroke="currentColor" d="m9 18 6-6-6-6" />
              </svg>
            </div>
            <div className="h-0.5 w-full bg-accent/15" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[12.5px] font-medium flex-wrap">
                <p className="text-accent mr-2">PROGRESS</p>
                <p>
                  <span className="text-white">{xp.toLocaleString("en-US")}</span>
                  <span className="text-accent">
                    {" "}/ {requiredXp.toLocaleString("en-US")} XP
                  </span>
                </p>
              </div>
              <div className="bg-[#1C2344] rounded-lg h-3 w-full overflow-hidden">
                <div
                  className="h-full rounded-lg transition-all duration-300"
                  style={{
                    backgroundColor: levelColor,
                    boxShadow:
                      "0px 0px 5.6px rgba(0, 0, 0, 0.1), 0px 0px 50px var(--color)",
                    "--color": levelColor,
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          </a>
          <MenuLink item={navItems[0]} />
          <button
            type="button"
            className="relative cursor-pointer outline-none flex select-none group px-2 py-1.5 rounded-lg hover:bg-[#283364] text-accent hover:text-white *:drop-shadow-[0_2px_0_#0000001F] font-medium transition-colors"
          >
            <div className="transition-opacity flex items-center size-full justify-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-5 mr-1.5 transition-colors group-hover:text-primary"
              >
                <path
                  fill="currentColor"
                  d="M12 2C6.486 2 2 6.486 2 12v4.143C2 17.167 2.897 18 4 18h1a1 1 0 0 0 1-1v-5.143a1 1 0 0 0-1-1h-.908C4.648 6.987 7.978 4 12 4s7.352 2.987 7.908 6.857H19a1 1 0 0 0-1 1V18c0 1.103-.897 2-2 2h-2v-1h-4v3h6c2.206 0 4-1.794 4-4 1.103 0 2-.833 2-1.857V12c0-5.514-4.486-10-10-10"
                />
              </svg>
              <span>Support</span>
            </div>
          </button>
          {navItems.slice(1).map((item) => (
            <MenuLink key={item.href} item={item} />
          ))}
          <button
            type="button"
            className="relative cursor-pointer outline-none select-none px-2 py-1.5 rounded-lg bg-error/12 hover:bg-error/18 text-error *:drop-shadow-[0_2px_0_#0000001F] font-medium transition-colors flex items-center"
            onClick={onLogout}
          >
            <div className="transition-opacity flex items-center justify-center size-full">
              <span>Logout</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
