import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl rounded-3xl p-16 border-2 border-border/50 shadow-2xl">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
            Ready to Transform Your{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Childminding Agency?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
            Join hundreds of agencies already streamlining their operations with ChildMinderPro
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <NavLink to="/join">
              <Button size="lg" className="group w-full sm:w-auto text-base px-10 py-7 h-auto shadow-xl hover:shadow-2xl transition-all">
                Join as Agency
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </NavLink>
            <NavLink to="/apply">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-10 py-7 h-auto border-2 hover:bg-primary/5 shadow-lg">
                Apply as Childminder
              </Button>
            </NavLink>
          </div>
          <p className="text-sm text-muted-foreground mt-8">
            No credit card required • Get started in minutes • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
