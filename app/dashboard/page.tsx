"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { BLUEPRINTS } from "@/lib/blueprints";
import { useSession } from "next-auth/react";

type OwnedSet = Set<number>;

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        border: "2px solid #222",
        borderRadius: 14,
        padding: 16,
        background: "#0b0b0b",
        minHeight: 560,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function ProgressBar({ ownedCount, total }: { ownedCount: number; total: number }) {
  const percent = total > 0 ? Math.round((ownedCount / total) * 100) : 0;

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 14, marginBottom: 6, opacity: 0.9 }}>
        {ownedCount} / {total} owned
      </div>

      <div
        style={{
          width: "100%",
          height: 8,
          background: "#1a1a1a",
          borderRadius: 999,
          overflow: "hidden",
          border: "1px solid #222",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: "linear-gradient(90deg, #22c55e, #16a34a)",
            transition: "width 0.2s ease",
          }}
        />
      </div>
    </div>
  );
}

function Tile({
  bpId,
  src,
  tick,
  draggablePayload,
}: {
  bpId: number;
  src: string;
  tick?: boolean;
  draggablePayload: string;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", draggablePayload);
      }}
      style={{
        width: 92,
        height: 92,
        borderRadius: 14,
        border: "1px solid #222",
        position: "relative",
        overflow: "hidden",
        background: "#0f0f0f",
        cursor: "grab",
      }}
      title={`BP ${bpId}`}
    >
      <Image src={src} alt={`bp-${bpId}`} width={92} height={92} style={{ objectFit: "cover" }} />
      {tick && (
        <div
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            background: "rgba(0,0,0,0.65)",
            borderRadius: 10,
            padding: "2px 6px",
            fontSize: 14,
          }}
        >
          ✅
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { status } = useSession();
  const [owned, setOwned] = useState<OwnedSet>(new Set());
  const ownedIds = useMemo(() => owned, [owned]);

  const ownedCount = ownedIds.size;
  const totalCount = BLUEPRINTS.length;

  useEffect(() => {
    if (status !== "authenticated") return;

    (async () => {
      const res = await fetch("/api/blueprints", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setOwned(new Set<number>(data.ownedBlueprintIds ?? []));
    })();
  }, [status]);

  function persist(next: OwnedSet) {
    setOwned(new Set(next));
    fetch("/api/blueprints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownedBlueprintIds: Array.from(next) }),
    }).catch(() => {});
  }

  function handleDrop(target: "owned" | "all", payload: string) {
    const parts = payload.split(":");
    if (parts.length !== 2) return;

    const id = Number(parts[1]);
    if (!Number.isFinite(id)) return;

    const next = new Set(ownedIds);

    if (target === "owned") next.add(id);
    if (target === "all") next.delete(id);

    persist(next);
  }

  if (status !== "authenticated") {
    return (
      <div style={{ padding: 24, background: "#050505", minHeight: "100vh", color: "#fff" }}>
        <div>Please login first.</div>
        <a href="/" style={{ color: "#fff" }}>Go to login</a>
      </div>
    );
  }

  return (
    <div style={{ padding: 22, background: "#050505", minHeight: "100vh", color: "#fff" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleDrop("all", e.dataTransfer.getData("text/plain"));
          }}
        >
          <Box title="Arc Raiders Blueprints">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 92px)", gap: 10 }}>
              {BLUEPRINTS.map((bp) => (
                <Tile
                  key={bp.id}
                  bpId={bp.id}
                  src={bp.coloredSrc}
                  tick={ownedIds.has(bp.id)}
                  draggablePayload={`bp:${bp.id}`}
                />
              ))}
            </div>
          </Box>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleDrop("owned", e.dataTransfer.getData("text/plain"));
          }}
        >
          <Box title="Owned Blueprints">
            <ProgressBar ownedCount={ownedCount} total={totalCount} />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 92px)", gap: 10 }}>
              {BLUEPRINTS.map((bp) => {
                const isOwned = ownedIds.has(bp.id);
                return (
                  <Tile
                    key={bp.id}
                    bpId={bp.id}
                    src={isOwned ? bp.coloredSrc : bp.graySrc}
                    tick={isOwned}
                    draggablePayload={`bp:${bp.id}`}
                  />
                );
              })}
            </div>
          </Box>
        </div>
      </div>
    </div>
  );
}
