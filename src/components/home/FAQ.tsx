import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How long does it take to get started?",
    answer: "You can be up and running in less than 10 minutes. Simply sign up, add your agency details, and start inviting childminders or reviewing applications immediately."
  },
  {
    question: "Is ChildMinderPro Ofsted compliant?",
    answer: "Yes, our platform is designed with Ofsted requirements in mind. We include all necessary compliance checks, document storage, and reporting features to help you meet regulatory standards."
  },
  {
    question: "Can I migrate my existing childminder data?",
    answer: "Absolutely. We provide data import tools and dedicated support to help you migrate your existing childminder records, documents, and compliance data smoothly."
  },
  {
    question: "What support do you offer?",
    answer: "All plans include email support. Professional and Enterprise plans also include priority phone support. Enterprise customers get a dedicated account manager."
  },
  {
    question: "How secure is my data?",
    answer: "Security is our top priority. We use bank-level encryption, regular security audits, and comply with GDPR. All data is stored in secure UK-based servers."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time. No long-term contracts or cancellation fees. You'll have access until the end of your billing period."
  }
];

const FAQ = () => {
  return (
    <section className="py-32 relative overflow-hidden bg-gradient-to-b from-background via-accent/5 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Everything you need to know about ChildMinderPro
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-5">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card/80 backdrop-blur-sm border-2 border-border/50 rounded-2xl px-7 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-lg"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-bold text-base">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
