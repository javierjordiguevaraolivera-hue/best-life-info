"use client";

import Image from "next/image";

type ProtegeFamiliaPrelandProps = {
  onContinue: () => void;
};

const benefits = [
  "Beneficios que crecen contigo",
  "Dinero disponible cuando lo necesites",
  "Mas que un seguro de vida",
];

function CheckIcon() {
  return (
    <span className="flex h-[clamp(22px,5.9svw,30px)] w-[clamp(22px,5.9svw,30px)] shrink-0 items-center justify-center rounded-full bg-[#248a4e] text-white md:h-7 md:w-7">
      <svg aria-hidden="true" className="h-[58%] w-[58%]" viewBox="0 0 16 16" fill="none">
        <path d="m3.4 8.1 2.7 2.7 6.5-6.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" className="h-[clamp(20px,5.4svw,28px)] w-[clamp(20px,5.4svw,28px)] text-[#727b83] md:h-5 md:w-5" viewBox="0 0 24 24" fill="none">
      <path d="M7 10V8.2C7 5.3 9.1 3 12 3s5 2.3 5 5.2V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M12 14v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function ProtegeFamiliaPreland({ onContinue }: ProtegeFamiliaPrelandProps) {
  return (
    <main className="flex h-[100svh] overflow-hidden bg-white text-[#202124] md:bg-[#f6f7f8]">
      {/* This prelanding intentionally renders only the content inside the phone reference. */}
      <section className="mx-auto flex h-[100svh] w-full max-w-[430px] flex-col bg-white md:max-w-[760px] md:shadow-[0_0_40px_rgba(15,23,42,0.06)]">
        {/* Brand row uses the existing IUL logo asset, inverted only here so other landings keep their logo unchanged. */}
        <header className="flex h-[clamp(76px,12svh,104px)] shrink-0 items-center justify-center bg-white px-[clamp(20px,6svw,30px)] md:h-[92px]">
          <div className="relative h-[clamp(42px,7.8svh,62px)] w-[min(62vw,245px)] md:h-[58px] md:w-[230px]">
            <Image
              priority
              src="/best-life-assets/seguros-de-vida-prweland-logo.png"
              alt="Seguros de Vida IUL"
              fill
              sizes="(min-width: 768px) 230px, 245px"
              className="object-contain object-left invert"
            />
          </div>
        </header>

        {/* The family image is the hero, matching the content area from the phone mockup without drawing the device. */}
        <div className="relative h-[31.5svh] min-h-[198px] shrink-0 overflow-hidden md:h-[340px] md:min-h-0">
          <Image
            priority
            src="/best-life-assets/familia-protege-familia.png"
            alt="Familia sonriendo al aire libre"
            fill
            sizes="(min-width: 768px) 760px, (max-width: 430px) 100vw, 430px"
            className="object-cover object-[center_39%] md:object-[center_50%]"
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-[clamp(38px,10.8svw,50px)] pb-[clamp(20px,3.7svh,34px)] pt-[clamp(18px,3.5svh,32px)] md:mx-auto md:w-full md:max-w-[560px] md:px-0 md:pb-7 md:pt-8">
          <h1 className="text-center text-[clamp(38px,11svw,54px)] font-extrabold leading-[1.02] tracking-[-0.055em] text-[#20282a] md:text-[48px] md:tracking-normal">
            Cuida tu familia,
            <span className="block text-[0.78em] leading-[1.08] md:text-[34px]">Pase lo que pase.</span>
          </h1>

          <p className="mt-[clamp(10px,1.8svh,17px)] text-center text-[clamp(20px,5.6svw,30px)] font-medium leading-[1.35] tracking-[-0.035em] text-[#596168] md:mx-auto md:max-w-[470px] md:text-[24px] md:leading-[1.22] md:tracking-normal">
            Recibe hasta $650,000 para tu retiro con una poliza IUL.
          </p>

          <ul className="mt-[clamp(13px,2.2svh,22px)] space-y-[clamp(9px,1.7svh,16px)] md:mx-auto md:mt-5 md:w-full md:max-w-[430px] md:space-y-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-[clamp(12px,3.4svw,18px)] text-[clamp(16px,4.5svw,23px)] font-medium leading-[1.2] tracking-[-0.035em] text-[#30373b] md:gap-4 md:text-[21px] md:tracking-normal">
                <CheckIcon />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onContinue}
            className="mt-[clamp(18px,3.3svh,30px)] flex h-[clamp(52px,7.2svh,64px)] shrink-0 items-center justify-center rounded-[9px] bg-[#22884a] text-white shadow-[0_10px_20px_rgba(30,87,44,0.18)] transition-transform active:scale-[0.99] md:mx-auto md:mt-6 md:h-[58px] md:w-[430px]"
          >
            <span className="block text-[25px] font-extrabold leading-none tracking-[-0.035em] min-[390px]:text-[28px] md:text-[28px] md:tracking-normal">
              Aplicar Ahora
            </span>
          </button>

          <div className="mt-[clamp(7px,1.3svh,12px)] flex shrink-0 items-center justify-center gap-2 text-[clamp(14px,3.8svw,21px)] font-medium tracking-[-0.03em] text-[#737c83] md:mt-3 md:text-[18px] md:tracking-normal">
            <LockIcon />
            <span>Seguro. Rapido. Sencillo.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
