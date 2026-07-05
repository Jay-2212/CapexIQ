export default function Home() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "4rem 1.5rem",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>CapexIQ</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem" }}>
        Know if it pays for itself, before you buy it.
      </p>
      <p style={{ color: "var(--text-muted)", marginTop: "2rem" }}>
        This is a scaffold. The wizard flow, formulas, and dashboard described
        in <code>SPEC.md</code> haven&apos;t been built yet — see{" "}
        <code>HANDOFF.md</code> for current status.
      </p>
    </main>
  );
}
