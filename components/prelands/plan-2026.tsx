"use client";

import { Montserrat } from "next/font/google";

type Plan2026PrelandProps = {
  onContinue: () => void;
};

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

const introBenefits = [
  {
    icon: "growth",
    title: "Ahorro con Interes Compuesto",
    description: "Maximiza tus fondos con rendimientos de hasta el 9.5% anual.",
  },
  {
    icon: "tax",
    title: "Retiros Libres de Impuestos",
    description: "Accede a tu dinero para el retiro sin pagar impuestos al IRS.",
  },
  {
    icon: "liquidity",
    title: "Liquidez Inmediata",
    description: "Solicita prestamos usando tu poliza como garantia cuando quieras.",
  },
  {
    icon: "protection",
    title: "Proteccion Contra Caidas",
    description: "Tu ahorro esta seguro con piso 0% aunque el mercado caiga.",
  },
  {
    icon: "health",
    title: "Beneficios en Vida",
    description: "Usa tus fondos en caso de una enfermedad critica o emergencia grave.",
  },
];

function IntroBenefitIcon({ icon }: { icon: string }) {
  const className = "h-[30px] w-[30px] md:h-[34px] md:w-[34px]";

  if (icon === "growth") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
        <rect x="3.5" y="4.5" width="17" height="15" rx="3" fill="#ece7ff" />
        <path d="M6.5 16.5 10 13l2.4 2.2 5.1-5.2" stroke="#1a73e8" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 7.5v9M11.5 7.5v9M16.5 7.5v9" stroke="#c4b5fd" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "tax") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
        <circle cx="12" cy="12" r="7.8" stroke="#f04467" strokeWidth="2.2" />
        <path d="M7 7 17 17" stroke="#f04467" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "liquidity") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
        <path d="M4 9.3 12 4l8 5.3" stroke="#7b6aa6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.5 10h13" stroke="#7b6aa6" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M7.2 10v7.3M12 10v7.3M16.8 10v7.3" stroke="#7b6aa6" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M4.5 18h15" stroke="#7b6aa6" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "protection") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
        <path d="M12 3.8c2.8 1.9 5.8 2.4 8 2.5v6c0 4.5-3.2 7.9-8 9.5-4.8-1.6-8-5-8-9.5v-6c2.2-.1 5.2-.6 8-2.5Z" fill="#dbeafe" stroke="#1a73e8" strokeWidth="1.6" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <rect x="5" y="4.5" width="14" height="15" rx="2.5" fill="#f2e8ff" />
      <path d="M12 7.2v5.4M9.3 9.9h5.4" stroke="#df4fb1" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8.5 15.8h7" stroke="#9b6ce0" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8.5 18.2h5.2" stroke="#9b6ce0" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Plan2026Preland({ onContinue }: Plan2026PrelandProps) {
  return (
    <main className={`${montserrat.className} min-h-[100svh] bg-[#f4f8fd] text-[#101820]`}>
      <section className="mx-auto flex min-h-[100svh] w-full max-w-[980px] flex-col items-center px-3 pb-5 pt-6 md:px-4 md:pb-10 md:pt-8">
        <div className="w-full max-w-[800px] px-[8px] py-[7px]">
          <div className="text-center">
            <h1 className="mx-auto max-w-[350px] text-[32px] font-extrabold leading-[1.16] tracking-normal text-[#0d2b5b] md:max-w-none md:text-[52px] md:leading-[1.14]">
              Plan Estrategico de Ahorro IUL 2026
            </h1>
            <p className="mx-auto mt-2 max-w-[340px] border-b-2 border-[#e8eef6] pb-[12px] text-[14px] leading-[1.25] text-[#64748b] md:mt-4 md:max-w-none md:pb-[15px] md:text-[18px]">
              Exclusivo para residentes de 22 a 50 anos
            </p>
          </div>

          <div className="mt-[14px] grid gap-[11px] md:mt-[15px] md:gap-[15px]">
            {introBenefits.map((benefit) => (
              <button
                key={benefit.title}
                type="button"
                onClick={onContinue}
                className="flex cursor-pointer items-stretch overflow-hidden rounded-[14px] bg-white text-left shadow-[0_0_0_1px_rgba(26,115,232,0.08),0_8px_20px_rgba(15,23,42,0.045)] transition-all duration-300 ease-out hover:-translate-y-[3px] hover:scale-[1.02] hover:shadow-[0_0_0_1px_rgba(26,115,232,0.14),0_10px_24px_rgba(15,23,42,0.075)] md:rounded-[15px]"
              >
                <span className="w-[6px] shrink-0 bg-[#1a73e8] md:w-[8px]" />
                <span className="flex flex-1 items-center gap-[13px] px-[17px] py-[14px] md:gap-[16px] md:px-[20px] md:py-[20px]">
                  <span className="flex min-w-[40px] justify-center md:min-w-[50px]">
                    <IntroBenefitIcon icon={benefit.icon} />
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block text-[20px] font-bold leading-[1.12] text-[#1e40af] md:text-[19px] md:leading-[1.2]">
                      {benefit.title}
                    </span>
                    <span className="mt-[4px] block text-[16px] leading-[1.28] text-[#475569] md:mt-1 md:text-[16px] md:leading-[1.4]">
                      {benefit.description}
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="mt-[28px] flex justify-center md:mt-[40px]">
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex w-full max-w-[365px] flex-col items-center justify-center rounded-[30px] bg-[#1a73e8] px-5 py-[15px] text-center text-white shadow-[10px_14px_18px_rgba(8,31,68,0.28),0_20px_34px_rgba(8,31,68,0.22),0_0_0_1px_rgba(255,255,255,0.22)_inset] transition-all duration-300 ease-out hover:-translate-y-[3px] hover:scale-[1.02] hover:bg-[#145fc1] hover:shadow-[12px_16px_22px_rgba(8,31,68,0.32),0_24px_42px_rgba(8,31,68,0.26),0_0_0_1px_rgba(255,255,255,0.18)_inset] focus:outline-none focus:ring-4 focus:ring-[#9cc3ff] sm:max-w-[420px] sm:rounded-[36px] sm:px-6 sm:py-[18px]"
            >
              <span className="w-full text-center text-[21px] font-extrabold leading-[1.08] text-white sm:text-[22px] md:text-[24px]">
                Verificar Mi Elegibilidad
              </span>
              <span className="mt-1 block w-full text-center text-[13px] font-semibold leading-[1.15] text-[#e0f2fe] sm:text-[14px] md:text-[14px]">
                (Solo para personas de 22 a 50 anos)
              </span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
