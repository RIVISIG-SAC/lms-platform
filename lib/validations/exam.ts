import { z } from "zod";

export const questionSchema = z.object({
  text: z.string().min(5, { error: "La pregunta debe tener al menos 5 caracteres" }).trim(),
  order: z.number().int().min(0),
  options: z
    .array(
      z.object({
        text: z.string().min(1, { error: "La opción no puede estar vacía" }).trim(),
        isCorrect: z.boolean(),
      })
    )
    .min(2, { error: "Debe tener al menos 2 opciones" })
    .max(6)
    .refine((opts) => opts.filter((o) => o.isCorrect).length === 1, {
      error: "Debe haber exactamente una opción correcta",
    }),
});

export type QuestionInput = z.infer<typeof questionSchema>;
