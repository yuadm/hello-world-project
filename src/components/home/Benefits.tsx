import { Card, CardContent } from "@/components/ui/card";
import { Clock, TrendingUp, Award, Users } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Save Time on Recruiting",
    description: "Automate your hiring process and reduce recruitment time by up to 70%",
    stat: "70%",
    statLabel: "Time Saved"
  },
  {
    icon: Award,
    title: "Compliance Made Easy",
    description: "Built-in Ofsted regulatory checks ensure you're always compliant",
    stat: "100%",
    statLabel: "Compliant"
  },
  {
    icon: Users,
    title: "Professional Image",
    description: "Manage all childminders under one unified, professional platform",
    stat: "200+",
    statLabel: "Agencies"
  },
  {
    icon: TrendingUp,
    title: "Scale with Confidence",
    description: "One platform to grow your agency from startup to enterprise",
    stat: "5x",
    statLabel: "Growth"
  },
];

const Benefits = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-background to-primary/5" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">ChildMinderPro</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Join hundreds of agencies transforming their childminding operations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <Card 
              key={index}
              className="border-2 border-border/50 hover:border-primary/40 transition-all duration-500 group bg-card/80 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-2"
            >
              <CardContent className="pt-8 pb-8">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center mb-6 group-hover:from-secondary/30 group-hover:to-accent/30 transition-all group-hover:scale-110 duration-500 shadow-lg">
                  <benefit.icon className="h-10 w-10 text-secondary" />
                </div>
                
                <h3 className="text-xl font-bold mb-3 tracking-tight">{benefit.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                  {benefit.description}
                </p>
                
                <div className="pt-6 border-t-2 border-border/50">
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                    {benefit.stat}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {benefit.statLabel}
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

export default Benefits;
