"use client"

import { motion } from "framer-motion"
import { MapPin, Phone, Clock, Mail, ExternalLink, Facebook, Instagram } from "lucide-react"
import Link from "next/link"

const HOURS = [
  { day: "Monday",    time: "6:00 AM – 4:00 PM", open: true  },
  { day: "Tuesday",   time: "6:00 AM – 4:00 PM", open: true  },
  { day: "Wednesday", time: "6:00 AM – 4:00 PM", open: true  },
  { day: "Thursday",  time: "Closed",             open: false },
  { day: "Friday",    time: "6:00 AM – 4:00 PM", open: true  },
  { day: "Saturday",  time: "6:00 AM – 4:00 PM", open: true  },
  { day: "Sunday",    time: "6:00 AM – 4:00 PM", open: true  },
]

const CONTACT_INFO = [
  { icon: MapPin, label: "Address", value: "725 Indiana Ave, Sheboygan, WI 53081", href: "https://www.google.com/maps/place/Cafe+Bella/@43.7428898,-87.7125244,17z" },
  { icon: Phone,  label: "Phone",   value: "+1 (920) 395-2354",                    href: "tel:+19203952354" },
  { icon: Mail,   label: "Email",   value: "hello@cafebella.com",                   href: "mailto:hello@cafebella.com" },
]

const DIRECTIONS_URL = "https://www.google.com/maps/place/Cafe+Bella/@43.7428898,-87.7125244,17z/data=!4m15!1m8!3m7!1s0x8804a7328be7e7c9:0x17778c746e6d86b7!2sCafe+Bella!8m2!3d43.7428898!4d-87.7125244!10e9!16s%2Fg%2F11fkyd7fsr!3m5!1s0x8804a7328be7e7c9:0x17778c746e6d86b7!8m2!3d43.7428898!4d-87.7125244!16s%2Fg%2F11fkyd7fsr?entry=ttu&g_ep=EgoyMDI2MDUwNi4wIKXMDSoASAFQAw%3D%3D"

const MAPS_EMBED = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2921.858!2d-87.71470!3d43.74289!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8804a7328be7e7c9%3A0x17778c746e6d86b7!2sCafe%20Bella!5e0!3m2!1sen!2sus!4v1715000000000!5m2!1sen!2sus"

// Check if currently open (not Thursday and within hours)
function isOpenNow() {
  const now = new Date()
  const day = now.getDay() // 0=Sun, 4=Thu
  if (day === 4) return false
  const h = now.getHours() + now.getMinutes() / 60
  return h >= 6 && h < 16
}

export function ContactSection() {
  const openNow = isOpenNow()

  return (
    <section id="contact" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-sm font-medium text-accent uppercase tracking-widest">Find Us</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mt-3 mb-4">
            Visit Us in Sheboygan
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Come in, sit down, and let us cook something fresh for you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10 items-start">

          {/* Left — contact info + hours */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Contact details */}
            <div className="space-y-4">
              {CONTACT_INFO.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-all duration-300">
                      <Icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">{item.label}</p>
                      <p className="text-foreground font-medium group-hover:text-primary transition-colors">{item.value}</p>
                    </div>
                  </a>
                )
              })}
            </div>

            {/* Hours */}
            <div className="bg-card border border-border/60 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Hours of Operation</h3>
              </div>

              <div className="space-y-2">
                {HOURS.map((h) => (
                  <div key={h.day} className="flex justify-between text-sm">
                    <span className={h.open ? "text-muted-foreground" : "text-muted-foreground/60"}>
                      {h.day}
                    </span>
                    <span className={`font-medium ${h.open ? "text-foreground" : "text-red-400"}`}>
                      {h.time}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${openNow ? "bg-green-500" : "bg-red-400"}`} />
                <span className={`text-sm font-medium ${openNow ? "text-green-600" : "text-red-500"}`}>
                  {openNow ? "Open Now" : "Closed Now"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right — Google Maps */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 space-y-3"
          >
            <div className="rounded-2xl overflow-hidden border border-border/60 shadow-lg">
              <iframe
                src={MAPS_EMBED}
                width="100%"
                height="420"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Cafe Bella location on Google Maps"
              />
            </div>
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 rounded-xl transition-colors"
            >
              <MapPin className="h-4 w-4" />
              Get Directions in Google Maps
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="bg-foreground text-background/80">
      <div className="container mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <p className="text-2xl font-serif font-bold text-background mb-3">Cafe Bella</p>
            <p className="text-sm text-background/60 leading-relaxed max-w-xs">
              Sheboygan's favorite breakfast and lunch spot. Made fresh, served with love, every day except Thursday.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-background/10 hover:bg-background/20 rounded-xl flex items-center justify-center transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-background/10 hover:bg-background/20 rounded-xl flex items-center justify-center transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-background font-semibold mb-4">Quick Links</p>
            <ul className="space-y-2.5">
              {[
                { label: "Home",    href: "/" },
                { label: "Menu",    href: "/menu" },
                { label: "About",   href: "/#about" },
                { label: "Reviews", href: "/#reviews" },
                { label: "Contact", href: "/#contact" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-background/60 hover:text-background transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-background font-semibold mb-4">Contact</p>
            <ul className="space-y-3 text-sm text-background/60">
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>725 Indiana Ave<br />Sheboygan, WI 53081</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                <a href="tel:+19203952354" className="hover:text-background transition-colors">
                  +1 (920) 395-2354
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Mon–Wed, Fri–Sun: 6AM–4PM<br />Thursday: Closed</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-background/40">
          <p>© {new Date().getFullYear()} Cafe Bella. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
