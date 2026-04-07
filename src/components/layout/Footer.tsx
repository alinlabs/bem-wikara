import { Link } from "react-router-dom";
import { Instagram, Mail, MapPin, ArrowUpRight, Github, Twitter } from "lucide-react";
import { Trans } from "@/components/ui/Trans";

export function Footer() {
  return (
    <footer className="hidden md:block bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 pt-16 pb-8 border-t border-slate-200 dark:border-slate-800/60 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-500/5 dark:bg-primary-900/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-12 gap-8 mb-12">
          <div className="col-span-5">
            <Link to="/" className="flex flex-col gap-1 mb-6 group w-fit">
              <span className="font-heading font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
                CAKRAWALA
              </span>
              <span className="text-xs font-light tracking-wider text-slate-500 dark:text-slate-500">
                BEM STIE WIKARA 2025/2026
              </span>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 max-w-sm mb-8 text-sm leading-relaxed font-light">
              <Trans>Portal resmi Musyawarah Besar dan Laporan Pertanggung Jawaban BEM STIE WIKARA Periode 2025/2026. Akhir perjalanan, awal perubahan menuju masa depan yang lebih cerah.</Trans>
            </p>
          </div>
          
          <div className="col-span-3 col-start-7">
            <h3 className="text-slate-900 dark:text-white font-medium mb-5 text-sm tracking-wider uppercase"><Trans>Tautan Cepat</Trans></h3>
            <ul className="space-y-3">
              {[
                { name: "Laporan Pertanggung Jawaban", path: "/lpj" },
                { name: "Musyawarah Besar", path: "/mubes" },
                { name: "Draft AD/ART", path: "/adart" }
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center group w-fit">
                    <span className="group-hover:translate-x-1 transition-transform"><Trans>{link.name}</Trans></span>
                    <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="col-span-3">
            <h3 className="text-slate-900 dark:text-white font-medium mb-5 text-sm tracking-wider uppercase"><Trans>Kontak</Trans></h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-slate-600 dark:text-slate-400 group">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 group-hover:border-primary-500/50 transition-colors">
                  <MapPin className="w-4 h-4 text-primary-500" />
                </div>
                <span className="mt-0.5 text-sm leading-relaxed"><Trans>Sekretariat BEM STIE WIKARA</Trans><br/><Trans>Jl. Jend. Ahmad Yani No.21, Nagri Tengah, Kec. Purwakarta, Kabupaten Purwakarta, Jawa Barat 41114</Trans></span>
              </li>
              <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400 group">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 group-hover:border-primary-500/50 transition-colors">
                  <Mail className="w-4 h-4 text-primary-500" />
                </div>
                <span className="text-sm">halo.wikara@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/50 flex items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <p><Trans>&copy; 2026 BEM CAKRAWALA STIE WIKARA. Hak Cipta Dilindungi.</Trans></p>
          <p className="flex items-center gap-1">
            <Trans>Dibuat untuk almamater tercinta.</Trans>
          </p>
        </div>
      </div>
    </footer>
  );
}
