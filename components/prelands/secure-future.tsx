"use client";

import Image from "next/image";

type SecureFuturePrelandProps = {
  onContinue: () => void;
};

const featureItems = [
  {
    title: "Mortgage\nProtection",
    icon: "home",
  },
  {
    title: "Crecimiento\nIndexado",
    icon: "money",
  },
  {
    title: "Health & Life\nCoverage",
    icon: "health",
  },
];

function ShieldIcon({ icon }: { icon: string }) {
  if (icon === "home") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 64 72"
        className="h-[clamp(30px,5.5svh,44px)] w-[clamp(28px,5svh,40px)] text-[#30343a]"
        fill="none"
      >
        <path d="M11 35 32 16l21 19" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 32v25h28V32" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
        <path d="M28 57V44h8v13" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "health") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 64 72"
        className="h-[clamp(30px,5.5svh,44px)] w-[clamp(28px,5svh,40px)] text-[#30343a]"
        fill="none"
      >
        <path
          d="M32 56s-20-12.2-20-27.2C12 21.5 17 16 23.5 16c3.7 0 6.9 1.8 8.5 4.7C33.6 17.8 36.8 16 40.5 16 47 16 52 21.5 52 28.8 52 43.8 32 56 32 56Z"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path d="M32 28v15" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M24.5 35.5h15" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "money") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 64 72"
        className="h-[clamp(30px,5.5svh,44px)] w-[clamp(28px,5svh,40px)] text-[#30343a]"
        fill="none"
      >
        <path d="M24 18h16l-5 9h-6l-5-9Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
        <path d="M20 32c-5 5.5-8 13.2-8 20 0 8.4 7.4 13 20 13s20-4.6 20-13c0-6.8-3-14.5-8-20-3.5-3.8-7.2-5-12-5s-8.5 1.2-12 5Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
        <path d="M28 49c0 2.2 1.8 3.7 4.4 3.7 2.4 0 4.1-1.2 4.1-3.1 0-2.1-1.9-2.8-4.5-3.4-2.6-.6-4.4-1.4-4.4-3.5 0-1.9 1.7-3.1 4.2-3.1 2.4 0 4 1.2 4.2 3.2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M32 37v18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 72"
      className="h-[clamp(30px,5.5svh,44px)] w-[clamp(28px,5svh,40px)] text-[#30343a]"
      fill="none"
    >
      <path
        d="M32 4 56 16v17c0 16.5-9.8 28.5-24 35C17.8 61.5 8 49.5 8 33V16L32 4Z"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinejoin="round"
      />
      {icon === "heart" ? (
        <path
          d="M32 47s-13-7.6-13-17.2c0-4.6 3.2-7.8 7.2-7.8 2.4 0 4.6 1.2 5.8 3.1 1.2-1.9 3.4-3.1 5.8-3.1 4 0 7.2 3.2 7.2 7.8C45 39.4 32 47 32 47Z"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  );
}

export default function SecureFuturePreland({
  onContinue,
}: SecureFuturePrelandProps) {
  return (
    <main className="flex h-[100svh] overflow-hidden items-center justify-center bg-white text-[#0b3554] md:bg-[#f5f5f5]">
      <section className="relative flex h-[100svh] w-full max-w-[430px] flex-col overflow-hidden bg-[#fffdf9] px-[22px] pb-[10px] pt-[clamp(18px,3.4svh,38px)] md:max-h-[900px] md:rounded-[28px] md:shadow-[0_18px_60px_rgba(0,0,0,0.16)]">
        <Image
          src="/best-life-assets/familia-prelanding.png"
          alt=""
          width={1024}
          height={1792}
          priority
          sizes="(max-width: 430px) 100vw, 430px"
          className="absolute inset-x-0 top-[11svh] h-auto w-full"
        />
        <div className="absolute inset-x-0 top-0 h-[34svh] bg-gradient-to-b from-[#fffdf9] via-[#fffdf9]/86 via-[62%] to-transparent" />
        <div className="relative z-10 text-center">
          <h1
            className="text-[clamp(32px,6.1svh,52px)] font-bold leading-[0.98] tracking-[-0.02em]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            <span className="block">Protege Tu</span>
            <span className="block">Familia</span>
          </h1>

          <p className="mx-auto mt-[clamp(10px,1.8svh,18px)] max-w-[315px] text-[clamp(14px,2.25svh,18px)] font-medium leading-[1.28] text-[#35373b]">
            Cuida de tu familia pase lo que pase. Accede a beneficios en vida cuando mas los necesites
          </p>
        </div>

        <div className="relative z-40 mx-[-22px] mt-auto h-[30svh] min-h-[155px] overflow-visible">
          <button
            type="button"
            onClick={onContinue}
            className="absolute bottom-[-28px] left-1/2 z-30 flex h-[clamp(52px,8.4svh,66px)] w-[78%] -translate-x-1/2 items-center justify-center rounded-[18px] border border-black/10 bg-[#003f68] px-5 text-[clamp(20px,3.6svh,32px)] font-black uppercase tracking-[0.06em] text-white shadow-[0_2px_0_rgba(0,0,0,0.28),0_10px_20px_rgba(0,38,68,0.32)] transition hover:bg-[#004c7f] focus:outline-none focus:ring-4 focus:ring-[#8bb9dd]"
          >
            Aplicar Ahora
          </button>
        </div>

        <div className="relative z-10 mx-[-22px] -mt-[8px] h-[14px] bg-gradient-to-t from-[#fffdf9] via-[#fffdf9]/82 to-transparent" />

        <div className="relative z-20 mx-[-22px] grid grid-cols-3 gap-2 bg-[#fffdf9] px-[22px] pb-[clamp(4px,1svh,10px)] pt-[clamp(34px,5.7svh,46px)] text-center">
          {featureItems.map((item) => (
            <div key={item.title} className="flex flex-col items-center">
              <ShieldIcon icon={item.icon} />
              <p className="mt-[clamp(4px,0.9svh,8px)] whitespace-pre-line text-[clamp(12px,2.1svh,17px)] font-medium leading-[1.14] text-[#30343a]">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
