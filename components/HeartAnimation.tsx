"use client";

import { useEffect, useRef } from "react";

export default function HeartAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Визначаємо чи це мобільний пристрій
    const isDevice =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        (
          navigator.userAgent ||
          navigator.vendor ||
          (window as any).opera ||
          ""
        ).toLowerCase()
      );

    const koef = isDevice ? 0.5 : 1;
    let width = (canvas.width = koef * window.innerWidth);
    let height = (canvas.height = koef * window.innerHeight);

    // Функція для позиції серця
    const heartPosition = (rad: number) => {
      return [
        Math.pow(Math.sin(rad), 3),
        -(
          15 * Math.cos(rad) -
          5 * Math.cos(2 * rad) -
          2 * Math.cos(3 * rad) -
          Math.cos(4 * rad)
        ),
      ];
    };

    const scaleAndTranslate = (
      pos: number[],
      sx: number,
      sy: number,
      dx: number,
      dy: number
    ) => {
      return [dx + pos[0] * sx, dy + pos[1] * sy];
    };

    // Обробник зміни розміру вікна
    const handleResize = () => {
      width = canvas.width = koef * window.innerWidth;
      height = canvas.height = koef * window.innerHeight;
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.fillRect(0, 0, width, height);
    };

    window.addEventListener("resize", handleResize);

    // Створюємо точки серця
    const traceCount = isDevice ? 20 : 50;
    const pointsOrigin: number[][] = [];
    const dr = isDevice ? 0.3 : 0.1;

    for (let i = 0; i < Math.PI * 2; i += dr) {
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), 210, 13, 0, 0));
    }
    for (let i = 0; i < Math.PI * 2; i += dr) {
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), 150, 9, 0, 0));
    }
    for (let i = 0; i < Math.PI * 2; i += dr) {
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), 90, 5, 0, 0));
    }

    const heartPointsCount = pointsOrigin.length;
    const targetPoints: number[][] = [];

    const pulse = (kx: number, ky: number) => {
      for (let i = 0; i < pointsOrigin.length; i++) {
        targetPoints[i] = [];
        targetPoints[i][0] = kx * pointsOrigin[i][0] + width / 2;
        targetPoints[i][1] = ky * pointsOrigin[i][1] + height / 2;
      }
    };

    // Створюємо частинки
    const particles: any[] = [];
    for (let i = 0; i < heartPointsCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      particles[i] = {
        vx: 0,
        vy: 0,
        R: 2,
        speed: Math.random() + 5,
        q: Math.floor(Math.random() * heartPointsCount),
        D: 2 * (i % 2) - 1,
        force: 0.2 * Math.random() + 0.7,
        f: `hsla(0,${Math.floor(40 * Math.random() + 60)}%,${Math.floor(
          60 * Math.random() + 20
        )}%,.3)`,
        trace: [],
      };
      for (let k = 0; k < traceCount; k++) {
        particles[i].trace[k] = { x, y };
      }
    }

    const config = {
      traceK: 0.4,
      timeDelta: 0.01,
    };

    let time = 0;
    let animationId: number;

    const loop = () => {
      const n = -Math.cos(time);
      pulse((1 + n) * 0.5, (1 + n) * 0.5);
      time += (Math.sin(time) < 0 ? 9 : n > 0.8 ? 0.2 : 1) * config.timeDelta;

      ctx.fillStyle = "rgba(0,0,0,.1)";
      ctx.fillRect(0, 0, width, height);

      for (let i = particles.length; i--; ) {
        const u = particles[i];
        const q = targetPoints[u.q];
        const dx = u.trace[0].x - q[0];
        const dy = u.trace[0].y - q[1];
        const length = Math.sqrt(dx * dx + dy * dy);

        if (10 > length) {
          if (0.95 < Math.random()) {
            u.q = Math.floor(Math.random() * heartPointsCount);
          } else {
            if (0.99 < Math.random()) {
              u.D *= -1;
            }
            u.q += u.D;
            u.q %= heartPointsCount;
            if (0 > u.q) {
              u.q += heartPointsCount;
            }
          }
        }

        u.vx += (-dx / length) * u.speed;
        u.vy += (-dy / length) * u.speed;
        u.trace[0].x += u.vx;
        u.trace[0].y += u.vy;
        u.vx *= u.force;
        u.vy *= u.force;

        for (let k = 0; k < u.trace.length - 1; ) {
          const T = u.trace[k];
          const N = u.trace[++k];
          N.x -= config.traceK * (N.x - T.x);
          N.y -= config.traceK * (N.y - T.y);
        }

        ctx.fillStyle = u.f;
        for (let k = 0; k < u.trace.length; k++) {
          ctx.fillRect(u.trace[k].x, u.trace[k].y, 1, 1);
        }
      }

      animationId = requestAnimationFrame(loop);
    };

    loop();

    // Очищення при демонтажі компонента
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ background: "transparent" }}
    />
  );
}
