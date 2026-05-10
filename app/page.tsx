import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { FeaturedMenu } from "@/components/featured-menu"
import { AboutSection } from "@/components/about-section"
import { ReviewsSection } from "@/components/reviews-section"
import { ContactSection, Footer } from "@/components/contact-section"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <FeaturedMenu />
      <AboutSection />
      <ReviewsSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
