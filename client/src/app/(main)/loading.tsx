export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="relative flex items-center justify-center w-24 h-24 mb-6">
        <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-r-2 border-tertiary rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        <span className="material-symbols-outlined text-4xl text-on-surface animate-pulse">diamond</span>
      </div>
      <h2 className="font-display-auction text-2xl font-bold tracking-widest text-on-surface uppercase mb-2">GALLERY X</h2>
      <p className="font-label-bold text-xs tracking-[0.2em] text-on-surface-variant uppercase">Loading Experience</p>
    </div>
  );
}
