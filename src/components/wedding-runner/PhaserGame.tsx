"use client";

import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import { GAME_DURATION_SEC } from "@/lib/wedding-constants";

// 스테이지 배경 · 캐릭터 · 아이템/장애물은 모두 마스터 제공 오리지널 도트 에셋 사용
// (포켓몬 IP 사용 금지 원칙 — CC0/오리지널만)

export type GameResult = {
  score: number;
  itemScore: number;
  maxCombo: number;
  survivalTime: number;
  completed: boolean;
};

const PALETTE = {
  sky: 0xfdf2f4,
  sky2: 0xf6e4e8,
  floor: 0x8a4b5c,
  floorShade: 0x6b3646,
  ink: 0x3a2430,
  groom: 0x3a2430,
  bride: 0xc85476,
};

const VIEW_W = 480;
const VIEW_H = 720;
const GROUND_Y = VIEW_H - 120;
const PLAYER_X = 96;

type ItemKind = "heart" | "ring" | "bouquet" | "champagne";
type ObstacleKind = "glass" | "flower" | "cake";

const ITEM_SCORE: Record<ItemKind, number> = {
  heart: 30,
  ring: 100,
  bouquet: 250,
  champagne: 80,
};

const OBSTACLE_PENALTY: Record<ObstacleKind, number> = {
  glass: 80,
  flower: 150,
  cake: 0,
};

type RunnerState = {
  player: Phaser.GameObjects.Image;
  playerW: number;
  playerH: number;
  bg: Phaser.GameObjects.TileSprite;
  itemsPool: Array<{ sprite: Phaser.GameObjects.Image; halo: Phaser.GameObjects.Arc; kind: ItemKind; x: number; y: number; alive: boolean; w: number; h: number }>;
  obstaclesPool: Array<{ sprite: Phaser.GameObjects.Image; warn: Phaser.GameObjects.Text; kind: ObstacleKind; x: number; y: number; alive: boolean; w: number; h: number }>;
  hudScore: Phaser.GameObjects.Text;
  hudTime: Phaser.GameObjects.Text;
  hudCombo: Phaser.GameObjects.Text;
  hudStatus: Phaser.GameObjects.Text;
  scoreValue: number;
  itemScoreValue: number;
  combo: number;
  maxCombo: number;
  survivalTime: number;
  elapsed: number;
  velocityY: number;
  isJumping: boolean;
  sliding: boolean;
  slideUntil: number;
  invincibleUntil: number;
  confusedUntil: number;
  scrollSpeed: number;
  nextItemAt: number;
  nextObstacleAt: number;
  finished: boolean;
};

const GRAVITY = 2200;
const JUMP_V = -760;
const SLIDE_DURATION = 500;

// 아이템/장애물 내부 키 → 실제 에셋 파일
const ITEM_TEXTURE: Record<ItemKind, string> = {
  heart: "spr-heart",
  ring: "spr-ring",
  bouquet: "spr-bouquet",
  champagne: "spr-champagne",
};
const OBSTACLE_TEXTURE: Record<ObstacleKind, string> = {
  glass: "spr-puddle",
  flower: "spr-chair",
  cake: "spr-cake",
};

// 월드 기준 표시 높이 (px). 너비는 원본 비율 유지
const ITEM_HEIGHT: Record<ItemKind, number> = {
  heart: 40,
  ring: 40,
  bouquet: 52,
  champagne: 48,
};
const OBSTACLE_HEIGHT: Record<ObstacleKind, number> = {
  glass: 36,
  flower: 54,
  cake: 56,
};

function intersects(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
) {
  return (
    Math.abs(ax - bx) < (aw + bw) / 2 &&
    Math.abs(ay - by) < (ah + bh) / 2
  );
}

export default function PhaserGame({
  onResult,
  playerType = "groom",
}: {
  onResult: (r: GameResult) => void;
  playerType?: "bride" | "groom";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const resultCalled = useRef(false);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const PhaserMod = await import("phaser");
      const Phaser = (PhaserMod as unknown as { default?: typeof PhaserMod }).default ?? PhaserMod;
      if (cancelled || !containerRef.current) return;

      const state: Partial<RunnerState> = {
        itemsPool: [],
        obstaclesPool: [],
        scoreValue: 0,
        itemScoreValue: 0,
        combo: 0,
        maxCombo: 0,
        survivalTime: 0,
        elapsed: 0,
        velocityY: 0,
        isJumping: false,
        sliding: false,
        slideUntil: 0,
        invincibleUntil: 0,
        confusedUntil: 0,
        scrollSpeed: 260,
        nextItemAt: 600,
        nextObstacleAt: 1400,
        finished: false,
      };

      function finish(this: Phaser.Scene, completed: boolean) {
        if (state.finished) return;
        state.finished = true;
        const scene = this;

        const callResult = () => {
          if (!resultCalled.current) {
            resultCalled.current = true;
            onResultRef.current({
              score: Math.max(0, Math.floor(state.scoreValue ?? 0)),
              itemScore: Math.floor(state.itemScoreValue ?? 0),
              maxCombo: state.maxCombo ?? 0,
              survivalTime: Math.min(GAME_DURATION_SEC, Math.floor(state.survivalTime ?? 0)),
              completed,
            });
          }
        };

        // 게임오버(케이크 충돌) 시: 캐릭터 창 안에서 오버레이 이미지 + 한글 텍스트 노출 후 결과로 전환
        if (!completed) {
          // 딤 배경: 화면 전체를 확실히 덮음
          const dim = scene.add.rectangle(VIEW_W / 2, VIEW_H / 2, VIEW_W, VIEW_H, 0x000000, 0.7);
          dim.setDepth(100).setScrollFactor(0);

          const hasImg = scene.textures.exists("game-over");
          if (hasImg) {
            const img = scene.add.image(VIEW_W / 2, VIEW_H / 2 - 60, "game-over");
            img.setDepth(101).setScrollFactor(0);
            // 원본 텍스처 크기 기준으로 안전 스케일 (너무 큰 이미지 대응)
            const srcW = img.width || 1;
            const srcH = img.height || 1;
            const maxW = VIEW_W - 40;
            const maxH = VIEW_H * 0.55;
            const fit = Math.min(maxW / srcW, maxH / srcH, 1);
            img.setScale(fit);
          } else {
            console.error("[WeddingRunner] game-over 텍스처 누락 — 이미지 로드 실패");
          }

          // "GAME OVER" 영문 대형 텍스트 — 마스터 요구
          scene.add.text(VIEW_W / 2, VIEW_H - 180, "GAME OVER", {
            fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', 'Pretendard', sans-serif",
            fontSize: "56px",
            color: "#ffffff",
            fontStyle: "bold",
            stroke: "#ff1744",
            strokeThickness: 8,
          }).setOrigin(0.5).setDepth(102).setScrollFactor(0);

          // 한글 "게임 오버" 보조 텍스트
          scene.add.text(VIEW_W / 2, VIEW_H - 120, "게임 오버", {
            fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', 'Pretendard', sans-serif",
            fontSize: "32px",
            color: "#ffffff",
            fontStyle: "bold",
            stroke: "#3a2430",
            strokeThickness: 6,
          }).setOrigin(0.5).setDepth(102).setScrollFactor(0);

          scene.add.text(VIEW_W / 2, VIEW_H - 76, "캐릭터가 쓰러졌습니다…", {
            fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', 'Pretendard', sans-serif",
            fontSize: "16px",
            color: "#fdf2f4",
            stroke: "#3a2430",
            strokeThickness: 3,
          }).setOrigin(0.5).setDepth(102).setScrollFactor(0);

          // 마스터 요청: 이미지를 충분히 감상할 수 있도록 3초간 노출 유지
          scene.time.delayedCall(3000, callResult);
          return;
        }

        callResult();
      }

      function tryJump() {
        if (state.isJumping || state.sliding) return;
        state.velocityY = JUMP_V;
        state.isJumping = true;
      }

      function trySlide(scene: Phaser.Scene) {
        if (state.isJumping || state.sliding) return;
        state.sliding = true;
        state.slideUntil = scene.time.now + SLIDE_DURATION;
        state.playerH = 30;
        const slideH = 38;
        state.player!.setDisplaySize(56, slideH);
        state.player!.y = GROUND_Y - slideH / 2;
      }

      function spawnItem(scene: Phaser.Scene) {
        const kinds: ItemKind[] = ["heart", "heart", "heart", "ring", "bouquet", "champagne"];
        const kind = kinds[Math.floor(Math.random() * kinds.length)];
        const aerial = kind === "heart" || kind === "ring" || Math.random() < 0.4;
        const targetH = ITEM_HEIGHT[kind];
        const y = aerial ? GROUND_Y - 90 - Math.random() * 80 : GROUND_Y - targetH / 2;

        // 아이템 뒤에 노란 halo 원 — "획득 가능" 시각 신호
        const haloR = Math.max(targetH, 32) * 0.7;
        const halo = scene.add.circle(VIEW_W + 30, y, haloR, 0xffeb3b, 0.45);
        halo.setStrokeStyle(2, 0xffc107, 0.85);
        halo.setDepth(-1);

        const img = scene.add.image(VIEW_W + 30, y, ITEM_TEXTURE[kind]);
        // 세로 기준 맞춤 — 원본 비율 유지
        const scale = targetH / img.height;
        img.setScale(scale);
        const w = img.width * scale;
        state.itemsPool!.push({ sprite: img, halo, kind, x: img.x, y: img.y, alive: true, w, h: targetH });
      }

      function spawnObstacle(scene: Phaser.Scene) {
        // cake = 즉사 장애물 — 확률 증가 (게임오버 연출 자주 발동)
        const kinds: ObstacleKind[] = ["glass", "glass", "flower", "cake", "cake"];
        const kind = kinds[Math.floor(Math.random() * kinds.length)];
        const targetH = OBSTACLE_HEIGHT[kind];
        // 바닥에 딱 붙게 배치
        const y = GROUND_Y - targetH / 2 + 6;
        const img = scene.add.image(VIEW_W + 30, y, OBSTACLE_TEXTURE[kind]);
        const scale = targetH / img.height;
        img.setScale(scale);
        // 장애물은 빨간 tint로 "위험" 시각 신호 — 아이템(원본색)과 구분
        img.setTint(0xff5a5a);
        const w = img.width * scale;

        // 장애물 위 "!" 경고 마커
        const warn = scene.add.text(img.x, y - targetH / 2 - 14, "!", {
          fontFamily: "monospace",
          fontSize: "20px",
          color: "#ff1744",
          fontStyle: "bold",
          stroke: "#ffffff",
          strokeThickness: 3,
        }).setOrigin(0.5);
        warn.setDepth(5);
        state.obstaclesPool!.push({ sprite: img, warn, kind, x: img.x, y: img.y, alive: true, w, h: targetH });
      }

      const sceneConfig: Phaser.Types.Scenes.SettingsConfig & {
        preload: (this: Phaser.Scene) => void;
        create: (this: Phaser.Scene) => void;
        update: (this: Phaser.Scene, t: number, dt: number) => void;
      } = {
        key: "main",
        preload(this: Phaser.Scene) {
          // 에셋 로드 실패 로깅 — 게임오버 이미지 누락 디버깅용
          this.load.on("loaderror", (file: { key: string; url?: string }) => {
            console.error("[WeddingRunner] 에셋 로드 실패:", file.key, file.url);
          });
          // 캐릭터 스프라이트 (오리지널 / 웨딩 16비트)
          this.load.image("player-bride", "/wedding-runner/bride.png");
          this.load.image("player-groom", "/wedding-runner/groom.png");
          // 게임오버 씬에 띄울 오리지널 일러스트
          this.load.image("game-over", "/wedding-runner/game-over.png");
          // 스테이지1 배경 (마스터 제공 · 가로 타일링)
          this.load.image("stage1-bg", "/wedding-runner/stage1-bg.png");
          // 아이템 (점수 부스터)
          this.load.image("spr-heart", "/wedding-runner/item-heart.png");
          this.load.image("spr-ring", "/wedding-runner/item-ring.png");
          this.load.image("spr-bouquet", "/wedding-runner/item-bouquet.png");
          this.load.image("spr-champagne", "/wedding-runner/item-champagne.png");
          // 장애물 (웅덩이 = glass 대체, 의자 = flower 대체, 케이크 = 게임오버)
          this.load.image("spr-puddle", "/wedding-runner/obs-puddle.png");
          this.load.image("spr-chair", "/wedding-runner/obs-chair.png");
          this.load.image("spr-cake", "/wedding-runner/item-cake.png");
        },
        create(this: Phaser.Scene) {
          const scene = this;
          // 스카이 폴백 (이미지 로드 실패 시를 대비한 배경)
          scene.add.rectangle(VIEW_W / 2, VIEW_H / 2, VIEW_W, VIEW_H, PALETTE.sky).setDepth(-20);

          // 가로 스크롤 배경 — tileSprite 로 좌측으로 흐르게 함
          const bgTex = scene.textures.get("stage1-bg").getSourceImage() as HTMLImageElement;
          const bgH = bgTex?.height ?? 559;
          // 배경이 뷰포트 전체 높이를 덮도록 세로 스케일, 가로는 tilePositionX 로 루프
          const tileScale = VIEW_H / bgH;
          const bg = scene.add.tileSprite(0, 0, VIEW_W, VIEW_H, "stage1-bg").setOrigin(0, 0);
          bg.tileScaleX = tileScale;
          bg.tileScaleY = tileScale;
          bg.setDepth(-10);
          state.bg = bg;

          // 캐릭터 발밑 그림자
          scene.add.ellipse(PLAYER_X, GROUND_Y + 6, 60, 12, PALETTE.ink, 0.25);
          const PLAYER_W = 56;
          const PLAYER_H = 92;
          state.playerW = PLAYER_W;
          state.playerH = PLAYER_H;
          const textureKey = playerType === "bride" ? "player-bride" : "player-groom";
          state.player = scene.add.image(PLAYER_X, GROUND_Y - PLAYER_H / 2, textureKey);
          state.player.setDisplaySize(PLAYER_W, PLAYER_H);

          const hudStyle = { fontFamily: "monospace", fontSize: "18px", color: "#3a2430", fontStyle: "bold" };
          state.hudScore = scene.add.text(16, 16, "SCORE 0000", hudStyle);
          state.hudTime = scene.add.text(VIEW_W - 16, 16, `TIME ${GAME_DURATION_SEC}`, hudStyle).setOrigin(1, 0);
          state.hudCombo = scene.add.text(16, 40, "", hudStyle);
          state.hudStatus = scene.add.text(VIEW_W / 2, 40, "", { ...hudStyle, fontSize: "14px", color: "#c85476" }).setOrigin(0.5, 0);

          scene.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
            if (state.finished) return;
            const inverted = scene.time.now < (state.confusedUntil ?? 0);
            if (p.y > VIEW_H * 0.7) {
              if (inverted) tryJump();
              else trySlide(scene);
            } else {
              if (inverted) trySlide(scene);
              else tryJump();
            }
          });
          scene.input.keyboard?.on("keydown-SPACE", () => tryJump());
          scene.input.keyboard?.on("keydown-UP", () => tryJump());
          scene.input.keyboard?.on("keydown-DOWN", () => trySlide(scene));
        },
        update(this: Phaser.Scene, _t: number, dt: number) {
          const scene = this;
          if (state.finished) return;
          state.elapsed = (state.elapsed ?? 0) + dt;
          state.survivalTime = state.elapsed / 1000;

          if (state.survivalTime < 15) state.scrollSpeed = 240;
          else if (state.survivalTime < 40) state.scrollSpeed = 290;
          else state.scrollSpeed = 360;

          const speed = state.scrollSpeed!;
          // 배경 tileSprite 좌측으로 흐름 (메인 스크롤)
          if (state.bg) {
            state.bg.tilePositionX += (speed * dt) / 1000 / (state.bg.tileScaleX || 1);
          }

          const baseH = 92;
          const baseY = GROUND_Y - baseH / 2;
          if (state.isJumping) {
            state.velocityY! += (GRAVITY * dt) / 1000;
            state.player!.y += (state.velocityY! * dt) / 1000;
            if (state.player!.y >= baseY) {
              state.player!.y = baseY;
              state.isJumping = false;
              state.velocityY = 0;
            }
          } else if (state.sliding && scene.time.now > state.slideUntil!) {
            state.sliding = false;
            state.playerH = baseH;
            state.player!.setDisplaySize(56, baseH);
            state.player!.y = baseY;
          } else if (!state.sliding) {
            // 달리기 호흡 — squash & stretch (땅 위에 있을 때만)
            const wob = Math.sin(state.elapsed! / 90) * 0.05;
            state.player!.setScale(state.player!.scaleX, (baseH / state.player!.height) * (1 + wob));
          }

          if (scene.time.now < (state.invincibleUntil ?? 0)) {
            state.player!.alpha = Math.floor(scene.time.now / 80) % 2 === 0 ? 1 : 0.4;
          } else {
            state.player!.alpha = 1;
          }

          if (scene.time.now < (state.confusedUntil ?? 0)) {
            state.hudStatus!.setText("혼란! 입력이 반전됩니다");
          } else if (scene.time.now < (state.invincibleUntil ?? 0)) {
            state.hudStatus!.setText("무적!");
          } else {
            state.hudStatus!.setText("");
          }

          if (state.elapsed >= state.nextItemAt!) {
            spawnItem(scene);
            const gap = state.survivalTime > 40 ? 500 : state.survivalTime > 15 ? 650 : 850;
            state.nextItemAt = state.elapsed + gap + Math.random() * 250;
          }
          if (state.elapsed >= state.nextObstacleAt!) {
            spawnObstacle(scene);
            const gap = state.survivalTime < 15 ? 1600 : state.survivalTime < 40 ? 1100 : 800;
            state.nextObstacleAt = state.elapsed + gap + Math.random() * 350;
          }

          // hit box는 시각 크기보다 살짝 작게 — 캐릭터 폭 56→40, 슬라이드 시 30
          const hitH = state.sliding ? 30 : 70;
          const hitW = 40;
          for (const it of state.itemsPool!) {
            if (!it.alive) continue;
            it.x -= (speed * dt) / 1000;
            it.sprite.x = it.x;
            it.halo.x = it.x;
            // halo 살짝 맥박 — 획득 가능 어필
            const pulse = 1 + Math.sin(state.elapsed! / 140) * 0.08;
            it.halo.setScale(pulse);
            if (it.x < -60) { it.alive = false; it.sprite.destroy(); it.halo.destroy(); continue; }
            if (intersects(PLAYER_X, state.player!.y, hitW, hitH, it.x, it.y, it.w, it.h)) {
              it.alive = false;
              it.sprite.destroy();
              it.halo.destroy();
              const gained = ITEM_SCORE[it.kind];
              state.scoreValue! += gained;
              state.itemScoreValue! += gained;
              state.combo! += 1;
              state.maxCombo = Math.max(state.maxCombo!, state.combo!);
              if (state.combo === 5) state.scoreValue! += 50;
              if (state.combo === 10) state.scoreValue! += 150;
              if (it.kind === "champagne") state.invincibleUntil = scene.time.now + 3000;
            }
          }

          for (const ob of state.obstaclesPool!) {
            if (!ob.alive) continue;
            ob.x -= (speed * dt) / 1000;
            ob.sprite.x = ob.x;
            ob.warn.x = ob.x;
            // 경고 마커 깜빡임
            ob.warn.alpha = Math.floor(scene.time.now / 180) % 2 === 0 ? 1 : 0.35;
            if (ob.x < -80) { ob.alive = false; ob.sprite.destroy(); ob.warn.destroy(); continue; }
            const hit = intersects(PLAYER_X, state.player!.y, hitW, hitH, ob.x, ob.y, ob.w, ob.h);
            if (hit) {
              ob.alive = false;
              ob.sprite.destroy();
              ob.warn.destroy();
              const invincible = scene.time.now < (state.invincibleUntil ?? 0);
              if (ob.kind === "cake") {
                if (invincible) continue;
                finish.call(scene, false);
                return;
              } else if (ob.kind === "glass") {
                if (invincible) continue;
                state.scoreValue! -= OBSTACLE_PENALTY.glass;
                state.combo = 0;
              } else {
                if (invincible) continue;
                state.scoreValue! -= OBSTACLE_PENALTY.flower;
                state.combo = 0;
                state.confusedUntil = scene.time.now + 2000;
              }
            }
          }

          state.scoreValue! += (10 * dt) / 1000;

          state.hudScore!.setText(`SCORE ${Math.max(0, Math.floor(state.scoreValue!)).toString().padStart(4, "0")}`);
          state.hudTime!.setText(`TIME ${Math.max(0, Math.ceil(GAME_DURATION_SEC - state.survivalTime))}`);
          state.hudCombo!.setText(state.combo! >= 2 ? `COMBO ×${state.combo}` : "");

          if (state.survivalTime >= GAME_DURATION_SEC) {
            finish.call(scene, true);
          }
        },
      };

      const game = new Phaser.Game({
        type: Phaser.AUTO,
        width: VIEW_W,
        height: VIEW_H,
        parent: containerRef.current,
        backgroundColor: "#fdf2f4",
        pixelArt: true,
        roundPixels: true,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        scene: sceneConfig,
      });
      gameRef.current = game;
    })();

    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [playerType]);

  return (
    <div
      ref={containerRef}
      className="mx-auto w-full max-w-[480px]"
      style={{ aspectRatio: "480 / 720" }}
    />
  );
}
