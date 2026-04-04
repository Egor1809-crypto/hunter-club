const HomePage = () => {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
      <p style={{ letterSpacing: "0.24em", textTransform: "uppercase", color: "#9ca3af", fontSize: 12 }}>
        Hunter Backend
      </p>
      <h1 style={{ fontSize: 44, fontWeight: 300, marginBottom: 16 }}>
        Backend skeleton is ready
      </h1>
      <p style={{ color: "#d4d4d8", lineHeight: 1.7, maxWidth: 720 }}>
        Start with Prisma generation, run the database, then implement the next
        API layers for schedule, loyalty, analytics and SMS.
      </p>
      <ul style={{ color: "#a1a1aa", lineHeight: 1.8, paddingLeft: 20 }}>
        <li>`GET /api/services`</li>
        <li>`PATCH /api/services`</li>
        <li>`GET /api/clients`</li>
        <li>`POST /api/clients`</li>
        <li>`GET /api/bookings`</li>
        <li>`POST /api/bookings`</li>
      </ul>
    </main>
  );
};

export default HomePage;
