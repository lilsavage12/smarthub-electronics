"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Shield, Truck, Clock, ArrowRight, Zap,
  Smartphone, Sparkles, ChevronRight, Star,
  Activity, Globe, Box, ShieldCheck, Heart,
  Mail, Gift
} from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { PRODUCTS, BRANDS } from "@/lib/mock-data"
import { ProductCard } from "@/components/products/ProductCard"
import { cn } from "@/lib/utils"

export default function Home() {
  const [products, setProducts] = React.useState<any[]>([])
  const [promos, setPromos] = React.useState<any[]>([])
  const [email, setEmail] = React.useState("")
  const [banner, setBanner] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [homeConfig, setHomeConfig] = React.useState<any>(null)

  React.useEffect(() => {
    const fetchHomePromos = async () => {
      try {
        const res = await fetch("/api/promotions?showOnHome=true")
        if (res.ok) {
          const data = await res.json()
          setPromos(data)
        }
      } catch (error) {
        console.error(error)
      }
    }

    const fetchBanner = async () => {
      try {
        const res = await fetch("/api/banner")
        if (res.ok) {
          const data = await res.json()
          if (data && data.title && data.isActive) {
            setBanner(data)
          }
        }
      } catch (error) {
        console.error(error)
      }
    }

    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products")
        if (res.ok) {
          const data = await res.json()
          setProducts(data)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchHomeConfig = async () => {
      try {
        const res = await fetch("/api/config/homepage")
        if (res.ok) {
          const data = await res.json()
          setHomeConfig(data)
        }
      } catch (error) {
        console.error("Home config fetch failed")
      }
    }

    fetchHomePromos()
    fetchBanner()
    fetchProducts()
    fetchHomeConfig()
  }, [])

  const flashSales = products.filter(p => p.promotions?.some((promo: any) => promo.category === 'FLASH_SALE'))
  const dailyDeals = products.filter(p => p.promotions?.some((promo: any) => promo.category === 'DAILY_DEAL'))
  const seasonalCampaigns = promos.filter(p => p.category === 'SEASONAL' && p.isActive)
  const otherActivePromos = promos.filter(p => !['FLASH_SALE', 'DAILY_DEAL', 'SEASONAL'].includes(p.category) && p.isActive)
  
  // Sort by Featured (Priority 1) then Newest (Priority 2)
  const featuredProducts = [...products]
    .sort((a, b) => {
      const aFeat = a.specs?.identity?.isFeatured ? 1 : 0
      const bFeat = b.specs?.identity?.isFeatured ? 1 : 0
      if (aFeat !== bFeat) return bFeat - aFeat
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    .slice(0, 12)

  const sortedSections = homeConfig ? Object.keys(homeConfig).sort((a, b) => homeConfig[a].order - homeConfig[b].order) : ['flashSale', 'dailyDeals', 'seasonal', 'featured']

  const handleSubscribe = () => {
    if (!email) return toast.error("Please enter email")
    toast.success("Joined the Inner Circle!")
    setEmail("")
  }

  return (
    <div className="flex flex-col gap-16 overflow-x-hidden bg-background text-foreground">
      {/* Premium Hero Section */}
      <section className="relative min-h-[70vh] w-full flex items-center justify-center overflow-hidden bg-background">
        {/* Animated Background Silos */}
        <div className="absolute inset-0 z-0 opacity-30">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]"
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 backdrop-blur-xl px-3 py-1 rounded-full w-fit">
              <Sparkles className="w-3.5 h-3.5 text-primary" fill="currentColor" />
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Titanium Launch 2026</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-[-0.05em] leading-[0.9] font-outfit text-foreground uppercase italic">
              UPGRADE YOUR <br />
              <span className="gradient-text">SMART LIFE</span>
            </h1>

            <p className="text-base text-muted-foreground max-w-sm leading-relaxed font-medium">
              Discover the finest collection of premium smartphones and technology for your digital lifestyle.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-2">
              <Link href="/products">
                <Button size="lg" variant="premium" className="px-8 h-12 text-[10px] font-black italic tracking-widest shadow-xl shadow-primary/20 group">
                  SHOP PRODUCTS
                  <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-8 mt-4 pt-8 border-t border-border">
              {[
                { label: "Products Sold", val: "4.2K+" },
                { label: "Delivery", val: "Fast & Safe" },
                { label: "Rating", val: "99.8%" }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-xl font-black italic">{stat.val}</span>
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Floating Product Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="hidden lg:flex justify-end relative"
          >
            <div className="relative w-[400px] h-[500px] group">
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 z-10 p-4 flex items-center justify-center"
              >
                <div className="relative w-full h-full bg-muted/30 rounded-[3rem] p-1 shadow-xl overflow-hidden border border-border">
                  <div className="w-full h-full bg-card rounded-[2.8rem] flex items-center justify-center relative overflow-hidden p-8">
                    <Image
                      src="/images/lumina_zx_white.png"
                      alt="Lumina ZX Proto"
                      fill
                      className="object-contain p-8 hover:scale-105 transition-transform duration-1000"
                      priority
                    />
                  </div>
                </div>
              </motion.div>
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-[80px] -z-1" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Operational Feed / Brands */}
      <section className="px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 py-8 border-y border-border">
          <div className="flex items-center gap-3">
            <Activity className="text-primary w-5 h-5 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground leading-none">Global Availability</span>
              <p className="text-[10px] font-bold italic text-foreground mt-1">REAL-TIME STOCK UPDATES</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 transition-all duration-500">
            {BRANDS.map((brand) => (
              <span key={brand.name} className="text-lg font-black font-outfit tracking-tighter hover:text-primary hover:scale-105 cursor-pointer transition-all">{brand.name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* DYNAMIC BANNER SECTION */}
      {banner && (
        <section className="px-6">
          <div className="max-w-6xl mx-auto bg-slate-950 rounded-[3rem] p-8 md:p-12 relative overflow-hidden group border border-border shadow-2xl">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent bg-contain opacity-40 z-0" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="flex flex-col gap-6 text-center lg:text-left flex-1">
                <div className="flex items-center justify-center lg:justify-start gap-4">
                  <div className="flex items-center gap-2 bg-primary px-4 py-1.5 rounded-full shadow-lg shadow-primary/20">
                    <Zap className="w-4 h-4 text-white fill-white animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest italic">{banner.title}</span>
                  </div>
                </div>
                <h2 className="text-4xl md:text-6xl font-black font-outfit text-white uppercase tracking-tighter italic leading-[0.85] drop-shadow-lg">
                  {banner.subtitle}
                </h2>

                {banner.startsIn && (
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-4">
                    <div className="flex flex-col items-center bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
                      <span className="text-2xl font-black font-outfit italic tracking-tighter text-white">{banner.startsIn}</span>
                      <span className="text-[8px] font-black uppercase text-white/40 tracking-[0.2em] mt-1">TIME LEFT</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 flex justify-center scale-110 relative">
                <Image
                  src="/images/lumina_watch_black.png"
                  alt="Elite Watch"
                  width={340}
                  height={340}
                  className="object-contain drop-shadow-[0_40px_100px_rgba(255,255,255,0.15)] hover:scale-110 transition-transform duration-1000 z-10 relative"
                />
                {banner.discountCode && (
                  <div className="absolute -bottom-4 right-1/4 bg-white/95 backdrop-blur-xl p-6 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col items-center rotate-6 border border-white/20 z-20">
                    <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40 leading-none mb-1">PROMO CODE</span>
                    <span className="text-2xl font-black text-slate-900 italic tracking-widest">{banner.discountCode}</span>
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">APPLY AT CHECKOUT</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 items-center lg:items-end w-full lg:w-auto mt-8 lg:mt-0">
                <Link href="/products" className="w-full">
                  <Button variant="premium" className="w-full lg:w-auto h-20 px-12 rounded-[2rem] text-lg font-black italic tracking-widest shadow-2xl shadow-primary/40 group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <span>CLAIM DEAL</span>
                    <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                {banner.targetReach && (
                  <div className="flex flex-col items-end gap-1.5 mt-4 w-full">
                    <div className="flex justify-between w-full lg:w-64 mb-1">
                      <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest italic pt-2">Campaign Goal</span>
                      <span className="text-white/60 text-[10px] font-black italic pt-2">{banner.targetReach}</span>
                    </div>
                    <div className="w-full lg:w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${banner.progress}%` }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* DYNAMIC SECTIONS RENDERER */}
      {sortedSections.map((sectionKey) => {
        const config = homeConfig ? homeConfig[sectionKey] : { visible: true, title: "" }
        if (!config.visible) return null

        if (sectionKey === 'flashSale' && flashSales.length > 0) {
          return (
            <section key={sectionKey} className="px-6 max-w-6xl mx-auto w-full">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="bg-rose-600 text-white p-3 rounded-2xl shadow-xl shadow-rose-600/20">
                    <Zap className="w-8 h-8 fill-white animate-pulse" />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-3xl font-black font-outfit uppercase italic tracking-tighter">{config.title || "FLASH SALES"}</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">LIMITED TIME OFFERS • EXPIRES SOON</p>
                  </div>
                </div>
                <Link href="/deals/flash" className="flex items-center gap-2 text-[10px] font-black italic uppercase tracking-widest text-rose-600 group underline decoration-1 underline-offset-4">
                  VIEW ALL FLASH DEALS
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {flashSales.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )
        }

        if (sectionKey === 'dailyDeals' && dailyDeals.length > 0) {
          return (
            <section key={sectionKey} className="px-6 bg-muted/30 py-16 rounded-[4rem]">
              <div className="max-w-6xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-amber-500 text-white p-3 rounded-2xl shadow-xl shadow-amber-500/20">
                      <Gift className="w-8 h-8 fill-white" />
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-3xl font-black font-outfit uppercase italic tracking-tighter">{config.title || "DAILY DEALS"}</h2>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">SPECIAL PRICING • REFRESHES EVERY 24H</p>
                    </div>
                  </div>
                  <Link href="/deals/daily" className="flex items-center gap-2 text-[10px] font-black italic uppercase tracking-widest text-amber-500 group underline decoration-1 underline-offset-4">
                    EXPLORE DAILY REVIEWS
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {dailyDeals.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </section>
          )
        }

        if (sectionKey === 'seasonal' && seasonalCampaigns.length > 0) {
          return (
            <section key={sectionKey} className="px-6">
              <div className="max-w-6xl mx-auto flex flex-col gap-8">
                {seasonalCampaigns.map((promo) => (
                  <div key={promo.id} className="relative w-full aspect-[21/9] md:aspect-[32/10] rounded-[3rem] overflow-hidden group border border-border bg-slate-900">
                    {promo.bannerUrl ? (
                      <img src={promo.bannerUrl} alt={promo.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-purple-600/20 to-background opacity-60" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
                    <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-center gap-6">
                      <div className="flex items-center gap-2 bg-purple-600 text-white px-4 py-1.5 rounded-full w-fit">
                        <Sparkles size={14} fill="white" />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">{promo.title}</span>
                      </div>
                      <h2 className="text-4xl md:text-6xl font-black font-outfit uppercase italic tracking-tighter leading-[0.85] max-w-xl text-foreground">
                        {promo.description || "Limited seasonal synchronization active."}
                      </h2>
                      <Link href="/deals/seasonal">
                        <Button variant="premium" className="h-16 px-10 rounded-2xl text-[10px] font-black italic uppercase tracking-widest shadow-2xl shadow-primary/20">
                          EXPLORE CAMPAIGN
                          <ChevronRight size={18} className="ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        }

        if (sectionKey === 'featured') {
          return (
            <section key={sectionKey} className="px-6 max-w-6xl mx-auto w-full">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 bg-foreground text-background w-fit px-3 py-1 rounded-full">
                    <Zap size={12} fill="currentColor" />
                    <span className="text-[8px] font-black uppercase tracking-widest">In Stock</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black font-outfit uppercase tracking-tighter italic">{config.title || "BEST SELLERS"}</h2>
                </div>
                <Link href="/products" className="flex items-center gap-2 text-[10px] font-black italic uppercase tracking-widest text-primary group underline decoration-1 underline-offset-4">
                  VIEW ALL PRODUCTS
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )
        }

        return null
      })}

      {/* ADDITIONAL CAMPAIGNS (REGULAR/EXCLUSIVE) */}
      {otherActivePromos.length > 0 && (
        <section className="px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {otherActivePromos.map((promo) => (
              <div key={promo.id} className="relative aspect-[21/9] rounded-[2rem] overflow-hidden group border border-border bg-muted/20">
                {promo.bannerUrl ? (
                  <img src={promo.bannerUrl} alt={promo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent flex items-center justify-center">
                    <Gift className="text-primary/20 w-24 h-24" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex flex-col justify-end p-8">
                  <div className="bg-primary px-3 py-1 rounded-full w-fit mb-2">
                    <span className="text-[10px] font-black text-white uppercase italic">{promo.category}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white italic lowercase tracking-tighter">{promo.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="px-6 py-8">
        <div className="max-w-6xl mx-auto bg-card rounded-[3rem] p-8 md:p-16 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12 border border-border/50 shadow-2xl">
          <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-primary/10 blur-[150px] pointer-events-none" />

          <div className="flex-1 flex flex-col gap-6 relative z-10 text-center lg:text-left">
            <h3 className="text-3xl md:text-5xl font-black text-foreground leading-[0.9] font-outfit uppercase italic">
              UPGRADE <br />
              <span className="text-primary">YOUR PHONE.</span>
            </h3>
            <p className="text-muted-foreground text-base max-w-sm font-medium leading-relaxed">Our AI evaluations your device and gives you instant credit for a new one.</p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-2">
              <Link href="/trade-in">
                <Button size="lg" className="px-8 h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-black italic tracking-widest uppercase rounded-xl">Value My Device</Button>
              </Link>
            </div>
          </div>

          <div className="flex-1 relative w-full h-[300px] group">
            <div className="w-full h-full bg-background/50 rounded-[2rem] flex items-center justify-center overflow-hidden p-8 border border-border">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-full h-full"
              >
                <Image src="/images/lumina_fold.png" alt="Trade In" fill className="object-contain p-6" />
              </motion.div>
            </div>
            <div className="absolute bottom-6 right-6 bg-primary px-4 py-2 rounded-xl shadow-xl flex flex-col items-center">
              <span className="text-[8px] font-black text-white uppercase tracking-widest">CASH BACK</span>
              <span className="text-xl font-black text-white italic mt-0.5">$800+</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Hub */}
      <section className="px-6 py-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: "ZERO INTEREST", sub: "Split your payments over 12 months at 0% APR.", icon: <Clock className="text-primary" />, color: "bg-primary/10" },
            { title: "FULL WARRANTY", sub: "24-month hardware coverage on all premium products.", icon: <ShieldCheck className="text-emerald-500" />, color: "bg-emerald-500/10" },
            { title: "EXPRESS SHIPPING", sub: "Fast delivery to your doorstep within hours.", icon: <Globe className="text-purple-500" />, color: "bg-purple-500/10" }
          ].map((pillar, i) => (
            <div key={i} className="flex flex-col gap-4 group transition-all duration-300">
              <div className={cn("p-4 rounded-2xl w-fit", pillar.color)}>
                {React.cloneElement(pillar.icon as React.ReactElement<any>, { size: 24 })}
              </div>
              <h4 className="text-lg font-black font-outfit uppercase italic tracking-tighter">{pillar.title}</h4>
              <p className="text-muted-foreground text-[13px] font-medium leading-relaxed">{pillar.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 bg-card border-t border-border relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center flex flex-col gap-8 items-center relative z-10">
          <div className="p-3 bg-muted rounded-2xl border border-border w-fit">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black font-outfit text-foreground uppercase italic leading-[0.9]">JOIN THE <span className="text-primary">CLUB</span></h2>
          <p className="text-base text-muted-foreground font-medium max-w-xl">Sign up for exclusive flagship launches and special pricing access.</p>
          <div className="flex flex-col sm:flex-row gap-4 w-full mt-4 max-w-2xl">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ENTER YOUR EMAIL"
              className="flex-1 bg-background px-8 py-4 rounded-xl border border-border outline-none focus:border-primary transition-all text-[11px] font-black text-foreground uppercase tracking-widest shadow-xl"
            />
            <Button onClick={handleSubscribe} size="lg" className="px-10 h-14 bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] font-black italic tracking-widest uppercase rounded-xl shadow-lg shadow-primary/10 transition-all duration-500">SUBSCRIBE NOW</Button>
          </div>
        </div>
      </section>
    </div>
  )
}
