import HunterNav from "@/components/HunterNav";
import HeroSection from "@/components/HeroSection";
import BookingSection from "@/components/BookingSection";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <HunterNav />
      <HeroSection />
      <BookingSection />
      <ServicesSection />
      <AboutSection />
      <ContactSection />
      <FooterSection />
    </div>
  );
};

export default Index;
