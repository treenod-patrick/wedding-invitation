"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, type PanInfo } from "framer-motion";

// 모바일 햅틱 (지원 안 하는 브라우저는 자동 무시)
const vibrate = (pattern: number | number[]) => {
  if (typeof navigator === "undefined") return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* noop */
  }
};

// 더미 데이터 — 마스터 정보 받으면 교체
const data = {
  groom: { name: "채종현", nameEn: "Jonghyun Chae", father: "채승우", mother: "김미경", phone: "010-0000-0000", account: "신한은행 110-000-000000" },
  bride: { name: "최수빈", nameEn: "Subin Choi", father: "최원영", mother: "김영미", phone: "010-0000-0000", account: "국민은행 000-00-0000-000" },
  date: "2026-11-15T14:00:00+09:00",
  dateLabel: "2026년 11월 15일 일요일 오후 2시",
  venue: {
    name: "테라리움 서울",
    address: "서울특별시 노원구 노원로 247 서울온천 7~8층",
    subway: "7호선 하계역 1번 출구 도보 7분",
    bus: "하계역·서울온천 정류장 (146·1224·1226·1227·1132)",
    parking: "건물 주차장 700대 · 무료 2시간",
    parkingExtra: "본 건물 만차 시 인근 대진고등학교 주차장(도보 5분)",
    phone: "02-6316-7700",
  },
  greeting: `서로의 계절을 함께 걸으며\n같은 풍경을 바라보게 되었습니다.\n\n작은 시작 위에\n귀한 발걸음 더해 주시면\n오래도록 따뜻한 기억으로 간직하겠습니다.`,
  gallery: Array.from({ length: 9 }, (_, i) => `https://picsum.photos/seed/mng${i}/800/1000`),
};

// 12종 폰트 — CSS 변수와 라벨 매핑
const FONTS: { key: string; label: string; cssVar: string; category: string }[] = [
  { key: "gowun-batang", label: "Gowun Batang", cssVar: "var(--font-gowun-batang)", category: "명조" },
  { key: "noto-serif", label: "Noto Serif KR", cssVar: "var(--font-noto-serif)", category: "명조" },
  { key: "nanum-myeongjo", label: "Nanum Myeongjo", cssVar: "var(--font-nanum-myeongjo)", category: "명조" },
  { key: "noto-sans", label: "Noto Sans KR", cssVar: "var(--font-noto-sans)", category: "고딕" },
  { key: "gowun-dodum", label: "Gowun Dodum", cssVar: "var(--font-gowun-dodum)", category: "고딕" },
  { key: "jua", label: "Jua", cssVar: "var(--font-jua)", category: "고딕" },
  { key: "black-han", label: "Black Han Sans", cssVar: "var(--font-black-han)", category: "고딕" },
  { key: "nanum-pen", label: "Nanum Pen Script", cssVar: "var(--font-nanum-pen)", category: "필기" },
  { key: "single-day", label: "Single Day", cssVar: "var(--font-single-day)", category: "필기" },
  { key: "east-sea", label: "East Sea Dokdo", cssVar: "var(--font-east-sea)", category: "필기" },
  { key: "gaegu", label: "Gaegu", cssVar: "var(--font-gaegu)", category: "캐주얼" },
  { key: "cute", label: "Cute Font", cssVar: "var(--font-cute)", category: "캐주얼" },
];

function useCountdown(target: string) {
  const [remain, setRemain] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(target).getTime() - Date.now());
      setRemain({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return remain;
}

function FlowerDivider() {
  return (
    <div className="flex items-center justify-center py-6">
      <svg viewBox="0 0 120 24" className="h-6 w-32 text-[color:var(--color-rose)]" fill="none" stroke="currentColor" strokeWidth="0.8">
        <path d="M2 12 H44" strokeLinecap="round" />
        <path d="M76 12 H118" strokeLinecap="round" />
        <g transform="translate(60 12)">
          <circle r="2.6" fill="currentColor" opacity="0.85" />
          <ellipse cx="-7" cy="0" rx="4" ry="1.6" opacity="0.55" />
          <ellipse cx="7" cy="0" rx="4" ry="1.6" opacity="0.55" />
          <ellipse cx="0" cy="-5" rx="1.6" ry="3.2" opacity="0.55" />
          <ellipse cx="0" cy="5" rx="1.6" ry="3.2" opacity="0.55" />
        </g>
      </svg>
    </div>
  );
}

function FontToggle({ value, onChange }: { value: string; onChange: (k: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-2 w-64 max-h-80 overflow-y-auto rounded-2xl bg-white shadow-2xl border border-[color:var(--color-line)] p-2">
          <div className="text-[12px] tracking-[0.28em] uppercase text-[color:var(--color-rose-deep)] px-3 py-2 border-b border-[color:var(--color-line)]">Font</div>
          {FONTS.map((f) => (
            <button
              key={f.key}
              onClick={() => onChange(f.key)}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition ${
                value === f.key ? "bg-[color:var(--color-blush)]" : "hover:bg-[color:var(--color-blush)]/60"
              }`}
              style={{ fontFamily: f.cssVar }}
            >
              <span className="text-[15px] text-[color:var(--color-charcoal)]">우리 결혼합니다</span>
              <span className="text-[11px] text-[color:var(--color-mute)] ml-2 whitespace-nowrap">{f.category}</span>
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-12 w-12 rounded-full bg-[color:var(--color-rose-deep)] text-white shadow-lg text-lg font-semibold active:scale-95 transition"
      >
        {open ? "×" : "가"}
      </button>
    </div>
  );
}

function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-8 text-center">
      <p className="eyebrow">{kicker}</p>
      <h2 className="section-title mt-3">{title}</h2>
    </div>
  );
}

// 공통 카드 래퍼 — 블러시 단일 톤
function Card({ children }: { children: React.ReactNode }) {
  return <div className="content-card bg-[color:var(--color-blush)]">{children}</div>;
}

function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[color:var(--color-blush)] via-white to-white px-7 text-center">
      <svg
        className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 text-[color:var(--color-rose)]/55"
        width="180"
        height="60"
        viewBox="0 0 180 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
      >
        <path d="M90 0 V60" />
        <path d="M90 12 Q70 18 60 30" />
        <path d="M90 12 Q110 18 120 30" />
        <path d="M90 26 Q72 32 64 44" />
        <path d="M90 26 Q108 32 116 44" />
        <ellipse cx="60" cy="30" rx="6" ry="2" />
        <ellipse cx="120" cy="30" rx="6" ry="2" />
        <ellipse cx="64" cy="44" rx="5" ry="1.8" />
        <ellipse cx="116" cy="44" rx="5" ry="1.8" />
      </svg>
      <div className="fade-in w-full max-w-[22rem]">
        <p className="eyebrow mb-6">We Invite You</p>
        <h1 className="text-[clamp(1.45rem,7vw,2.1rem)] leading-[1.15] text-[color:var(--color-charcoal)] break-words">
          {data.groom.nameEn}
        </h1>
        <p className="my-2 italic text-base text-[color:var(--color-rose-deep)]">&amp;</p>
        <h1 className="text-[clamp(1.45rem,7vw,2.1rem)] leading-[1.15] text-[color:var(--color-charcoal)] break-words">
          {data.bride.nameEn}
        </h1>
        <FlowerDivider />
        <p className="mt-2 text-[clamp(11px,3.4vw,14px)] tracking-[0.22em] text-[color:var(--color-mute)]">2026. 11. 15 · 일</p>
        <p className="mt-2 text-[clamp(10px,3vw,12px)] tracking-[0.18em] text-[color:var(--color-mute)]">{data.venue.name}</p>
      </div>
      <div className="absolute bottom-8 label-caps text-[color:var(--color-mute)] animate-pulse">SCROLL</div>
    </section>
  );
}

function Greeting() {
  return (
    <section className="px-5 py-10 bg-white">
      <Card>
        <SectionHead kicker="Invitation" title="초대합니다" />
        <p className="whitespace-pre-line text-center leading-[2.1] text-[15px] text-[color:var(--color-charcoal)]/85">
          {data.greeting}
        </p>
        <FlowerDivider />
        <div className="text-center text-[13px] leading-loose text-[color:var(--color-mute)]">
          <p>
            <span className="text-[color:var(--color-charcoal)]/70">{data.groom.father}</span>
            <span className="mx-2">·</span>
            <span className="text-[color:var(--color-charcoal)]/70">{data.groom.mother}</span>
            <span className="ml-2">의 아들</span>
            <span className="ml-2 font-medium text-[color:var(--color-charcoal)]">{data.groom.name}</span>
          </p>
          <p className="mt-1.5">
            <span className="text-[color:var(--color-charcoal)]/70">{data.bride.father}</span>
            <span className="mx-2">·</span>
            <span className="text-[color:var(--color-charcoal)]/70">{data.bride.mother}</span>
            <span className="ml-2">의 딸</span>
            <span className="ml-2 font-medium text-[color:var(--color-charcoal)]">{data.bride.name}</span>
          </p>
        </div>
      </Card>
    </section>
  );
}

function Couple() {
  const Person = ({ role, p }: { role: string; p: typeof data.groom }) => (
    <div className="text-center">
      <p className="eyebrow">{role}</p>
      <p className="mt-3 text-[clamp(1.15rem,5vw,1.5rem)] text-[color:var(--color-charcoal)] whitespace-nowrap">{p.nameEn}</p>
      <p className="mt-1 text-[clamp(14px,4vw,16px)] text-[color:var(--color-charcoal)]">{p.name}</p>
      <p className="mt-2 text-[11px] text-[color:var(--color-mute)] whitespace-nowrap">
        {p.father} · {p.mother}
      </p>
      <a
        href={`tel:${p.phone}`}
        className="mt-3 inline-block label-caps text-[color:var(--color-rose-deep)] border border-[color:var(--color-rose)]/40 rounded-full px-3 py-1"
      >
        CALL
      </a>
    </div>
  );
  return (
    <section className="px-5 py-10 bg-white">
      <Card>
        <SectionHead kicker="The Couple" title="신랑 · 신부" />
        <div className="grid grid-cols-2 gap-4 items-start">
          <Person role="Groom" p={data.groom} />
          <Person role="Bride" p={data.bride} />
        </div>
      </Card>
    </section>
  );
}

function Countdown() {
  const r = useCountdown(data.date);
  const items = [
    { v: r.d, l: "DAYS" },
    { v: r.h, l: "HOUR" },
    { v: r.m, l: "MIN" },
    { v: r.s, l: "SEC" },
  ];
  return (
    <section className="px-5 py-10 bg-white">
      <Card>
        <SectionHead kicker="D-Day" title="우리의 그 날까지" />
        <div className="grid grid-cols-4 gap-2 text-center">
          {items.map((i) => (
            <div key={i.l} className="py-5">
              <div className="text-[clamp(1.4rem,6vw,1.7rem)] text-[color:var(--color-rose-deep)] tabular-nums">{String(i.v).padStart(2, "0")}</div>
              <div className="mt-1 label-caps text-[color:var(--color-mute)]">{i.l}</div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-[13px] text-[color:var(--color-mute)]">
          <span className="text-[color:var(--color-charcoal)]">{data.groom.name}</span>
          <span className="mx-2 text-[color:var(--color-rose)]">♥</span>
          <span className="text-[color:var(--color-charcoal)]">{data.bride.name}</span>의 결혼식이{" "}
          <b className="text-[color:var(--color-rose-deep)]">{r.d}</b>일 남았습니다.
        </p>
      </Card>
    </section>
  );
}

function Calendar() {
  const target = new Date(data.date);
  const year = target.getFullYear();
  const month = target.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startCol = first.getDay();
  const days: (number | null)[] = [
    ...Array(startCol).fill(null),
    ...Array.from({ length: last.getDate() }, (_, i) => i + 1),
  ];
  while (days.length % 7 !== 0) days.push(null);
  const monthName = target.toLocaleDateString("en-US", { month: "long" });
  return (
    <section className="px-5 py-10 bg-white">
      <Card>
        <SectionHead kicker="When" title="예식일" />
        <div className="mx-auto max-w-xs p-5">
          <p className="text-center tracking-[0.2em] text-[color:var(--color-rose-deep)] text-[clamp(13px,3.8vw,16px)] whitespace-nowrap">
            {monthName} · {year}
          </p>
          <div className="mt-4 grid grid-cols-7 text-center text-[clamp(13px,3.8vw,18px)] tracking-wider text-[color:var(--color-mute)]">
            {["S", "M", "T", "W", "T", "F", "S"].map((l, i) => (
              <div key={i} className={`py-2 ${i === 0 ? "text-[color:var(--color-rose-deep)]" : ""}`}>{l}</div>
            ))}
            {days.map((d, i) => {
              const isTarget = d === target.getDate();
              return (
                <div key={i} className="py-2 text-[13px] text-[color:var(--color-charcoal)]/80">
                  {d && isTarget && (
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--color-rose)] text-white">
                      {d}
                    </span>
                  )}
                  {d && !isTarget && <span>{d}</span>}
                </div>
              );
            })}
          </div>
        </div>
        <p className="mt-6 text-center text-[13px] text-[color:var(--color-mute)]">{data.dateLabel.split(" 오후")[0]}</p>
        <p className="mt-1 text-center text-[13px] text-[color:var(--color-rose-deep)]">오후 2시</p>
      </Card>
    </section>
  );
}

function Gallery() {
  return (
    <section className="px-5 py-10 bg-white">
      <SectionHead kicker="Gallery" title="우리의 순간" />
      <div className="grid grid-cols-3 gap-1.5 max-w-md mx-auto">
        {data.gallery.map((src, i) => (
          <div key={i} className="aspect-[3/4] overflow-hidden bg-[color:var(--color-blush)]/50 rounded-md">
            <img src={src} alt={`gallery-${i}`} className="h-full w-full object-cover transition duration-500 hover:scale-105" loading="lazy" />
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-[12px] text-[color:var(--color-mute)]">사진 자리 — 마스터 사진 받으면 교체</p>
    </section>
  );
}

function Location() {
  const copyAddress = () => {
    navigator.clipboard?.writeText(data.venue.address);
  };
  const naverMapUrl =
    "https://map.naver.com/p/search/%ED%85%8C%EB%9D%BC%EB%A6%AC%EC%9B%80%20%EC%84%9C%EC%9A%B8/place/1618264201?c=15.00,0,0,0,dh&placePath=/home?bk_query=%ED%85%8C%EB%9D%BC%EB%A6%AC%EC%9B%80%20%EC%84%9C%EC%9A%B8&entry=bmp&from=map&fromPanelNum=2&locale=ko&svcName=map_pcv5&searchText=%ED%85%8C%EB%9D%BC%EB%A6%AC%EC%9B%80%20%EC%84%9C%EC%9A%B8";
  return (
    <section className="px-5 py-10 bg-white">
      <Card>
        <SectionHead kicker="Location" title="오시는 길" />
        <a
          href={naverMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group block overflow-hidden rounded-2xl"
        >
          <div
            className="relative h-56 w-full"
            style={{
              background:
                "linear-gradient(135deg, #f0f7f0 0%, #e3efe0 40%, #eef2f6 100%)",
            }}
          >
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 600 224"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <g stroke="#d7e2d4" strokeWidth="1.2" fill="none" opacity="0.8">
                <path d="M0 56 L600 56" />
                <path d="M0 112 L600 112" />
                <path d="M0 168 L600 168" />
                <path d="M120 0 L120 224" />
                <path d="M260 0 L260 224" />
                <path d="M400 0 L400 224" />
                <path d="M520 0 L520 224" />
              </g>
              <path
                d="M0 140 Q120 128 260 148 T520 132 T600 138"
                stroke="#c6d6cc"
                strokeWidth="14"
                fill="none"
                opacity="0.55"
              />
              <path
                d="M70 0 L140 110 L80 224"
                stroke="#e6d8c9"
                strokeWidth="10"
                fill="none"
                opacity="0.6"
              />
              <circle cx="300" cy="112" r="60" fill="#ffffff" opacity="0.4" />
            </svg>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
              <svg width="46" height="60" viewBox="0 0 46 60" aria-hidden="true">
                <path
                  d="M23 2 C11 2 2 11 2 23 C2 37 19 54 23 58 C27 54 44 37 44 23 C44 11 35 2 23 2 Z"
                  fill="#03C75A"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <circle cx="23" cy="22" r="7" fill="#ffffff" />
              </svg>
            </div>
            <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 shadow-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-[#03C75A]" />
              <span className="text-[11px] font-semibold tracking-wider text-[color:var(--color-charcoal)] whitespace-nowrap">NAVER MAP</span>
            </div>
            <div className="pointer-events-none absolute left-1/2 top-[62%] -translate-x-1/2 whitespace-nowrap rounded-md bg-white/95 px-3 py-1 text-[11px] font-medium tracking-wide text-[color:var(--color-charcoal)] shadow-sm">
              {data.venue.name}
            </div>
            <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-[color:var(--color-rose-deep)] px-3 py-1.5 text-[11px] tracking-wider text-white whitespace-nowrap transition group-hover:bg-[color:var(--color-charcoal)]">
              네이버 지도 열기 →
            </div>
          </div>
        </a>
        <div className="mt-5 text-center">
          <p className="text-[clamp(1.05rem,4.6vw,1.35rem)] tracking-wide text-[color:var(--color-charcoal)]">{data.venue.name}</p>
          <p className="mt-2 text-[13px] text-[color:var(--color-mute)] body-kr leading-relaxed">{data.venue.address}</p>
          <p className="text-[13px] text-[color:var(--color-mute)] whitespace-nowrap">{data.venue.phone}</p>
          <button
            onClick={copyAddress}
            className="mt-3 rounded-full border border-[color:var(--color-rose)]/40 px-4 py-1.5 text-[12px] tracking-wider text-[color:var(--color-rose-deep)] whitespace-nowrap"
          >
            주소 복사
          </button>
        </div>
        <div className="mt-7 space-y-3 p-5 text-[13px] text-[color:var(--color-charcoal)]/85 body-kr">
          <div className="flex gap-3">
            <span className="min-w-[48px] text-[color:var(--color-rose-deep)] text-[13px] whitespace-nowrap">지하철</span>
            <span>{data.venue.subway}</span>
          </div>
          <div className="flex gap-3">
            <span className="min-w-[48px] text-[color:var(--color-rose-deep)] text-[13px] whitespace-nowrap">버스</span>
            <span>{data.venue.bus}</span>
          </div>
          <div className="flex gap-3">
            <span className="min-w-[48px] text-[color:var(--color-rose-deep)] text-[13px] whitespace-nowrap">주차</span>
            <span>
              {data.venue.parking}
              <br />
              <span className="text-[12px] text-[color:var(--color-mute)]">{data.venue.parkingExtra}</span>
            </span>
          </div>
        </div>
      </Card>
    </section>
  );
}

function Account() {
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const toggle = (k: string) => setOpened((o) => ({ ...o, [k]: !o[k] }));
  const Row = ({ k, role, name, account }: { k: string; role: string; name: string; account: string }) => {
    const isOpen = opened[k];
    return (
      <div>
        <button
          onClick={() => toggle(k)}
          className="flex w-full items-center justify-between rounded-2xl px-5 py-4 border-b border-[color:var(--color-rose)]/20"
        >
          <span className="text-[13px] tracking-wide">
            <span className="text-[color:var(--color-mute)]">{role}</span>
            <span className="ml-3 text-[color:var(--color-charcoal)]">{name}</span>
          </span>
          <span className="text-[color:var(--color-rose-deep)] text-lg leading-none">{isOpen ? "−" : "+"}</span>
        </button>
        {isOpen && (
          <div className="mt-1 flex items-center justify-between px-5 py-3 text-[13px]">
            <span className="text-[color:var(--color-charcoal)]">{account}</span>
            <button
              onClick={() => navigator.clipboard?.writeText(account)}
              className="text-[12px] tracking-wider text-[color:var(--color-rose-deep)] border border-[color:var(--color-rose)]/40 rounded-full px-3 py-1 whitespace-nowrap"
            >
              복사
            </button>
          </div>
        )}
      </div>
    );
  };
  return (
    <section className="px-5 py-10 bg-white">
      <Card>
        <SectionHead kicker="Heart" title="마음 전하실 곳" />
        <p className="mb-8 text-center text-[13px] leading-loose text-[color:var(--color-mute)] body-kr">
          참석이 어려우신 분들을 위해
          <br />
          조심스레 계좌번호를 안내드립니다.
        </p>
        <div className="space-y-3">
          <Row k="groom" role="신랑측" name={data.groom.name} account={data.groom.account} />
          <Row k="bride" role="신부측" name={data.bride.name} account={data.bride.account} />
        </div>
      </Card>
    </section>
  );
}

function Guestbook() {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [list, setList] = useState<{ name: string; msg: string; ts: number }[]>([
    { name: "친구 J", msg: "두 분의 새로운 시작을 진심으로 축하합니다. 늘 따스한 봄날 같은 결혼 생활 보내세요.", ts: Date.now() - 86400000 },
  ]);
  const [open, setOpen] = useState(false);
  const submit = () => {
    if (!name.trim() || !msg.trim()) return;
    setList((l) => [{ name: name.trim(), msg: msg.trim(), ts: Date.now() }, ...l]);
    setName("");
    setMsg("");
    setOpen(false);
  };
  const fmt = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };
  return (
    <section className="px-5 py-10 bg-white">
      <Card>
        <SectionHead kicker="Guestbook" title="방명록" />
        <p className="mb-6 text-center text-[13px] text-[color:var(--color-mute)] leading-loose body-kr">
          따뜻한 마음 한 줄 남겨주시면
          <br />
          오래도록 간직하겠습니다.
        </p>

        <div className="space-y-4">
          {list.map((g, i) => (
            <div
              key={i}
              className="relative px-5 pt-6 pb-5 border-t border-[color:var(--color-rose)]/20"
            >
              <div className="absolute -top-2 left-5 inline-flex items-center gap-1.5 bg-[color:var(--color-blush)] rounded-full px-3 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-rose-deep)]" />
                <span className="text-[11px] tracking-widest text-[color:var(--color-rose-deep)] whitespace-nowrap">{g.name}</span>
              </div>
              <p className="mt-2 text-[14px] leading-[2] text-[color:var(--color-charcoal)]/85 whitespace-pre-line body-kr">
                {g.msg}
              </p>
              <p className="mt-3 text-right text-[11px] tracking-widest text-[color:var(--color-mute)] whitespace-nowrap">{fmt(g.ts)}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setOpen(true)}
          className="mt-7 mx-auto block rounded-full border border-[color:var(--color-rose)]/40 px-6 py-2.5 text-[12px] tracking-[0.22em] text-[color:var(--color-rose-deep)] whitespace-nowrap"
        >
          + 메시지 남기기
        </button>

        {open && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-6 sm:pb-0">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <p className="eyebrow text-center">Leave a Note</p>
              <h3 className="mt-2 mb-5 text-center text-lg text-[color:var(--color-charcoal)]">축하 메시지</h3>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름"
                className="w-full px-0 py-2 mb-3 bg-transparent border-0 border-b border-[color:var(--color-line)] text-[14px] focus:outline-none focus:border-[color:var(--color-rose-deep)]"
              />
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="축하 메시지를 남겨주세요"
                rows={4}
                className="w-full px-0 py-2 bg-transparent border-0 border-b border-[color:var(--color-line)] text-[14px] resize-none focus:outline-none focus:border-[color:var(--color-rose-deep)]"
              />
              <div className="mt-6 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="py-3 rounded-xl border border-[color:var(--color-line)] text-[13px] tracking-widest text-[color:var(--color-mute)]"
                >
                  취소
                </button>
                <button
                  onClick={submit}
                  className="py-3 rounded-xl bg-[color:var(--color-rose-deep)] text-white text-[13px] tracking-widest"
                >
                  남기기
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </section>
  );
}

// 🎮 모바일 네이티브 3단계 하이브리드 게임 — 스와이프덱 → 메모리 카드 → 탭 러너
type GamePhase = "intro" | "stage1" | "stage2" | "stage3" | "ending";

const STORY_CARDS = [
  { emoji: "🌸", title: "첫 만남", body: "2024년 봄, 벚꽃이 피던 날\n우리는 처음 마주쳤어요" },
  { emoji: "☕", title: "첫 데이트", body: "어색한 침묵 사이로 흐르던\n따뜻한 커피 한 잔의 시간" },
  { emoji: "✈️", title: "함께한 여행", body: "낯선 도시의 골목길에서도\n서로의 손만은 놓지 않았어요" },
  { emoji: "💍", title: "프로포즈", body: "언젠가가 오늘이 되기를\n바랐던 그날의 약속" },
  { emoji: "🏡", title: "우리의 시작", body: "둘만의 작은 세계를\n함께 만들어가기로 했어요" },
  { emoji: "💌", title: "그리고 오늘", body: "서로의 사계절을 지나\n마침내 부부가 됩니다" },
];

const MEMORY_ICONS = ["💍", "💐", "💒"];

function WeddingGame({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<GamePhase>("intro");

  return (
    <div className="relative mx-auto w-full max-w-[420px] px-5 pb-10 pt-2">
      <GameProgress phase={phase} />
      <div className="relative min-h-[520px]">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <PhaseShell key="intro">
              <IntroScreen onStart={() => setPhase("stage1")} />
            </PhaseShell>
          )}
          {phase === "stage1" && (
            <PhaseShell key="stage1">
              <SwipeDeck onDone={() => setPhase("stage2")} />
            </PhaseShell>
          )}
          {phase === "stage2" && (
            <PhaseShell key="stage2">
              <MemoryBoard onDone={() => setPhase("stage3")} />
            </PhaseShell>
          )}
          {phase === "stage3" && (
            <PhaseShell key="stage3">
              <TapRunner onDone={() => setPhase("ending")} />
            </PhaseShell>
          )}
          {phase === "ending" && (
            <PhaseShell key="ending">
              <EndingScreen onComplete={onComplete} />
            </PhaseShell>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PhaseShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="absolute inset-0"
    >
      {children}
    </motion.div>
  );
}

function GameProgress({ phase }: { phase: GamePhase }) {
  const step = phase === "intro" ? 0 : phase === "stage1" ? 1 : phase === "stage2" ? 2 : phase === "stage3" ? 3 : 4;
  const total = 4;
  return (
    <div className="mb-5 flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 overflow-hidden rounded-full bg-[color:var(--color-blush)]/40"
        >
          <motion.div
            initial={false}
            animate={{ width: i < step ? "100%" : "0%" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full bg-[#c68e9a]"
          />
        </div>
      ))}
    </div>
  );
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "backOut" }}
        className="text-6xl"
      >
        💕
      </motion.div>
      <div>
        <p className="eyebrow">Our Little Story</p>
        <h2 className="mt-2 text-[22px] font-medium tracking-tight text-[color:var(--color-ink)]">
          우리 이야기, 함께 걸어볼까요?
        </h2>
        <p className="mt-3 text-[13px] leading-[1.75] text-[color:var(--color-mute)]">
          스와이프 · 매칭 · 탭 세 가지 작은 여정을 지나면
          <br />
          채종현 · 최수빈의 청첩장이 열립니다.
        </p>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="mt-2 rounded-full bg-[#b07989] px-8 py-3 text-[13px] font-medium tracking-widest text-white shadow-[0_6px_18px_-8px_rgba(176,121,137,0.6)] transition active:scale-95"
      >
        START
      </button>
    </div>
  );
}

// ─── Stage 1 : 스와이프 덱 ────────────────────────────────
function SwipeDeck({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState(0);
  const total = STORY_CARDS.length;

  const handleSwipe = useCallback(
    (dir: 1 | -1) => {
      vibrate(20);
      if (dir === 1) setLiked((v) => v + 1);
      setIndex((v) => {
        const next = v + 1;
        if (next >= total) {
          setTimeout(onDone, 400);
        }
        return next;
      });
    },
    [onDone, total],
  );

  return (
    <div className="flex h-full flex-col items-center justify-start gap-4">
      <div className="text-center">
        <p className="eyebrow">Stage 1 · Swipe</p>
        <h3 className="mt-1 text-[17px] font-medium text-[color:var(--color-ink)]">
          우리 이야기를 넘겨보세요
        </h3>
        <p className="mt-1 text-[11px] text-[color:var(--color-mute)]">
          좌우로 드래그 · 오른쪽은 ♥ 추억 모으기
        </p>
      </div>

      <div className="relative mt-2 h-[340px] w-full max-w-[300px]">
        {STORY_CARDS.map((card, i) => {
          if (i < index) return null;
          if (i > index + 2) return null;
          const depth = i - index;
          return (
            <StoryCard
              key={i}
              card={card}
              depth={depth}
              isTop={depth === 0}
              onSwipe={handleSwipe}
              count={`${i + 1} / ${total}`}
            />
          );
        })}
      </div>

      <div className="mt-2 flex items-center gap-3 text-[12px] text-[color:var(--color-mute)]">
        <span>♥ {liked}</span>
        <span className="opacity-40">·</span>
        <span>{Math.max(0, total - index)} 장 남음</span>
      </div>
    </div>
  );
}

function StoryCard({
  card,
  depth,
  isTop,
  onSwipe,
  count,
}: {
  card: (typeof STORY_CARDS)[number];
  depth: number;
  isTop: boolean;
  onSwipe: (dir: 1 | -1) => void;
  count: string;
}) {
  const [exitDir, setExitDir] = useState<0 | 1 | -1>(0);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 90;
    if (info.offset.x > threshold) {
      setExitDir(1);
      setTimeout(() => onSwipe(1), 200);
    } else if (info.offset.x < -threshold) {
      setExitDir(-1);
      setTimeout(() => onSwipe(-1), 200);
    }
  };

  return (
    <motion.div
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      initial={{ scale: 1 - depth * 0.04, y: depth * 10, opacity: depth > 1 ? 0.6 : 1 }}
      animate={
        exitDir !== 0
          ? { x: exitDir * 400, rotate: exitDir * 18, opacity: 0 }
          : { scale: 1 - depth * 0.04, y: depth * 10, opacity: depth > 1 ? 0.6 : 1, x: 0, rotate: 0 }
      }
      transition={{ duration: exitDir ? 0.25 : 0.3, ease: "easeOut" }}
      style={{
        zIndex: 10 - depth,
        touchAction: isTop ? "pan-y" : "auto",
      }}
      className="absolute inset-0 flex flex-col items-center justify-between rounded-3xl bg-gradient-to-br from-[#fdf2f5] via-white to-[#fbe3e9] p-6 text-center shadow-[0_12px_28px_-16px_rgba(176,121,137,0.45)] ring-1 ring-[color:var(--color-blush)]/40"
    >
      <div className="self-end text-[10px] tracking-widest text-[color:var(--color-mute)]">
        {count}
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="text-5xl">{card.emoji}</div>
        <h4 className="text-[18px] font-medium text-[color:var(--color-ink)]">{card.title}</h4>
        <p className="whitespace-pre-line text-[13px] leading-[1.7] text-[color:var(--color-mute)]">
          {card.body}
        </p>
      </div>
      <div className="flex w-full items-center justify-between text-[10px] tracking-widest text-[color:var(--color-mute)]/70">
        <span>← 다음</span>
        <span>♥ 기억할게요 →</span>
      </div>
    </motion.div>
  );
}

// ─── Stage 2 : 메모리 카드 매칭 ────────────────────────────
type MemCard = { id: number; icon: string; matched: boolean; flipped: boolean };

function makeMemoryDeck(): MemCard[] {
  const pairs: MemCard[] = [];
  MEMORY_ICONS.forEach((icon, idx) => {
    pairs.push({ id: idx * 2, icon, matched: false, flipped: false });
    pairs.push({ id: idx * 2 + 1, icon, matched: false, flipped: false });
  });
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs;
}

function MemoryBoard({ onDone }: { onDone: () => void }) {
  const [deck, setDeck] = useState<MemCard[]>(() => makeMemoryDeck());
  const [lock, setLock] = useState(false);
  const [tries, setTries] = useState(0);

  const allMatched = deck.every((c) => c.matched);

  useEffect(() => {
    if (allMatched) {
      const t = setTimeout(onDone, 900);
      return () => clearTimeout(t);
    }
  }, [allMatched, onDone]);

  const flip = (cardId: number) => {
    if (lock) return;
    setDeck((prev) => {
      const target = prev.find((c) => c.id === cardId);
      if (!target || target.flipped || target.matched) return prev;
      const flipped = prev.filter((c) => c.flipped && !c.matched);
      if (flipped.length >= 2) return prev;
      const next = prev.map((c) => (c.id === cardId ? { ...c, flipped: true } : c));
      const nowFlipped = next.filter((c) => c.flipped && !c.matched);
      if (nowFlipped.length === 2) {
        setLock(true);
        setTries((t) => t + 1);
        const [a, b] = nowFlipped;
        if (a.icon === b.icon) {
          vibrate([20, 40, 30]);
          setTimeout(() => {
            setDeck((cur) =>
              cur.map((c) => (c.icon === a.icon ? { ...c, matched: true, flipped: true } : c)),
            );
            setLock(false);
          }, 400);
        } else {
          setTimeout(() => {
            setDeck((cur) =>
              cur.map((c) => (c.id === a.id || c.id === b.id ? { ...c, flipped: false } : c)),
            );
            setLock(false);
          }, 800);
        }
      }
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col items-center gap-4">
      <div className="text-center">
        <p className="eyebrow">Stage 2 · Memory</p>
        <h3 className="mt-1 text-[17px] font-medium text-[color:var(--color-ink)]">
          짝을 맞춰주세요
        </h3>
        <p className="mt-1 text-[11px] text-[color:var(--color-mute)]">
          같은 그림 3쌍을 모두 찾으면 다음 단계
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {deck.map((card) => (
          <MemoryTile key={card.id} card={card} onFlip={() => flip(card.id)} />
        ))}
      </div>

      <p className="mt-1 text-[11px] text-[color:var(--color-mute)]">시도 {tries}회</p>
    </div>
  );
}

function MemoryTile({ card, onFlip }: { card: MemCard; onFlip: () => void }) {
  const face = card.flipped || card.matched;
  return (
    <button
      type="button"
      onClick={onFlip}
      className="relative h-[96px] w-[88px] select-none"
      style={{ perspective: "600px" }}
      aria-label={face ? card.icon : "카드 뒤집기"}
    >
      <motion.div
        animate={{ rotateY: face ? 180 : 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#c68e9a] to-[#8f5c6b] text-[22px] text-white shadow-[0_8px_18px_-10px_rgba(143,92,107,0.55)]"
          style={{ backfaceVisibility: "hidden" }}
        >
          ♥
        </div>
        <div
          className={`absolute inset-0 flex items-center justify-center rounded-2xl text-4xl shadow-[0_8px_18px_-10px_rgba(176,121,137,0.4)] ring-1 ring-[color:var(--color-blush)]/40 ${
            card.matched ? "bg-[#f7d9e0]" : "bg-white"
          }`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {card.icon}
        </div>
      </motion.div>
    </button>
  );
}

// ─── Stage 3 : 홀드-릴리즈 폭죽 ──────────────────────────
// 버튼을 꾹 눌러 게이지(0→100)를 채우고, 일정 이상에서 떼면 폭죽이 터진다.
const HOLD_DURATION_MS = 1600; // 100까지 차오르는 시간
const HOLD_MIN_PERCENT = 70; // 최소 홀드 판정(실수 릴리즈 방지)

function TapRunner({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [released, setReleased] = useState(false);
  const [launched, setLaunched] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  const stopHold = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startRef.current = null;
  }, []);

  useEffect(() => {
    return () => stopHold();
  }, [stopHold]);

  useEffect(() => {
    if (launched) {
      const t = setTimeout(onDone, 1500);
      return () => clearTimeout(t);
    }
  }, [launched, onDone]);

  const startHold = () => {
    if (launched) return;
    setReleased(false);
    startRef.current = performance.now();
    const tick = (now: number) => {
      if (startRef.current === null) return;
      const elapsed = now - startRef.current;
      const next = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setProgress(next);
      if (next < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const endHold = () => {
    if (launched) return;
    stopHold();
    setReleased(true);
    setProgress((current) => {
      if (current >= HOLD_MIN_PERCENT) {
        vibrate([30, 20, 60]);
        setLaunched(true);
        return 100;
      }
      // 부족하면 리셋 후 다시 도전
      setTimeout(() => {
        setProgress(0);
        setReleased(false);
      }, 280);
      return current;
    });
  };

  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-5"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="text-center">
        <p className="eyebrow">Stage 3 · Hold & Release</p>
        <h3 className="mt-1 text-[17px] font-medium text-[color:var(--color-ink)]">
          꾹 눌러 폭죽을 쏘아 올려요
        </h3>
        <p className="mt-1 text-[11px] text-[color:var(--color-mute)]">
          게이지가 가득 차면 손을 떼세요
        </p>
      </div>

      <div className="relative w-full max-w-[320px] rounded-full bg-[color:var(--color-blush)]/40 p-2">
        <motion.div
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: reduced ? 0 : 0.1, ease: "linear" }}
          className="h-2 rounded-full bg-gradient-to-r from-[#c68e9a] to-[#8f5c6b]"
        />
      </div>

      <div className="relative h-[200px] w-full max-w-[320px] overflow-hidden rounded-3xl bg-gradient-to-b from-[#fdf2f5] to-white ring-1 ring-[color:var(--color-blush)]/40">
        {/* 신랑·신부 커플 */}
        <motion.div
          initial={false}
          animate={{
            y: launched ? -40 : 0,
            scale: launched ? 1.1 : 1,
          }}
          transition={{ duration: reduced ? 0 : 0.6, ease: "backOut" }}
          className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-end gap-1"
        >
          <span className="text-3xl">🤵</span>
          <span className="text-4xl">💒</span>
          <span className="text-3xl">👰</span>
        </motion.div>

        {/* 폭죽 파티클 */}
        <AnimatePresence>
          {launched && (
            <>
              {Array.from({ length: 14 }).map((_, i) => {
                const angle = (Math.PI * 2 * i) / 14;
                const radius = 90 + Math.random() * 30;
                const dx = Math.cos(angle) * radius;
                const dy = Math.sin(angle) * radius;
                const symbols = ["💗", "✨", "🎉", "💐", "💍"];
                const s = symbols[i % symbols.length];
                return (
                  <motion.span
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                    animate={{
                      x: reduced ? 0 : dx,
                      y: reduced ? 0 : dy,
                      opacity: [0, 1, 1, 0],
                      scale: [0.4, 1, 1, 0.8],
                    }}
                    transition={{ duration: reduced ? 0.2 : 1.1, ease: "easeOut" }}
                    className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 text-xl"
                  >
                    {s}
                  </motion.span>
                );
              })}
            </>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onPointerDown={startHold}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        onPointerCancel={endHold}
        disabled={launched}
        className="w-full max-w-[320px] select-none rounded-full bg-[#b07989] py-4 text-[14px] font-medium tracking-widest text-white shadow-[0_6px_18px_-8px_rgba(176,121,137,0.6)] transition active:scale-[0.98] disabled:opacity-70"
        style={{ touchAction: "none" }}
      >
        {launched ? "🎉 축하합니다!" : released && progress < HOLD_MIN_PERCENT ? "조금 더 꾹 눌러요" : "꾹 누르세요"}
      </button>
    </div>
  );
}

// ─── Ending ──────────────────────────────────────────────
function EndingScreen({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "backOut" }}
        className="text-6xl"
      >
        💒
      </motion.div>
      <div>
        <p className="eyebrow">Invitation Unlocked</p>
        <h3 className="mt-2 text-[20px] font-medium text-[color:var(--color-ink)]">
          귀한 발걸음 더해 주세요
        </h3>
        <p className="mt-3 whitespace-pre-line text-[13px] leading-[1.75] text-[color:var(--color-mute)]">
          {"우리의 작은 이야기를 함께 걸어주셔서 감사합니다\n이제 채종현 · 최수빈의 청첩장이 열립니다"}
        </p>
      </div>
      <button
        type="button"
        onClick={onComplete}
        className="mt-2 rounded-full bg-[#b07989] px-8 py-3 text-[13px] font-medium tracking-widest text-white shadow-[0_6px_18px_-8px_rgba(176,121,137,0.6)] transition active:scale-95"
      >
        청첩장 열기 →
      </button>
    </div>
  );
}

function Share() {
  const share = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "우리 결혼합니다", url: window.location.href });
      } catch {
        /* noop */
      }
    } else {
      await navigator.clipboard?.writeText(window.location.href);
      alert("링크를 복사했습니다");
    }
  };
  return (
    <section className="px-5 py-14 pb-28 bg-white">
      <FlowerDivider />
      <div className="text-center">
        <p className="eyebrow">Thank You</p>
        <p className="mt-4 text-[clamp(1.2rem,5.4vw,1.6rem)] text-[color:var(--color-charcoal)] whitespace-nowrap">
          {data.groom.nameEn} &amp; {data.bride.nameEn}
        </p>
        <button
          onClick={share}
          className="mx-auto mt-8 block rounded-full bg-[color:var(--color-rose-deep)] px-7 py-3 text-[12px] tracking-[0.28em] text-white whitespace-nowrap"
        >
          SHARE
        </button>
        <p className="mt-10 label-caps text-[color:var(--color-mute)]">MADE WITH LOVE</p>
      </div>
    </section>
  );
}

// ─── 랜딩 ───
// 첫 진입 시 청첩장/게임 분기를 선택하는 단순한 표지화면
function Landing({ onPickInvitation, onPickGame }: { onPickInvitation: () => void; onPickGame: () => void }) {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[color:var(--color-blush)] via-white to-white px-6 text-center">
      <div className="fade-in flex w-full max-w-[22rem] flex-col items-center">
        <p className="eyebrow mb-4">Wedding Day</p>
        <h1 className="text-[clamp(1.3rem,6vw,1.9rem)] leading-[1.2] text-[color:var(--color-charcoal)] text-center">
          <span className="block break-words">{data.groom.nameEn}</span>
          <span className="my-1 block italic text-[0.75em] text-[color:var(--color-rose-deep)]">&amp;</span>
          <span className="block break-words">{data.bride.nameEn}</span>
        </h1>
        <p className="mt-3 text-[clamp(12px,3.6vw,14px)] tracking-[0.2em] text-[color:var(--color-mute)]">
          2026. 11. 15 · SUN · 14:00
        </p>
        <p className="mt-1 text-[clamp(11px,3.2vw,13px)] tracking-[0.16em] text-[color:var(--color-mute)]">
          {data.venue.name}
        </p>

        <FlowerDivider />

        <button
          type="button"
          onClick={onPickInvitation}
          className="w-full max-w-xs rounded-full bg-[color:var(--color-rose-deep)] px-6 py-4 text-[clamp(14px,4vw,16px)] font-medium tracking-[0.18em] text-white shadow-md active:scale-[0.98] transition"
        >
          📬 청첩장 바로보기
        </button>
        <button
          type="button"
          onClick={onPickGame}
          className="mt-3 w-full max-w-xs rounded-full border border-[color:var(--color-rose)]/50 bg-white/60 px-6 py-3 text-[clamp(12px,3.6vw,14px)] tracking-[0.16em] text-[color:var(--color-rose-deep)] active:scale-[0.98] transition"
        >
          🎮 미니게임 하고 선물 받기
        </button>
        <p className="mt-3 text-[11px] tracking-widest text-[color:var(--color-mute)] whitespace-nowrap">
          ※ 게임 1~3등 소정의 선물 증정
        </p>
      </div>
      <div className="absolute bottom-6 label-caps text-[color:var(--color-mute)]">SCROLL OR TAP</div>
    </section>
  );
}

// ─── 게임 단독 뷰 ───
// 랜딩 → 게임 선택 시 게임만 보여주고, 클리어/오버 후 자동으로 청첩장 본문으로 전환
function GameStage({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  return (
    <section className="relative min-h-[100svh] bg-white">
      <div className="flex items-center justify-between px-5 pt-5">
        <p className="eyebrow">Wedding Quest</p>
        <button
          type="button"
          onClick={onSkip}
          className="text-[11px] tracking-widest text-[color:var(--color-mute)] underline underline-offset-4 whitespace-nowrap"
        >
          청첩장 바로보기 →
        </button>
      </div>
      <WeddingGame onComplete={onComplete} />
    </section>
  );
}

type View = "landing" | "game" | "invitation";

export default function Home() {
  const [fontKey, setFontKey] = useState("gowun-batang");
  const [view, setView] = useState<View>("landing");
  const [transitioning, setTransitioning] = useState(false);
  const fontVar = useMemo(
    () => FONTS.find((f) => f.key === fontKey)?.cssVar ?? "var(--font-gowun-batang)",
    [fontKey],
  );

  // 게임 종료 → 페이드아웃 후 청첩장 전환
  const handleGameComplete = useCallback(() => {
    setTransitioning(true);
    window.setTimeout(() => {
      setView("invitation");
      setTransitioning(false);
      window.scrollTo({ top: 0, behavior: "auto" });
    }, 600);
  }, []);

  return (
    <main className="invitation" style={{ fontFamily: fontVar } as React.CSSProperties}>
      <div className={transitioning ? "fade-out" : "fade-in"} key={view}>
        {view === "landing" && (
          <Landing
            onPickInvitation={() => setView("invitation")}
            onPickGame={() => setView("game")}
          />
        )}
        {view === "game" && (
          <GameStage
            onComplete={handleGameComplete}
            onSkip={() => setView("invitation")}
          />
        )}
        {view === "invitation" && (
          <>
            <Hero />
            <Greeting />
            <Couple />
            <Countdown />
            <Calendar />
            <Gallery />
            <Location />
            <Account />
            <Guestbook />
            <Share />
          </>
        )}
      </div>
      <FontToggle value={fontKey} onChange={setFontKey} />
    </main>
  );
}
