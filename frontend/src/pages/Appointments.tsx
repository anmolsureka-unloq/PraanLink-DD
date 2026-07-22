import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Star, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Hospital {
  id: number;
  name: string;
  address: string;
  distance: string;
  rating: number;
  specialties: string[];
  phone: string;
  availability: "immediate" | "today" | "tomorrow";
}

const hospitals: Hospital[] = [
  {
    id: 1,
    name: "Apollo Multispecialty Hospital",
    address: "123 MG Road, Bangalore",
    distance: "1.2 km",
    rating: 4.8,
    specialties: ["Cardiology", "Neurology", "Orthopedics"],
    phone: "+91 80 1234 5678",
    availability: "immediate",
  },
  {
    id: 2,
    name: "Manipal Hospital",
    address: "456 HAL Airport Road, Bangalore",
    distance: "2.5 km",
    rating: 4.6,
    specialties: ["General Medicine", "Pediatrics", "ENT"],
    phone: "+91 80 2345 6789",
    availability: "today",
  },
  {
    id: 3,
    name: "Fortis Hospital",
    address: "789 Bannerghatta Road, Bangalore",
    distance: "3.8 km",
    rating: 4.7,
    specialties: ["Oncology", "Gastroenterology", "Nephrology"],
    phone: "+91 80 3456 7890",
    availability: "tomorrow",
  },
];

export default function Appointments() {
  const navigate = useNavigate();
  const [selectedHospital, setSelectedHospital] = useState<number | null>(null);

  const handleBookAppointment = (hospital: Hospital) => {
    navigate("/agent-call", { state: { hospital } });
  };

  const getAvailabilityBadge = (availability: Hospital["availability"]) => {
    switch (availability) {
      case "immediate":
        return <Badge className="bg-primary">Available Now</Badge>;
      case "today":
        return <Badge variant="secondary">Available Today</Badge>;
      case "tomorrow":
        return <Badge variant="outline">Tomorrow</Badge>;
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Compact map preview */}
      <div className="relative h-28 w-full flex-shrink-0 border-b border-border bg-gradient-to-br from-primary-lighter to-secondary/20">
        <div className="absolute left-1/4 top-1/3 h-3 w-3 animate-bounce rounded-full bg-primary shadow-lg" />
        <div className="absolute right-1/3 top-1/2 h-3 w-3 animate-bounce rounded-full bg-primary shadow-lg delay-100" />
        <div className="flex h-full items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary shadow-md">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-body font-semibold text-foreground">Koramangala, Bangalore</p>
              <p className="text-caption text-muted-foreground">{hospitals.length} hospitals within 5 km</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Navigation className="mr-1 h-4 w-4" />
            View map
          </Button>
        </div>
      </div>

      {/* Hospital List */}
      <div className="flex-1 overflow-auto px-5 py-5">
        <div className="space-y-4">
          {hospitals.map((hospital) => (
            <Card key={hospital.id} className="p-5 transition-smooth hover:shadow-md">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-subtitle text-foreground">{hospital.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-caption text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{hospital.address}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-caption">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-medium text-foreground">{hospital.rating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline">
                    <Navigation className="mr-1 h-3 w-3" />
                    {hospital.distance}
                  </Badge>
                  {getAvailabilityBadge(hospital.availability)}
                </div>

                <div className="flex flex-wrap gap-2">
                  {hospital.specialties.map((specialty, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-primary-lighter px-3 py-1 text-caption font-medium text-primary"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-2 text-caption text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{hospital.phone}</span>
                  </div>
                  <Button
                    onClick={() => handleBookAppointment(hospital)}
                    disabled={selectedHospital === hospital.id}
                    size="sm"
                  >
                    {selectedHospital === hospital.id ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      "Book appointment"
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
