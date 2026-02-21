import { Moon, MapPin, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Moon className="h-5 w-5" />
              <span className="font-serif text-xl font-bold">JejakMasjid</span>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              Jejaki perjalanan ibadah anda. Dari terawih ke iftar, 
              setiap langkah ke masjid adalah satu jejak bermakna.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-3">Pautan</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="/browse" className="hover:opacity-100 transition-opacity">Cari Masjid</a></li>
              <li><a href="/tracking" className="hover:opacity-100 transition-opacity">Jejak Saya</a></li>
              <li><a href="/add" className="hover:opacity-100 transition-opacity">Tambah Masjid</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-3">Komuniti</h4>
            <p className="text-sm opacity-80 leading-relaxed">
              Dibina dengan kasih sayang untuk umat. 
              Setiap sumbangan masjid baru menguatkan komuniti kita.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/20 pt-6 text-center text-sm opacity-60">
          <p className="flex items-center justify-center gap-1">
            Dibina dengan <Heart className="h-3 w-3 fill-current" /> untuk komuniti
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
