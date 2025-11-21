import { Card, CardContent } from "@/components/ui/card";
import { 
  UserCheck, 
  Shield, 
  FileText, 
  Calendar, 
  BarChart3, 
  Bell,
  CheckCircle2
} from "lucide-react";
import featureComplianceImage from "@/assets/feature-compliance.jpg";
import featureRecruitmentImage from "@/assets/feature-recruitment.jpg";

const features = [
  {
    icon: UserCheck,
    title: "Smart Recruitment Portal",
    description: "Transform your hiring process with an intelligent application system that automatically screens, tracks, and manages childminder candidates from first contact to onboarding.",
    image: featureRecruitmentImage,
    points: [
      "Automated candidate screening and filtering",
      "Real-time application tracking dashboard",
      "Customizable application forms and workflows",
      "Integrated communication tools"
    ]
  },
  {
    icon: Shield,
    title: "Complete Compliance Suite",
    description: "Stay Ofsted-ready with built-in DBS verification, regulatory checks, and automated compliance monitoring for all applicants and household members.",
    image: featureComplianceImage,
    points: [
      "Enhanced DBS checks with barred lists",
      "Household member verification",
      "Automated renewal reminders",
      "Compliance status reporting"
    ]
  },
  {
    icon: FileText,
    title: "Document Management",
    description: "Secure centralized storage for all qualifications, certificates, and compliance documents.",
  },
  {
    icon: Calendar,
    title: "Availability Scheduling",
    description: "Coordinate childminder schedules, working hours, and branch locations effortlessly.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Track performance metrics, application pipelines, and compliance rates in real-time.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Automated alerts for renewals, applications, and critical compliance deadlines.",
  },
];

const Features = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Manage Your Agency</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Streamline your entire childminding operation from a single, powerful platform
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 mb-20">
          {features.slice(0, 2).map((feature, index) => (
            <Card key={index} className="border-2 border-border/50 hover:border-primary/40 transition-all duration-500 overflow-hidden group bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-2xl">
              <div className="h-72 overflow-hidden relative">
                <img 
                  src={feature.image} 
                  alt={feature.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
              <CardContent className="p-8">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-lg">
                  <feature.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6 text-base">
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  {feature.points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mt-0.5 flex-shrink-0">
                        <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <span className="text-sm text-foreground font-medium">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.slice(2).map((feature, index) => (
            <Card key={index} className="border-2 border-border/50 hover:border-primary/40 transition-all duration-300 group bg-card/50 backdrop-blur-sm hover:shadow-xl">
              <CardContent className="p-7">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center mb-5 group-hover:from-secondary/30 group-hover:to-accent/30 transition-colors">
                  <feature.icon className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
