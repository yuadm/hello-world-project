import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { ArrowRight, ChevronDown } from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import { useState, useEffect } from "react";

const cyclingWords = ["Flexible", "Safe", "Compliant", "Trusted", "Bespoke"];

const Hero = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % cyclingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const scrollToValues = () => {
    document.getElementById("values")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src={heroImage} alt="Children playing" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-foreground/50" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          {/* Text content */}
          <div className="space-y-6 text-primary-foreground">
            <div className="inline-block px-4 py-2 bg-primary/20 backdrop-blur-sm rounded-full">
              <span className="text-primary-foreground font-semibold text-sm font-poppins">Forward-Thinking Childcare</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight font-poppins">
              Forward‑Thinking Care That Puts Kids First
            </h1>
            
            {/* Cycling tagline */}
            <div className="h-12 flex items-center">
              <span className="text-2xl lg:text-3xl font-semibold font-poppins">
                <span className="text-secondary transition-all duration-500">
                  {cyclingWords[currentWordIndex]}
                </span>
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <NavLink to="/parents">
                <Button size="lg" className="group w-full sm:w-auto">
                  Find Childcare
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </NavLink>
              <NavLink to="/childminders">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Become a Childminder
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToValues}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors cursor-pointer group"
        aria-label="Scroll to learn more"
      >
        <span className="text-sm font-medium">Learn More</span>
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </button>
    </section>
  );
};

export default Hero;
