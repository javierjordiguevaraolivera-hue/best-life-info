"use client";

import Image from "next/image";

type SavingsPlanPrelandProps = {
  onContinue: () => void;
};

const benefits = [
  "Ahorro con potencial de crecimiento",
  "Proteccion para tu familia",
  "Beneficios en vida cuando los necesites",
];

function CheckIcon() {
  return (
    <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[#1f8a5b] text-white">
      <svg aria-hidden="true" viewBox="0 0 16 16" className="h-[15px] w-[15px]" fill="none">
        <path
          d="m3.2 8.1 2.7 2.8 6.8-7"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function SavingsPlanPreland({ onContinue }: SavingsPlanPrelandProps) {
  return (
    <main className="flex min-h-[100svh] bg-[#eef7f6] text-[#13273d] md:bg-white">
      <section className="mx-auto flex min-h-[100svh] w-full max-w-[430px] flex-col overflow-hidden bg-white md:max-w-[760px] md:shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
        <header className="flex h-[82px] shrink-0 items-center justify-center border-b border-[#e5eef0] bg-white px-8 md:h-[92px]">
          <Image
            src="/best-life-assets/seguros-de-vida-prweland-logo.png"
            alt="Seguros de Vida IUL"
            width={789}
            height={208}
            priority
            className="h-auto w-full max-w-[210px] object-contain invert md:max-w-[230px]"
          />
        </header>

        <div className="relative h-[34svh] min-h-[235px] shrink-0 overflow-hidden md:h-[330px]">
          <Image
            src="/best-life-assets/familia-prelanding.png"
            alt="Familia al aire libre"
            fill
            priority
            sizes="(min-width: 768px) 760px, 100vw"
            className="object-cover object-[center_58%]"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/72 to-transparent" />
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-8 pb-6 pt-1 md:mx-auto md:w-full md:max-w-[560px] md:px-0 md:pb-8 md:pt-3">
          <p className="text-center text-[14px] font-bold uppercase tracking-[0.16em] text-[#1f8a5b]">
            Plan de ahorro IUL
          </p>

          <h1 className="mt-3 text-center text-[40px] font-black leading-[0.98] tracking-[-0.045em] text-[#12243a] md:text-[50px] md:tracking-normal">
            Ahorra para tu futuro
            <span className="block text-[0.78em] text-[#24445f]">sin dejar de proteger</span>
          </h1>

          <p className="mx-auto mt-4 max-w-[340px] text-center text-[20px] font-medium leading-[1.28] tracking-[-0.025em] text-[#53606a] md:max-w-[470px] md:text-[24px] md:tracking-normal">
            Descubre una estrategia para crecer tu dinero y cuidar a tu familia al mismo tiempo.
          </p>

          <ul className="mt-5 space-y-3 md:mx-auto md:w-full md:max-w-[430px]">
            {benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-center gap-3 text-[17px] font-semibold leading-[1.22] text-[#24323c] md:text-[20px]"
              >
                <CheckIcon />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onContinue}
            className="mt-auto flex h-[58px] w-full items-center justify-center rounded-[10px] bg-[#004b7a] px-6 text-[23px] font-black uppercase tracking-[0.03em] text-white shadow-[0_12px_24px_rgba(0,65,111,0.24)] transition hover:bg-[#005b91] focus:outline-none focus:ring-4 focus:ring-[#9dc8e8] md:mx-auto md:mt-8 md:h-[64px] md:w-[430px]"
          >
            Aplicar Ahora
          </button>

          <p className="mt-3 text-center text-[14px] font-semibold text-[#7a858d] md:text-[16px]">
            Seguro. Rapido. Sencillo.
          </p>
        </div>
      </section>
    </main>
  );
}
