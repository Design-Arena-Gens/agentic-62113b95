"use client";

import { useMemo, useState } from "react";

type EmailTone = "profesional" | "cordial" | "entusiasta";
type TemplateId = "seguimiento" | "bienvenida" | "recordatorio";

interface ToneConfig {
  key: EmailTone;
  label: string;
  description: string;
  greeting: string;
  connector: string;
  closing: string;
  signature: string;
  highlightHeading: string;
}

interface FormState {
  destinatario: string;
  asuntoPersonalizado: string;
  tema: string;
  contexto: string;
  puntos: string;
  accion: string;
  fecha: string;
  notaFinal: string;
  remitente: string;
  rol: string;
  extra: string;
}

interface TemplateArgs extends FormState {
  tone: ToneConfig;
  puntosArray: string[];
}

interface TemplateConfig {
  id: TemplateId;
  title: string;
  badge: string;
  description: string;
  subject: (args: TemplateArgs) => string;
  body: (args: TemplateArgs) => string;
}

const toneLibrary: Record<EmailTone, ToneConfig> = {
  profesional: {
    key: "profesional",
    label: "Profesional",
    description: "Formal, directo y con foco en resultados.",
    greeting: "Estimado/a",
    connector: "Espero que este mensaje te encuentre bien",
    closing: "Quedo atento a tus comentarios",
    signature: "Saludos cordiales",
    highlightHeading: "Resumen de puntos clave:",
  },
  cordial: {
    key: "cordial",
    label: "Cercano",
    description: "Amable, colaborativo y humano.",
    greeting: "Hola",
    connector: "Espero que estés teniendo una gran semana",
    closing: "Seguimos en contacto",
    signature: "Un abrazo",
    highlightHeading: "Lo más importante:",
  },
  entusiasta: {
    key: "entusiasta",
    label: "Entusiasta",
    description: "Energético, motivador y positivo.",
    greeting: "¡Hola",
    connector: "Me entusiasma contarte las novedades",
    closing: "Me encantaría saber qué te parece",
    signature: "¡Vamos con todo!",
    highlightHeading: "Highlights para celebrar:",
  },
};

const ensureSentence = (value: string, fallback?: string): string => {
  const trimmed = value?.trim();
  if (trimmed) {
    return /[.!?¡¿]$/.test(trimmed) ? trimmed : `${trimmed}.`;
  }
  const fallbackTrimmed = fallback?.trim();
  if (fallbackTrimmed) {
    return /[.!?¡¿]$/.test(fallbackTrimmed)
      ? fallbackTrimmed
      : `${fallbackTrimmed}.`;
  }
  return "";
};

const formatBullets = (items: string[]): string =>
  items.map((item) => `• ${item}`).join("\n");

const buildSignature = (
  remitente: string,
  rol: string,
  signature: string,
): string => {
  const lines = [`${signature},`, remitente.trim() || "Tu nombre"];
  if (rol.trim()) {
    lines.push(rol.trim());
  }
  return lines.join("\n");
};

const templates: TemplateConfig[] = [
  {
    id: "seguimiento",
    title: "Seguimiento",
    badge: "Negocios",
    description:
      "Refuerza el interés, aporta valor y pedí una respuesta concreta.",
    subject: ({ tema, destinatario }) => {
      const base = tema
        ? `Seguimiento sobre ${tema.trim()}`
        : "Seguimiento de nuestra conversación";
      return destinatario.trim()
        ? `${base} — ${destinatario.trim()}`
        : base;
    },
    body: ({
      tone,
      destinatario,
      contexto,
      puntosArray,
      accion,
      fecha,
      extra,
      notaFinal,
      remitente,
      rol,
    }) => {
      const saludo = `${tone.greeting} ${destinatario.trim() || "equipo"}`;
      const intro = ensureSentence(contexto, tone.connector);
      const extraLine = ensureSentence(extra);
      const destaque = puntosArray.length
        ? `${tone.highlightHeading}\n${formatBullets(puntosArray)}`
        : "";
      const accionLinea = ensureSentence(accion);
      const recordatorio = ensureSentence(
        fecha ? `Idealmente antes de ${fecha.trim()}` : "",
      );
      const cierre = ensureSentence(
        [
          tone.closing,
          notaFinal.trim() ? notaFinal.trim() : undefined,
        ]
          .filter(Boolean)
          .join(" "),
        tone.closing,
      );
      const firma = buildSignature(remitente, rol, tone.signature);

      const paragraphs = [
        `${saludo},`,
        [intro, extraLine].filter(Boolean).join(" "),
        destaque,
        [accionLinea, recordatorio].filter(Boolean).join(" "),
        cierre,
        firma,
      ].filter(Boolean);

      return paragraphs.join("\n\n");
    },
  },
  {
    id: "bienvenida",
    title: "Bienvenida",
    badge: "Onboarding",
    description:
      "Dale la bienvenida a nuevas personas con claridad y calidez.",
    subject: ({ tema, destinatario }) => {
      const nombre = destinatario.trim();
      const base = tema.trim()
        ? `Bienvenido/a a ${tema.trim()}`
        : "Bienvenido/a a bordo";
      return nombre ? `${base}, ${nombre}!` : `${base}!`;
    },
    body: ({
      tone,
      destinatario,
      contexto,
      puntosArray,
      accion,
      fecha,
      extra,
      notaFinal,
      remitente,
      rol,
    }) => {
      const saludo = `${tone.greeting}${
        tone.key === "entusiasta" ? "!" : ""
      } ${destinatario.trim() || "nuevo integrante"}`;
      const intro = ensureSentence(
        contexto,
        "Nos alegra mucho contar con vos en esta etapa",
      );
      const recursos = puntosArray.length
        ? `Recursos iniciales:\n${formatBullets(puntosArray)}`
        : "";
      const primerPaso = ensureSentence(
        accion,
        "Tu primer paso será revisar el material de bienvenida",
      );
      const agenda = ensureSentence(
        fecha ? `Tenemos agendada una instancia el ${fecha.trim()}` : "",
      );
      const soporte = ensureSentence(
        extra,
        "Si necesitás algo, esta es tu vía directa conmigo",
      );
      const cierre = ensureSentence(
        [
          tone.closing,
          notaFinal.trim() ? notaFinal.trim() : undefined,
        ]
          .filter(Boolean)
          .join(" "),
        tone.closing,
      );
      const firma = buildSignature(remitente, rol, tone.signature);

      const paragraphs = [
        `${saludo},`,
        intro,
        recursos,
        [primerPaso, agenda].filter(Boolean).join(" "),
        soporte,
        cierre,
        firma,
      ].filter(Boolean);

      return paragraphs.join("\n\n");
    },
  },
  {
    id: "recordatorio",
    title: "Recordatorio",
    badge: "Agenda",
    description:
      "Recordá reuniones o fechas clave con tacto y claridad de acción.",
    subject: ({ tema, fecha }) => {
      const base = tema.trim()
        ? `Recordatorio: ${tema.trim()}`
        : "Recordatorio de nuestra próxima reunión";
      return fecha.trim() ? `${base} — ${fecha.trim()}` : base;
    },
    body: ({
      tone,
      destinatario,
      contexto,
      puntosArray,
      accion,
      fecha,
      extra,
      notaFinal,
      remitente,
      rol,
    }) => {
      const saludo = `${tone.greeting} ${destinatario.trim() || "equipo"}`;
      const intro = ensureSentence(
        contexto,
        "Te escribo para asegurarnos de que tenemos todo listo",
      );
      const cuando = ensureSentence(
        fecha ? `Nos encontramos el ${fecha.trim()}` : "",
      );
      const logistica = ensureSentence(
        extra,
        "Podés acceder con el enlace habitual",
      );
      const agenda = puntosArray.length
        ? `Agenda propuesta:\n${formatBullets(puntosArray)}`
        : "";
      const confirmacion = ensureSentence(
        accion,
        "Avisame si necesitás ajustar algo antes",
      );
      const cierre = ensureSentence(
        [
          tone.closing,
          notaFinal.trim() ? notaFinal.trim() : undefined,
        ]
          .filter(Boolean)
          .join(" "),
        tone.closing,
      );
      const firma = buildSignature(remitente, rol, tone.signature);

      const paragraphs = [
        `${saludo},`,
        intro,
        [cuando, logistica].filter(Boolean).join(" "),
        agenda,
        confirmacion,
        cierre,
        firma,
      ].filter(Boolean);

      return paragraphs.join("\n\n");
    },
  },
];

const defaultForm: FormState = {
  destinatario: "María",
  asuntoPersonalizado: "",
  tema: "la propuesta de marketing digital",
  contexto:
    "Te escribo para retomar la conversación que tuvimos esta semana sobre la propuesta de marketing digital",
  puntos: [
    "Análisis de audiencia afinado con los nuevos datos",
    "Presupuesto ajustado a las observaciones del directorio",
    "Calendario de lanzamientos listo para revisión",
  ].join("\n"),
  accion: "¿Podrías confirmarme si seguimos adelante con el plan?",
  fecha: "viernes 12 a las 12:00",
  notaFinal: "Así reservamos al equipo creativo sin demoras.",
  remitente: "Julián",
  rol: "Gerente de proyectos",
  extra: "",
};

const fieldLabels: Record<keyof FormState, string> = {
  destinatario: "Nombre del destinatario",
  asuntoPersonalizado: "Asunto personalizado (opcional)",
  tema: "Tema o proyecto principal",
  contexto: "Contexto del correo",
  puntos: "Puntos clave (uno por línea)",
  accion: "Acción que necesitás",
  fecha: "Fecha, hora o deadline relevante",
  notaFinal: "Nota final o refuerzo",
  remitente: "Tu nombre",
  rol: "Rol o equipo",
  extra: "Dato extra (enlace, recurso, etc.)",
};

const helperTexts: Partial<Record<keyof FormState, string>> = {
  puntos: "Ejemplo: Presupuesto cerrado / Enlace al documento / Próximos pasos",
  accion: "Pedí una confirmación, feedback puntual o la acción esperada.",
  extra: "Comparte enlaces, ubicaciones o detalles logísticos.",
};

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40";

export default function Home() {
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateId>("seguimiento");
  const [tone, setTone] = useState<EmailTone>("profesional");
  const [form, setForm] = useState<FormState>(defaultForm);
  const [copyStatus, setCopyStatus] = useState<{
    subject: "idle" | "copied" | "error";
    body: "idle" | "copied" | "error";
  }>({ subject: "idle", body: "idle" });

  const template = useMemo(
    () => templates.find((item) => item.id === selectedTemplate)!,
    [selectedTemplate],
  );

  const puntosArray = useMemo(
    () =>
      form.puntos
        .split("\n")
        .map((item) => item.replace(/^[-•]\s*/, "").trim())
        .filter(Boolean),
    [form.puntos],
  );

  const composed = useMemo(() => {
    const args: TemplateArgs = {
      ...form,
      tone: toneLibrary[tone],
      puntosArray,
    };

    const generatedSubject = template.subject(args);
    const subject =
      form.asuntoPersonalizado.trim() || generatedSubject.trim();
    const body = template.body(args);

    return { subject, body };
  }, [form, puntosArray, template, tone]);

  const wordCount = useMemo(() => {
    if (!composed.body) return 0;
    return composed.body
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean).length;
  }, [composed.body]);

  const handleCopy = async (value: string, type: "subject" | "body") => {
    if (!value.trim()) {
      setCopyStatus((prev) => ({ ...prev, [type]: "error" }));
      setTimeout(
        () =>
          setCopyStatus((prev) => ({
            ...prev,
            [type]: "idle",
          })),
        2000,
      );
      return;
    }

    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard?.writeText
      ) {
        await navigator.clipboard.writeText(value);
      } else if (typeof document !== "undefined") {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopyStatus((prev) => ({ ...prev, [type]: "copied" }));
      setTimeout(
        () =>
          setCopyStatus((prev) => ({
            ...prev,
            [type]: "idle",
          })),
        1600,
      );
    } catch {
      setCopyStatus((prev) => ({ ...prev, [type]: "error" }));
      setTimeout(
        () =>
          setCopyStatus((prev) => ({
            ...prev,
            [type]: "idle",
          })),
        2000,
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-950/98 px-4 py-12 text-slate-100 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <header className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Emails listos para enviar
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Crea correos irresistibles en segundos.
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Elegí una plantilla, ajustá los datos clave y obtené un correo
            listo para enviar con el tono que mejor te represente. Perfecto
            para seguimientos, bienvenidas y recordatorios sin perder tiempo.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-[0_30px_120px_-50px_rgba(79,70,229,0.7)] backdrop-blur">
            <div className="grid gap-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Seleccioná una plantilla
                  </h2>
                  <p className="text-sm text-slate-400">
                    Elegí el enfoque y luego personalizá los detalles.
                  </p>
                </div>
                <span className="rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200">
                  {toneLibrary[tone].label}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {templates.map((item) => {
                  const isActive = item.id === selectedTemplate;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedTemplate(item.id)}
                      className={`group flex h-full flex-col gap-2 rounded-2xl border px-4 py-3 text-left transition ${
                        isActive
                          ? "border-indigo-400/60 bg-indigo-500/15 shadow-[0_0_0_1px_rgba(129,140,248,0.3)]"
                          : "border-white/10 bg-white/[0.02] hover:border-indigo-400/40 hover:bg-indigo-500/10"
                      }`}
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-indigo-200/90">
                        {item.badge}
                      </span>
                      <span className="text-base font-semibold text-white">
                        {item.title}
                      </span>
                      <p className="text-xs text-slate-400">
                        {item.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {Object.values(toneLibrary).map((item) => {
                  const isActive = item.key === tone;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTone(item.key)}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        isActive
                          ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-100 shadow-[0_0_0_1px_rgba(16,185,129,0.3)]"
                          : "border-white/10 bg-white/[0.02] text-slate-200 hover:border-emerald-400/40 hover:bg-emerald-500/10"
                      }`}
                    >
                      <span className="text-sm font-semibold">
                        {item.label}
                      </span>
                      <p className="mt-1 text-xs text-slate-400">
                        {item.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-5">
                {(Object.keys(fieldLabels) as (keyof FormState)[]).map(
                  (fieldKey) => {
                    const label = fieldLabels[fieldKey];
                    const helper = helperTexts[fieldKey];
                    const isTextArea = ["contexto", "puntos", "accion", "notaFinal", "extra"].includes(
                      fieldKey,
                    );

                    return (
                      <label
                        key={fieldKey}
                        className="grid gap-2 text-sm font-medium text-slate-200"
                      >
                        <span className="flex items-center justify-between gap-2">
                          {label}
                          {helper ? (
                            <span className="text-xs font-normal text-slate-400">
                              {helper}
                            </span>
                          ) : null}
                        </span>

                        {isTextArea ? (
                          <textarea
                            value={form[fieldKey]}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                [fieldKey]: event.target.value,
                              }))
                            }
                            rows={
                              fieldKey === "puntos" ? 4 : fieldKey === "contexto" ? 3 : 2
                            }
                            className={`${inputClassName} resize-y`}
                            placeholder={
                              fieldKey === "puntos"
                                ? "Primer punto\nSegundo punto\nTercer punto"
                                : ""
                            }
                          />
                        ) : (
                          <input
                            value={form[fieldKey]}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                [fieldKey]: event.target.value,
                              }))
                            }
                            type="text"
                            className={inputClassName}
                          />
                        )}
                      </label>
                    );
                  },
                )}
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-6">
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-white">
                  Vista previa
                </h2>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {wordCount} palabras
                </span>
              </div>
              <div className="mt-4 grid gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Asunto
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(composed.subject, "subject")}
                      className="inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-100 transition hover:border-indigo-300 hover:bg-indigo-500/30"
                    >
                      {copyStatus.subject === "copied"
                        ? "Copiado"
                        : copyStatus.subject === "error"
                          ? "Sin contenido"
                          : "Copiar"}
                    </button>
                  </div>
                  <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-100">
                    {composed.subject}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Cuerpo del correo
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(composed.body, "body")}
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300 hover:bg-emerald-500/30"
                    >
                      {copyStatus.body === "copied"
                        ? "Copiado"
                        : copyStatus.body === "error"
                          ? "Sin contenido"
                          : "Copiar"}
                    </button>
                  </div>
                  <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4 text-sm leading-relaxed text-slate-100">
                    {composed.body}
                  </pre>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-slate-900/80 p-6 text-sm text-slate-200 shadow-[0_25px_80px_-40px_rgba(129,140,248,0.8)] backdrop-blur">
              <h3 className="text-base font-semibold text-white">
                Tips rápidos para mejores correos
              </h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-200">
                <li>
                  • Ajustá el campo &ldquo;Tema&rdquo; para cambiar el foco del
                  asunto y el cuerpo en simultáneo.
                </li>
                <li>
                  • Usá la lista de puntos clave para que el correo respire y
                  sea fácil de escanear.
                </li>
                <li>
                  • Combiná el tono con la plantilla para encontrar el estilo que
                  más se parezca a tu marca.
                </li>
                <li>
                  • Antes de enviar, pegá el texto en tu cliente de correo y
                  ajustá saludos o firmas si es necesario.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
