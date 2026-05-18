"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, ZoomControl, useMap } from "react-leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";

type ContactPoint = {
  id: string;
  lat: number;
  lng: number;
  name: Record<Locale, string>;
  region: Record<Locale, string>;
  address: Record<Locale, string>;
  phone: string;
  email: string;
};

const points: ContactPoint[] = [
  { id: "astana", lat: 51.13, lng: 71.43, name: { ru: "Астана", kk: "Астана" }, region: { ru: "Центральный аппарат", kk: "Орталық аппарат" }, address: { ru: "пр. Мәңгілік Ел, 10", kk: "Мәңгілік Ел даңғылы, 10" }, phone: "1400", email: "contact@knb.gov.kz" },
  { id: "almaty", lat: 43.24, lng: 76.95, name: { ru: "Алматы", kk: "Алматы" }, region: { ru: "г. Алматы", kk: "Алматы қ." }, address: { ru: "ул. Байзакова, 100", kk: "Байзақов көшесі, 100" }, phone: "+7 727 000 00 00", email: "almaty@example.gov.kz" },
  { id: "shymkent", lat: 42.32, lng: 69.59, name: { ru: "Шымкент", kk: "Шымкент" }, region: { ru: "г. Шымкент", kk: "Шымкент қ." }, address: { ru: "пр. Тауке хана, 12", kk: "Тәуке хан даңғылы, 12" }, phone: "+7 7252 000 000", email: "shymkent@example.gov.kz" },
  { id: "aktobe", lat: 50.28, lng: 57.17, name: { ru: "Актобе", kk: "Ақтөбе" }, region: { ru: "Актюбинская область", kk: "Ақтөбе облысы" }, address: { ru: "ул. Абилкайыр хана, 44", kk: "Әбілқайыр хан көшесі, 44" }, phone: "+7 7132 000 000", email: "aktobe@example.gov.kz" },
  { id: "atyrau", lat: 47.11, lng: 51.88, name: { ru: "Атырау", kk: "Атырау" }, region: { ru: "Атырауская область", kk: "Атырау облысы" }, address: { ru: "ул. Сатпаева, 8", kk: "Сәтбаев көшесі, 8" }, phone: "+7 7122 000 000", email: "atyrau@example.gov.kz" },
  { id: "aktau", lat: 43.65, lng: 51.17, name: { ru: "Актау", kk: "Ақтау" }, region: { ru: "Мангистауская область", kk: "Маңғыстау облысы" }, address: { ru: "мкр. 14, здание 21", kk: "14 шағынаудан, 21 ғимарат" }, phone: "+7 7292 000 000", email: "aktau@example.gov.kz" },
  { id: "uralsk", lat: 51.23, lng: 51.37, name: { ru: "Уральск", kk: "Орал" }, region: { ru: "Западно-Казахстанская область", kk: "Батыс Қазақстан облысы" }, address: { ru: "пр. Назарбаева, 175", kk: "Назарбаев даңғылы, 175" }, phone: "+7 7112 000 000", email: "uralsk@example.gov.kz" },
  { id: "kostanay", lat: 53.22, lng: 63.62, name: { ru: "Костанай", kk: "Қостанай" }, region: { ru: "Костанайская область", kk: "Қостанай облысы" }, address: { ru: "ул. Аль-Фараби, 66", kk: "Әл-Фараби көшесі, 66" }, phone: "+7 7142 000 000", email: "kostanay@example.gov.kz" },
  { id: "petropavl", lat: 54.87, lng: 69.16, name: { ru: "Петропавловск", kk: "Петропавл" }, region: { ru: "Северо-Казахстанская область", kk: "Солтүстік Қазақстан облысы" }, address: { ru: "ул. Конституции Казахстана, 38", kk: "Қазақстан Конституциясы көшесі, 38" }, phone: "+7 7152 000 000", email: "petropavl@example.gov.kz" },
  { id: "kokshetau", lat: 53.28, lng: 69.38, name: { ru: "Кокшетау", kk: "Көкшетау" }, region: { ru: "Акмолинская область", kk: "Ақмола облысы" }, address: { ru: "ул. Абая, 96", kk: "Абай көшесі, 96" }, phone: "+7 7162 000 000", email: "kokshetau@example.gov.kz" },
  { id: "pavlodar", lat: 52.29, lng: 76.95, name: { ru: "Павлодар", kk: "Павлодар" }, region: { ru: "Павлодарская область", kk: "Павлодар облысы" }, address: { ru: "ул. Торайгырова, 54", kk: "Торайғыров көшесі, 54" }, phone: "+7 7182 000 000", email: "pavlodar@example.gov.kz" },
  { id: "oskemen", lat: 49.95, lng: 82.61, name: { ru: "Усть-Каменогорск", kk: "Өскемен" }, region: { ru: "Восточно-Казахстанская область", kk: "Шығыс Қазақстан облысы" }, address: { ru: "ул. Казахстан, 59", kk: "Қазақстан көшесі, 59" }, phone: "+7 7232 000 000", email: "oskemen@example.gov.kz" },
  { id: "semey", lat: 50.41, lng: 80.25, name: { ru: "Семей", kk: "Семей" }, region: { ru: "Абайская область", kk: "Абай облысы" }, address: { ru: "ул. Шакарима, 31", kk: "Шәкәрім көшесі, 31" }, phone: "+7 7222 000 000", email: "semey@example.gov.kz" },
  { id: "karaganda", lat: 49.8, lng: 73.1, name: { ru: "Караганда", kk: "Қарағанды" }, region: { ru: "Карагандинская область", kk: "Қарағанды облысы" }, address: { ru: "пр. Бухар жырау, 30", kk: "Бұқар жырау даңғылы, 30" }, phone: "+7 7212 000 000", email: "karaganda@example.gov.kz" },
  { id: "zhezkazgan", lat: 47.8, lng: 67.71, name: { ru: "Жезказган", kk: "Жезқазған" }, region: { ru: "Улытауская область", kk: "Ұлытау облысы" }, address: { ru: "ул. Алашахана, 22", kk: "Алашахан көшесі, 22" }, phone: "+7 7102 000 000", email: "zhezkazgan@example.gov.kz" },
  { id: "kyzylorda", lat: 44.85, lng: 65.51, name: { ru: "Кызылорда", kk: "Қызылорда" }, region: { ru: "Кызылординская область", kk: "Қызылорда облысы" }, address: { ru: "ул. Айтеке би, 29", kk: "Әйтеке би көшесі, 29" }, phone: "+7 7242 000 000", email: "kyzylorda@example.gov.kz" },
  { id: "taraz", lat: 42.9, lng: 71.37, name: { ru: "Тараз", kk: "Тараз" }, region: { ru: "Жамбылская область", kk: "Жамбыл облысы" }, address: { ru: "ул. Толе би, 71", kk: "Төле би көшесі, 71" }, phone: "+7 7262 000 000", email: "taraz@example.gov.kz" },
  { id: "turkistan", lat: 43.3, lng: 68.27, name: { ru: "Туркестан", kk: "Түркістан" }, region: { ru: "Туркестанская область", kk: "Түркістан облысы" }, address: { ru: "пр. Б. Саттарханова, 27", kk: "Б. Саттарханов даңғылы, 27" }, phone: "+7 7253 000 000", email: "turkistan@example.gov.kz" },
  { id: "taldykorgan", lat: 45.02, lng: 78.37, name: { ru: "Талдыкорган", kk: "Талдықорған" }, region: { ru: "Жетысуская область", kk: "Жетісу облысы" }, address: { ru: "ул. Кабанбай батыра, 26", kk: "Қабанбай батыр көшесі, 26" }, phone: "+7 7282 000 000", email: "taldykorgan@example.gov.kz" },
  { id: "konaev", lat: 43.88, lng: 77, name: { ru: "Конаев", kk: "Қонаев" }, region: { ru: "Алматинская область", kk: "Алматы облысы" }, address: { ru: "ул. Д. Кунаева, 2", kk: "Д. Қонаев көшесі, 2" }, phone: "+7 7277 000 000", email: "konaev@example.gov.kz" }
];

const copy = {
  ru: {
    listTitle: "Территориальные органы",
    mapNote: "Подробная карта: дороги, населенные пункты, реки, озера, границы и соседние государства."
  },
  kk: {
    listTitle: "Аумақтық органдар",
    mapNote: "Толық карта: жолдар, елді мекендер, өзендер, көлдер, шекаралар және көрші мемлекеттер."
  }
};

function createMarkerIcon(isSelected: boolean) {
  const size = isSelected ? 36 : 26;
  const center = size / 2;
  const inner = isSelected ? 7 : 5;

  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [center, center],
    popupAnchor: [0, -center],
    html: `
      <span style="
        display:grid;
        place-items:center;
        width:${size}px;
        height:${size}px;
        border-radius:9999px;
        background:${isSelected ? "#D6A83A" : "#ffffff"};
        border:${isSelected ? 3 : 2}px solid ${isSelected ? "#061B33" : "#007D73"};
        box-shadow:0 10px 28px rgba(6,27,51,0.24);
      ">
        <span style="
          width:${inner}px;
          height:${inner}px;
          border-radius:9999px;
          background:${isSelected ? "#061B33" : "#00A99B"};
        "></span>
      </span>
    `
  });
}

function SelectedPointController({ point }: { point: ContactPoint }) {
  const map = useMap();

  useEffect(() => {
    map.attributionControl.setPrefix(false);
    map.flyTo([point.lat, point.lng], Math.max(map.getZoom(), 6), {
      animate: true,
      duration: 0.7
    });
  }, [map, point]);

  return null;
}

export function ContactsMapLeaflet({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [selectedId, setSelectedId] = useState("astana");
  const selectedPoint = useMemo(() => points.find((point) => point.id === selectedId) ?? points[0], [selectedId]);

  return (
    <div className="grid gap-6">
      <div className="rounded-[1.35rem] border border-slate-200/80 bg-white/[0.94] p-4 shadow-sm md:p-6">
        <div className="relative min-h-[34rem] overflow-hidden rounded-[1.1rem] border border-state-teal/15 bg-state-surface">
          <MapContainer
            center={[48.2, 67.7]}
            zoom={5}
            minZoom={4}
            maxZoom={13}
            maxBounds={[[39.5, 44], [56.5, 90]]}
            maxBoundsViscosity={0.85}
            scrollWheelZoom
            zoomControl={false}
            className="h-[34rem] w-full"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="topright" />
            <SelectedPointController point={selectedPoint} />
            {points.map((point) => {
              const isSelected = point.id === selectedPoint.id;

              return (
                <Marker
                  key={point.id}
                  position={[point.lat, point.lng]}
                  icon={createMarkerIcon(isSelected)}
                  eventHandlers={{
                    click: () => setSelectedId(point.id)
                  }}
                />
              );
            })}
          </MapContainer>
          <div className="absolute bottom-4 right-4 z-[650] w-[min(22rem,calc(100%-2rem))] rounded-2xl border border-slate-200 bg-white/[0.97] p-4 text-state-navy shadow-[0_24px_70px_rgba(6,27,51,0.2)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-state-tealDark">{selectedPoint.region[locale]}</p>
            <h2 className="mt-2 text-xl font-bold">{selectedPoint.name[locale]}</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              <p className="flex gap-2 leading-5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-state-tealDark" />
                {selectedPoint.address[locale]}
              </p>
              <p className="flex gap-2 leading-5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-state-tealDark" />
                {selectedPoint.phone}
              </p>
              <p className="flex gap-2 leading-5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-state-tealDark" />
                {selectedPoint.email}
              </p>
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-4 left-4 z-[450] max-w-[calc(100%-25rem)] rounded-2xl border border-slate-200 bg-white/[0.95] px-4 py-3 text-xs font-semibold leading-5 text-state-navy shadow-sm">
            {t.mapNote}
          </div>
        </div>
      </div>

      <div className="rounded-[1.35rem] border border-slate-200/80 bg-white/[0.94] p-4 shadow-sm">
        <p className="px-2 text-sm font-bold uppercase tracking-[0.16em] text-slate-500">{t.listTitle}</p>
        <div className="mt-3 grid max-h-80 gap-1 overflow-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
          {points.map((point) => (
            <button key={point.id} type="button" onClick={() => setSelectedId(point.id)} className={`rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${point.id === selectedPoint.id ? "bg-state-gold text-state-navy" : "text-slate-600 hover:bg-state-surface hover:text-state-navy"}`}>
              {point.name[locale]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
