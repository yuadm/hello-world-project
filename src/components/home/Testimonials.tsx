import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Director",
    company: "Little Steps Childminding",
    content: "ChildMinderPro has transformed how we manage our agency. The compliance tracking alone has saved us countless hours and given us peace of mind.",
    rating: 5
  },
  {
    name: "James Thompson",
    role: "Owner",
    company: "Caring Hands Agency",
    content: "The recruitment portal is a game-changer. We've reduced our hiring time by 60% and found better quality candidates. Absolutely worth it.",
    rating: 5
  },
  {
    name: "Emma Roberts",
    role: "Manager",
    company: "Sunshine Childcare",
    content: "Finally, a platform built specifically for childminder agencies. The Ofsted compliance features are exactly what we needed.",
    rating: 5
  }
];

const Testimonials = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Leading Agencies</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            See how ChildMinderPro is transforming childminding agencies across the UK
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-2 border-border/50 hover:border-primary/30 transition-all duration-500 bg-card/80 backdrop-blur-sm hover:shadow-2xl group">
              <CardContent className="pt-8 pb-8">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent transition-transform group-hover:scale-110 duration-300" style={{ transitionDelay: `${i * 50}ms` }} />
                  ))}
                </div>
                
                <p className="text-foreground mb-8 leading-relaxed italic text-base">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-4 pt-6 border-t-2 border-border/50">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <span className="text-primary-foreground font-bold text-lg">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground font-medium">{testimonial.role}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
