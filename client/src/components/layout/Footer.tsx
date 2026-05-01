import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-12 mt-auto bg-slate-950 border-t border-slate-900 pb-24 md:pb-12">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-6">
        <span className="text-lg font-black text-slate-200 font-display-auction">
          GALLERY X
        </span>
        <div className="flex flex-wrap justify-center gap-6 font-display-auction text-xs tracking-wide text-slate-500">
          <Link href="#" className="hover:text-amber-500 transition-colors">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-amber-500 transition-colors">
            Terms of Service
          </Link>
          <Link href="#" className="hover:text-amber-500 transition-colors">
            Consign with Us
          </Link>
          <Link href="#" className="hover:text-amber-500 transition-colors">
            Affiliate Program
          </Link>
        </div>
        <p className="font-display-auction text-xs tracking-wide text-slate-500 text-center md:text-right">
          © 2024 GALLERY X AUCTION HOUSE. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}
