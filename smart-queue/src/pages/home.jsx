import React from 'react'
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";

import Hero from "../components/sections/hero";
import Stats from "../components/sections/stats";
import Specialties from "../components/sections/specialties";
import AIPreview from "../components/sections/aiPreview";
import Testimonials from "../components/sections/testimonials";
import Features from "../components/sections/features";
import HowItWorks from "../components/sections/howitworks";
import CTA from "../components/sections/CTA";
import CarouselRail from "../components/sections/carouselRail";

const featuredDoctors = [
  {
    id: "dr-ananya",
    name: "Dr. Ananya Sen",
    specialty: "Cardiology",
    description: "Trusted for heart checkups, preventive care, and live slot management.",
    image: "https://images.pexels.com/photos/7338727/pexels-photo-7338727.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    id: "dr-rohan",
    name: "Dr. Rohan Mehta",
    specialty: "Orthopedics",
    description: "Joint pain, sports injuries, and recovery planning in one place.",
    image: "https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    id: "dr-priya",
    name: "Dr. Priya Sharma",
    specialty: "Gynecology",
    description: "Family-focused consultation with calm, clear appointment support.",
    image: "https://images.pexels.com/photos/5214959/pexels-photo-5214959.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    id: "dr-kunal",
    name: "Dr. Kunal Roy",
    specialty: "Neurology",
    description: "Headache, dizziness, and nervous system care with quick access.",
    image: "https://images.pexels.com/photos/8460153/pexels-photo-8460153.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    id: "dr-meera",
    name: "Dr. Meera Das",
    specialty: "Dermatology",
    description: "Skin care guidance with modern, easy-to-book consultations.",
    image: "https://images.pexels.com/photos/5327584/pexels-photo-5327584.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
];

const patientStories = [
  {
    id: "story-1",
    title: "Fast booking, less waiting",
    image: "https://images.pexels.com/photos/7089023/pexels-photo-7089023.jpeg?auto=compress&cs=tinysrgb&w=900",
    text: "Patients move from symptom to specialist with fewer clicks and a clearer flow.",
  },
  {
    id: "story-2",
    title: "Reception-ready QR passes",
    image: "https://images.pexels.com/photos/7089237/pexels-photo-7089237.jpeg?auto=compress&cs=tinysrgb&w=900",
    text: "Appointments are easy to verify, check in, and keep organized at the desk.",
  },
  {
    id: "story-3",
    title: "Clear confirmation journey",
    image: "https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg?auto=compress&cs=tinysrgb&w=900",
    text: "The patient gets a calm, premium confirmation flow after payment completes.",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <CarouselRail
        eyebrow="Featured doctors"
        title="A few specialists worth spotlighting"
        description="These cards give the home page more depth and help people understand the clinic’s care network at a glance."
        items={featuredDoctors}
        renderItem={(doctor) => (
          <div className="glass-card overflow-hidden rounded-[1.7rem] border border-white/10">
            <div className="relative h-64">
              <img src={doctor.image} alt={doctor.name} className="h-full w-full object-cover object-top" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,20,0.08),rgba(5,8,20,0.88))]" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">{doctor.specialty}</p>
                <h3 className="mt-1 text-2xl font-black">{doctor.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-100/80">{doctor.description}</p>
              </div>
            </div>
          </div>
        )}
      />
      <Stats />
      <Specialties />
      <AIPreview />
      <Features />
      <Testimonials />
      <CarouselRail
        eyebrow="Patient stories"
        title="Why the flow feels easier"
        description="A second carousel adds more content depth with visual proof points, so the landing page feels less static and more complete."
        items={patientStories}
        renderItem={(story) => (
          <div className="glass-card overflow-hidden rounded-[1.7rem] border border-white/10">
            <div className="relative h-64">
              <img src={story.image} alt={story.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,20,0.1),rgba(5,8,20,0.9))]" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-2xl font-black">{story.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-100/80">{story.text}</p>
              </div>
            </div>
          </div>
        )}
      />
      <HowItWorks />
      <CTA />
      <Footer />
    </>
  );
}
