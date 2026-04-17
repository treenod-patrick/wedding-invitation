"use client";

import { useEffect, useMemo, useState } from "react";

// 더미 데이터 — 마스터 정보 받으면 교체
const data = {
  groom: { name: "채종현", nameEn: "Jonghyun Chae", father: "채승우", mother: "김미경", phone: "010-0000-0000", account: "신한은행 110-000-000000" },
  bride: { name: "최수빈", nameEn: "Subin Choi", father: "최원영", mother: "김영미", phone: "010-0000-0000", account: "국민은행 000-00-0000-000" },
  date: "2026-11-15T14:00:00+09:00",
  dateLabel: "2026년 11월 15일 일요일 오후 2시",
  venue: {
    name: "테라리움 서울",
    address: "서울특별시 노원구 노원로 247 서울온천 7~8층",
    subway: "7호선 하계역 도보 7분",
    parking: "건물 주차장 이용 가능",
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

// 꽃 디바이더 — 살롱드레터 레퍼런스 영감
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
        <div className="mb-2 w-64 max-h-80 overflow-y-auto rounded-sm bg-white shadow-2xl border border-[color:var(--color-line)] p-2">
          <div className="text-[20px] tracking-[0.3em] uppercase text-[color:var(--color-rose-deep)] px-3 py-2 border-b border-[color:var(--color-line)]">Font</div>
          {FONTS.map((f) => (
            <button
              key={f.key}
              onClick={() => onChange(f.key)}
              className={`w-full text-left px-3 py-2 rounded-sm flex items-center justify-between transition ${
                value === f.key ? "bg-[color:var(--color-blush)]/30" : "hover:bg-[color:var(--color-blush)]/20"
              }`}
              style={{ fontFamily: f.cssVar }}
            >
              <span className="text-base text-[color:var(--color-charcoal)]">우리 결혼합니다</span>
              <span className="text-[20px] text-[color:var(--color-mute)] ml-2">{f.category}</span>
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-12 w-12 rounded-full bg-[color:var(--color-charcoal)] text-[color:var(--color-ivory)] shadow-lg text-lg font-semibold active:scale-95 transition"
      >
        {open ? "×" : "가"}
      </button>
    </div>
  );
}

function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-10 text-center">
      <p className="eyebrow">{kicker}</p>
      <h2 className="section-title mt-3">{title}</h2>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[color:var(--color-blush)]/40 via-[color:var(--color-paper)] to-[color:var(--color-paper)] px-7 text-center">
      <svg
        className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 text-[color:var(--color-rose)]/40"
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
        <h1 className="text-[2.4rem] leading-tight text-[color:var(--color-charcoal)]">{data.groom.nameEn}</h1>
        <p className="my-3 italic text-base text-[color:var(--color-rose-deep)]">&amp;</p>
        <h1 className="text-[2.4rem] leading-tight text-[color:var(--color-charcoal)]">{data.bride.nameEn}</h1>
        <FlowerDivider />
        <p className="mt-2 text-sm tracking-[0.25em] text-[color:var(--color-mute)]">2026. 11. 15 · 일</p>
        <p className="mt-2 text-xs tracking-[0.2em] text-[color:var(--color-mute)]">{data.venue.name}</p>
      </div>
      <div className="absolute bottom-8 text-[20px] tracking-[0.4em] text-[color:var(--color-mute)] animate-pulse">SCROLL</div>
    </section>
  );
}

function Greeting() {
  return (
    <section className="px-7 py-20">
      <div className="mx-auto max-w-md">
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
      </div>
    </section>
  );
}

function Couple() {
  const Person = ({ role, p }: { role: string; p: typeof data.groom; kid: string }) => (
    <div className="text-center">
      <p className="eyebrow">{role}</p>
      <p className="mt-3 text-2xl text-[color:var(--color-charcoal)]">{p.nameEn}</p>
      <p className="mt-1 text-base text-[color:var(--color-charcoal)]">{p.name}</p>
      <p className="mt-2 text-xs text-[color:var(--color-mute)]">
        {p.father} · {p.mother}
      </p>
      <a
        href={`tel:${p.phone}`}
        className="mt-3 inline-block text-[22px] tracking-widest text-[color:var(--color-rose-deep)] border border-[color:var(--color-line)] rounded-full px-3 py-1"
      >
        CALL
      </a>
    </div>
  );
  return (
    <section className="px-7 py-20 bg-[color:var(--color-blush)]/25">
      <div className="mx-auto max-w-md">
        <SectionHead kicker="The Couple" title="신랑 · 신부" />
        <div className="grid grid-cols-2 gap-4 items-start">
          <Person role="Groom" p={data.groom} kid="장남" />
          <Person role="Bride" p={data.bride} kid="장녀" />
        </div>
      </div>
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
    <section className="px-7 py-20">
      <div className="mx-auto max-w-md">
        <SectionHead kicker="D-Day" title="우리의 그 날까지" />
        <div className="grid grid-cols-4 gap-2 text-center">
          {items.map((i) => (
            <div key={i.l} className="rounded-sm border border-[color:var(--color-line)] bg-white py-5">
              <div className="text-[1.6rem] text-[color:var(--color-rose-deep)] tabular-nums">{String(i.v).padStart(2, "0")}</div>
              <div className="mt-1 text-[10px] tracking-[0.3em] text-[color:var(--color-mute)]">{i.l}</div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-[13px] text-[color:var(--color-mute)]">
          <span className="text-[color:var(--color-charcoal)]">{data.groom.name}</span>
          <span className="mx-2 text-[color:var(--color-rose)]">♥</span>
          <span className="text-[color:var(--color-charcoal)]">{data.bride.name}</span>의 결혼식이{" "}
          <b className="text-[color:var(--color-rose-deep)]">{r.d}</b>일 남았습니다.
        </p>
      </div>
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
    <section className="px-7 py-20 bg-[color:var(--color-blush)]/20">
      <div className="mx-auto max-w-md">
        <SectionHead kicker="When" title="예식일" />
        <div className="mx-auto max-w-xs rounded-sm bg-white p-5 shadow-[0_2px_24px_rgba(184,125,120,0.08)]">
          <p className="text-center tracking-[0.2em] text-[color:var(--color-rose-deep)]">
            {monthName} · {year}
          </p>
          <div className="mt-4 grid grid-cols-7 text-center text-[22px] tracking-widest text-[color:var(--color-mute)]">
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
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section className="px-7 py-20">
      <div className="mx-auto max-w-md">
        <SectionHead kicker="Gallery" title="우리의 순간" />
        <div className="grid grid-cols-3 gap-1.5">
          {data.gallery.map((src, i) => (
            <div key={i} className="aspect-[3/4] overflow-hidden bg-[color:var(--color-blush)]/30">
              <img src={src} alt={`gallery-${i}`} className="h-full w-full object-cover transition duration-500 hover:scale-105" loading="lazy" />
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-[22px] text-[color:var(--color-mute)]">사진 자리 — 마스터 사진 받으면 교체</p>
      </div>
    </section>
  );
}

function Location() {
  const copyAddress = () => {
    navigator.clipboard?.writeText(data.venue.address);
  };
  // 네이버 지도 — 테라리움 서울 (place id 1618264201)
  const naverMapUrl =
    "https://map.naver.com/p/search/%ED%85%8C%EB%9D%BC%EB%A6%AC%EC%9B%80%20%EC%84%9C%EC%9A%B8/place/1618264201?c=15.00,0,0,0,dh&placePath=/home?bk_query=%ED%85%8C%EB%9D%BC%EB%A6%AC%EC%9B%80%20%EC%84%9C%EC%9A%B8&entry=bmp&from=map&fromPanelNum=2&locale=ko&svcName=map_pcv5&searchText=%ED%85%8C%EB%9D%BC%EB%A6%AC%EC%9B%80%20%EC%84%9C%EC%9A%B8";
  return (
    <section className="px-7 py-20">
      <div className="mx-auto max-w-md">
        <SectionHead kicker="Location" title="오시는 길" />
        <a
          href={naverMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group block overflow-hidden rounded-sm border border-[color:var(--color-line)] bg-[color:var(--color-blush)]/15"
        >
          <div className="relative h-64 w-full">
            {/* 네이버 지도 정적 이미지 (OSM 스태틱 폴백) */}
            <img
              src="https://staticmap.openstreetmap.de/staticmap.php?center=37.6372,127.0694&zoom=16&size=600x256&markers=37.6372,127.0694,red"
              alt={`${data.venue.name} 지도`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 shadow-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-[#03C75A]" />
              <span className="text-[20px] font-semibold tracking-wider text-[color:var(--color-charcoal)]">NAVER MAP</span>
            </div>
            <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-[color:var(--color-charcoal)]/90 px-3 py-1.5 text-[20px] tracking-widest text-[color:var(--color-ivory)] transition group-hover:bg-[color:var(--color-rose-deep)]">
              네이버 지도 열기 →
            </div>
          </div>
        </a>
        <div className="mt-5 text-center">
          <p className="text-xl tracking-wide text-[color:var(--color-charcoal)]">{data.venue.name}</p>
          <p className="mt-2 text-[13px] text-[color:var(--color-mute)]">{data.venue.address}</p>
          <p className="text-[13px] text-[color:var(--color-mute)]">{data.venue.phone}</p>
          <button
            onClick={copyAddress}
            className="mt-3 rounded-full border border-[color:var(--color-line)] px-4 py-1.5 text-[22px] tracking-widest text-[color:var(--color-rose-deep)]"
          >
            주소 복사
          </button>
        </div>
        <div className="mt-8 space-y-3 rounded-sm bg-[color:var(--color-blush)]/25 p-5 text-[13px] text-[color:var(--color-charcoal)]/80">
          <div className="flex gap-3">
            <span className="min-w-[48px] text-[color:var(--color-rose-deep)]">지하철</span>
            <span>{data.venue.subway}</span>
          </div>
          <div className="flex gap-3">
            <span className="min-w-[48px] text-[color:var(--color-rose-deep)]">주차</span>
            <span>{data.venue.parking}</span>
          </div>
        </div>
      </div>
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
          className="flex w-full items-center justify-between rounded-sm border border-[color:var(--color-line)] bg-white px-5 py-4"
        >
          <span className="text-[13px] tracking-wide">
            <span className="text-[color:var(--color-mute)]">{role}</span>
            <span className="ml-3 text-[color:var(--color-charcoal)]">{name}</span>
          </span>
          <span className="text-[color:var(--color-rose-deep)] text-lg leading-none">{isOpen ? "−" : "+"}</span>
        </button>
        {isOpen && (
          <div className="mt-1 flex items-center justify-between rounded-sm bg-[color:var(--color-blush)]/20 px-5 py-3 text-[13px]">
            <span className="text-[color:var(--color-charcoal)]">{account}</span>
            <button
              onClick={() => navigator.clipboard?.writeText(account)}
              className="text-[22px] tracking-widest text-[color:var(--color-rose-deep)] border border-[color:var(--color-rose)]/40 rounded-full px-3 py-1"
            >
              복사
            </button>
          </div>
        )}
      </div>
    );
  };
  return (
    <section className="px-7 py-20 bg-[color:var(--color-blush)]/20">
      <div className="mx-auto max-w-md">
        <SectionHead kicker="Heart" title="마음 전하실 곳" />
        <p className="mb-8 text-center text-[13px] leading-loose text-[color:var(--color-mute)]">
          참석이 어려우신 분들을 위해
          <br />
          조심스레 계좌번호를 안내드립니다.
        </p>
        <div className="space-y-3">
          <Row k="groom" role="신랑측" name={data.groom.name} account={data.groom.account} />
          <Row k="bride" role="신부측" name={data.bride.name} account={data.bride.account} />
        </div>
      </div>
    </section>
  );
}

function Guestbook() {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [list, setList] = useState<{ name: string; msg: string }[]>([
    { name: "친구A", msg: "두 분의 결혼을 진심으로 축하드립니다." },
  ]);
  const submit = () => {
    if (!name.trim() || !msg.trim()) return;
    setList((l) => [{ name, msg }, ...l]);
    setName("");
    setMsg("");
  };
  return (
    <section className="px-7 py-20">
      <div className="mx-auto max-w-md">
        <SectionHead kicker="Guestbook" title="방명록" />
        <div className="space-y-2 mb-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
            className="w-full px-4 py-2 rounded-sm bg-white border border-[color:var(--color-line)] text-sm"
          />
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="축하 메시지를 남겨주세요"
            rows={3}
            className="w-full px-4 py-2 rounded-sm bg-white border border-[color:var(--color-line)] text-sm resize-none"
          />
          <button
            onClick={submit}
            className="w-full py-2 rounded-sm bg-[color:var(--color-charcoal)] text-[color:var(--color-ivory)] text-sm tracking-[0.2em]"
          >
            남기기
          </button>
        </div>
        <div className="space-y-3">
          {list.map((g, i) => (
            <div key={i} className="bg-white rounded-sm p-3 border border-[color:var(--color-line)] text-sm">
              <div className="text-xs text-[color:var(--color-rose-deep)] mb-1">{g.name}</div>
              <div className="text-[color:var(--color-charcoal)]/80">{g.msg}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RSVP() {
  const [yes, setYes] = useState<boolean | null>(null);
  const [meal, setMeal] = useState<string | null>(null);
  return (
    <section className="px-7 py-20 bg-[color:var(--color-blush)]/20">
      <div className="mx-auto max-w-md">
        <SectionHead kicker="RSVP" title="참석 여부" />
        <div className="space-y-5">
          <div>
            <div className="text-sm text-[color:var(--color-mute)] mb-2">참석하시나요?</div>
            <div className="flex gap-2">
              {[
                { v: true, l: "참석" },
                { v: false, l: "불참" },
              ].map((o) => (
                <button
                  key={String(o.v)}
                  onClick={() => setYes(o.v)}
                  className={`flex-1 py-3 rounded-sm border text-sm transition ${
                    yes === o.v
                      ? "bg-[color:var(--color-charcoal)] text-[color:var(--color-ivory)] border-[color:var(--color-charcoal)]"
                      : "border-[color:var(--color-line)] bg-white"
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>
          {yes && (
            <div>
              <div className="text-sm text-[color:var(--color-mute)] mb-2">식사 여부</div>
              <div className="flex gap-2">
                {["식사함", "식사안함"].map((o) => (
                  <button
                    key={o}
                    onClick={() => setMeal(o)}
                    className={`flex-1 py-3 rounded-sm border text-sm transition ${
                      meal === o
                        ? "bg-[color:var(--color-charcoal)] text-[color:var(--color-ivory)] border-[color:var(--color-charcoal)]"
                        : "border-[color:var(--color-line)] bg-white"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
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
    <section className="px-7 py-20 pb-28">
      <div className="mx-auto max-w-md">
        <FlowerDivider />
        <div className="text-center">
          <p className="eyebrow">Thank You</p>
          <p className="mt-4 text-2xl text-[color:var(--color-charcoal)]">
            {data.groom.nameEn} &amp; {data.bride.nameEn}
          </p>
          <button
            onClick={share}
            className="mx-auto mt-8 block rounded-full bg-[color:var(--color-charcoal)] px-7 py-3 text-[12px] tracking-[0.3em] text-[color:var(--color-ivory)]"
          >
            SHARE
          </button>
          <p className="mt-10 text-[20px] tracking-[0.3em] text-[color:var(--color-mute)]">MADE WITH LOVE</p>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [fontKey, setFontKey] = useState("gowun-batang");
  const fontVar = useMemo(
    () => FONTS.find((f) => f.key === fontKey)?.cssVar ?? "var(--font-gowun-batang)",
    [fontKey],
  );
  return (
    <main className="invitation" style={{ fontFamily: fontVar } as React.CSSProperties}>
      <Hero />
      <Greeting />
      <Couple />
      <Countdown />
      <Calendar />
      <Gallery />
      <Location />
      <Account />
      <Guestbook />
      <RSVP />
      <Share />
      <FontToggle value={fontKey} onChange={setFontKey} />
    </main>
  );
}
