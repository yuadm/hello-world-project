import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import heroImage from "@/assets/hero-childcare.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column - Text content */}
          <div className="space-y-8 lg:pr-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full border border-primary/20">
                <span className="text-primary font-semibold text-sm tracking-wide">All-in-One Agency Management</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
                Transform Your{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Childminder Agency
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                Find, manage and onboard childminders seamlessly. Grow your childminding business with confidence and compliance.
              </p>
            </div>

            {/* Key benefits */}
            <div className="grid gap-4 pt-4">
              {[
                "Streamlined recruitment & vetting",
                "Built-in Ofsted compliance",
                "Automated document management",
                "Scale with ease"
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="text-primary-foreground h-4 w-4" />
                  </div>
                  <span className="text-foreground font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <NavLink to="/join">
                <Button size="lg" className="group w-full sm:w-auto text-base px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all">
                  Join as Agency
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </NavLink>
              <NavLink to="/apply">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 h-auto border-2 hover:bg-primary/5">
                  Apply as Childminder
                </Button>
              </NavLink>
            </div>

            <p className="text-sm text-muted-foreground pt-2">
              ✨ Join 200+ agencies already transforming their childminding operations
            </p>
          </div>

          {/* Right column - Image */}
          <div className="relative lg:block">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-border/50">
              <img 
                src={heroImage} 
                alt="Happy diverse children running and playing together outdoors in safe childcare environment" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
            </div>
            
            {/* Floating stats cards */}
            <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-2xl shadow-xl border border-border backdrop-blur-sm hidden lg:block animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <CheckCircle2 className="text-primary-foreground h-7 w-7" />
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">98%</div>
                  <div className="text-sm text-muted-foreground font-medium">Compliance Rate</div>
                </div>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 bg-card p-6 rounded-2xl shadow-xl border border-border backdrop-blur-sm hidden lg:block animate-in fade-in slide-in-from-top-4 duration-700 delay-150">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
                  <span className="text-2xl">🎉</span>
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">200+</div>
                  <div className="text-sm text-muted-foreground font-medium">Happy Agencies</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
