"use client";

import Image from "next/image";

type FinancialFreedomPrelandProps = {
  onContinue: () => void;
};

const benefits = [
  "Acceso a beneficios en vida",
  "Ayuda a complementar tu retiro",
  "Protección para tu hogar",
  "Potencial de valor en efectivo",
  "Protección para tu familia",
  "Potencial de crecimiento",
  "Legado para tu familia",
];

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 28 28"
      className="h-[26px] w-[26px] shrink-0 text-[#228a55] md:h-[41px] md:w-[41px]"
      fill="none"
    >
      <path
        d="M4.5 14.4 11 21 24 6.8"
        stroke="currentColor"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FinancialFreedomPreland({
  onContinue,
}: FinancialFreedomPrelandProps) {
  return (
    <main className="min-h-[100svh] bg-[#e4f3f4] text-[#142844] sm:bg-[#f7f8fb]">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800;900&display=swap");
      `}</style>

      <section
        className="mx-auto flex min-h-[100svh] w-full max-w-[760px] flex-col bg-white shadow-[0_12px_40px_rgba(15,23,42,0.12)] sm:min-h-screen"
        style={{ fontFamily: '"Montserrat", Arial, sans-serif' }}
      >
        <header className="flex h-[17svh] min-h-[108px] max-h-[136px] items-center justify-center bg-[#003a73] px-7 py-5 text-white shadow-[inset_0_-10px_28px_rgba(0,0,0,0.16)] md:min-h-[210px] md:py-8">
          <Image
            src="/best-life-assets/seguros-de-vida-prweland-logo.png"
            alt="Financial Freedom"
            width={789}
            height={208}
            priority
            className="h-auto w-full max-w-[260px] object-contain min-[390px]:max-w-[286px] md:max-w-[520px]"
          />
        </header>

        <div className="flex min-h-0 flex-1 flex-col px-[30px] pb-[18px] pt-[7svh] min-[390px]:px-[36px] md:px-[86px] md:pb-14 md:pt-[92px]">
          <h1 className="text-[29px] font-bold leading-[1.22] tracking-normal text-[#152b46] drop-shadow-[0_2px_1px_rgba(15,23,42,0.18)] min-[390px]:text-[32px] md:text-[64px]">
            <span className="block">Construye tu retiro.</span>
            <span className="block">Protege a quienes</span>
            <span className="block">más amas.</span>
          </h1>

          <p className="mt-[4.8svh] text-[21px] font-semibold leading-[1.35] tracking-normal text-[#4a4a50] min-[390px]:text-[23px] md:text-[42px]">
            Podrías retirar hasta $650,000
            <span className="block">en tu jubilación creciendo tus ahorros</span>
          </p>

          <ul className="mt-[3.6svh] flex flex-col gap-[1.6svh] md:mt-16 md:gap-[36px]">
            {benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-center gap-[15px] text-[16px] font-bold leading-[1.12] tracking-normal text-[#45454b] min-[390px]:gap-[18px] min-[390px]:text-[18px] md:gap-[32px] md:text-[34px]"
              >
                <CheckIcon />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onContinue}
            className="mt-[5svh] flex h-[56px] w-full items-center justify-center rounded-[8px] bg-[#003f7c] px-6 text-[28px] uppercase leading-none tracking-normal text-white shadow-[inset_0_2px_8px_rgba(255,255,255,0.12),0_2px_5px_rgba(0,0,0,0.16)] transition hover:bg-[#004b91] focus:outline-none focus:ring-4 focus:ring-[#78aee5] min-[390px]:h-[62px] min-[390px]:text-[31px] md:mt-auto md:h-[112px] md:text-[54px]"
          >
            <span className="font-[900]" style={{ fontWeight: 900 }}>
              Aplicar ahora
            </span>
          </button>
        </div>
      </section>
    </main>
  );
}
