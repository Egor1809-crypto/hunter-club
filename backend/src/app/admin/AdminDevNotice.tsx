const AdminDevNotice = ({ message }: { message: string }) => {
  return (
    <section
      style={{
        border: "1px solid rgba(250, 204, 21, 0.24)",
        background: "rgba(113, 63, 18, 0.18)",
        color: "#fef3c7",
        padding: 18,
        marginBottom: 24,
        lineHeight: 1.7,
      }}
    >
      {message}
    </section>
  );
};

export default AdminDevNotice;
