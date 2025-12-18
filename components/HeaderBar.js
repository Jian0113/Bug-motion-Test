import Image from "next/image";
import Link from "next/link";

function NavLink({ href = "#", children }) {
  return (
    <Link
      href={href}
      style={{
        color: "rgb(0, 255, 0)",
        textDecoration: "none",
        fontSize: 14,
        padding: "6px 10px",
      }}
    >
      {children}
    </Link>
  );
}

export default function HeaderBar() {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 18px",
        borderBottom: "none",
        background: "rgba(0, 0, 0, 0.35)",
        height: 60,
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Link href="/WEB_Intro" style={{ display: "flex", alignItems: "center", gap: 10, color: "#ffffff" }}>
          <Image
            src="/WhiteLogo.png"
            alt="VibeCodingBUG logo"
            width={28}
            height={28}
            style={{ filter: "brightness(0) saturate(100%) invert(39%) sepia(93%) saturate(1384%) hue-rotate(95deg) brightness(98%) contrast(101%)" }}
          />
          <span style={{ fontWeight: 700, fontSize: 15, color: "rgb(0, 255, 0)" }}>VibeCodingBUGEncyclopedia</span>
        </Link>
        <NavLink href="/note">Note</NavLink>
        <NavLink href="/bug-detector">BugDetector</NavLink>
        <NavLink href="/about">About</NavLink>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }} />
    </header>
  );
}
