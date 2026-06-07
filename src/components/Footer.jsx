export default function Footer() {
  return (
    <footer className="bg-felt-950 border-t border-luck-goldMuted/30">
      <div className="section-divider" />
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-text-muted text-sm">© 2026 Julian Ting</span>

        {/* Taiwan flag micro-accent */}
        <div className="flex flex-col items-center gap-0.5" title="Made with ❤️ for Taiwan 🇹🇼" aria-label="Taiwan flag colors">
          <div className="w-10 h-0.5 bg-taiwan-red rounded-full" />
          <div className="w-10 h-0.5 bg-taiwan-blue rounded-full" />
          <div className="w-10 h-0.5 bg-taiwan-white/80 rounded-full" />
        </div>

        <span className="text-text-muted text-sm font-mono">Built with React + ♠</span>
      </div>
    </footer>
  )
}
