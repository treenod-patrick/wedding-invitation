"use client";

import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import { GAME_DURATION_SEC } from "@/lib/wedding-constants";

// 외부 IP·스프라이트 없이 Graphics/Rectangle 으로 도트 풍을 연출
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
  heart: 0xe25c7f,
  ring: 0xf7c95c,
  bouquet: 0xe8a0b5,
  champagne: 0xffe27a,
  glass: 0xb5dbe8,
  flower: 0xd65a8a,
  cake: 0xffffff,
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
  itemsPool: Array<{ rect: Phaser.GameObjects.Graphics; kind: ItemKind; x: number; y: number; alive: boolean; size: number }>;
  obstaclesPool: Array<{ rect: Phaser.GameObjects.Graphics; kind: ObstacleKind; x: number; y: number; alive: boolean; w: number; h: number }>;
  groundTiles: Phaser.GameObjects.Rectangle[];
  parallaxLayers: Phaser.GameObjects.Rectangle[][];
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

function drawItem(g: Phaser.GameObjects.Graphics, kind: ItemKind, size: number) {
  g.clear();
  const c =
    kind === "heart" ? PALETTE.heart :
    kind === "ring" ? PALETTE.ring :
    kind === "bouquet" ? PALETTE.bouquet :
    PALETTE.champagne;
  g.fillStyle(c, 1);
  if (kind === "ring") {
    g.lineStyle(4, c, 1);
    g.strokeCircle(0, 0, size);
    g.lineStyle(2, PALETTE.ink, 1);
    g.strokeCircle(0, 0, size);
  } else if (kind === "heart") {
    g.fillRect(-size / 2, -size / 2, size, size);
    g.fillRect(-size, -size / 2, size / 2, size / 2);
    g.fillRect(size / 2, -size / 2, size / 2, size / 2);
    g.lineStyle(2, PALETTE.ink, 1);
    g.strokeRect(-size / 2, -size / 2, size, size);
  } else if (kind === "bouquet") {
    g.fillCircle(0, -4, size * 0.8);
    g.fillStyle(0x4a8b5e, 1);
    g.fillRect(-2, 0, 4, size);
    g.lineStyle(2, PALETTE.ink, 1);
    g.strokeCircle(0, -4, size * 0.8);
  } else {
    g.fillRect(-size / 3, -size, (size / 3) * 2, size * 2);
    g.fillStyle(PALETTE.ink, 1);
    g.fillRect(-size / 4, -size - 6, size / 2, 6);
  }
}

function drawObstacle(g: Phaser.GameObjects.Graphics, kind: ObstacleKind, w: number, h: number) {
  g.clear();
  if (kind === "glass") {
    g.fillStyle(PALETTE.glass, 1);
    g.fillTriangle(-w / 2, -h / 2, w / 2, -h / 2, 0, h / 2);
    g.lineStyle(2, PALETTE.ink, 1);
    g.strokeTriangle(-w / 2, -h / 2, w / 2, -h / 2, 0, h / 2);
  } else if (kind === "flower") {
    g.fillStyle(PALETTE.flower, 1);
    g.fillRect(-w / 2, -h / 2, w, h);
    g.lineStyle(2, PALETTE.ink, 1);
    g.strokeRect(-w / 2, -h / 2, w, h);
    g.fillStyle(PALETTE.ink, 1);
    g.fillRect(-8, -h / 2 + 10, 4, 4);
    g.fillRect(4, -h / 2 + 10, 4, 4);
  } else {
    g.fillStyle(PALETTE.cake, 1);
    g.fillRect(-w / 2, -h / 2, w, h);
    g.fillStyle(PALETTE.bride, 1);
    g.fillRect(-w / 2, -h / 2, w, 10);
    g.lineStyle(2, PALETTE.ink, 1);
    g.strokeRect(-w / 2, -h / 2, w, h);
  }
}

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
        groundTiles: [],
        parallaxLayers: [[], []],
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
        if (!completed && scene.textures.exists("game-over")) {
          const dim = scene.add.rectangle(VIEW_W / 2, VIEW_H / 2, VIEW_W, VIEW_H, 0x000000, 0.55);
          dim.setDepth(100);

          const img = scene.add.image(VIEW_W / 2, VIEW_H / 2 - 40, "game-over");
          img.setDepth(101);
          const maxW = VIEW_W - 60;
          const maxH = VIEW_H * 0.55;
          const fit = Math.min(maxW / img.width, maxH / img.height, 1);
          img.setScale(fit);

          scene.add.text(VIEW_W / 2, VIEW_H - 150, "게임 오버", {
            fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', 'Pretendard', sans-serif",
            fontSize: "44px",
            color: "#ffffff",
            fontStyle: "bold",
            stroke: "#3a2430",
            strokeThickness: 6,
          }).setOrigin(0.5).setDepth(101);

          scene.add.text(VIEW_W / 2, VIEW_H - 96, "캐릭터가 쓰러졌습니다…", {
            fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', 'Pretendard', sans-serif",
            fontSize: "18px",
            color: "#fdf2f4",
            stroke: "#3a2430",
            strokeThickness: 3,
          }).setOrigin(0.5).setDepth(101);

          scene.time.delayedCall(1800, callResult);
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
        const y = aerial ? GROUND_Y - 90 - Math.random() * 80 : GROUND_Y - 20;
        const size = kind === "bouquet" ? 22 : kind === "champagne" ? 20 : 16;
        const g = scene.add.graphics();
        drawItem(g, kind, size);
        g.x = VIEW_W + 30;
        g.y = y;
        state.itemsPool!.push({ rect: g, kind, x: g.x, y: g.y, alive: true, size });
      }

      function spawnObstacle(scene: Phaser.Scene) {
        const kinds: ObstacleKind[] = ["glass", "glass", "flower", "flower", "cake"];
        const kind = kinds[Math.floor(Math.random() * kinds.length)];
        let w = 28, h = 36, y = GROUND_Y - 18;
        if (kind === "flower") { w = 36; h = 48; y = GROUND_Y - 24; }
        else if (kind === "cake") { w = 40; h = 52; y = GROUND_Y - 26; }
        else { w = 28; h = 28; y = GROUND_Y - 14; }
        const g = scene.add.graphics();
        drawObstacle(g, kind, w, h);
        g.x = VIEW_W + 30;
        g.y = y;
        state.obstaclesPool!.push({ rect: g, kind, x: g.x, y: g.y, alive: true, w, h });
      }

      const sceneConfig: Phaser.Types.Scenes.SettingsConfig & {
        preload: (this: Phaser.Scene) => void;
        create: (this: Phaser.Scene) => void;
        update: (this: Phaser.Scene, t: number, dt: number) => void;
      } = {
        key: "main",
        preload(this: Phaser.Scene) {
          // 캐릭터 스프라이트 (오리지널 / 웨딩 16비트)
          this.load.image("player-bride", "/wedding-runner/bride.png");
          this.load.image("player-groom", "/wedding-runner/groom.png");
          // 게임오버 씬에 띄울 오리지널 일러스트
          this.load.image("game-over", "/wedding-runner/game-over.png");
          // 스테이지1 배경 (마스터 제공 · 가로 타일링)
          this.load.image("stage1-bg", "/wedding-runner/stage1-bg.png");
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

          for (let i = 0; i < 8; i++) {
            const r = scene.add.rectangle(i * 80 + 40, GROUND_Y - 180, 60, 40, PALETTE.sky2);
            r.setStrokeStyle(2, PALETTE.ink, 0.2);
            state.parallaxLayers![0].push(r);
          }
          for (let i = 0; i < 6; i++) {
            const r = scene.add.rectangle(i * 120 + 30, GROUND_Y - 60, 12, 40, PALETTE.bride, 0.6);
            state.parallaxLayers![1].push(r);
          }
          for (let i = 0; i < 16; i++) {
            const t = scene.add.rectangle(i * 48, GROUND_Y + 40, 48, 80,
              i % 2 === 0 ? PALETTE.floor : PALETTE.floorShade);
            t.setOrigin(0, 0.5);
            state.groundTiles!.push(t);
          }

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
          for (const r of state.parallaxLayers![0]) {
            r.x -= (speed * 0.25 * dt) / 1000;
            if (r.x < -60) r.x += 8 * 80;
          }
          for (const r of state.parallaxLayers![1]) {
            r.x -= (speed * 0.6 * dt) / 1000;
            if (r.x < -30) r.x += 6 * 120;
          }
          for (const t of state.groundTiles!) {
            t.x -= (speed * dt) / 1000;
            if (t.x < -48) t.x += 16 * 48;
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
            it.rect.x = it.x;
            if (it.x < -40) { it.alive = false; it.rect.destroy(); continue; }
            if (intersects(PLAYER_X, state.player!.y, hitW, hitH, it.x, it.y, it.size * 2, it.size * 2)) {
              it.alive = false;
              it.rect.destroy();
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
            ob.rect.x = ob.x;
            if (ob.x < -50) { ob.alive = false; ob.rect.destroy(); continue; }
            const hit = intersects(PLAYER_X, state.player!.y, hitW, hitH, ob.x, ob.y, ob.w, ob.h);
            if (hit) {
              ob.alive = false;
              ob.rect.destroy();
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
