import { redirect } from "next/navigation";
import AdminLogoutButton from "@/app/admin/AdminLogoutButton";
import AdminNav from "@/app/admin/AdminNav";
import AdminBrand from "@/app/admin/AdminBrand";
import ReviewStatusControl from "@/app/admin/reviews/ReviewStatusControl";
import { getCurrentAdminSession } from "@/lib/auth";
import { listReviews } from "@/lib/reviews-store";

const renderStars = (rating: number) =>
  Array.from({ length: 5 }, (_, index) => (index < rating ? "★" : "☆")).join("");

const AdminReviewsPage = async () => {
  const admin = await getCurrentAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  const reviews = await listReviews({ take: 100 });

  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 24px 72px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 24,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ marginBottom: 16 }}>
            <AdminBrand />
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 300, margin: "10px 0 8px" }}>Отзывы</h1>
          <p style={{ color: "#a1a1aa", maxWidth: 720, lineHeight: 1.7 }}>
            Здесь появляются отзывы, которые посетители оставляют прямо на сайте.
          </p>
        </div>

        <AdminLogoutButton />
      </div>

      <AdminNav />

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          { label: "Всего отзывов", value: reviews.length },
          { label: "Новых", value: reviews.filter((review) => review.status === "new").length },
          { label: "Опубликованных", value: reviews.filter((review) => review.status === "published").length },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(18,18,18,0.92)",
              padding: 20,
            }}
          >
            <p style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "#9ca3af" }}>
              {item.label}
            </p>
            <p style={{ fontSize: 32, fontWeight: 300, margin: "12px 0 0" }}>{item.value}</p>
          </div>
        ))}
      </section>

      <section
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(18,18,18,0.92)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(180px,0.9fr) minmax(170px,0.8fr) minmax(120px,0.6fr) minmax(260px,1.6fr) minmax(150px,0.8fr)",
            gap: 16,
            padding: 16,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            fontSize: 12,
          }}
        >
          <span>Клиент</span>
          <span>Услуга</span>
          <span>Оценка</span>
          <span>Отзыв</span>
          <span>Статус</span>
        </div>

        {reviews.length === 0 ? (
          <p style={{ margin: 0, padding: 24, color: "#a1a1aa" }}>Пока отзывов с сайта нет.</p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(180px,0.9fr) minmax(170px,0.8fr) minmax(120px,0.6fr) minmax(260px,1.6fr) minmax(150px,0.8fr)",
                gap: 16,
                padding: 16,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                alignItems: "start",
              }}
            >
              <div style={{ display: "grid", gap: 6 }}>
                <strong style={{ fontSize: 16, fontWeight: 500 }}>{review.customer_name}</strong>
                <span style={{ color: "#9ca3af", fontSize: 12 }}>
                  {new Date(review.created_at).toLocaleString("ru-RU")}
                </span>
              </div>

              <span style={{ color: "#d4d4d8" }}>{review.service_label || "—"}</span>

              <span style={{ color: "#f5f5f5" }}>{renderStars(review.rating)}</span>

              <p style={{ margin: 0, color: "#a1a1aa", lineHeight: 1.6 }}>{review.message}</p>

              <ReviewStatusControl reviewId={review.id} currentStatus={review.status} />
            </div>
          ))
        )}
      </section>
    </main>
  );
};

export default AdminReviewsPage;
