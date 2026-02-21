import { MapPin, CheckCircle, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export interface MasjidData {
  id: string;
  name: string;
  location: string;
  state: string;
  image?: string;
  verified: boolean;
  verificationCount: number;
  totalVisits: number;
  hasIftar: boolean;
  hasTerawih: boolean;
}

const MasjidCard = ({ masjid }: { masjid: MasjidData }) => {
  return (
    <Link
      to={`/masjid/${masjid.id}`}
      className="group block overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        {masjid.image ? (
          <img
            src={masjid.image}
            alt={masjid.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-secondary">
            <MapPin className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Verification Badge */}
        {masjid.verified ? (
          <div className="absolute top-3 right-3">
            <Badge className="bg-accent text-accent-foreground gap-1 font-sans text-xs font-semibold">
              <CheckCircle className="h-3 w-3" />
              Disahkan
            </Badge>
          </div>
        ) : (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="font-sans text-xs">
              Belum disahkan
            </Badge>
          </div>
        )}

        {/* Tags */}
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {masjid.hasTerawih && (
            <Badge variant="secondary" className="bg-primary/90 text-primary-foreground font-sans text-xs backdrop-blur-sm">
              🌙 Terawih
            </Badge>
          )}
          {masjid.hasIftar && (
            <Badge variant="secondary" className="bg-primary/90 text-primary-foreground font-sans text-xs backdrop-blur-sm">
              🍽️ Iftar
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {masjid.name}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {masjid.location}, {masjid.state}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {masjid.totalVisits} kunjungan
          </span>
          <span>•</span>
          <span>{masjid.verificationCount}/3 pengesahan</span>
        </div>
      </div>
    </Link>
  );
};

export default MasjidCard;
