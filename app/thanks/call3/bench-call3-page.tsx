"use client";

import Image from "next/image";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildApplicationNumber } from "@/lib/application-number";
import { createEventId, getUtmParams, pushGtmEvent } from "@/lib/gtm-events";

const fallbackPhoneNumber =
  process.env.NEXT_PUBLIC_PAY_PER_CALL_PHONE_NUMBER || "+18882882203";
const fallbackRingbaCampaignId = process.env.NEXT_PUBLIC_RINGBA_CAMPAIGN_ID || "";

type BenchCall3PageProps = {
  funnelId?: string;
  ageGroup?: string;
  insuranceGoal?: string;
  leadId?: string;
  firstName?: string;
  applicationNumber?: string;
  phoneNumber?: string;
  ringbaCampaignId?: string;
};

function normalizePhoneDigits(value?: string | null) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return digits;
  if (digits.length === 10) return `1${digits}`;
  return digits;
}

function formatPhone(value: string) {
  const digits = normalizePhoneDigits(value);
  const national =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (national.length !== 10) return fallbackPhoneNumber;
  return `+1 (${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getVisiblePrintedPhoneNumber() {
  if (typeof document === "undefined") return "";

  const phoneNodes = Array.from(
    document.querySelectorAll<HTMLElement>("[data-call3-ringba-phone]"),
  );

  for (const node of phoneNodes) {
    const href = node instanceof HTMLAnchorElement ? node.href : "";
    const candidate = normalizePhoneDigits(`${node.textContent || ""} ${href}`);
    if (/^1[2-9]\d{2}[2-9]\d{6}$/.test(candidate)) return candidate;
  }

  return "";
}

export default function BenchCall3Page({
  funnelId = "",
  ageGroup = "",
  insuranceGoal = "",
  leadId = "",
  firstName = "",
  applicationNumber = "",
  phoneNumber = fallbackPhoneNumber,
  ringbaCampaignId = fallbackRingbaCampaignId,
}: BenchCall3PageProps) {
  const resolvedPhoneNumber = phoneNumber || fallbackPhoneNumber;
  const resolvedRingbaCampaignId = ringbaCampaignId || fallbackRingbaCampaignId;
  const [printedNumber, setPrintedNumber] = useState(() =>
    normalizePhoneDigits(resolvedPhoneNumber),
  );
  const [secondsLeft, setSecondsLeft] = useState(180);
  const hasSentPrintedNumberRef = useRef(false);
  const basePhoneNumber = normalizePhoneDigits(resolvedPhoneNumber);
  const ringbaScriptUrl = /^CA[a-zA-Z0-9]+$/.test(resolvedRingbaCampaignId)
    ? `//b-js.ringba.com/${resolvedRingbaCampaignId}`
    : "";
  const resolvedApplicationNumber =
    applicationNumber || buildApplicationNumber(leadId);
  const safeFirstName = firstName.trim();
  const telHref = `tel:+${printedNumber || basePhoneNumber}`;
  const phoneDisplay = formatPhone(printedNumber || basePhoneNumber);
  const ringbaTags = useMemo(
    () =>
      JSON.stringify({
        ...Object.fromEntries(
          new URLSearchParams(
            typeof window !== "undefined" ? window.location.search : "",
          ).entries(),
        ),
        funnel_id: funnelId,
        call3_age_group: ageGroup,
        call3_insurance_goal: insuranceGoal,
        lead_id: leadId,
      }),
    [ageGroup, funnelId, insuranceGoal, leadId],
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSecondsLeft((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!leadId) return;

    try {
      const storedNumber =
        window.sessionStorage.getItem(`bf_printed_number_${leadId}`) ||
        window.sessionStorage.getItem("bf_last_printed_number");

      if (storedNumber) {
        window.setTimeout(() => {
          setPrintedNumber(normalizePhoneDigits(storedNumber));
        }, 0);
      }
    } catch {
      // Ringba can still replace the visible number below.
    }
  }, [leadId]);

  useEffect(() => {
    const sendPrintedNumber = (nextPrintedNumber: string) => {
      if (hasSentPrintedNumberRef.current) return;
      if (!/^1[2-9]\d{2}[2-9]\d{6}$/.test(nextPrintedNumber)) return;

      hasSentPrintedNumberRef.current = true;
      setPrintedNumber(nextPrintedNumber);

      try {
        window.sessionStorage.setItem("bf_last_printed_number", nextPrintedNumber);
        if (leadId) {
          window.sessionStorage.setItem(
            `bf_printed_number_${leadId}`,
            nextPrintedNumber,
          );
        }
      } catch {
        // Best effort only.
      }

      if (!leadId) return;

      void fetch("/api/call-attribution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId,
          applicationId: resolvedApplicationNumber,
          printedNumber: nextPrintedNumber,
          page: "/thanks/call3",
        }),
        keepalive: true,
      }).catch(() => {
        hasSentPrintedNumberRef.current = false;
      });
    };

    const syncPrintedNumber = () => {
      const nextPrintedNumber = getVisiblePrintedPhoneNumber();
      if (!nextPrintedNumber || nextPrintedNumber === basePhoneNumber) return;
      sendPrintedNumber(nextPrintedNumber);
    };

    const observer = new MutationObserver(syncPrintedNumber);
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    });

    const intervalId = window.setInterval(syncPrintedNumber, 250);
    const timeoutId = window.setTimeout(() => {
      sendPrintedNumber(normalizePhoneDigits(printedNumber || basePhoneNumber));
      window.clearInterval(intervalId);
      observer.disconnect();
    }, 10000);

    syncPrintedNumber();

    return () => {
      observer.disconnect();
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [basePhoneNumber, leadId, printedNumber, resolvedApplicationNumber]);

  const trackContactClick = () => {
    pushGtmEvent("Contact", {
      event_id: createEventId("contact"),
      lead_id: leadId || undefined,
      external_id: leadId || undefined,
      funnel_id: funnelId || "iul-v4",
      ringba_phone_number: printedNumber || basePhoneNumber,
      country: "us",
      ...getUtmParams(),
    });
  };

  return (
    <main
      className="min-h-screen bg-[#f3f3f3] text-[#171717]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(211,211,211,.42) 1px, transparent 1px), linear-gradient(90deg, rgba(211,211,211,.42) 1px, transparent 1px)",
        backgroundSize: "106px 106px",
      }}
    >
      <Script id="ringba-call3-tags" strategy="afterInteractive">
        {`
          window._rgba_tags = window._rgba_tags || [];
          window._rgba_tags.push(${ringbaTags});
        `}
      </Script>
      {ringbaScriptUrl ? (
        <Script
          id="ringba-call3-number-pool"
          src={ringbaScriptUrl}
          strategy="afterInteractive"
        />
      ) : null}

      <section className="mx-auto w-full max-w-[720px] px-1 pb-14 pt-[86px] text-center sm:px-5 sm:pt-24">
        <h1 className="mx-auto max-w-[610px] px-5 text-[24px] font-black leading-[1.35] text-[#0c263e] sm:text-[30px]">
          Conéctate Con Un Agente Para Completar Tu Solicitud De Seguro De Vida.
        </h1>

        <div className="mt-9 bg-white px-5 pb-8 pt-9 shadow-[0_1px_10px_rgba(0,0,0,0.025)] sm:px-8 sm:pb-10">
          <div className="bg-[#34588f] px-2 py-2.5 text-[21px] font-black leading-tight text-white sm:text-[25px]">
            FELICIDADES{safeFirstName ? `, ${safeFirstName}` : ""}
          </div>

          <p className="mx-auto mt-5 max-w-[600px] text-[19px] leading-[1.42] sm:text-[22px]">
            Eres elegible para avanzar con tu solicitud y conocer las opciones
            disponibles para <strong>proteger a tu familia.</strong>
            <br />
            Beneficios para gastos finales, hipoteca, jubilación y más.
          </p>

          <p className="mt-5 text-[18px] font-black text-[#f2382e] sm:text-[20px]">
            Aplicación #: {resolvedApplicationNumber}
          </p>

          <p className="mt-6 text-[16px] leading-snug sm:text-[18px]">
            Debes <strong>Llamar Ahora</strong> para completar tu solicitud.
          </p>

          <a
            data-call3-ringba-phone
            href={telHref}
            onClick={trackContactClick}
            className="mx-auto mt-5 flex min-h-[55px] w-full max-w-[330px] items-center justify-center bg-[#579531] px-3 text-[24px] font-semibold tracking-[0.01em] text-white transition hover:bg-[#477c27] active:scale-[0.99] sm:text-[28px]"
            aria-label={`Llamar ahora al ${phoneDisplay}`}
          >
            {phoneDisplay}
          </a>

          <p className="mt-5 text-[16px] font-black sm:text-[18px]">
            Esta oportunidad termina en{" "}
            <span className="text-[#f2382e]">
              {formatCountdown(secondsLeft)}
            </span>
          </p>

          <div className="mx-auto mt-10 flex max-w-[310px] items-center justify-center border-y border-[#ececec] py-5">
            <Image
              src="/best-money-assets/secure-call-badge.png"
              alt="Llamada segura"
              width={918}
              height={148}
              className="h-auto w-[220px]"
            />
          </div>

          <div className="mx-auto mt-5 max-w-[610px] text-left text-[9px] leading-[1.35] text-[#272727] sm:text-[10px]">
            <p>
              Al hacer clic en el número telefónico, aceptas ser contactado por
              Best Life y sus socios de marketing por teléfono, mensajes de texto
              o correo electrónico, incluso si tu número aparece en una lista
              estatal o federal de no llamar. El consentimiento no es una
              condición para recibir servicios.
            </p>
            <p className="mt-3">
              Puedes recibir llamadas o mensajes mediante tecnología automatizada
              o pregrabada. Se pueden aplicar tarifas de mensajes y datos. Al
              continuar, confirmas que eres mayor de 18 años y aceptas nuestra{" "}
              <a
                href="/privacy"
                className="font-bold text-[#1769d2] underline"
              >
                Política de Privacidad
              </a>{" "}
              y nuestros{" "}
              <a href="/terms" className="font-bold text-[#1769d2] underline">
                Términos y Condiciones
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
