import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Smartphone, Home, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <main className="flex-1 flex flex-col items-center justify-center py-24 px-6 text-center min-h-[70vh]" suppressHydrationWarning>
            <div className="relative group mb-8" suppressHydrationWarning>
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                <Smartphone className="w-32 h-32 lg:w-48 lg:h-48 text-primary relative z-10 transition-transform group-hover:scale-110 duration-500" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl font-black opacity-10 tracking-tighter select-none">
                    404
                </div>
            </div>

                <h1 className="text-4xl lg:text-7xl font-black  uppercase tracking-tighter mb-4 font-outfit" suppressHydrationWarning>
                    Connection <span className="text-primary">Lost</span>
                </h1>

                <p className="max-w-md text-muted-foreground text-sm uppercase tracking-widest font-bold mb-12  opacity-60" suppressHydrationWarning>
                    The page you requested was intercepted or moved. Error code: 0x404_NOT_FOUND.
                </p>

                <div className="flex flex-col sm:flex-row gap-4" suppressHydrationWarning>
                    <Link href="/">
                        <Button size="lg" className="h-16 px-10 rounded-2xl bg-primary text-primary-foreground font-black  uppercase tracking-widest text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all">
                            <Home className="w-4 h-4 mr-2" />
                            Return Home
                        </Button>
                    </Link>
                    <Link href="/products">
                        <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl border-2 font-black  uppercase tracking-widest text-xs hover:bg-slate-900 hover:text-white transition-all">
                            <Search className="w-4 h-4 mr-2" />
                            Search Inventory
                        </Button>
                    </Link>
                </div>
            </main>
    );
}
