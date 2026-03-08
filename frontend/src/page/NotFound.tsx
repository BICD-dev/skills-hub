import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <div className="bg-black px-6 py-5 flex items-center gap-6 border-b-4 border-yellow-400">
        <div>
          <p className="text-yellow-400 text-xs font-bold uppercase tracking-[0.3em] mb-0.5">
            TREM latterhouse sanctuary
          </p>
          <div className="w-50 h-14 flex items-center justify-center shrink-0">
            <img src="/assets/logo1.PNG" alt="Logo" className="w-full h-full object-contain" />
          </div>
        </div>
        <div className="ml-auto hidden sm:flex flex-col items-end">
          <span className="text-white/40 text-xs uppercase tracking-widest">Page Not Found</span>
          <span className="text-yellow-400 font-black text-sm">2026 Edition</span>
        </div>
      </div>

      {/* Accent stripe */}
      <div className="h-2 bg-gradient-to-r from-yellow-400 via-red-600 to-yellow-400" />

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div
          className="bg-white border-4 border-black shadow-[8px_8px_0_black]"
          style={{ animation: "popIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both" }}
        >
          {/* Card header */}
          <div className="bg-yellow-400 px-8 py-5 border-b-4 border-black">
            <h1 className="font-display text-5xl tracking-wide text-black font-black">404</h1>
            <p className="text-sm text-black/60 font-medium mt-2">
              Oops! Page not found
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-12 text-center">
            <div className="text-6xl mb-6">🔍</div>

            <h2 className="text-2xl font-black uppercase tracking-wide text-black mb-4">
              We couldn't find that page
            </h2>

            <p className="text-black/70 font-medium mb-8 max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved. Let's get you back on track!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="bg-yellow-400 border-4 border-black text-black font-black uppercase tracking-widest py-4 px-8 transition-all duration-200 hover:bg-black hover:text-yellow-400 hover:shadow-none active:translate-y-0.5 shadow-[4px_4px_0_black] text-center"
              >
                Back to Registration
              </Link>

              <Link
                to="/"
                className="bg-white border-4 border-black text-black font-black uppercase tracking-widest py-4 px-8 transition-all duration-200 hover:bg-black hover:text-yellow-400 active:translate-y-0.5 shadow-[4px_4px_0_black] text-center"
              >
                Home
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="h-1 w-16 bg-yellow-400 mx-auto mb-4" />
          <p className="text-xs text-black/40 uppercase tracking-widest">
            © 2026 TREM latterhouse sanctuary · Lead Conference
          </p>
        </div>
      </div>
    </div>
  );
}
