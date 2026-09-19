import { z } from "zod";

/** Tipos que admite una pregunta, tal como se guardan en la BD. */
export const QUESTION_TYPES = ["SINGLE", "MULTIPLE"] as const;
export type QuestionTypeValue = (typeof QUESTION_TYPES)[number];

export const MIN_OPCIONES = 2;
export const MAX_OPCIONES = 6;
/** Una pregunta de respuesta múltiple con una sola correcta sería `SINGLE`. */
export const MIN_CORRECTAS_MULTIPLE = 2;

/** Nota mínima, sobre 100, con la que el alumno aprueba la evaluación. */
export const EXAM_PASSING_SCORE = 70;
/** Intentos por inscripción: al agotarlos se retira el acceso al curso. */
export const EXAM_MAX_ATTEMPTS = 2;

const optionSchema = z.object({
  text: z.string().min(1, { error: "La opción no puede estar vacía" }).trim(),
  isCorrect: z.boolean(),
});

export const questionSchema = z
  .object({
    text: z
      .string()
      .min(5, { error: "La pregunta debe tener al menos 5 caracteres" })
      .trim(),
    type: z.enum(QUESTION_TYPES),
    order: z.number().int().min(0),
    options: z
      .array(optionSchema)
      .min(MIN_OPCIONES, { error: `Debe tener al menos ${MIN_OPCIONES} opciones` })
      .max(MAX_OPCIONES, { error: `Máximo ${MAX_OPCIONES} opciones` }),
  })
  .superRefine((value, ctx) => {
    const correctas = value.options.filter((o) => o.isCorrect).length;

    if (value.type === "SINGLE" && correctas !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "Debe haber exactamente una respuesta correcta",
      });
      return;
    }

    if (value.type === "MULTIPLE" && correctas < MIN_CORRECTAS_MULTIPLE) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: `Marca al menos ${MIN_CORRECTAS_MULTIPLE} respuestas correctas o usa una pregunta de respuesta única`,
      });
    }
  });

export type QuestionInput = z.infer<typeof questionSchema>;

/**
 * Corrige una pregunta.
 *
 * En las de respuesta múltiple la corrección es estricta: el estudiante acierta
 * solo si marca todas las correctas y ninguna incorrecta. No hay puntaje
 * parcial, así que marcarlas todas "por si acaso" no sirve de nada.
 */
export function isAnswerCorrect(
  correctOptionIds: string[],
  selectedOptionIds: string[],
): boolean {
  if (correctOptionIds.length === 0) return false;

  const selected = new Set(selectedOptionIds);
  if (selected.size !== correctOptionIds.length) return false;

  return correctOptionIds.every((id) => selected.has(id));
}
