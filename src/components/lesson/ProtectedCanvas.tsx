"use client";

/**
 * Renders a protected lesson image into an HTML5 `<canvas>`.
 *
 * Why a canvas instead of <img>?
 * - The image bytes never appear in any DOM `src` attribute, so right-click →
 *   "Save image" copies the canvas snapshot (with watermark), not the original.
 * - We can overlay a per-user watermark client-side.
 *
 * The bytes are streamed from `/api/secure-image/<token>`, where `<token>` is
 * a short-lived JWT bound to (image_id, user_id). Without the user's JWT
 * Authorization header, the request fails with 401.
 *
 * Defenses (best-effort, never bullet-proof on the open web):
 *  - Canvas is rendered with `pointerEvents: 'none'` and `userSelect: 'none'`.
 *  - The container intercepts contextmenu / dragstart at capture phase.
 *  - The bytes URL is held in memory only (we revoke the blob URL right after
 *    drawing, but we don't even create one — we draw straight from the blob).
 *  - The canvas element is `tainted` from the moment we draw the watermark, so
 *    `.toDataURL()` would throw a SecurityError if the image came from a CORS
 *    origin without the right headers — but in our setup the image is served
 *    same-origin via fetch+JWT, so we set the watermark at draw time.
 */

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import type { ApiLessonImage } from "@/lib/api/types";
import { lessons as lessonsApi } from "@/lib/api/endpoints";

type Props = {
  image: ApiLessonImage;
  /** Token from `/api/lessons/<id>` payload. */
  token?: string;
  /** Max display width in CSS px. */
  maxWidth?: number;
};

async function fetchImageBlob(token: string): Promise<Blob> {
  // We use apiFetch to attach the JWT. apiFetch parses JSON by default, so we
  // bypass it for binary by using fetch directly with the same auth header.
  const accessToken =
    typeof window !== "undefined"
      ? window.localStorage.getItem("algopy.access_token")
      : null;
  const apiBase =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE) ||
    "http://127.0.0.1:5050";
  const res = await fetch(`${apiBase}/api/secure-image/${token}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`);
  return await res.blob();
}

export function ProtectedCanvas({ image, token, maxWidth = 800 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    setLoaded(false);

    async function draw() {
      try {
        let imgToken = token;
        if (!imgToken) {
          const r = await lessonsApi.refreshImageToken(image.lesson_id, image.id);
          imgToken = r.token;
        }
        const blob = await fetchImageBlob(imgToken);
        if (cancelled) return;
        const bitmap = await createImageBitmap(blob);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const ratio = bitmap.width > maxWidth ? maxWidth / bitmap.width : 1;
        const w = Math.round(bitmap.width * ratio);
        const h = Math.round(bitmap.height * ratio);
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(bitmap, 0, 0, w, h);

        // Tiled watermark — translucent text, two layers (dark stroke + light fill)
        // so it remains readable on any background.
        const wmText = user?.name
          ? `${user.name} • AlgoPy TN`
          : "AlgoPy TN";
        ctx.save();
        ctx.font = "14px system-ui, -apple-system, sans-serif";
        ctx.textBaseline = "top";
        ctx.globalAlpha = 0.18;
        const step = 220;
        ctx.translate(w / 2, h / 2);
        ctx.rotate(-Math.PI / 8);
        ctx.translate(-w, -h);
        for (let y = 0; y < h * 2; y += step) {
          for (let x = 0; x < w * 2; x += step) {
            ctx.fillStyle = "rgba(0,0,0,0.55)";
            ctx.fillText(wmText, x + 1, y + 1);
            ctx.fillStyle = "rgba(255,255,255,0.85)";
            ctx.fillText(wmText, x, y);
          }
        }
        ctx.restore();
        setLoaded(true);
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message ?? "Erreur de chargement de l'image.");
        }
      }
    }

    void draw();
    return () => {
      cancelled = true;
    };
  }, [image.id, image.lesson_id, token, maxWidth, user?.name]);

  // Block right-click + drag at capture phase on the container.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const stop = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    node.addEventListener("contextmenu", stop, true);
    node.addEventListener("dragstart", stop, true);
    return () => {
      node.removeEventListener("contextmenu", stop, true);
      node.removeEventListener("dragstart", stop, true);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative inline-block max-w-full select-none rounded-xl border border-white/10 bg-black/20 p-2"
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        draggable={false}
        className="block max-w-full"
        style={{ pointerEvents: "none" }}
      />
      {!loaded && !error ? (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-400">
          Chargement de l&apos;image…
        </div>
      ) : null}
      {error ? (
        <div className="px-3 py-6 text-center text-sm text-rose-300">{error}</div>
      ) : null}
      {/* invisible overlay to soak up touch / mouse events */}
      <div
        aria-hidden
        className="pointer-events-auto absolute inset-0"
        style={{ background: "transparent" }}
      />
    </div>
  );
}
