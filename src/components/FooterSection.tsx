const FooterSection = () => {
  return (
    <footer className="py-8 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-display text-lg tracking-[0.2em] uppercase text-foreground">
          Hunter
        </span>
        <span className="font-body text-xs text-muted-foreground tracking-wide">
          © {new Date().getFullYear()} Hunter Barbershop. Все права защищены.
        </span>
      </div>
    </footer>
  );
};

export default FooterSection;
