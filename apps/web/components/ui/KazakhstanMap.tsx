export function KazakhstanMap() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -right-20 top-20 h-[34rem] w-[42rem] opacity-25">
        <svg viewBox="0 0 760 520" fill="none" aria-hidden className="h-full w-full">
          <path
            d="M84 246C109 205 160 187 214 187C254 156 301 123 371 144C420 111 486 123 512 168C583 159 650 191 676 243C715 321 620 376 535 354C493 407 409 420 354 383C296 418 218 402 192 349C132 349 53 318 84 246Z"
            fill="url(#mapGradient)"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="2"
          />
          <path d="M184 268H595M236 205L312 382M385 148L438 396M533 180L480 358" stroke="rgba(255,255,255,0.24)" strokeWidth="2" />
          <circle cx="384" cy="248" r="8" fill="#D6A83A" />
          <circle cx="472" cy="303" r="6" fill="#FFFFFF" opacity="0.9" />
          <circle cx="284" cy="258" r="6" fill="#FFFFFF" opacity="0.9" />
          <defs>
            <linearGradient id="mapGradient" x1="83" y1="138" x2="708" y2="397" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00A99B" />
              <stop offset="0.55" stopColor="#2F6FAE" />
              <stop offset="1" stopColor="#D6A83A" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:64px_64px]" />
    </div>
  );
}
