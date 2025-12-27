"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ padding: 24, background: "#050505", minHeight: "100vh", color: "#fff" }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>ARC Raiders BP Tracker</h1>

      {!session ? (
        <button
          onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #222",
            background: "#111",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Login with Discord
        </button>
      ) : (
        <>
          <div style={{ marginBottom: 12 }}>
            Logged in as {(session.user as any)?.name || "User"}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <a
              href="/dashboard"
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #222",
                background: "#111",
                color: "#fff",
                textDecoration: "none",
              }}
            >
              Open Dashboard
            </a>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #222",
                background: "#111",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
