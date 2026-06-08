import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/* ------------------------------------------------------------------ *
 * Tarnmail hero preview — an animated, looping product walkthrough.
 * Pure frame-driven animation (no CSS transitions / no tailwind anim).
 * Themeable through the `accent` prop so it follows the live brand color.
 * ------------------------------------------------------------------ */

export type HeroPreviewProps = {
  accent: string;
  accentDark: string;
};

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const SLATE = {
  900: "#0f172a",
  700: "#334155",
  600: "#475569",
  500: "#64748b",
  400: "#94a3b8",
  300: "#cbd5e1",
  200: "#e2e8f0",
  100: "#f1f5f9",
  50: "#f8fafc",
};

type Row = {
  name: string;
  subject: string;
  snippet: string;
  time: string;
  unread: boolean;
  star: boolean;
  bg: string;
  fg: string;
};

const BASE_ROWS: Row[] = [
  {
    name: "GitHub",
    subject: "[tarnmail] New sign-in from Chrome",
    snippet: "We noticed a new login to your account",
    time: "8:30",
    unread: true,
    star: true,
    bg: "#e2e8f0",
    fg: "#334155",
  },
  {
    name: "Dana Whitlock",
    subject: "Q3 roadmap review",
    snippet: "Sharing the deck ahead of Thursday",
    time: "Tue",
    unread: false,
    star: false,
    bg: "#d1fae5",
    fg: "#047857",
  },
  {
    name: "Lemon Squeezy",
    subject: "Your payout is on the way",
    snippet: "$1,204.50 will arrive in 2 days",
    time: "Tue",
    unread: false,
    star: false,
    bg: "#fef3c7",
    fg: "#b45309",
  },
  {
    name: "Trustpilot",
    subject: "Looking to grow your business?",
    snippet: "Collect reviews on autopilot",
    time: "Mon",
    unread: false,
    star: false,
    bg: "#e0f2fe",
    fg: "#0369a1",
  },
];

const NEW_MAIL: Row = {
  name: "Sentry",
  subject: "Weekly report for tarnmail",
  snippet: "Issues down 12% week over week",
  time: "now",
  unread: true,
  star: false,
  bg: "#ede9fe",
  fg: "#6d28d9",
};

const initials = (n: string) =>
  n
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Avatar: React.FC<{ row: Row; size?: number }> = ({ row, size = 30 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: row.bg,
      color: row.fg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.4,
      fontWeight: 700,
      flexShrink: 0,
    }}
  >
    {initials(row.name)}
  </div>
);

const Star: React.FC<{ filled: boolean; size?: number }> = ({
  filled,
  size = 15,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path
      d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z"
      fill={filled ? "#fbbf24" : "none"}
      stroke={filled ? "#fbbf24" : SLATE[300]}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
  </svg>
);

const MailRow: React.FC<{
  row: Row;
  accent: string;
  progress: number; // 0..1 reveal
  highlight?: number; // 0..1 accent wash (1 = strong)
}> = ({ row, accent, progress, highlight = 0 }) => {
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const x = interpolate(progress, [0, 1], [16, 0]);
  const wash = interpolate(highlight, [0, 1], [0, 0.1]);
  const baseBg = row.unread ? "#ffffff" : "rgba(248,250,252,0.5)";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "13px 20px",
        borderBottom: `1px solid ${SLATE[100]}`,
        background:
          wash > 0 ? `rgba(${hexToRgb(accent)}, ${wash})` : baseBg,
        opacity,
        transform: `translateX(${x}px)`,
      }}
    >
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: 4,
          border: `1.5px solid ${SLATE[300]}`,
          flexShrink: 0,
        }}
      />
      <Star filled={row.star} />
      <Avatar row={row} />
      <span
        style={{
          width: 92,
          flexShrink: 0,
          fontSize: 13,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          color: row.unread ? SLATE[900] : SLATE[600],
          fontWeight: row.unread ? 700 : 400,
        }}
      >
        {row.name}
      </span>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            fontSize: 13,
            color: row.unread ? SLATE[900] : SLATE[600],
            fontWeight: row.unread ? 600 : 400,
            flexShrink: 0,
          }}
        >
          {row.subject}
        </span>
        <span
          style={{
            fontSize: 13,
            color: SLATE[400],
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {row.snippet}
        </span>
      </span>
      {row.unread && (
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: accent,
            flexShrink: 0,
          }}
        />
      )}
      <span
        style={{
          fontSize: 12,
          flexShrink: 0,
          color: row.unread ? SLATE[700] : SLATE[400],
          fontWeight: row.unread ? 600 : 400,
        }}
      >
        {row.time}
      </span>
    </div>
  );
};

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16
  );
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

const Sidebar: React.FC<{
  accent: string;
  frame: number;
  fps: number;
  inboxCount: number;
}> = ({ accent, frame, fps, inboxCount }) => {
  const slide = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  const x = interpolate(slide, [0, 1], [-30, 0]);
  const folders = ["Inbox", "Drafts", "Sent", "Starred", "Archive"];
  return (
    <aside
      style={{
        borderRight: `1px solid ${SLATE[100]}`,
        background: "rgba(248,250,252,0.6)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        opacity: slide,
        transform: `translateX(${x}px)`,
      }}
    >
      <div
        style={{
          background: accent,
          color: "#fff",
          borderRadius: 10,
          padding: "9px 8px",
          textAlign: "center",
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 14,
        }}
      >
        Compose
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {folders.map((name, i) => {
          const fSpring = spring({
            frame: frame - 12 - i * 3,
            fps,
            config: { damping: 200 },
          });
          const active = i === 0;
          return (
            <li
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: 8,
                padding: "6px 9px",
                marginBottom: 3,
                fontSize: 13,
                opacity: fSpring,
                background: active ? `rgba(${hexToRgb(accent)}, 0.1)` : "transparent",
                color: active ? accent : SLATE[500],
                fontWeight: active ? 600 : 400,
              }}
            >
              <span>{name}</span>
              {active && inboxCount > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700 }}>{inboxCount}</span>
              )}
            </li>
          );
        })}
      </ul>
      <div style={{ marginTop: "auto", paddingTop: 18 }}>
        <div
          style={{
            height: 5,
            width: "100%",
            borderRadius: 999,
            background: SLATE[200],
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${interpolate(
                spring({ frame: frame - 28, fps, config: { damping: 200 } }),
                [0, 1],
                [0, 25]
              )}%`,
              borderRadius: 999,
              background: accent,
            }}
          />
        </div>
        <p style={{ margin: "7px 0 0", fontSize: 10, color: SLATE[400] }}>
          3.7 GB / 15 GB
        </p>
      </div>
    </aside>
  );
};

const ComposeWindow: React.FC<{
  accent: string;
  accentDark: string;
  frame: number;
  fps: number;
  localFrame: number; // frames since compose started
}> = ({ accent, accentDark, frame, fps, localFrame }) => {
  // enter
  const enter = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, mass: 0.7 },
  });
  // send / exit
  const sendFrame = 95;
  const exit = spring({
    frame: localFrame - sendFrame,
    fps,
    config: { damping: 200 },
  });

  const enterY = interpolate(enter, [0, 1], [340, 0]);
  // on send: zip up & toward the inbox, shrink + fade
  const exitY = interpolate(exit, [0, 1], [0, -120]);
  const exitX = interpolate(exit, [0, 1], [0, -160]);
  const scale = interpolate(exit, [0, 1], [1, 0.55]);
  const opacity = interpolate(exit, [0.4, 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subject = "Re: Q3 roadmap review";
  const body = "Looks great — let's lock the deck for Thursday.";
  const subjLen = Math.round(
    interpolate(localFrame, [12, 36], [0, subject.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const bodyLen = Math.round(
    interpolate(localFrame, [40, 80], [0, body.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const caret = Math.floor(frame / 8) % 2 === 0 ? "|" : " ";

  return (
    <div
      style={{
        position: "absolute",
        right: 22,
        bottom: 0,
        width: 360,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        background: "#fff",
        boxShadow: "0 -10px 40px rgba(15,23,42,0.18)",
        border: `1px solid ${SLATE[200]}`,
        borderBottom: "none",
        overflow: "hidden",
        opacity,
        transformOrigin: "bottom right",
        transform: `translate(${exitX}px, ${enterY + exitY}px) scale(${scale})`,
      }}
    >
      <div
        style={{
          background: SLATE[900],
          color: "#fff",
          padding: "10px 14px",
          fontSize: 12,
          fontWeight: 600,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>New message</span>
        <span style={{ color: SLATE[400], fontSize: 14 }}>—  ✕</span>
      </div>
      <div style={{ padding: 14 }}>
        <Field label="To" value="dana@workmail.com" />
        <Field
          label="Subject"
          value={subject.slice(0, subjLen) + (subjLen < subject.length && localFrame < 80 ? caret : "")}
        />
        <div
          style={{
            marginTop: 10,
            fontSize: 13,
            lineHeight: 1.5,
            color: SLATE[700],
            minHeight: 56,
          }}
        >
          {body.slice(0, bodyLen)}
          {bodyLen < body.length && localFrame >= 40 ? caret : ""}
        </div>
        <button
          style={{
            marginTop: 6,
            background: localFrame >= sendFrame ? accentDark : accent,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 18px",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: FONT,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div
    style={{
      display: "flex",
      gap: 8,
      padding: "7px 0",
      borderBottom: `1px solid ${SLATE[100]}`,
      fontSize: 13,
    }}
  >
    <span style={{ color: SLATE[400], width: 52, flexShrink: 0 }}>{label}</span>
    <span style={{ color: SLATE[700] }}>{value}</span>
  </div>
);

const Toast: React.FC<{ accent: string; localFrame: number; fps: number }> = ({
  accent,
  localFrame,
  fps,
}) => {
  const enter = spring({
    frame: localFrame,
    fps,
    config: { damping: 16, mass: 0.6 },
  });
  const out = interpolate(localFrame, [55, 70], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(enter, [0, 1], [40, 0]);
  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        left: "50%",
        transform: `translate(-50%, ${y}px)`,
        opacity: Math.min(enter, out),
        background: SLATE[900],
        color: "#fff",
        borderRadius: 999,
        padding: "10px 20px",
        fontSize: 13,
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: 9,
        boxShadow: "0 10px 30px rgba(15,23,42,0.25)",
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
        }}
      >
        ✓
      </span>
      Message sent
    </div>
  );
};

export const HeroPreview: React.FC<HeroPreviewProps> = ({
  accent,
  accentDark,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // window entrance
  const shell = spring({ frame, fps, config: { damping: 200 } });
  const shellScale = interpolate(shell, [0, 1], [0.96, 1]);

  // new mail arrival
  const ARRIVE = 78;
  const arriveGrow = spring({
    frame: frame - ARRIVE,
    fps,
    config: { damping: 18, mass: 0.8 },
  });
  const highlight = interpolate(
    frame,
    [ARRIVE, ARRIVE + 12, ARRIVE + 45],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const newMailH = interpolate(arriveGrow, [0, 1], [0, 56]);
  const inboxCount = frame >= ARRIVE + 6 ? 3 : 2;

  // compose lifecycle
  const COMPOSE_START = 150;
  const composeLocal = frame - COMPOSE_START;
  const showCompose = composeLocal >= 0 && composeLocal < 95 + 22;

  // toast
  const TOAST_START = COMPOSE_START + 95 + 6;
  const toastLocal = frame - TOAST_START;
  const showToast = toastLocal >= 0 && toastLocal < 75;

  // global loop fade
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 14, durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const fadeIn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(135deg, rgba(238,242,255,0.7) 0%, #ffffff 55%)",
        fontFamily: FONT,
        padding: 40,
        opacity: Math.min(fadeIn, fadeOut),
      }}
    >
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 1120,
            borderRadius: 16,
            background: "#fff",
            boxShadow:
              "0 30px 60px -15px rgba(15,23,42,0.25), 0 0 0 1px rgba(226,232,240,0.9)",
            overflow: "hidden",
            opacity: shell,
            transform: `scale(${shellScale})`,
            position: "relative",
          }}
        >
          {/* Top bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              borderBottom: `1px solid ${SLATE[200]}`,
              padding: "14px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 16,
                fontWeight: 800,
                color: SLATE[900],
                letterSpacing: "-0.01em",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect
                  x="2"
                  y="4"
                  width="20"
                  height="16"
                  rx="3"
                  stroke={accent}
                  strokeWidth="2"
                />
                <path
                  d="M3 6l9 7 9-7"
                  stroke={accent}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              tarnmail
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 10,
                background: SLATE[100],
                padding: "8px 14px",
                fontSize: 12,
                color: SLATE[400],
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke={SLATE[400]} strokeWidth="2" />
                <path
                  d="M20 20l-3-3"
                  stroke={SLATE[400]}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Search messages
            </div>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: accent,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              S
            </div>
          </div>

          {/* Body */}
          <div style={{ display: "grid", gridTemplateColumns: "150px 1fr" }}>
            <Sidebar
              accent={accent}
              frame={frame}
              fps={fps}
              inboxCount={inboxCount}
            />

            <div>
              {/* list toolbar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  borderBottom: `1px solid ${SLATE[100]}`,
                  padding: "12px 20px",
                  opacity: spring({
                    frame: frame - 16,
                    fps,
                    config: { damping: 200 },
                  }),
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 4,
                    border: `1.5px solid ${SLATE[300]}`,
                  }}
                />
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: SLATE[900] }}
                >
                  Inbox
                </span>
                <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  {["Unread", "Filter"].map((t) => (
                    <span
                      key={t}
                      style={{
                        border: `1px solid ${SLATE[200]}`,
                        borderRadius: 8,
                        padding: "2px 9px",
                        fontSize: 10,
                        color: SLATE[500],
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </span>
              </div>

              {/* new mail (grows in at top) */}
              <div style={{ height: newMailH, overflow: "hidden" }}>
                <MailRow
                  row={NEW_MAIL}
                  accent={accent}
                  progress={arriveGrow}
                  highlight={highlight}
                />
              </div>

              {/* base rows */}
              {BASE_ROWS.map((row, i) => {
                const p = spring({
                  frame: frame - 22 - i * 5,
                  fps,
                  config: { damping: 200 },
                });
                return (
                  <MailRow key={row.subject} row={row} accent={accent} progress={p} />
                );
              })}
            </div>
          </div>

          {/* compose */}
          {showCompose && (
            <ComposeWindow
              accent={accent}
              accentDark={accentDark}
              frame={frame}
              fps={fps}
              localFrame={composeLocal}
            />
          )}

          {/* toast */}
          {showToast && (
            <Toast accent={accent} localFrame={toastLocal} fps={fps} />
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
