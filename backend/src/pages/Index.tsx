import HunterNav from "@/components/HunterNav";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import CosmeticsSection from "@/components/CosmeticsSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import FooterSection from "@/components/FooterSection";
import CookieBanner from "@/components/CookieBanner";

const Index = () => {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <HunterNav />
      <HeroSection />
      <ServicesSection />
      <CosmeticsSection />
      <AboutSection />
      <ContactSection />
      <FooterSection />
      <CookieBanner />
    </div>
  );
};

export default Index;
