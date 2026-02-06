"use client";
import React from "react";
import { motion } from "motion/react";
import { TestimonialsColumn, Testimonial } from "./TestimonialsColumn";

const testimonials: Testimonial[] = [
  {
    text: "Receipt Generator saved me hours of work. I needed to recreate receipts for expense reports and this tool made it incredibly simple.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    name: "Sarah Chen",
    role: "Small Business Owner",
  },
  {
    text: "The template variety is impressive. I found exactly what I needed for my auto repair shop within minutes.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    name: "Michael Torres",
    role: "Auto Shop Manager",
  },
  {
    text: "Clean interface, professional results. I've recommended this to every small business owner I know.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    name: "Emily Watson",
    role: "Freelance Consultant",
  },
  {
    text: "The AI generator is a game-changer. I uploaded an old receipt and it matched the format perfectly.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    name: "David Kim",
    role: "Restaurant Owner",
  },
  {
    text: "Finally, a receipt generator that actually looks professional. The thermal paper texture option is genius.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    name: "Jessica Park",
    role: "E-commerce Manager",
  },
  {
    text: "I use this for my entire retail chain. The consistency and quality of receipts has improved customer trust.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    name: "Robert Martinez",
    role: "Retail Director",
  },
  {
    text: "The drag-and-drop editor makes customization so intuitive. No design skills needed at all.",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face",
    name: "Amanda Hughes",
    role: "Office Administrator",
  },
  {
    text: "Premium was worth every penny. No watermarks and unlimited downloads for my growing business.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
    name: "James Wilson",
    role: "Startup Founder",
  },
  {
    text: "Customer support is excellent. They helped me set up custom templates for our hotel chain.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
    name: "Lisa Thompson",
    role: "Hospitality Manager",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export const Testimonials = () => {
  return (
    <section className="py-24 lg:py-32 bg-paper-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold-100 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-gold-500 rounded-full" />
            <span className="text-xs font-medium text-gold-700">Testimonials</span>
          </div>

          <h2 className="font-display text-4xl lg:text-5xl text-ink-950 text-center mb-4">
            Trusted by thousands
          </h2>
          <p className="text-lg text-ink-600 text-center">
            See what our customers have to say about Receipt Generator
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
