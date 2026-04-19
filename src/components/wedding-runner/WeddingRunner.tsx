"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { v4 as uuidv4 } from "uuid";
import type { GameResult } from "./PhaserGame";
import {
  LEADERBOARD_DEADLINE_ISO,
  NICKNAME_MAX,
  NICKNAME_MIN,
  PRIZES,
} from "@/lib/wedding-constants";

const PhaserGame = dynamic(() => import("./PhaserGame"), { ssr: false });

type Stage = "intro" | "form" | "character" | "play" | "result" | "leaderboard";
type PlayerType = "bride" | "groom";

type TopRow = {
  id: string;
  player_id: string;
  nickname: string;
  score: number;
  max_combo: number;
  survival_time: number;
  updated_at: string;
};

const LS_PLAYER_ID = "wr_player_id";
const LS_NICKNAME = "wr_nickname";
const LS_CONTACT = "wr_contact";
const LS_BEST = "wr_best_score";
const LS_PLAYER_TYPE = "wr_player_type";

function loadPlayerId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(LS_PLAYER_ID) ?? "";
  if (!id) {
    id = uuidv4();
    window.localStorage.setItem(LS_PLAYER_ID, id);
  }
  return id;
}

export default function WeddingRunner({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [playerId, setPlayerId] = useState<string>("");
  const [nickname, setNickname] = useState("");
  const [contact, setContact] = useState("");
  const [playerType, setPlayerType] = useState<PlayerType>("groom");
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [top, setTop] = useState<TopRow[]>([]);
  const [meRank, setMeRank] = useState<{ rank: number; score: number; nickname: string } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPlayerId(loadPlayerId());
    const n = window.localStorage.getItem(LS_NICKNAME) ?? "";
    const c = window.localStorage.getItem(LS_CONTACT) ?? "";
    const t = window.localStorage.getItem(LS_PLAYER_TYPE) as PlayerType | null;
    if (n) setNickname(n);
    if (c) setContact(c);
    if (t === "bride" || t === "groom") setPlayerType(t);
  }, []);

  const bestLocal = useMemo(() => {
    if (typeof window === "undefined") return 0;
    return Number(window.localStorage.getItem(LS_BEST) ?? 0);
  }, [result]);

  const validateAndStart = () => {
    const n = nickname.trim();
    const c = contact.trim();
    if (n.length < NICKNAME_MIN || n.length > NICKNAME_MAX) {
      setFormError(`이름/닉네임은 ${NICKNAME_MIN}~${NICKNAME_MAX}자로 입력해주세요`);
      return;
    }
    const digits = c.replace(/[^0-9]/g, "");
    if (digits.length < 9 || digits.length > 15) {
      setFormError("연락처는 숫자 포함 9~15자리로 입력해주세요");
      return;
    }
    setFormError(null);
    window.localStorage.setItem(LS_NICKNAME, n);
    window.localStorage.setItem(LS_CONTACT, c);
    setStage("character");
  };

  const confirmCharacter = (t: PlayerType) => {
    setPlayerType(t);
    window.localStorage.setItem(LS_PLAYER_TYPE, t);
    setStage("play");
  };

  const handleResult = useCallback(async (r: GameResult) => {
    setResult(r);
    setStage("result");
    const prevBest = Number(window.localStorage.getItem(LS_BEST) ?? 0);
    if (r.score > prevBest) window.localStorage.setItem(LS_BEST, String(r.score));

    setSubmitting(true);
    setServerMsg(null);
    try {
      const res = await fetch("/api/scores/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          nickname: nickname.trim(),
          contact: contact.trim(),
          score: r.score,
          itemScore: r.itemScore,
          maxCombo: r.maxCombo,
          survivalTime: r.survivalTime,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setServerMsg(data.reason === "suspicious" ? "점수 검증 실패" : "리더보드 등록 실패(로컬 점수는 유지됩니다)");
      } else if (data.mode === "local") {
        setServerMsg("리더보드 준비 중 — 로컬 점수만 집계됩니다");
      } else {
        setServerMsg(data.updated ? "🏆 리더보드 최고점 갱신!" : `최고점 유지 (${data.bestScore ?? "-"}점)`);
      }
    } catch {
      setServerMsg("네트워크 오류 — 로컬 점수는 유지됩니다");
    } finally {
      setSubmitting(false);
    }
  }, [playerId, nickname, contact]);

  const loadLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`/api/scores/top?playerId=${encodeURIComponent(playerId)}&limit=10`);
      const data = await res.json();
      if (data.ok) {
        setTop(data.top ?? []);
        setMeRank(data.me ?? null);
      }
    } catch {
      /* ignore */
    }
  }, [playerId]);

  useEffect(() => {
    if (stage === "leaderboard") loadLeaderboard();
  }, [stage, loadLeaderboard]);

  const shareResult = async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      if (!cardRef.current) return;
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
      const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), "image/png"));
      const file = new File([blob], "wedding-runner.png", { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "웨딩러너 결과", text: `${nickname} — ${result?.score}점` });
        return;
      }
      // 폴백: 다운로드
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wedding-runner-${nickname}-${result?.score}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("공유에 실패했습니다. 이미지 저장으로 대신 시도해주세요");
    }
  };

  if (stage === "intro") {
    return (
      <Shell>
        <p className="eyebrow text-center">Mini Game</p>
        <h2 className="mt-3 text-center text-[clamp(1.2rem,5.6vw,1.5rem)] leading-tight text-[color:var(--color-charcoal)]">
          웨딩러너
        </h2>
        <p className="mt-3 text-center text-[13px] leading-relaxed text-[color:var(--color-mute)]">
          60초 안에 아이템을 모으고 장애물을 피해 식장으로 달려가세요.
          <br />
          상위 3등은 결혼식 당일 소정의 선물을 드립니다.
        </p>

        <div className="mt-6 rounded-2xl border border-[color:var(--color-rose)]/30 bg-[color:var(--color-blush)]/40 px-5 py-4 text-[12px] leading-relaxed text-[color:var(--color-charcoal)]">
          <p className="mb-2 tracking-widest label-caps">집계 마감</p>
          <p className="mb-3">
            {new Date(LEADERBOARD_DEADLINE_ISO).toLocaleString("ko-KR", { dateStyle: "long", timeStyle: "short" })}까지
          </p>
          <p className="mb-1 tracking-widest label-caps">경품</p>
          <ul className="space-y-0.5">
            {PRIZES.map((p) => (
              <li key={p.rank}>{p.emoji} {p.rank}등 — {p.label}</li>
            ))}
          </ul>
        </div>

        {bestLocal > 0 && (
          <p className="mt-4 text-center text-[12px] text-[color:var(--color-rose-deep)]">
            이 기기 최고 점수: {bestLocal.toLocaleString()}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <button
            className="rounded-full bg-[color:var(--color-rose-deep)] px-6 py-3 text-[14px] tracking-[0.16em] text-white active:scale-[0.98]"
            onClick={() => setStage("form")}
          >
            시작하기
          </button>
          <button
            className="rounded-full border border-[color:var(--color-rose)]/40 bg-white/70 px-6 py-2.5 text-[12px] tracking-[0.14em] text-[color:var(--color-rose-deep)] active:scale-[0.98]"
            onClick={() => setStage("leaderboard")}
          >
            리더보드 보기
          </button>
        </div>
      </Shell>
    );
  }

  if (stage === "form") {
    return (
      <Shell>
        <p className="eyebrow text-center">Player Info</p>
        <h2 className="mt-3 text-center text-[clamp(1.1rem,5vw,1.35rem)] text-[color:var(--color-charcoal)]">
          정보 입력
        </h2>
        <p className="mt-2 text-center text-[12px] text-[color:var(--color-mute)]">
          경품 당첨 시 본인 확인용으로만 사용됩니다.
          <br />
          연락처는 암호화되어 저장됩니다.
        </p>
        <div className="mt-5 flex flex-col gap-3 text-[13px]">
          <label className="block">
            <span className="mb-1 block text-[11px] tracking-widest text-[color:var(--color-mute)]">이름 / 닉네임</span>
            <input
              className="w-full rounded-xl border border-[color:var(--color-rose)]/30 bg-white px-4 py-3 text-[14px] outline-none focus:border-[color:var(--color-rose-deep)]"
              maxLength={NICKNAME_MAX}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={`${NICKNAME_MIN}~${NICKNAME_MAX}자`}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] tracking-widest text-[color:var(--color-mute)]">연락처</span>
            <input
              type="tel"
              inputMode="tel"
              className="w-full rounded-xl border border-[color:var(--color-rose)]/30 bg-white px-4 py-3 text-[14px] outline-none focus:border-[color:var(--color-rose-deep)]"
              maxLength={32}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="010-1234-5678"
            />
          </label>
          {formError && <p className="text-[12px] text-[color:var(--color-rose-deep)]">{formError}</p>}
        </div>
        <div className="mt-6 flex gap-2">
          <button
            className="flex-1 rounded-full border border-[color:var(--color-rose)]/40 bg-white/70 px-4 py-2.5 text-[12px] tracking-[0.14em] text-[color:var(--color-rose-deep)]"
            onClick={() => setStage("intro")}
          >
            뒤로
          </button>
          <button
            className="flex-1 rounded-full bg-[color:var(--color-rose-deep)] px-4 py-3 text-[13px] tracking-[0.16em] text-white"
            onClick={validateAndStart}
          >
            게임 시작
          </button>
        </div>
      </Shell>
    );
  }

  if (stage === "character") {
    const options: { type: PlayerType; label: string; runSheet: string; sub: string }[] = [
      { type: "bride", label: "신부", runSheet: "/wedding-runner/bride-run.png", sub: "Bride" },
      { type: "groom", label: "신랑", runSheet: "/wedding-runner/groom-run.png", sub: "Groom" },
    ];
    return (
      <Shell>
        <p className="eyebrow text-center">Character</p>
        <h2 className="mt-3 text-center text-[clamp(1.1rem,5vw,1.35rem)] text-[color:var(--color-charcoal)]">
          캐릭터 선택
        </h2>
        <p className="mt-2 text-center text-[12px] text-[color:var(--color-mute)]">
          오늘 달릴 주인공을 골라주세요
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {options.map((opt) => {
            const active = playerType === opt.type;
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => setPlayerType(opt.type)}
                className={`flex flex-col items-center rounded-2xl border-2 px-3 py-4 transition-transform active:scale-[0.98] ${
                  active
                    ? "border-[color:var(--color-rose-deep)] bg-[color:var(--color-blush)]/60 shadow-md"
                    : "border-[color:var(--color-rose)]/30 bg-white/70"
                }`}
              >
                <div className="flex h-[175px] w-full items-end justify-center overflow-hidden rounded-xl bg-[color:var(--color-blush)]/30">
                  <div
                    aria-label={opt.label}
                    role="img"
                    className="wr-run-sprite"
                    style={{ backgroundImage: `url(${opt.runSheet})` }}
                  />
                </div>
                <p className="mt-3 text-[14px] tracking-[0.16em] text-[color:var(--color-charcoal)]">{opt.label}</p>
                <p className="text-[10px] tracking-[0.22em] text-[color:var(--color-mute)]">{opt.sub}</p>
              </button>
            );
          })}
        </div>
        <div className="mt-6 flex gap-2">
          <button
            className="flex-1 rounded-full border border-[color:var(--color-rose)]/40 bg-white/70 px-4 py-2.5 text-[12px] tracking-[0.14em] text-[color:var(--color-rose-deep)]"
            onClick={() => setStage("form")}
          >
            뒤로
          </button>
          <button
            className="flex-1 rounded-full bg-[color:var(--color-rose-deep)] px-4 py-3 text-[13px] tracking-[0.16em] text-white"
            onClick={() => confirmCharacter(playerType)}
          >
            출발
          </button>
        </div>
      </Shell>
    );
  }

  if (stage === "play") {
    return (
      <div className="relative">
        <PhaserGame onResult={handleResult} playerType={playerType} />
        <p className="mt-3 text-center text-[11px] tracking-widest text-[color:var(--color-mute)]">
          화면 탭 또는 Space/↑ = 점프
        </p>
      </div>
    );
  }

  if (stage === "result" && result) {
    return (
      <Shell>
        <div ref={cardRef} className="result-card relative mx-auto w-full max-w-[340px] rounded-2xl border-2 border-[color:var(--color-charcoal)] bg-[color:var(--color-blush)]/40 px-5 py-6 text-center">
          <p className="label-caps text-[color:var(--color-mute)]">Wedding Runner</p>
          <p className="mt-1 text-[11px] tracking-[0.22em] text-[color:var(--color-rose-deep)]">
            No. {playerId.slice(0, 4).toUpperCase()}  ·  {nickname}
          </p>
          <div className="my-4 h-px w-full bg-[color:var(--color-charcoal)]/20" />
          <p className="text-[12px] tracking-[0.14em] text-[color:var(--color-mute)]">SCORE</p>
          <p className="mt-1 text-[34px] font-bold tracking-widest text-[color:var(--color-charcoal)]">
            {result.score.toLocaleString()}
          </p>
          <div className="mt-3 flex justify-center gap-3 text-[12px] text-[color:var(--color-charcoal)]">
            <span>최대 콤보 <b>×{result.maxCombo}</b></span>
            <span>생존 <b>{result.survivalTime}s</b></span>
          </div>
          <p className="mt-4 text-[11px] tracking-[0.18em] text-[color:var(--color-rose-deep)]">
            {result.completed ? "식장까지 완주!" : "다시 달려보세요"}
          </p>
        </div>

        {serverMsg && (
          <p className="mt-3 text-center text-[12px] text-[color:var(--color-mute)]">
            {submitting ? "리더보드 등록 중…" : serverMsg}
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            className="rounded-full bg-[color:var(--color-rose-deep)] px-4 py-2.5 text-[12px] tracking-[0.14em] text-white"
            onClick={shareResult}
          >
            결과 공유
          </button>
          <button
            className="rounded-full border border-[color:var(--color-rose)]/40 bg-white/70 px-4 py-2.5 text-[12px] tracking-[0.14em] text-[color:var(--color-rose-deep)]"
            onClick={() => setStage("leaderboard")}
          >
            리더보드
          </button>
          <button
            className="rounded-full border border-[color:var(--color-rose)]/40 bg-white/70 px-4 py-2.5 text-[12px] tracking-[0.14em] text-[color:var(--color-rose-deep)]"
            onClick={() => {
              setResult(null);
              setServerMsg(null);
              setStage("play");
            }}
          >
            다시 하기
          </button>
          <button
            className="rounded-full border border-[color:var(--color-rose)]/40 bg-white/70 px-4 py-2.5 text-[12px] tracking-[0.14em] text-[color:var(--color-rose-deep)]"
            onClick={onComplete}
          >
            청첩장으로
          </button>
        </div>
      </Shell>
    );
  }

  // leaderboard
  return (
    <Shell>
      <p className="eyebrow text-center">Leaderboard</p>
      <h2 className="mt-2 text-center text-[clamp(1.1rem,5vw,1.3rem)] text-[color:var(--color-charcoal)]">TOP 10</h2>
      <ol className="mt-5 space-y-1.5">
        {top.length === 0 && (
          <li className="text-center text-[12px] text-[color:var(--color-mute)]">
            아직 등록된 점수가 없습니다
          </li>
        )}
        {top.map((row, idx) => {
          const isMe = row.player_id === playerId;
          return (
            <li
              key={row.id}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-[13px] ${
                isMe ? "bg-[color:var(--color-rose-deep)]/10 border border-[color:var(--color-rose-deep)]/30" : "bg-white/60"
              }`}
            >
              <span className="w-7 text-[color:var(--color-mute)]">{idx + 1}</span>
              <span className="flex-1 truncate text-[color:var(--color-charcoal)]">{row.nickname}</span>
              <span className="font-semibold text-[color:var(--color-rose-deep)]">{row.score.toLocaleString()}</span>
            </li>
          );
        })}
      </ol>
      {meRank && meRank.rank > 10 && (
        <div className="mt-3 rounded-xl border border-[color:var(--color-rose-deep)]/30 bg-[color:var(--color-rose-deep)]/10 px-3 py-2 text-[13px] text-[color:var(--color-charcoal)]">
          <div className="flex items-center justify-between">
            <span>{meRank.rank}위</span>
            <span className="flex-1 truncate px-2">{meRank.nickname}</span>
            <span className="font-semibold text-[color:var(--color-rose-deep)]">{meRank.score.toLocaleString()}</span>
          </div>
        </div>
      )}
      <div className="mt-6 flex gap-2">
        <button
          className="flex-1 rounded-full border border-[color:var(--color-rose)]/40 bg-white/70 px-4 py-2.5 text-[12px] tracking-[0.14em] text-[color:var(--color-rose-deep)]"
          onClick={() => setStage(result ? "result" : "intro")}
        >
          뒤로
        </button>
        <button
          className="flex-1 rounded-full bg-[color:var(--color-rose-deep)] px-4 py-2.5 text-[12px] tracking-[0.14em] text-white"
          onClick={() => setStage("play")}
        >
          다시 하기
        </button>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[420px] px-5 py-6">
      {children}
    </div>
  );
}
