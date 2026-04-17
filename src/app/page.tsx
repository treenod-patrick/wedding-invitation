"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
      <div className="fade-in">
        <p className="eyebrow mb-6">We Invite You</p>
        <h1 className="text-[clamp(1.9rem,8.5vw,2.6rem)] leading-tight text-[color:var(--color-charcoal)] whitespace-nowrap">{data.groom.nameEn}</h1>
        <p className="my-3 italic text-base text-[color:var(--color-rose-deep)]">&amp;</p>
        <h1 className="text-[clamp(1.9rem,8.5vw,2.6rem)] leading-tight text-[color:var(--color-charcoal)] whitespace-nowrap">{data.bride.nameEn}</h1>
        <FlowerDivider />
        <p className="mt-2 text-[clamp(11px,3.4vw,14px)] tracking-[0.22em] text-[color:var(--color-mute)] whitespace-nowrap">2026. 11. 15 · 일</p>
        <p className="mt-2 text-[clamp(10px,3vw,12px)] tracking-[0.18em] text-[color:var(--color-mute)] whitespace-nowrap">{data.venue.name}</p>
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

// 🎮 포켓몬 감성 탑다운 JRPG — 오리지널 드로잉, 4단계 어드벤처
// Phase 1 인트로 → Phase 2 집 탈출 → Phase 3 마을 이동 → Phase 4 레드카펫 러너
type Phase = "intro" | "home" | "town" | "runner" | "cleared" | "over";
type Sex = "groom" | "bride";

// 저해상도 게임보이 감성 해상도 (CSS에서 2~3배 업스케일)
const VW = 320;
const VH = 288;
const TILE = 16;

// Phase 4 러너 상수 — 횡스크롤 엔드리스 러너 (t-rex-runner 패턴 참고, 오리지널 드로잉)
const RUN_DURATION = 60; // 초
const GROUND_Y = VH - 44; // 플레이어 발바닥 y
const PLAYER_X = Math.floor(VW * 0.3); // 플레이어 고정 x
const GRAVITY = 1600; // px/s^2
const JUMP_VY = -520; // px/s (위로)
const SLIDE_DURATION = 0.6; // 초
const BASE_SPEED = 140; // px/s
const MAX_SPEED = 340; // px/s
const SPEED_ACCEL = 6; // 초당 속도 증가
const PARTNER_GAP_MAX = 78; // 파트너-플레이어 최대 간격
const PARTNER_GAP_START = 56; // 시작 간격

type RunnerKind = "coin" | "gem" | "bouquet" | "stone" | "bird" | "banner";
type RunnerItem = { kind: RunnerKind; x: number; y: number; hit?: boolean };

// 대사 큐 — 플랫 카툰 RPG 스타일, 오리지널 카피
const INTRO_LINES: string[] = [
  "안녕! 이 세계에 온 걸 환영하네.",
  "이 세상은 「결혼」이라 불리는 아주 특별한 이벤트로 가득 차 있지.",
  "나는 「축박사」라고 하네.",
  "자, 오늘의 주인공… 자네의 모습을 보여주겠나?",
];
const HOME_LINES: string[] = [
  "어머, 일어났구나!",
  "오늘은 인생 최고의 날이란다.",
  "늦지 않게 식장으로 가렴!",
];
const TOWN_LINES: string[] = [
  "꼬마: 와! 오늘 결혼한대!",
  "할머니: 좋을 때다~ 축하하네.",
  "친구: 드디어 가는구나! 축하한다!",
  "야생의 하객이 나타났다!",
  "…반갑다고 인사했다.",
  "식장이 보인다. 문을 연다…",
];

// ─────────────────────────────────────────────────────────
//  게임 오디오 엔진 — Web Audio API 절차적 8비트 합성
//  저작권 안전: 모든 멜로디/SFX는 런타임에 직접 생성, 외부 음원 의존 0
// ─────────────────────────────────────────────────────────

type BgmTrack = "intro" | "home" | "town" | "runner" | "cleared" | "over" | null;

// 반음 주파수 (A4=440 기준, MIDI 69)
function midiToHz(m: number): number {
  return 440 * Math.pow(2, (m - 69) / 12);
}

// Phase별 8비트 루프 멜로디 — 오리지널 작곡 (IP 안전)
// 포맷: [midi노트 또는 0(쉼표), 박자 길이]
const BGM_PATTERNS: Record<Exclude<BgmTrack, null>, { bpm: number; notes: [number, number][]; bass: [number, number][] }> = {
  // 인트로: 잔잔한 아르페지오 C-G-Am-F
  intro: {
    bpm: 88,
    notes: [[72, 1], [76, 1], [79, 1], [76, 1], [71, 1], [74, 1], [79, 1], [74, 1], [69, 1], [72, 1], [76, 1], [72, 1], [65, 1], [69, 1], [72, 1], [69, 1]],
    bass: [[48, 4], [43, 4], [45, 4], [41, 4]],
  },
  // 집: 아침 마을 — 경쾌하지만 여유
  home: {
    bpm: 112,
    notes: [[72, 1], [74, 1], [76, 2], [79, 1], [76, 1], [74, 2], [72, 1], [74, 1], [76, 1], [74, 1], [72, 1], [69, 1], [72, 4]],
    bass: [[48, 2], [55, 2], [53, 2], [52, 2], [48, 2], [55, 2], [50, 2], [55, 2]],
  },
  // 마을: 보행 느낌 — 스텝 바운스
  town: {
    bpm: 124,
    notes: [[76, 1], [79, 1], [81, 1], [83, 1], [84, 2], [81, 1], [79, 1], [77, 1], [76, 1], [74, 2], [72, 1], [74, 1], [76, 2], [77, 1], [79, 1]],
    bass: [[52, 2], [59, 2], [57, 2], [55, 2], [53, 2], [57, 2], [52, 2], [55, 2]],
  },
  // 러너: 빠른 템포 — 긴박감
  runner: {
    bpm: 156,
    notes: [[76, 1], [79, 1], [84, 1], [79, 1], [77, 1], [81, 1], [84, 1], [81, 1], [74, 1], [77, 1], [82, 1], [77, 1], [76, 1], [79, 1], [84, 2]],
    bass: [[40, 1], [52, 1], [40, 1], [52, 1], [41, 1], [53, 1], [41, 1], [53, 1], [38, 1], [50, 1], [38, 1], [50, 1], [40, 1], [52, 1], [40, 2]],
  },
  // 클리어: 축하 팡파레 (웨딩 행진 오마주 — 오리지널 멜로디)
  cleared: {
    bpm: 100,
    notes: [[72, 2], [72, 1], [74, 1], [76, 4], [72, 2], [72, 1], [74, 1], [79, 4], [77, 1], [76, 1], [74, 1], [72, 1], [74, 2], [72, 2]],
    bass: [[48, 4], [48, 4], [53, 4], [48, 4]],
  },
  // 오버: 다운 코드
  over: {
    bpm: 72,
    notes: [[67, 2], [65, 2], [63, 2], [60, 4]],
    bass: [[48, 4], [43, 4]],
  },
};

type AudioEngine = {
  ensureStarted: () => void;
  playBgm: (track: BgmTrack) => void;
  stopBgm: () => void;
  sfx: (kind: "dialog" | "pickup" | "hit" | "win" | "lose" | "jump") => void;
  setMuted: (m: boolean) => void;
  getMuted: () => boolean;
};

function useAudioEngine(): AudioEngine {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const bgmGainRef = useRef<GainNode | null>(null);
  const mutedRef = useRef<boolean>(false);
  const bgmTimerRef = useRef<number | null>(null);
  const currentTrackRef = useRef<BgmTrack>(null);

  // 초기 음소거 상태 로드
  useEffect(() => {
    try {
      const raw = localStorage.getItem("wedding_audio_muted_v1");
      mutedRef.current = raw === "1";
    } catch {}
  }, []);

  const ensureStarted = useCallback(() => {
    if (ctxRef.current) {
      if (ctxRef.current.state === "suspended") ctxRef.current.resume().catch(() => {});
      return;
    }
    try {
      const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      const ctx = new AC();
      const master = ctx.createGain();
      master.gain.value = mutedRef.current ? 0 : 0.5;
      master.connect(ctx.destination);
      const bgmGain = ctx.createGain();
      bgmGain.gain.value = 0.35;
      bgmGain.connect(master);
      ctxRef.current = ctx;
      masterRef.current = master;
      bgmGainRef.current = bgmGain;
    } catch {}
  }, []);

  const stopBgm = useCallback(() => {
    if (bgmTimerRef.current !== null) {
      window.clearInterval(bgmTimerRef.current);
      bgmTimerRef.current = null;
    }
    currentTrackRef.current = null;
  }, []);

  const playBgm = useCallback((track: BgmTrack) => {
    ensureStarted();
    if (currentTrackRef.current === track) return;
    stopBgm();
    currentTrackRef.current = track;
    if (!track) return;
    const ctx = ctxRef.current;
    const bgmGain = bgmGainRef.current;
    if (!ctx || !bgmGain) return;
    const pat = BGM_PATTERNS[track];
    const beatSec = 60 / pat.bpm / 2; // 1박 = 8분음표
    let startAt = ctx.currentTime + 0.05;
    const notesDur = pat.notes.reduce((a, b) => a + b[1], 0) * beatSec;
    const bassDur = pat.bass.reduce((a, b) => a + b[1], 0) * beatSec;
    const loopDur = Math.max(notesDur, bassDur);

    const scheduleLoop = (t0: number) => {
      let t = t0;
      for (const [m, len] of pat.notes) {
        if (m > 0) playBlip(ctx, bgmGain, midiToHz(m), t, len * beatSec * 0.92, "square", 0.22);
        t += len * beatSec;
      }
      let bt = t0;
      for (const [m, len] of pat.bass) {
        if (m > 0) playBlip(ctx, bgmGain, midiToHz(m), bt, len * beatSec * 0.85, "triangle", 0.35);
        bt += len * beatSec;
      }
    };

    scheduleLoop(startAt);
    bgmTimerRef.current = window.setInterval(() => {
      startAt += loopDur;
      scheduleLoop(startAt);
    }, loopDur * 1000 - 40);
  }, [ensureStarted, stopBgm]);

  const sfx = useCallback((kind: "dialog" | "pickup" | "hit" | "win" | "lose" | "jump") => {
    ensureStarted();
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const t = ctx.currentTime;
    if (kind === "dialog") {
      playBlip(ctx, master, 880, t, 0.05, "square", 0.18);
    } else if (kind === "pickup") {
      playBlip(ctx, master, 880, t, 0.08, "square", 0.25);
      playBlip(ctx, master, 1320, t + 0.06, 0.1, "square", 0.22);
    } else if (kind === "hit") {
      playBlip(ctx, master, 160, t, 0.18, "sawtooth", 0.3);
    } else if (kind === "jump") {
      playBlip(ctx, master, 440, t, 0.08, "square", 0.22);
      playBlip(ctx, master, 660, t + 0.05, 0.06, "square", 0.2);
    } else if (kind === "win") {
      [72, 76, 79, 84].forEach((m, i) => playBlip(ctx, master, midiToHz(m), t + i * 0.08, 0.18, "square", 0.28));
    } else if (kind === "lose") {
      [72, 67, 63, 58].forEach((m, i) => playBlip(ctx, master, midiToHz(m), t + i * 0.12, 0.22, "sawtooth", 0.25));
    }
  }, [ensureStarted]);

  const setMuted = useCallback((m: boolean) => {
    mutedRef.current = m;
    try { localStorage.setItem("wedding_audio_muted_v1", m ? "1" : "0"); } catch {}
    const master = masterRef.current;
    const ctx = ctxRef.current;
    if (master && ctx) master.gain.setTargetAtTime(m ? 0 : 0.5, ctx.currentTime, 0.05);
  }, []);

  const getMuted = useCallback(() => mutedRef.current, []);

  // 언마운트 시 정리
  useEffect(() => () => { stopBgm(); ctxRef.current?.close().catch(() => {}); }, [stopBgm]);

  return useMemo(
    () => ({ ensureStarted, playBgm, stopBgm, sfx, setMuted, getMuted }),
    [ensureStarted, playBgm, stopBgm, sfx, setMuted, getMuted]
  );
}

// 단발 톤 — 오실레이터 + ADSR
function playBlip(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  when: number,
  dur: number,
  type: OscillatorType,
  vol: number
) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol, when + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc.connect(g);
  g.connect(dest);
  osc.start(when);
  osc.stop(when + dur + 0.02);
}

function WeddingAdventure({ onComplete }: { onComplete?: () => void } = {}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const phaseRef = useRef<Phase>("intro");
  const audio = useAudioEngine();
  const [muted, setMutedState] = useState(false);
  const [sex, setSex] = useState<Sex>("groom");
  const sexRef = useRef<Sex>("groom");
  const [nickname, setNickname] = useState("");

  // 공용 대사 상태
  const [dialogIdx, setDialogIdx] = useState(0);
  const dialogIdxRef = useRef(0);
  const [dialogChars, setDialogChars] = useState(0);
  const dialogCharsRef = useRef(0);
  const cursorBlinkRef = useRef(0);

  // Phase 2 집 탈출 (타일맵 8×6)
  // 0=풀밭, 1=벽, 2=침대, 3=책상, 4=카펫, 5=문, 9=NPC
  const HOME_MAP: number[][] = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 0, 0, 0, 3, 1],
    [1, 2, 2, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 9, 0, 0, 1],
    [1, 4, 4, 4, 4, 4, 4, 1],
    [1, 1, 1, 1, 5, 1, 1, 1],
  ];
  const playerRef = useRef({ col: 4, row: 3, facing: "down" as "up" | "down" | "left" | "right" });
  const moveTimerRef = useRef(0);

  // Phase 3 마을 자동 스크롤
  const townScrollRef = useRef(0);
  const townLineIdxRef = useRef(0);
  const townTimerRef = useRef(0);

  // Phase 4 러너
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [remain, setRemain] = useState(RUN_DURATION);
  const remainRef = useRef(RUN_DURATION);
  const [lives, setLives] = useState(3);
  const livesRef = useRef(3);
  const [best, setBest] = useState(0);
  // 플레이어 물리 상태
  const playerYRef = useRef(GROUND_Y);
  const playerVYRef = useRef(0);
  const playerStateRef = useRef<"grounded" | "jumping" | "sliding">("grounded");
  const slideTimerRef = useRef(0);
  // 월드 상태
  const worldSpeedRef = useRef(BASE_SPEED);
  const elapsedRef = useRef(0);
  const itemsRef = useRef<RunnerItem[]>([]);
  const spawnRef = useRef(0.9);
  const invincRef = useRef(0);
  const runScrollRef = useRef(0);
  // 추격자(파트너) — 플레이어보다 더 뒤에서 따라옴. 피격 시 간격 줄어들어 잡힘
  const partnerGapRef = useRef(PARTNER_GAP_START);
  const partnerBounceRef = useRef(0);

  // RAF 루프
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  // best 스코어 + 음소거 상태 로드
  useEffect(() => {
    try {
      const raw = localStorage.getItem("wedding_adventure_best_v1");
      if (raw) setBest(parseInt(raw, 10) || 0);
      const m = localStorage.getItem("wedding_audio_muted_v1") === "1";
      setMutedState(m);
    } catch {}
  }, []);

  // cleared/over 진입 시 3초 뒤 onComplete 호출 → 청첩장 자동 전환
  useEffect(() => {
    if (!onComplete) return;
    if (phase !== "cleared" && phase !== "over") return;
    const t = window.setTimeout(() => onComplete(), 3200);
    return () => window.clearTimeout(t);
  }, [phase, onComplete]);

  const setPhaseBoth = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
    // phase 진입시 대사 인덱스 초기화
    dialogIdxRef.current = 0;
    dialogCharsRef.current = 0;
    setDialogIdx(0);
    setDialogChars(0);
    // phase별 BGM 스왑
    if (p === "cleared") audio.sfx("win");
    else if (p === "over") audio.sfx("lose");
    audio.playBgm(p as BgmTrack);
  }, [audio]);

  const startRunner = useCallback(() => {
    scoreRef.current = 0;
    remainRef.current = RUN_DURATION;
    livesRef.current = 3;
    playerYRef.current = GROUND_Y;
    playerVYRef.current = 0;
    playerStateRef.current = "grounded";
    slideTimerRef.current = 0;
    worldSpeedRef.current = BASE_SPEED;
    elapsedRef.current = 0;
    itemsRef.current = [];
    spawnRef.current = 0.9;
    invincRef.current = 0;
    runScrollRef.current = 0;
    partnerGapRef.current = PARTNER_GAP_START;
    partnerBounceRef.current = 0;
    setScore(0);
    setRemain(RUN_DURATION);
    setLives(3);
    setPhaseBoth("runner");
  }, [setPhaseBoth]);

  const endRunner = useCallback((cleared: boolean) => {
    const finalScore = scoreRef.current + (cleared ? 500 : 0);
    scoreRef.current = finalScore;
    setScore(finalScore);
    try {
      const prev = parseInt(localStorage.getItem("wedding_adventure_best_v1") || "0", 10);
      if (finalScore > prev) {
        localStorage.setItem("wedding_adventure_best_v1", String(finalScore));
        setBest(finalScore);
      }
    } catch {}
    setPhaseBoth(cleared ? "cleared" : "over");
  }, [setPhaseBoth]);

  // 대사 진행 — 탭/클릭하면 다음 줄
  const advanceDialog = useCallback((lines: string[], onDone: () => void) => {
    const full = lines[dialogIdxRef.current] ?? "";
    if (dialogCharsRef.current < full.length) {
      dialogCharsRef.current = full.length;
      setDialogChars(full.length);
      audio.sfx("dialog");
      return;
    }
    const next = dialogIdxRef.current + 1;
    if (next >= lines.length) {
      onDone();
      return;
    }
    audio.sfx("dialog");
    dialogIdxRef.current = next;
    dialogCharsRef.current = 0;
    setDialogIdx(next);
    setDialogChars(0);
  }, []);

  // 러너 액션 — 점프 / 슬라이드
  const jump = useCallback(() => {
    if (phaseRef.current !== "runner") return;
    if (playerStateRef.current !== "grounded") return;
    playerStateRef.current = "jumping";
    playerVYRef.current = JUMP_VY;
    audio.sfx("jump");
  }, [audio]);
  const slide = useCallback(() => {
    if (phaseRef.current !== "runner") return;
    if (playerStateRef.current === "sliding") return;
    // 공중에서 아래 키 누르면 빠르게 착지 후 슬라이드
    if (playerStateRef.current === "jumping") {
      playerVYRef.current = Math.max(playerVYRef.current, 700);
      return;
    }
    playerStateRef.current = "sliding";
    slideTimerRef.current = SLIDE_DURATION;
    audio.sfx("dialog");
  }, [audio]);

  // 집 탈출 이동
  const movePlayer = useCallback((dx: number, dy: number) => {
    if (phaseRef.current !== "home") return;
    if (moveTimerRef.current > 0) return;
    const p = playerRef.current;
    p.facing = dx === -1 ? "left" : dx === 1 ? "right" : dy === -1 ? "up" : "down";
    const nc = p.col + dx;
    const nr = p.row + dy;
    if (nr < 0 || nr >= HOME_MAP.length || nc < 0 || nc >= HOME_MAP[0].length) return;
    const tile = HOME_MAP[nr][nc];
    if (tile === 1 || tile === 2 || tile === 3) return; // 벽/침대/책상 블록
    if (tile === 5) {
      // 현관문 → 마을로
      setPhaseBoth("town");
      return;
    }
    p.col = nc;
    p.row = nr;
    moveTimerRef.current = 0.12;
  }, [setPhaseBoth]);

  // 키보드 입력
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phaseRef.current === "intro") {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          advanceDialog(INTRO_LINES, () => setPhaseBoth("home"));
        }
        return;
      }
      if (phaseRef.current === "home") {
        if (e.key === "ArrowLeft") movePlayer(-1, 0);
        else if (e.key === "ArrowRight") movePlayer(1, 0);
        else if (e.key === "ArrowUp") movePlayer(0, -1);
        else if (e.key === "ArrowDown") movePlayer(0, 1);
        else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          advanceDialog(HOME_LINES, () => {});
        }
        return;
      }
      if (phaseRef.current === "town") {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          advanceDialog(TOWN_LINES, () => startRunner());
        }
        return;
      }
      if (phaseRef.current === "runner") {
        if (e.key === "ArrowUp" || e.key === " " || e.key === "Spacebar" || e.key === "w" || e.key === "W") {
          e.preventDefault();
          jump();
        } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
          e.preventDefault();
          slide();
        }
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advanceDialog, movePlayer, jump, slide, setPhaseBoth, startRunner]);

  // 터치 스와이프 (러너 전용)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    if (phaseRef.current !== "runner") return;
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (phaseRef.current !== "runner") return;
    const s = touchStartRef.current;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    // 세로 스와이프 우선
    if (Math.abs(dy) > 18 && Math.abs(dy) > Math.abs(dx)) {
      if (dy < 0) jump();
      else slide();
    } else if (Math.abs(dx) < 14 && Math.abs(dy) < 14) {
      // 짧은 탭 = 점프
      jump();
    }
    touchStartRef.current = null;
  };

  // 러너 업데이트 & 모든 phase 렌더 루프
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const loop = (ts: number) => {
      const last = lastTsRef.current ?? ts;
      const dt = Math.min(0.05, (ts - last) / 1000);
      lastTsRef.current = ts;
      cursorBlinkRef.current = (cursorBlinkRef.current + dt) % 1.2;

      const ph = phaseRef.current;

      // phase별 업데이트
      if (ph === "intro") {
        // 타자 효과
        const line = INTRO_LINES[dialogIdxRef.current] ?? "";
        if (dialogCharsRef.current < line.length) {
          dialogCharsRef.current = Math.min(line.length, dialogCharsRef.current + dt * 38);
          setDialogChars(Math.floor(dialogCharsRef.current));
        }
      } else if (ph === "home") {
        if (moveTimerRef.current > 0) moveTimerRef.current -= dt;
        const line = HOME_LINES[dialogIdxRef.current] ?? "";
        if (dialogCharsRef.current < line.length) {
          dialogCharsRef.current = Math.min(line.length, dialogCharsRef.current + dt * 38);
          setDialogChars(Math.floor(dialogCharsRef.current));
        }
      } else if (ph === "town") {
        townScrollRef.current = (townScrollRef.current + dt * 22) % (VW * 2);
        const line = TOWN_LINES[dialogIdxRef.current] ?? "";
        if (dialogCharsRef.current < line.length) {
          dialogCharsRef.current = Math.min(line.length, dialogCharsRef.current + dt * 38);
          setDialogChars(Math.floor(dialogCharsRef.current));
        }
      } else if (ph === "runner") {
        remainRef.current -= dt;
        elapsedRef.current += dt;
        // 시간이 흐를수록 월드 속도 증가 — 난이도 점증
        worldSpeedRef.current = Math.min(MAX_SPEED, BASE_SPEED + elapsedRef.current * SPEED_ACCEL);
        runScrollRef.current = (runScrollRef.current + dt * worldSpeedRef.current) % 64;
        if (invincRef.current > 0) invincRef.current -= dt;
        setRemain(Math.max(0, Math.ceil(remainRef.current)));

        // 플레이어 물리
        if (playerStateRef.current === "jumping") {
          playerVYRef.current += GRAVITY * dt;
          playerYRef.current += playerVYRef.current * dt;
          if (playerYRef.current >= GROUND_Y) {
            playerYRef.current = GROUND_Y;
            playerVYRef.current = 0;
            playerStateRef.current = "grounded";
          }
        } else if (playerStateRef.current === "sliding") {
          slideTimerRef.current -= dt;
          if (slideTimerRef.current <= 0) {
            playerStateRef.current = "grounded";
            slideTimerRef.current = 0;
          }
        }

        // 파트너는 피격 안 당하면 서서히 뒤로 밀려남(안전 거리 회복)
        partnerGapRef.current = Math.min(PARTNER_GAP_MAX, partnerGapRef.current + dt * 6);
        partnerBounceRef.current += dt * 10;

        // 스폰
        spawnRef.current -= dt;
        if (spawnRef.current <= 0) {
          // 속도가 빨라질수록 스폰 간격도 약간 좁아짐
          const base = Math.max(0.45, 1.0 - elapsedRef.current * 0.008);
          spawnRef.current = base + Math.random() * 0.35;
          const r = Math.random();
          let kind: RunnerKind;
          if (r < 0.18) kind = "coin";
          else if (r < 0.30) kind = "gem";
          else if (r < 0.38) kind = "bouquet";
          else if (r < 0.66) kind = "stone";
          else if (r < 0.86) kind = "bird";
          else kind = "banner";
          const y =
            kind === "bird" ? GROUND_Y - 40
            : kind === "banner" ? GROUND_Y - 32
            : kind === "coin" || kind === "gem" ? GROUND_Y - 22 - Math.random() * 24
            : GROUND_Y - 2; // stone, bouquet (지면)
          itemsRef.current.push({ kind, x: VW + 20, y });
        }

        // 월드 이동
        const mv = worldSpeedRef.current * dt;
        for (const it of itemsRef.current) it.x -= mv;

        // 충돌 판정
        const px = PLAYER_X;
        const py = playerYRef.current;
        const ps = playerStateRef.current;
        // 플레이어 hitbox — 슬라이딩 중엔 납작
        const pbox = ps === "sliding"
          ? { x: px - 7, y: py - 8, w: 14, h: 8 }
          : { x: px - 6, y: py - 22, w: 12, h: 22 };
        for (const it of itemsRef.current) {
          if (it.hit) continue;
          let ibox: { x: number; y: number; w: number; h: number };
          if (it.kind === "stone") ibox = { x: it.x - 6, y: it.y - 10, w: 12, h: 10 };
          else if (it.kind === "bird") ibox = { x: it.x - 7, y: it.y - 5, w: 14, h: 8 };
          else if (it.kind === "banner") ibox = { x: it.x - 9, y: it.y - 10, w: 18, h: 14 };
          else if (it.kind === "bouquet") ibox = { x: it.x - 6, y: it.y - 12, w: 12, h: 12 };
          else ibox = { x: it.x - 6, y: it.y - 6, w: 12, h: 12 };
          const hit =
            pbox.x < ibox.x + ibox.w &&
            pbox.x + pbox.w > ibox.x &&
            pbox.y < ibox.y + ibox.h &&
            pbox.y + pbox.h > ibox.y;
          if (!hit) continue;
          it.hit = true;
          if (it.kind === "coin") { scoreRef.current += 50; audio.sfx("pickup"); }
          else if (it.kind === "gem") { scoreRef.current += 150; audio.sfx("pickup"); }
          else if (it.kind === "bouquet") { scoreRef.current += 300; invincRef.current = 2.5; audio.sfx("pickup"); }
          else {
            // 장애물 피격 — 라이프 감소 + 파트너가 가까워짐
            if (invincRef.current <= 0) {
              livesRef.current -= 1;
              partnerGapRef.current = Math.max(8, partnerGapRef.current - 22);
              audio.sfx("hit");
            }
          }
          setScore(scoreRef.current);
          setLives(livesRef.current);
        }

        // 장애물 통과 점수 + 화면 밖/피격 제거
        itemsRef.current = itemsRef.current.filter((it) => {
          if (it.hit) return false;
          if (it.x < -30) {
            if (it.kind === "stone" || it.kind === "bird" || it.kind === "banner") {
              scoreRef.current += 10;
            }
            return false;
          }
          return true;
        });

        if (livesRef.current <= 0 || partnerGapRef.current <= 0) { endRunner(false); }
        else if (remainRef.current <= 0) { endRunner(true); }
      }

      // 렌더
      drawScene(ctx, ph, {
        sex: sexRef.current,
        homeMap: HOME_MAP,
        player: playerRef.current,
        townScroll: townScrollRef.current,
        dialogIdx: dialogIdxRef.current,
        dialogChars: dialogCharsRef.current,
        cursorBlink: cursorBlinkRef.current,
        runner: {
          playerY: playerYRef.current,
          playerState: playerStateRef.current,
          partnerGap: partnerGapRef.current,
          partnerBounce: partnerBounceRef.current,
          worldSpeed: worldSpeedRef.current,
          items: itemsRef.current,
          invinc: invincRef.current,
          remain: remainRef.current,
          score: scoreRef.current,
          lives: livesRef.current,
          scroll: runScrollRef.current,
        },
        nickname,
      });

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [endRunner, nickname, audio]);

  // 캔버스 클릭/탭 = 대사 진행 or 레인 이동 안내
  const onCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const p = phaseRef.current;
    if (p === "intro") {
      advanceDialog(INTRO_LINES, () => setPhaseBoth("home"));
    } else if (p === "home") {
      advanceDialog(HOME_LINES, () => {});
    } else if (p === "town") {
      advanceDialog(TOWN_LINES, () => startRunner());
    } else if (p === "runner") {
      // 화면 하단 1/3 탭 = 슬라이드, 나머지 = 점프
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      if (y > rect.height * 0.66) slide();
      else jump();
    }
  }, [advanceDialog, jump, slide, setPhaseBoth, startRunner]);

  return (
    <section className="px-5 pt-3 pb-10">
      <SectionHead kicker="Wedding Quest" title="웨딩 러너" />
      <Card>
        <div className="px-2 py-4 rounded-2xl">
          <div
            className="mx-auto relative select-none"
            style={{ maxWidth: 360 }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <canvas
              ref={canvasRef}
              width={VW}
              height={VH}
              onClick={onCanvasClick}
              className="w-full h-auto rounded-lg border border-[color:var(--color-rose)]/30 block"
              style={{ imageRendering: "pixelated", touchAction: "manipulation", aspectRatio: `${VW}/${VH}` }}
            />
            {/* 음소거 토글 — 캔버스 우상단 */}
            <button
              type="button"
              aria-label={muted ? "배경음 켜기" : "배경음 끄기"}
              onClick={(e) => {
                e.stopPropagation();
                audio.ensureStarted();
                const next = !muted;
                audio.setMuted(next);
                setMutedState(next);
                if (!next && phaseRef.current) audio.playBgm(phaseRef.current as BgmTrack);
              }}
              className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/85 border border-[color:var(--color-rose)]/40 text-[14px] shadow-sm"
            >
              {muted ? "🔇" : "🔊"}
            </button>

            {/* Phase별 HUD/오버레이 */}
            {phase === "intro" && (
              <div className="mt-3 flex flex-col gap-2">
                <label className="text-[11px] tracking-widest opacity-70">내 이름 (선택)</label>
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value.slice(0, 10))}
                  placeholder="리더보드 표시용"
                  className="px-3 py-2 rounded-md bg-white/70 border border-[color:var(--color-rose)]/30 text-[13px]"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      audio.ensureStarted();
                      audio.playBgm("intro");
                      sexRef.current = "groom";
                      setSex("groom");
                      audio.sfx("pickup");
                    }}
                    className={`flex-1 py-3 rounded-md text-[12px] tracking-widest border ${sex === "groom" ? "bg-[color:var(--color-rose-deep)] text-white border-transparent" : "border-[color:var(--color-rose)]/40"}`}
                  >
                    🤵 채종현 (신랑)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      audio.ensureStarted();
                      audio.playBgm("intro");
                      sexRef.current = "bride";
                      setSex("bride");
                      audio.sfx("pickup");
                    }}
                    className={`flex-1 py-3 rounded-md text-[12px] tracking-widest border ${sex === "bride" ? "bg-[color:var(--color-rose-deep)] text-white border-transparent" : "border-[color:var(--color-rose)]/40"}`}
                  >
                    👰 최수빈 (신부)
                  </button>
                </div>
                <p className="text-[10px] tracking-widest opacity-55 text-center">
                  선택한 반대 파트너가 러너에서 뒤따라옵니다
                </p>
                <button
                  type="button"
                  onClick={() => { audio.ensureStarted(); setPhaseBoth("runner"); }}
                  className="mt-1 py-2 rounded-md bg-white/70 border border-[color:var(--color-rose)]/30 text-[11px] tracking-widest opacity-80"
                >
                  ⏭ 오프닝 스킵 → 러너로
                </button>
              </div>
            )}

            {phase === "runner" && (
              <div className="mt-3 flex items-center justify-between text-[12px] font-mono">
                <span>⏱ {remain}s</span>
                <span>♥ {"♥".repeat(Math.max(0, lives))}</span>
                <span>SCORE {score}</span>
                <span className="opacity-60">BEST {best}</span>
              </div>
            )}

            {phase === "runner" && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => slide()}
                  onTouchStart={(e) => { e.preventDefault(); slide(); }}
                  className="py-3 rounded-md bg-white/80 border border-[color:var(--color-rose)]/30 text-[13px] tracking-widest"
                >
                  ⬇ 앉기 (SLIDE)
                </button>
                <button
                  type="button"
                  onClick={() => jump()}
                  onTouchStart={(e) => { e.preventDefault(); jump(); }}
                  className="py-3 rounded-md bg-[color:var(--color-rose-deep)] text-white text-[13px] tracking-widest"
                >
                  점프 (JUMP) ⬆
                </button>
              </div>
            )}

            {(phase === "cleared" || phase === "over") && (
              <div className="mt-3 text-center">
                <p className="text-[13px] tracking-widest mb-2">
                  {phase === "cleared" ? "🎉 결혼했다!" : "💔 GAME OVER"}
                </p>
                <p className="text-[11px] opacity-70 mb-3">
                  점수 {score} · 베스트 {best}
                </p>
                <button
                  type="button"
                  onClick={() => { setPhaseBoth("intro"); }}
                  className="px-5 py-2 rounded-md bg-[color:var(--color-rose-deep)] text-white text-[12px] tracking-widest"
                >
                  다시 하기
                </button>
              </div>
            )}

            <p className="mt-3 text-center text-[10px] tracking-widest opacity-55">
              탭/클릭 = 대화 · 점프↑ / 슬라이드↓ · 위·아래 스와이프
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
//  드로잉 레이어 — 전부 오리지널 도트 (IP 직카피 NO)
// ─────────────────────────────────────────────────────────

type DrawCtx = {
  sex: Sex;
  homeMap: number[][];
  player: { col: number; row: number; facing: "up" | "down" | "left" | "right" };
  townScroll: number;
  dialogIdx: number;
  dialogChars: number;
  cursorBlink: number;
  runner: {
    playerY: number;
    playerState: "grounded" | "jumping" | "sliding";
    partnerGap: number;
    partnerBounce: number;
    worldSpeed: number;
    items: RunnerItem[];
    invinc: number;
    remain: number;
    score: number;
    lives: number;
    scroll: number;
  };
  nickname: string;
};

function drawScene(ctx: CanvasRenderingContext2D, phase: Phase, c: DrawCtx) {
  ctx.imageSmoothingEnabled = false;
  // 배경 기본 클리어
  ctx.fillStyle = "#f7ecea";
  ctx.fillRect(0, 0, VW, VH);

  if (phase === "intro") drawIntro(ctx, c);
  else if (phase === "home") drawHome(ctx, c);
  else if (phase === "town") drawTown(ctx, c);
  else if (phase === "runner") drawRunner(ctx, c);
  else if (phase === "cleared") drawEnding(ctx, c, true);
  else if (phase === "over") drawEnding(ctx, c, false);
}

// 대화창 (포켓몬 감성의 하단 2줄 박스 + ▼ 커서)
function drawDialogBox(ctx: CanvasRenderingContext2D, text: string, chars: number, blink: number, showCursor: boolean) {
  const boxH = 72;
  const y = VH - boxH - 6;
  // 흰색 박스
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(6, y, VW - 12, boxH);
  // 내측 보더
  ctx.strokeStyle = "#8a5a5a";
  ctx.lineWidth = 2;
  ctx.strokeRect(6, y, VW - 12, boxH);
  ctx.strokeStyle = "#c9a6a0";
  ctx.strokeRect(10, y + 4, VW - 20, boxH - 8);

  // 본문
  ctx.fillStyle = "#3d2b28";
  ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
  const shown = text.slice(0, chars);
  const lines = wrapText(ctx, shown, VW - 40);
  for (let i = 0; i < lines.length && i < 3; i++) {
    ctx.fillText(lines[i], 18, y + 20 + i * 16);
  }

  // ▼ 커서 (블링크)
  if (showCursor && chars >= text.length && blink < 0.6) {
    ctx.fillStyle = "#8a5a5a";
    ctx.beginPath();
    ctx.moveTo(VW - 22, y + boxH - 14);
    ctx.lineTo(VW - 14, y + boxH - 14);
    ctx.lineTo(VW - 18, y + boxH - 8);
    ctx.fill();
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let cur = "";
  for (const ch of text) {
    const test = cur + ch;
    if (ctx.measureText(test).width > maxWidth) {
      if (cur) lines.push(cur);
      cur = ch;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// ───── 캐릭터 도트 (오리지널) ─────
// 신랑: 검은 턱시도 + 흰 와이셔츠 + 나비넥타이
// 신부: 흰 드레스 + 면사포
function drawHero(ctx: CanvasRenderingContext2D, cx: number, cy: number, facing: string, sex: Sex, tick: number) {
  const isGroom = sex === "groom";
  // 그림자
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 14, 7, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // 다리 2프레임
  const legSwap = Math.floor(tick * 6) % 2 === 0;
  // 몸 — 신랑(소년)은 네이비 재킷, 신부는 드레스 상의
  ctx.fillStyle = isGroom ? "#1f2a44" : "#f8efe8";
  ctx.fillRect(cx - 5, cy - 1, 10, 11);
  if (isGroom) {
    // 셔츠 V
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cx - 2, cy + 1, 4, 7);
    // 나비넥타이 (조금 더 큼직하게)
    ctx.fillStyle = "#c94a4a";
    ctx.fillRect(cx - 3, cy + 1, 6, 2);
    // 재킷 라펠
    ctx.fillStyle = "#141c2e";
    ctx.fillRect(cx - 3, cy + 3, 1, 6);
    ctx.fillRect(cx + 2, cy + 3, 1, 6);
    // 금색 단추
    ctx.fillStyle = "#d4b86a";
    ctx.fillRect(cx, cy + 5, 1, 1);
  } else {
    // 드레스 치마
    ctx.fillStyle = "#ffe4e4";
    ctx.fillRect(cx - 6, cy + 6, 12, 6);
  }
  // 얼굴 — 소년은 살짝 더 둥글고 크게
  ctx.fillStyle = "#f8d6b5";
  if (isGroom) {
    ctx.fillRect(cx - 4, cy - 11, 8, 9);
    ctx.fillRect(cx - 5, cy - 9, 1, 5);
    ctx.fillRect(cx + 4, cy - 9, 1, 5);
  } else {
    ctx.fillRect(cx - 4, cy - 10, 8, 8);
  }
  // 머리 — 신랑은 밝은 갈색 소년 머리(앞머리 삐침), 신부는 기존 유지
  ctx.fillStyle = isGroom ? "#3d2818" : "#efe0cf";
  if (isGroom) {
    if (facing === "up") {
      ctx.fillRect(cx - 5, cy - 14, 10, 7);
    } else {
      // 볼륨 있는 앞머리
      ctx.fillRect(cx - 5, cy - 14, 10, 5);
      ctx.fillRect(cx - 5, cy - 11, 3, 3);
      ctx.fillRect(cx + 2, cy - 11, 3, 3);
      // 삐친 앞머리 한 가닥
      ctx.fillRect(cx - 1, cy - 15, 2, 2);
    }
  } else {
    if (facing === "up") {
      ctx.fillRect(cx - 5, cy - 13, 10, 6);
    } else {
      ctx.fillRect(cx - 5, cy - 13, 10, 4);
      ctx.fillRect(cx - 5, cy - 10, 2, 3);
      ctx.fillRect(cx + 3, cy - 10, 2, 3);
    }
  }
  // 면사포 (신부)
  if (!isGroom) {
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fillRect(cx - 6, cy - 14, 12, 2);
    ctx.fillRect(cx - 5, cy - 6, 1, 6);
    ctx.fillRect(cx + 4, cy - 6, 1, 6);
  }
  // 눈 + 볼터치(소년 귀여움 포인트)
  if (facing !== "up") {
    ctx.fillStyle = "#1a1a1a";
    if (facing === "left") { ctx.fillRect(cx - 3, cy - 7, 1, 2); }
    else if (facing === "right") { ctx.fillRect(cx + 2, cy - 7, 1, 2); }
    else { ctx.fillRect(cx - 3, cy - 7, 1, 2); ctx.fillRect(cx + 2, cy - 7, 1, 2); }
    if (isGroom) {
      ctx.fillStyle = "rgba(240,120,120,0.55)";
      ctx.fillRect(cx - 4, cy - 4, 2, 1);
      ctx.fillRect(cx + 2, cy - 4, 2, 1);
    }
  }
  // 다리 — 신랑은 네이비 정장 바지
  ctx.fillStyle = isGroom ? "#141c2e" : "#1a1a1a";
  if (legSwap) {
    ctx.fillRect(cx - 4, cy + 10, 3, 4);
    ctx.fillRect(cx + 1, cy + 10, 3, 4);
  } else {
    ctx.fillRect(cx - 3, cy + 10, 3, 4);
    ctx.fillRect(cx, cy + 10, 3, 4);
  }
}

// ───── Phase 1 인트로 ─────
function drawIntro(ctx: CanvasRenderingContext2D, c: DrawCtx) {
  // 배경 — 별들
  ctx.fillStyle = "#2d1b2c";
  ctx.fillRect(0, 0, VW, VH - 80);
  ctx.fillStyle = "#fff3c6";
  for (let i = 0; i < 24; i++) {
    const sx = (i * 37) % VW;
    const sy = (i * 53) % (VH - 120);
    ctx.fillRect(sx, sy, 1, 1);
  }
  // 타이틀 리본
  ctx.fillStyle = "#e89378";
  ctx.fillRect(20, 18, VW - 40, 28);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 14px ui-sans-serif, system-ui";
  ctx.textAlign = "center";
  ctx.fillText("WEDDING QUEST", VW / 2, 37);
  ctx.textAlign = "left";
  // 축박사 NPC (가운데)
  const px = VW / 2;
  const py = VH / 2 - 20;
  // 안경 할아버지 실루엣 (오리지널)
  ctx.fillStyle = "#f5d0b5";
  ctx.fillRect(px - 8, py - 10, 16, 14);
  ctx.fillStyle = "#c9c9c9";
  ctx.fillRect(px - 10, py - 18, 20, 8);
  ctx.fillStyle = "#5a3a1a";
  ctx.fillRect(px - 9, py + 4, 18, 22);
  // 안경
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 1;
  ctx.strokeRect(px - 7, py - 6, 5, 4);
  ctx.strokeRect(px + 2, py - 6, 5, 4);
  ctx.beginPath();
  ctx.moveTo(px - 2, py - 4);
  ctx.lineTo(px + 2, py - 4);
  ctx.stroke();
  // 가운 라벨
  ctx.fillStyle = "#fff";
  ctx.font = "10px ui-monospace";
  ctx.textAlign = "center";
  ctx.fillText("축박사", px, py + 40);
  ctx.textAlign = "left";
  // 대화창
  drawDialogBox(ctx, INTRO_LINES[c.dialogIdx] ?? "", c.dialogChars, c.cursorBlink, true);
}

// ───── Phase 2 집 ─────
function drawHome(ctx: CanvasRenderingContext2D, c: DrawCtx) {
  // 오프셋으로 중앙 정렬
  const mapW = c.homeMap[0].length * TILE;
  const mapH = c.homeMap.length * TILE;
  const ox = Math.floor((VW - mapW) / 2);
  const oy = 16;
  ctx.fillStyle = "#9fc99a";
  ctx.fillRect(0, 0, VW, VH);
  for (let r = 0; r < c.homeMap.length; r++) {
    for (let cc = 0; cc < c.homeMap[r].length; cc++) {
      const t = c.homeMap[r][cc];
      const x = ox + cc * TILE;
      const y = oy + r * TILE;
      if (t === 0) {
        ctx.fillStyle = "#e8d7b4"; // 바닥
        ctx.fillRect(x, y, TILE, TILE);
      } else if (t === 1) {
        ctx.fillStyle = "#7a5a48"; // 벽
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = "#9a7a60";
        ctx.fillRect(x, y, TILE, 3);
      } else if (t === 2) {
        ctx.fillStyle = "#e8d7b4";
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = "#c94a4a"; // 침대 매트
        ctx.fillRect(x + 1, y + 1, TILE - 2, TILE - 5);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x + 2, y + 2, 5, 4);
      } else if (t === 3) {
        ctx.fillStyle = "#e8d7b4";
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = "#6e4d2e"; // 책상
        ctx.fillRect(x + 1, y + 2, TILE - 2, TILE - 4);
      } else if (t === 4) {
        ctx.fillStyle = "#d9a0a0"; // 카펫
        ctx.fillRect(x, y, TILE, TILE);
      } else if (t === 5) {
        ctx.fillStyle = "#3a2a1a"; // 문
        ctx.fillRect(x + 2, y, TILE - 4, TILE);
        ctx.fillStyle = "#f2d37a";
        ctx.fillRect(x + TILE - 6, y + 8, 2, 2);
      } else if (t === 9) {
        ctx.fillStyle = "#e8d7b4";
        ctx.fillRect(x, y, TILE, TILE);
        // 엄마 NPC
        ctx.fillStyle = "#c85b9f";
        ctx.fillRect(x + 4, y + 5, 8, 9);
        ctx.fillStyle = "#f5d0b5";
        ctx.fillRect(x + 5, y + 1, 6, 5);
        ctx.fillStyle = "#5a3a1a";
        ctx.fillRect(x + 4, y, 8, 3);
      }
    }
  }
  // 플레이어
  const p = c.player;
  drawHero(
    ctx,
    ox + p.col * TILE + TILE / 2,
    oy + p.row * TILE + TILE / 2,
    p.facing,
    c.sex,
    performance.now() / 1000,
  );
  // 힌트 + 대화창
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(0, 0, VW, 14);
  ctx.fillStyle = "#fff";
  ctx.font = "10px ui-monospace";
  ctx.fillText("← → ↑ ↓ 이동 · 문으로 나가기", 6, 10);

  drawDialogBox(ctx, HOME_LINES[c.dialogIdx] ?? "", c.dialogChars, c.cursorBlink, true);
}

// ───── Phase 3 마을 ─────
function drawTown(ctx: CanvasRenderingContext2D, c: DrawCtx) {
  // 하늘 + 잔디
  const sky = ctx.createLinearGradient(0, 0, 0, VH);
  sky.addColorStop(0, "#b5d9ff");
  sky.addColorStop(1, "#e9d7b0");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VW, VH);
  // 지면 타일 2줄
  ctx.fillStyle = "#7ab770";
  ctx.fillRect(0, VH - 140, VW, 60);
  // 길
  ctx.fillStyle = "#caa678";
  ctx.fillRect(0, VH - 130, VW, 40);
  // 집 실루엣 스크롤
  const offset = -c.townScroll;
  for (let i = -1; i < 4; i++) {
    const hx = (i * 140 + offset) % (VW * 2);
    const hy = VH - 170;
    drawTownHouse(ctx, hx + 40, hy, i % 3);
  }
  // 식장 (오른쪽 끝)
  drawChapelPixel(ctx, VW - 70 - offset * 0.5, VH - 180);
  // NPC 2명
  drawNPC(ctx, 70 + Math.sin(c.townScroll / 40) * 2, VH - 120, "#e89378");
  drawNPC(ctx, 200, VH - 115, "#7a9ac9");
  // 주인공
  drawHero(ctx, VW / 2, VH - 115, "down", c.sex, performance.now() / 1000);
  // 타이틀
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, 0, VW, 14);
  ctx.fillStyle = "#fff";
  ctx.font = "10px ui-monospace";
  ctx.fillText("TOWN · 식장으로 향하는 길", 6, 10);
  // 대화창
  drawDialogBox(ctx, TOWN_LINES[c.dialogIdx] ?? "", c.dialogChars, c.cursorBlink, true);
}

function drawTownHouse(ctx: CanvasRenderingContext2D, x: number, y: number, variant: number) {
  const colors = ["#e3b09a", "#c9a2d4", "#a0c7a2"];
  ctx.fillStyle = "#7a4a3a";
  ctx.beginPath();
  ctx.moveTo(x - 28, y);
  ctx.lineTo(x + 28, y);
  ctx.lineTo(x, y - 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = colors[variant] ?? colors[0];
  ctx.fillRect(x - 24, y, 48, 28);
  ctx.fillStyle = "#3a2a1a";
  ctx.fillRect(x - 6, y + 10, 12, 18);
  ctx.fillStyle = "#ffd36a";
  ctx.fillRect(x - 18, y + 6, 6, 6);
  ctx.fillRect(x + 12, y + 6, 6, 6);
}

function drawChapelPixel(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = "#fff7ef";
  ctx.fillRect(x - 32, y, 64, 48);
  ctx.fillStyle = "#c9a6a0";
  ctx.beginPath();
  ctx.moveTo(x - 34, y);
  ctx.lineTo(x + 34, y);
  ctx.lineTo(x, y - 20);
  ctx.closePath();
  ctx.fill();
  // 십자가
  ctx.fillStyle = "#8a5a5a";
  ctx.fillRect(x - 1, y - 30, 2, 12);
  ctx.fillRect(x - 4, y - 26, 8, 2);
  // 문
  ctx.fillStyle = "#6e4d2e";
  ctx.fillRect(x - 8, y + 20, 16, 28);
  // 창문
  ctx.fillStyle = "#b5d9ff";
  ctx.fillRect(x - 22, y + 10, 10, 14);
  ctx.fillRect(x + 12, y + 10, 10, 14);
}

function drawNPC(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(x, y + 12, 6, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.fillRect(x - 4, y - 2, 8, 10);
  ctx.fillStyle = "#f5d0b5";
  ctx.fillRect(x - 3, y - 8, 6, 6);
  ctx.fillStyle = "#2b1e16";
  ctx.fillRect(x - 4, y - 10, 8, 3);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(x - 3, y + 8, 2, 3);
  ctx.fillRect(x + 1, y + 8, 2, 3);
}

// ───── Phase 4 러너 — 횡스크롤 엔드리스 (Dino-style 미니멀 배경) ─────
function drawRunner(ctx: CanvasRenderingContext2D, c: DrawCtx) {
  const t = performance.now() / 1000;
  const scroll = c.runner.scroll;
  const speed = c.runner.worldSpeed;

  // 깔끔한 상아빛 배경 (공룡 런 무드)
  ctx.fillStyle = "#fbf7f4";
  ctx.fillRect(0, 0, VW, VH);

  // 구름 — 단순 도트 구름 (엷게)
  const cloudOff = (t * 14) % 120;
  ctx.fillStyle = "#e8d9d6";
  for (let i = 0; i < 3; i++) {
    const cx = ((i * 110 - cloudOff) % (VW + 80)) - 40;
    const cy = 32 + (i % 2) * 14;
    ctx.fillRect(cx, cy, 10, 3);
    ctx.fillRect(cx + 4, cy - 3, 10, 3);
    ctx.fillRect(cx + 10, cy + 3, 8, 3);
  }

  // 지면 — 공룡 런처럼 단일 라인 + 점선 포인트
  ctx.fillStyle = "#3d2b28";
  ctx.fillRect(0, GROUND_Y + 1, VW, 1);
  // 지면 밑 모래 포인트(스크롤)
  ctx.fillStyle = "#8a5a5a";
  for (let x = (-scroll | 0) % 18; x < VW; x += 18) {
    ctx.fillRect(x, GROUND_Y + 4, 3, 1);
  }
  for (let x = ((-scroll / 2) | 0) % 28; x < VW; x += 28) {
    ctx.fillRect(x, GROUND_Y + 8, 2, 1);
  }

  // 장애물 + 아이템
  for (const it of c.runner.items) {
    drawRunnerItem(ctx, it.x, it.y, it.kind, t);
  }

  // 파트너(추격자) — 플레이어 뒤쪽
  const partnerSex: Sex = c.sex === "groom" ? "bride" : "groom";
  const partnerX = Math.max(8, PLAYER_X - c.runner.partnerGap);
  const partnerBob = Math.sin(c.runner.partnerBounce) * 1.2;
  drawRunnerHero(ctx, partnerX, GROUND_Y + partnerBob, partnerSex, "grounded", t, true);
  // 손에 든 밧줄 (추격 연출)
  ctx.strokeStyle = "rgba(90,40,40,0.65)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(partnerX + 6, GROUND_Y - 12);
  const ropeEnd = PLAYER_X - 8;
  ctx.quadraticCurveTo((partnerX + ropeEnd) / 2, GROUND_Y - 18 + Math.sin(t * 6) * 2, ropeEnd, GROUND_Y - 16);
  ctx.stroke();

  // 플레이어
  const blinking = c.runner.invinc > 0 && Math.floor(c.runner.invinc * 10) % 2 === 0;
  if (!blinking) {
    drawRunnerHero(ctx, PLAYER_X, c.runner.playerY, c.sex, c.runner.playerState, t, false);
  }

  // 상단 HUD — 공룡 런 무드: 배경 투명, 모노스페이스 텍스트만
  ctx.fillStyle = "#3d2b28";
  ctx.font = "bold 10px ui-monospace";
  ctx.fillText(`⏱ ${Math.ceil(c.runner.remain)}`, 6, 14);
  ctx.fillText(`HI ${String(c.runner.score).padStart(5, "0")}`, VW - 72, 14);
  ctx.fillStyle = "#8a3d3d";
  ctx.fillText(`♥${Math.max(0, c.runner.lives)}`, 60, 14);
  ctx.fillText(`v${Math.round(speed)}`, 100, 14);
  if (c.runner.invinc > 0) {
    ctx.fillStyle = "#c98a2a";
    ctx.fillText("★", 138, 14);
  }
  // 파트너 거리 게이지 — 가늘게
  const gaugeW = 60;
  const ratio = Math.max(0, Math.min(1, c.runner.partnerGap / PARTNER_GAP_MAX));
  ctx.fillStyle = "#e8d9d6";
  ctx.fillRect(VW - gaugeW - 6, 22, gaugeW, 3);
  ctx.fillStyle = ratio < 0.3 ? "#c94a4a" : ratio < 0.6 ? "#c98a2a" : "#6e9a6a";
  ctx.fillRect(VW - gaugeW - 6, 22, gaugeW * ratio, 3);
}

// ───── 러너 전용 히어로 (옆모습 + 슬라이딩 대응) ─────
function drawRunnerHero(
  ctx: CanvasRenderingContext2D,
  cx: number,
  footY: number,
  sex: Sex,
  state: "grounded" | "jumping" | "sliding",
  tick: number,
  isPartner: boolean,
) {
  ctx.save();
  ctx.translate(cx, footY);
  if (state === "sliding") {
    // 몸을 눕힘
    ctx.translate(0, 6);
    ctx.scale(1.15, 0.55);
  }
  const legSwap = Math.floor(tick * 10) % 2 === 0;
  const isGroom = sex === "groom";
  // 그림자
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(0, 2, 9, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 몸
  ctx.fillStyle = isGroom ? "#1f2a44" : "#f8efe8";
  ctx.fillRect(-5, -14, 10, 11);
  if (isGroom) {
    // 흰 셔츠 V
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-2, -12, 4, 7);
    // 나비넥타이
    ctx.fillStyle = "#c94a4a";
    ctx.fillRect(-3, -12, 6, 2);
    // 라펠
    ctx.fillStyle = "#141c2e";
    ctx.fillRect(-3, -10, 1, 6);
    ctx.fillRect(2, -10, 1, 6);
    // 금 단추
    ctx.fillStyle = "#d4b86a";
    ctx.fillRect(0, -8, 1, 1);
  } else {
    // 드레스 치마
    ctx.fillStyle = "#ffe4e4";
    ctx.fillRect(-7, -6, 14, 7);
  }

  // 얼굴
  ctx.fillStyle = "#f8d6b5";
  ctx.fillRect(-4, -25, 8, 9);
  // 볼터치 (소년)
  if (isGroom) {
    ctx.fillStyle = "rgba(240,120,120,0.55)";
    ctx.fillRect(-4, -19, 2, 1);
    ctx.fillRect(2, -19, 2, 1);
  }
  // 머리
  ctx.fillStyle = isGroom ? "#3d2818" : "#efe0cf";
  if (isGroom) {
    ctx.fillRect(-5, -28, 10, 5);
    // 오른쪽으로 삐친 한 가닥(달리는 방향)
    ctx.fillRect(2, -29, 3, 2);
    ctx.fillRect(-5, -25, 3, 3);
    ctx.fillRect(2, -25, 3, 3);
  } else {
    ctx.fillRect(-5, -27, 10, 4);
    ctx.fillRect(-5, -24, 2, 3);
    ctx.fillRect(3, -24, 2, 3);
    // 면사포
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fillRect(-6, -28, 12, 2);
    ctx.fillRect(-5, -20, 1, 6);
    ctx.fillRect(4, -20, 1, 6);
  }
  // 눈 (오른쪽 바라봄)
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(2, -21, 1, 2);

  // 팔 — 뛰는 느낌. 파트너는 밧줄 당기는 앞팔
  ctx.fillStyle = isGroom ? "#1f2a44" : "#f8efe8";
  if (isPartner) {
    // 앞으로 뻗은 팔 (밧줄 당기기)
    ctx.fillRect(4, -12, 6, 2);
  } else {
    const armSwing = legSwap ? -2 : 2;
    ctx.fillRect(-5, -11 + armSwing, 2, 5);
    ctx.fillRect(4, -11 - armSwing, 2, 5);
  }

  // 다리 — 횡 달리기 프레임
  ctx.fillStyle = isGroom ? "#141c2e" : "#1a1a1a";
  if (state === "jumping") {
    // 무릎 굽힘
    ctx.fillRect(-3, -3, 3, 3);
    ctx.fillRect(1, -3, 3, 3);
  } else if (state === "sliding") {
    // 뻗은 다리
    ctx.fillRect(-1, -3, 7, 2);
  } else {
    // 달리기
    if (legSwap) {
      ctx.fillRect(-4, -3, 3, 4);
      ctx.fillRect(1, -3, 3, 2);
      ctx.fillRect(3, -2, 2, 2);
    } else {
      ctx.fillRect(-3, -3, 3, 2);
      ctx.fillRect(-5, -2, 2, 2);
      ctx.fillRect(1, -3, 3, 4);
    }
  }
  ctx.restore();
}

function drawRunnerItem(ctx: CanvasRenderingContext2D, x: number, y: number, kind: RunnerKind, t: number) {
  switch (kind) {
    case "coin": {
      // 공중 코인 — 반짝이는 금색
      const ph = Math.sin(t * 8) * 0.5 + 0.5;
      ctx.fillStyle = "#f2d37a";
      ctx.beginPath();
      ctx.ellipse(x, y, 6, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#c98a2a";
      ctx.beginPath();
      ctx.ellipse(x, y, 6 * (0.6 + ph * 0.4), 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#fff3c6";
      ctx.fillRect(x - 2, y - 3, 1, 2);
      break;
    }
    case "gem": {
      // 하트 보석
      drawHeart(ctx, x, y, 6, "#e94a6a");
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillRect(x - 2, y - 2, 1, 1);
      break;
    }
    case "bouquet": {
      // 지면 부케 (점수 보너스 + 무적)
      ctx.fillStyle = "#6e9a6a";
      ctx.fillRect(x - 1, y - 4, 2, 6);
      ctx.fillStyle = "#ffb5c2";
      ctx.beginPath(); ctx.arc(x - 4, y - 6, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 4, y - 6, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, y - 9, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffd36a";
      ctx.beginPath(); ctx.arc(x, y - 7, 2, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case "stone": {
      // 지면 장애물 — 점프로 넘어야 함 (웨딩 케이크 모양)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x - 9, y - 6, 18, 6);
      ctx.fillStyle = "#f5c0c9";
      ctx.fillRect(x - 6, y - 10, 12, 4);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x - 3, y - 14, 6, 4);
      ctx.fillStyle = "#f2d37a";
      ctx.fillRect(x - 1, y - 17, 2, 3);
      // 초 깜빡임
      ctx.fillStyle = "#ff9a3a";
      ctx.fillRect(x - 1, y - 18 + Math.sin(t * 14) * 0.5, 2, 2);
      break;
    }
    case "bird": {
      // 공중 장애물 — 슬라이드로 피해야 함 (날아오는 비둘기)
      const flap = Math.floor(t * 8) % 2 === 0;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x - 5, y - 2, 10, 4);
      ctx.fillStyle = "#e3e3e3";
      ctx.fillRect(x + 3, y - 1, 3, 2);
      // 날개
      ctx.fillStyle = "#ffffff";
      if (flap) {
        ctx.fillRect(x - 7, y - 6, 6, 3);
        ctx.fillRect(x + 1, y - 6, 6, 3);
      } else {
        ctx.fillRect(x - 6, y + 1, 6, 3);
        ctx.fillRect(x, y + 1, 6, 3);
      }
      // 부리
      ctx.fillStyle = "#f2a36a";
      ctx.fillRect(x + 5, y, 2, 1);
      // 눈
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(x + 4, y - 1, 1, 1);
      break;
    }
    case "banner": {
      // 공중 플래카드 — 슬라이드로 피해야 함
      ctx.fillStyle = "#8a5a5a";
      ctx.fillRect(x - 10, y - 14, 20, 2);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x - 9, y - 12, 18, 14);
      ctx.strokeStyle = "#c94a4a";
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 9, y - 12, 18, 14);
      ctx.fillStyle = "#c94a4a";
      ctx.font = "8px ui-monospace";
      ctx.textAlign = "center";
      ctx.fillText("축결혼", x, y - 2);
      ctx.textAlign = "left";
      break;
    }
  }
}

// ───── Ending ─────
function drawEnding(ctx: CanvasRenderingContext2D, c: DrawCtx, cleared: boolean) {
  const t = performance.now() / 1000;
  if (cleared) {
    ctx.fillStyle = "#fff3ec";
    ctx.fillRect(0, 0, VW, VH);
    drawChapelPixel(ctx, VW / 2, VH / 2 - 40);
    const cy = VH / 2 + 40;
    drawHero(ctx, VW / 2 - 14, cy, "down", "groom", t);
    drawHero(ctx, VW / 2 + 14, cy, "down", "bride", t);
    drawHeart(ctx, VW / 2, cy - 8, 4, "#e94a6a");
    ctx.fillStyle = "#3d2b28";
    ctx.font = "bold 16px ui-sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("결혼했다!", VW / 2, VH / 2 + 80);
    ctx.font = "10px ui-monospace";
    ctx.fillText("종현 ♥ 수빈", VW / 2, VH / 2 + 96);
    ctx.fillText(`${c.nickname || "하객"} 점수 ${c.runner.score}`, VW / 2, VH / 2 + 110);
    ctx.textAlign = "left";
    return;
  }

  // GAME OVER — 신부가 신랑을 밧줄로 잡는 엔딩 컷
  // 배경
  const sky = ctx.createLinearGradient(0, 0, 0, VH);
  sky.addColorStop(0, "#2d1b2c");
  sky.addColorStop(0.7, "#5b2e3a");
  sky.addColorStop(1, "#8a3d3d");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VW, VH);
  // 별
  ctx.fillStyle = "#fff3c6";
  for (let i = 0; i < 20; i++) {
    const sx = (i * 37) % VW;
    const sy = (i * 53) % (VH - 120);
    ctx.fillRect(sx, sy, 1, 1);
  }
  // 지면
  const GY = VH - 50;
  ctx.fillStyle = "#6e2f2f";
  ctx.fillRect(0, GY, VW, VH - GY);
  ctx.fillStyle = "#8a3d3d";
  ctx.fillRect(0, GY, VW, 3);
  // 지면 점선
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  for (let x = 0; x < VW; x += 20) ctx.fillRect(x, GY + 10, 10, 1);

  // 신부(추격자)와 신랑(플레이어) — 선택 캐릭터에 따라 역할 교차
  const playerSex: Sex = c.sex;
  const catcherSex: Sex = c.sex === "groom" ? "bride" : "groom";
  // catcher 왼쪽
  const catcherX = 70;
  // 플레이어 오른쪽 — 밧줄에 끌려와 기울어져 있음
  const caughtX = VW - 90;
  // 밧줄 (곡선)
  const shake = Math.sin(t * 3) * 1.5;
  ctx.strokeStyle = "#c9a06a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(catcherX + 6, GY - 18);
  ctx.quadraticCurveTo((catcherX + caughtX) / 2, GY - 30 + shake, caughtX - 4, GY - 20);
  ctx.stroke();
  // 밧줄 고리 (플레이어 몸에 감긴)
  ctx.strokeStyle = "#c9a06a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(caughtX, GY - 18, 10, 12, 0, 0, Math.PI * 2);
  ctx.stroke();

  // 캐릭터 렌더
  drawRunnerHero(ctx, catcherX, GY, catcherSex, "grounded", t, true);
  // 잡힌 신랑 — 몸을 기울임 + 당황 표정
  ctx.save();
  ctx.translate(caughtX, GY);
  ctx.rotate(Math.sin(t * 2) * 0.05 - 0.12);
  drawRunnerHero(ctx, 0, 0, playerSex, "grounded", t, false);
  ctx.restore();
  // 땀방울
  ctx.fillStyle = "#9cd3ff";
  ctx.fillRect(caughtX + 6, GY - 28 + Math.sin(t * 6) * 1, 2, 3);
  ctx.fillRect(caughtX - 10, GY - 26 + Math.cos(t * 6) * 1, 2, 3);
  // 당혹! 말풍선
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(caughtX + 2, GY - 52, 28, 14);
  ctx.strokeStyle = "#3d2b28";
  ctx.lineWidth = 1;
  ctx.strokeRect(caughtX + 2, GY - 52, 28, 14);
  ctx.beginPath();
  ctx.moveTo(caughtX + 10, GY - 38);
  ctx.lineTo(caughtX + 14, GY - 34);
  ctx.lineTo(caughtX + 16, GY - 38);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#3d2b28";
  ctx.font = "9px ui-monospace";
  ctx.textAlign = "center";
  ctx.fillText("헉!", caughtX + 16, GY - 42);

  // 신부 말풍선 — 웃고 있음
  ctx.fillStyle = "#ffe4e4";
  ctx.fillRect(catcherX + 8, GY - 58, 56, 16);
  ctx.strokeStyle = "#8a3d3d";
  ctx.strokeRect(catcherX + 8, GY - 58, 56, 16);
  ctx.fillStyle = "#8a3d3d";
  ctx.font = "9px ui-monospace";
  ctx.textAlign = "center";
  ctx.fillText("도망 못가!", catcherX + 36, GY - 47);

  // 타이틀
  ctx.fillStyle = "#fff";
  ctx.font = "bold 16px ui-sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("잡혔다!", VW / 2, 40);
  ctx.font = "10px ui-monospace";
  ctx.fillStyle = "#ffd6d6";
  ctx.fillText("GAME OVER — 식장으로 끌려갑니다", VW / 2, 58);
  ctx.fillStyle = "#fff";
  ctx.fillText(`점수 ${c.runner.score}`, VW / 2, 74);
  ctx.textAlign = "left";
}

// 하트 유틸 (기존 유지)
function drawHeart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.6);
  ctx.bezierCurveTo(cx + s * 1.2, cy + s * 0.2, cx + s * 0.9, cy - s * 0.9, cx, cy - s * 0.2);
  ctx.bezierCurveTo(cx - s * 0.9, cy - s * 0.9, cx - s * 1.2, cy + s * 0.2, cx, cy + s * 0.6);
  ctx.fill();
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
      <div className="fade-in flex w-full max-w-sm flex-col items-center">
        <p className="eyebrow mb-4">Wedding Day</p>
        <h1 className="text-[clamp(1.7rem,7.6vw,2.2rem)] leading-tight text-[color:var(--color-charcoal)] whitespace-nowrap">
          {data.groom.nameEn} &amp; {data.bride.nameEn}
        </h1>
        <p className="mt-3 text-[clamp(13px,3.8vw,15px)] tracking-[0.2em] text-[color:var(--color-mute)] whitespace-nowrap">
          2026. 11. 15 · SUN · 14:00
        </p>
        <p className="mt-1 text-[clamp(11px,3.2vw,13px)] tracking-[0.16em] text-[color:var(--color-mute)] whitespace-nowrap">
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
      <WeddingAdventure onComplete={onComplete} />
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
