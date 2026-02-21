import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-muted/50 py-6">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p className="flex items-center justify-center gap-1">
          Dibina dengan <Heart className="h-3 w-3 fill-current text-primary" /> untuk komuniti
        </p>
        <p className="mt-1 opacity-60">© {new Date().getFullYear()} JejakMasjid</p>
      </div>
    </footer>
  );
};

export default Footer;
