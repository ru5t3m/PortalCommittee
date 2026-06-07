"use client";

import { MapPin, Phone } from "lucide-react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, ZoomControl, useMap } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";

type Service = "knb" | "border";

type ContactPoint = {
  id: string;
  service: Service;
  lat: number;
  lng: number;
  name: Record<Locale, string>;
  region: Record<Locale, string>;
  phones: string[];
};

const knbPoints: ContactPoint[] = [
  { id: "knb-astana", service: "knb", lat: 51.13, lng: 71.43, name: { ru: "ДКНБ по г. Астана", kk: "Астана қ. бойынша ҰҚКД" }, region: { ru: "Астана", kk: "Астана" }, phones: ["8 (7172) 76-41-26"] },
  { id: "knb-almaty", service: "knb", lat: 43.24, lng: 76.95, name: { ru: "ДКНБ по г. Алматы", kk: "Алматы қ. бойынша ҰҚКД" }, region: { ru: "Алматы", kk: "Алматы" }, phones: ["8 (727) 275-88-15"] },
  { id: "knb-shymkent", service: "knb", lat: 42.32, lng: 69.59, name: { ru: "ДКНБ по г. Шымкент", kk: "Шымкент қ. бойынша ҰҚКД" }, region: { ru: "Шымкент", kk: "Шымкент" }, phones: ["8 (7252) 95-10-77"] },
  { id: "knb-akmola", service: "knb", lat: 53.28, lng: 69.38, name: { ru: "ДКНБ по Акмолинской области", kk: "Ақмола облысы бойынша ҰҚКД" }, region: { ru: "Акмолинская область", kk: "Ақмола облысы" }, phones: ["8 (7162) 29-60-95", "8 (7162) 29-60-29"] },
  { id: "knb-aktobe", service: "knb", lat: 50.28, lng: 57.17, name: { ru: "ДКНБ по Актюбинской области", kk: "Ақтөбе облысы бойынша ҰҚКД" }, region: { ru: "Актюбинская область", kk: "Ақтөбе облысы" }, phones: ["8 (7132) 93-40-70", "8 (7132) 93-40-74"] },
  { id: "knb-almaty-region", service: "knb", lat: 43.88, lng: 77, name: { ru: "ДКНБ по Алматинской области", kk: "Алматы облысы бойынша ҰҚКД" }, region: { ru: "Алматинская область", kk: "Алматы облысы" }, phones: ["8 (700) 456-95-59"] },
  { id: "knb-atyrau", service: "knb", lat: 47.11, lng: 51.88, name: { ru: "ДКНБ по Атырауской области", kk: "Атырау облысы бойынша ҰҚКД" }, region: { ru: "Атырауская область", kk: "Атырау облысы" }, phones: ["8 (7122) 99-51-76"] },
  { id: "knb-abay", service: "knb", lat: 50.41, lng: 80.25, name: { ru: "ДКНБ по области Абай", kk: "Абай облысы бойынша ҰҚКД" }, region: { ru: "Область Абай", kk: "Абай облысы" }, phones: ["8 (7222) 55-02-70", "8 (7222) 55-02-73"] },
  { id: "knb-vko", service: "knb", lat: 49.95, lng: 82.61, name: { ru: "ДКНБ по Восточно-Казахстанской области", kk: "Шығыс Қазақстан облысы бойынша ҰҚКД" }, region: { ru: "Восточно-Казахстанская область", kk: "Шығыс Қазақстан облысы" }, phones: ["8 (7232) 28-21-70", "8 (7232) 28-22-01"] },
  { id: "knb-zhambyl", service: "knb", lat: 42.9, lng: 71.37, name: { ru: "ДКНБ по Жамбылской области", kk: "Жамбыл облысы бойынша ҰҚКД" }, region: { ru: "Жамбылская область", kk: "Жамбыл облысы" }, phones: ["8 (7262) 94-00-74"] },
  { id: "knb-zhetisu", service: "knb", lat: 45.02, lng: 78.37, name: { ru: "ДКНБ по области Жетісу", kk: "Жетісу облысы бойынша ҰҚКД" }, region: { ru: "Область Жетісу", kk: "Жетісу облысы" }, phones: ["8 (7282) 60-55-73"] },
  { id: "knb-zko", service: "knb", lat: 51.23, lng: 51.37, name: { ru: "ДКНБ по Западно-Казахстанской области", kk: "Батыс Қазақстан облысы бойынша ҰҚКД" }, region: { ru: "Западно-Казахстанская область", kk: "Батыс Қазақстан облысы" }, phones: ["8 (7112) 98-80-71", "8 (7112) 98-81-71"] },
  { id: "knb-karaganda", service: "knb", lat: 49.8, lng: 73.1, name: { ru: "ДКНБ по Карагандинской области", kk: "Қарағанды облысы бойынша ҰҚКД" }, region: { ru: "Карагандинская область", kk: "Қарағанды облысы" }, phones: ["8 (7212) 49-86-55"] },
  { id: "knb-kostanay", service: "knb", lat: 53.22, lng: 63.62, name: { ru: "ДКНБ по Костанайской области", kk: "Қостанай облысы бойынша ҰҚКД" }, region: { ru: "Костанайская область", kk: "Қостанай облысы" }, phones: ["8 (7142) 52-01-75"] },
  { id: "knb-kyzylorda", service: "knb", lat: 44.85, lng: 65.51, name: { ru: "ДКНБ по Кызылординской области", kk: "Қызылорда облысы бойынша ҰҚКД" }, region: { ru: "Кызылординская область", kk: "Қызылорда облысы" }, phones: ["8 (7242) 29-63-76", "8 (7242) 29-63-71"] },
  { id: "knb-mangystau", service: "knb", lat: 43.65, lng: 51.17, name: { ru: "ДКНБ по Мангистауской области", kk: "Маңғыстау облысы бойынша ҰҚКД" }, region: { ru: "Мангистауская область", kk: "Маңғыстау облысы" }, phones: ["8 (7292) 46-00-60", "8 (7292) 46-01-36"] },
  { id: "knb-pavlodar", service: "knb", lat: 52.29, lng: 76.95, name: { ru: "ДКНБ по Павлодарской области", kk: "Павлодар облысы бойынша ҰҚКД" }, region: { ru: "Павлодарская область", kk: "Павлодар облысы" }, phones: ["8 (7182) 39-16-28", "8 (7182) 39-16-89"] },
  { id: "knb-ulytau", service: "knb", lat: 47.8, lng: 67.71, name: { ru: "ДКНБ по области Ұлытау", kk: "Ұлытау облысы бойынша ҰҚКД" }, region: { ru: "Область Ұлытау", kk: "Ұлытау облысы" }, phones: ["8 (7102) 41-03-96", "8 (7102) 73-58-50"] },
  { id: "knb-sko", service: "knb", lat: 54.87, lng: 69.16, name: { ru: "ДКНБ по Северо-Казахстанской области", kk: "Солтүстік Қазақстан облысы бойынша ҰҚКД" }, region: { ru: "Северо-Казахстанская область", kk: "Солтүстік Қазақстан облысы" }, phones: ["8 (7152) 39-01-20", "8 (7152) 39-01-45"] },
  { id: "knb-turkistan", service: "knb", lat: 43.3, lng: 68.27, name: { ru: "ДКНБ по Туркестанской области", kk: "Түркістан облысы бойынша ҰҚКД" }, region: { ru: "Туркестанская область", kk: "Түркістан облысы" }, phones: ["8 (7253) 35-10-75", "8 (7253) 35-10-71", "8 (7253) 35-10-76"] }
];

const borderPoints: ContactPoint[] = [
  { id: "border-almaty-city", service: "border", lat: 43.24, lng: 76.95, name: { ru: "ДПС по г. Алматы", kk: "Алматы қ. бойынша ШҚД" }, region: { ru: "Алматы", kk: "Алматы" }, phones: ["8 (7272) 61-58-49", "8 (7272) 61-58-39"] },
  { id: "border-aktobe", service: "border", lat: 50.28, lng: 57.17, name: { ru: "ДПС по Актюбинской области", kk: "Ақтөбе облысы бойынша ШҚД" }, region: { ru: "Актюбинская область", kk: "Ақтөбе облысы" }, phones: ["8 (7132) 93-45-34", "8 (7132) 93-45-90"] },
  { id: "border-atyrau", service: "border", lat: 47.11, lng: 51.88, name: { ru: "ДПС по Атырауской области", kk: "Атырау облысы бойынша ШҚД" }, region: { ru: "Атырауская область", kk: "Атырау облысы" }, phones: ["8 (7122) 99-95-55", "8 (7122) 99-95-38"] },
  { id: "border-abay", service: "border", lat: 50.41, lng: 80.25, name: { ru: "ДПС по области Абай", kk: "Абай облысы бойынша ШҚД" }, region: { ru: "Область Абай", kk: "Абай облысы" }, phones: ["8 (7222) 69-10-26", "8 (7222) 69-10-25"] },
  { id: "border-vko", service: "border", lat: 49.95, lng: 82.61, name: { ru: "ДПС по ВКО", kk: "ШҚО бойынша ШҚД" }, region: { ru: "Восточно-Казахстанская область", kk: "Шығыс Қазақстан облысы" }, phones: ["8 (7232) 29-30-98", "8 (7232) 29-30-36"] },
  { id: "border-zhambyl", service: "border", lat: 42.9, lng: 71.37, name: { ru: "ДПС по Жамбылской области", kk: "Жамбыл облысы бойынша ШҚД" }, region: { ru: "Жамбылская область", kk: "Жамбыл облысы" }, phones: ["8 (7262) 47-00-92", "8 (7262) 47-00-63"] },
  { id: "border-zhetisu", service: "border", lat: 45.02, lng: 78.37, name: { ru: "ДПС по области Жетісу", kk: "Жетісу облысы бойынша ШҚД" }, region: { ru: "Область Жетісу", kk: "Жетісу облысы" }, phones: ["8 (7272) 61-99-32", "8 (7272) 72-89-20"] },
  { id: "border-zko", service: "border", lat: 51.23, lng: 51.37, name: { ru: "ДПС по ЗКО", kk: "БҚО бойынша ШҚД" }, region: { ru: "Западно-Казахстанская область", kk: "Батыс Қазақстан облысы" }, phones: ["8 (7112) 98-93-27", "8 (7112) 98-83-26"] },
  { id: "border-kostanay", service: "border", lat: 53.22, lng: 63.62, name: { ru: "ДПС по Костанайской области", kk: "Қостанай облысы бойынша ШҚД" }, region: { ru: "Костанайская область", kk: "Қостанай облысы" }, phones: ["8 (7142) 52-04-28", "8 (7142) 52-04-84"] },
  { id: "border-kyzylorda", service: "border", lat: 44.85, lng: 65.51, name: { ru: "ДПС по Кызылординской области", kk: "Қызылорда облысы бойынша ШҚД" }, region: { ru: "Кызылординская область", kk: "Қызылорда облысы" }, phones: ["8 (7242) 29-61-13", "8 (7242) 29-61-35"] },
  { id: "border-mangystau", service: "border", lat: 43.65, lng: 51.17, name: { ru: "ДПС по Мангистауской области", kk: "Маңғыстау облысы бойынша ШҚД" }, region: { ru: "Мангистауская область", kk: "Маңғыстау облысы" }, phones: ["8 (7292) 46-05-45"] },
  { id: "border-pavlodar", service: "border", lat: 52.29, lng: 76.95, name: { ru: "ДПС по Павлодарской области", kk: "Павлодар облысы бойынша ШҚД" }, region: { ru: "Павлодарская область", kk: "Павлодар облысы" }, phones: ["8 (7182) 39-90-25", "8 (7182) 99-09-90"] },
  { id: "border-sko", service: "border", lat: 54.87, lng: 69.16, name: { ru: "ДПС по СКО", kk: "СҚО бойынша ШҚД" }, region: { ru: "Северо-Казахстанская область", kk: "Солтүстік Қазақстан облысы" }, phones: ["8 (7152) 62-80-23", "8 (7152) 62-80-23"] },
  { id: "border-turkistan", service: "border", lat: 42.32, lng: 69.59, name: { ru: "ДПС по Туркестанской области", kk: "Түркістан облысы бойынша ШҚД" }, region: { ru: "Туркестанская область", kk: "Түркістан облысы" }, phones: ["8 (7252) 98-30-88", "8 (7252) 98-30-91"] },
  { id: "border-upk-astana", service: "border", lat: 51.13, lng: 71.43, name: { ru: "УПК «Астана»", kk: "«Астана» ШББ" }, region: { ru: "Астана", kk: "Астана" }, phones: ["8 (7172) 33-48-35", "8 (7172) 33-48-04"] },
  { id: "border-upk-almaty", service: "border", lat: 43.24, lng: 76.95, name: { ru: "УПК «Алматы»", kk: "«Алматы» ШББ" }, region: { ru: "Алматы", kk: "Алматы" }, phones: ["8 (7272) 60-03-27", "8 (7272) 51-45-51"] },
  { id: "border-usn", service: "border", lat: 43.24, lng: 76.95, name: { ru: "УСН, г. Алматы", kk: "АББ, Алматы қ." }, region: { ru: "Алматы", kk: "Алматы" }, phones: ["8 (7272) 60-01-92", "8 (7272) 60-01-92"] },
  { id: "border-usk", service: "border", lat: 43.24, lng: 76.95, name: { ru: "УСК, г. Алматы", kk: "АҚБ, Алматы қ." }, region: { ru: "Алматы", kk: "Алматы" }, phones: ["8 (7273) 98-17-24", "8 (7273) 61-98-34"] },
  { id: "border-urtv", service: "border", lat: 43.24, lng: 76.95, name: { ru: "УРТВ, г. Алматы", kk: "РТВБ, Алматы қ." }, region: { ru: "Алматы", kk: "Алматы" }, phones: ["8 (7272) 60-00-60"] },
  { id: "border-us-almaty", service: "border", lat: 43.24, lng: 76.95, name: { ru: "УС «Алматы»", kk: "«Алматы» ББ" }, region: { ru: "Алматы", kk: "Алматы" }, phones: ["8 (7272) 60-02-26", "8 (7272) 60-02-56"] },
  { id: "border-us-zhangiztobe", service: "border", lat: 43.65, lng: 51.17, name: { ru: "УС «Жангизтобе», г. Актау", kk: "«Жаңғызтөбе» ББ, Ақтау қ." }, region: { ru: "Актау", kk: "Ақтау" }, phones: ["8 (7234) 52-57-82"] },
  { id: "border-us-aktau", service: "border", lat: 43.65, lng: 51.17, name: { ru: "УС «Актау»", kk: "«Ақтау» ББ" }, region: { ru: "Актау", kk: "Ақтау" }, phones: ["8 (7292) 20-34-18"] }
];

const copy = {
  ru: {
    choose: "Что вы ищете",
    knb: "КНБ",
    border: "Пограничная служба",
    listTitle: "Телефонный справочник",
    mapNote: "Выберите подразделение в списке или на карте, чтобы увидеть телефоны."
  },
  kk: {
    choose: "Не іздеп тұрсыз",
    knb: "ҰҚК",
    border: "Шекара қызметі",
    listTitle: "Телефон анықтамалығы",
    mapNote: "Телефондарды көру үшін тізімнен немесе картадан бөлімшені таңдаңыз."
  }
};

function createMarkerIcon(isSelected: boolean, service: Service) {
  const size = isSelected ? 36 : 26;
  const center = size / 2;
  const accent = service === "knb" ? "#007D73" : "#D6A83A";

  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [center, center],
    html: `
      <span style="display:grid;place-items:center;width:${size}px;height:${size}px;border-radius:9999px;background:${isSelected ? "#061B33" : "#ffffff"};border:2px solid ${accent};box-shadow:0 10px 28px rgba(6,27,51,0.24);">
        <span style="width:${isSelected ? 10 : 6}px;height:${isSelected ? 10 : 6}px;border-radius:9999px;background:${accent};"></span>
      </span>
    `
  });
}

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
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
  const [service, setService] = useState<Service>("knb");
  const points = service === "knb" ? knbPoints : borderPoints;
  const [selectedId, setSelectedId] = useState(knbPoints[0].id);
  const selectedPoint = useMemo(() => points.find((point) => point.id === selectedId) ?? points[0], [points, selectedId]);

  function selectService(nextService: Service) {
    setService(nextService);
    setSelectedId(nextService === "knb" ? knbPoints[0].id : borderPoints[0].id);
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-[1.35rem] border border-slate-200/80 bg-white/[0.96] p-4 shadow-sm md:p-6">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">{t.choose}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(["knb", "border"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => selectService(item)}
              className={`min-h-12 rounded-xl px-5 py-3 text-sm font-bold transition ${service === item ? "bg-state-navy text-white shadow-sm" : "border border-slate-200 bg-white text-state-navy hover:border-state-teal"}`}
            >
              {item === "knb" ? t.knb : t.border}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[1.35rem] border border-slate-200/80 bg-white/[0.94] p-4 shadow-sm md:p-6">
        <div className="relative min-h-[32rem] overflow-hidden rounded-[1.1rem] border border-state-teal/15 bg-state-surface">
          <MapContainer
            center={[48.2, 67.7]}
            zoom={5}
            minZoom={4}
            maxZoom={13}
            maxBounds={[[39.5, 44], [56.5, 90]]}
            maxBoundsViscosity={0.85}
            scrollWheelZoom
            zoomControl={false}
            className="h-[32rem] w-full"
          >
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ZoomControl position="topright" />
            <SelectedPointController point={selectedPoint} />
            {points.map((point) => (
              <Marker
                key={point.id}
                position={[point.lat, point.lng]}
                icon={createMarkerIcon(point.id === selectedPoint.id, point.service)}
                eventHandlers={{ click: () => setSelectedId(point.id) }}
              />
            ))}
          </MapContainer>
          <div className="absolute bottom-4 right-4 z-[650] w-[min(24rem,calc(100%-2rem))] rounded-2xl border border-slate-200 bg-white/[0.98] p-4 text-state-navy shadow-[0_24px_70px_rgba(6,27,51,0.2)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-state-tealDark">{selectedPoint.region[locale]}</p>
            <h2 className="mt-2 text-xl font-bold">{selectedPoint.name[locale]}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedPoint.phones.map((phone, index) => (
                <a key={`${phone}-${index}`} href={phoneHref(phone)} className="inline-flex items-center gap-2 rounded-xl bg-state-teal/10 px-3 py-2 text-sm font-bold text-state-tealDark transition hover:bg-state-teal hover:text-white">
                  <Phone className="h-4 w-4" />
                  {phone}
                </a>
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-4 left-4 z-[450] hidden max-w-[calc(100%-28rem)] rounded-2xl border border-slate-200 bg-white/[0.95] px-4 py-3 text-xs font-semibold leading-5 text-state-navy shadow-sm lg:block">
            {t.mapNote}
          </div>
        </div>
      </div>

      <div className="rounded-[1.35rem] border border-slate-200/80 bg-white/[0.96] p-4 shadow-sm md:p-6">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">{t.listTitle}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {points.map((point) => (
              <button
                key={point.id}
                type="button"
                onClick={() => setSelectedId(point.id)}
                className={`rounded-2xl border p-4 text-left transition ${point.id === selectedPoint.id ? "border-state-gold bg-state-gold/12" : "border-slate-200 bg-white hover:border-state-teal hover:bg-state-surface"}`}
              >
                <span className="flex items-start gap-2 text-sm font-bold text-state-navy">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-state-tealDark" />
                  {point.name[locale]}
                </span>
                <span className="mt-2 block text-xs font-semibold text-slate-500">{point.region[locale]}</span>
                <span className="mt-3 flex flex-wrap gap-2">
                  {point.phones.map((phone, index) => (
                    <a key={`${phone}-${index}`} href={phoneHref(phone)} onClick={(event) => event.stopPropagation()} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-state-tealDark transition hover:bg-state-teal hover:text-white">
                      {phone}
                    </a>
                  ))}
                </span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
