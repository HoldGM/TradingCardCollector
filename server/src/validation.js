import { z } from "zod";
import {
  CONDITIONS,
  GENRES,
  GRADES,
  GRADING_COMPANIES,
} from "./taxonomy.js";

function enumField(values, message) {
  return z.enum(values, { errorMap: () => ({ message }) });
}

function optionalText(max, label) {
  return z
    .string()
    .trim()
    .max(max, `${label} is too long.`)
    .nullable()
    .optional()
    .transform((value) => {
      if (typeof value !== "string") return null;
      return value.trim() ? value : null;
    });
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function toNumber(value) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return Number(trimmed);
}

function normalize(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return input;
  const next = { ...input };
  if (typeof next.year === "string") {
    const trimmed = next.year.trim();
    next.year = trimmed ? Number(trimmed) : null;
  }
  if (typeof next.quantity === "string") next.quantity = toNumber(next.quantity);
  if (typeof next.value === "string") next.value = toNumber(next.value);
  return next;
}

export const cardInputSchema = z
  .object({
    name: z
      .string({
        required_error: "Enter a card name.",
        invalid_type_error: "Enter a card name.",
      })
      .trim()
      .min(1, "Enter a card name.")
      .max(160, "Name is too long."),
    year: z
      .number({ invalid_type_error: "Enter a four-digit year." })
      .int("Enter a four-digit year.")
      .min(1860, "Year must be between 1860 and 2100.")
      .max(2100, "Year must be between 1860 and 2100.")
      .nullable()
      .optional(),
    setName: optionalText(160, "Set"),
    cardNumber: optionalText(40, "Card number"),
    notes: optionalText(2000, "Notes"),
    genre: enumField(GENRES, "Choose a genre."),
    sportOrGame: z
      .string({
        required_error: "Choose a sport or game.",
        invalid_type_error: "Choose a sport or game.",
      })
      .trim()
      .min(1, "Choose a sport or game.")
      .max(80, "Sport or game is too long."),
    condition: enumField(CONDITIONS, "Choose a condition."),
    gradingCompany: enumField(GRADING_COMPANIES, "Choose a grading company."),
    grade: z
      .string()
      .trim()
      .nullable()
      .optional()
      .transform((value) => {
        if (typeof value !== "string") return null;
        return value.trim() ? value : null;
      }),
    quantity: z
      .number({
        required_error: "Enter a quantity.",
        invalid_type_error: "Quantity must be a whole number.",
      })
      .int("Quantity must be a whole number.")
      .min(1, "Quantity must be at least 1.")
      .max(100000, "Quantity is too large."),
    value: z
      .number({
        required_error: "Enter a value.",
        invalid_type_error: "Enter a value.",
      })
      .min(0, "Value cannot be negative.")
      .max(100000000, "Value is too large."),
  })
  .superRefine((card, ctx) => {
    if (card.sportOrGame === "Other") {
      ctx.addIssue({
        code: "custom",
        path: ["sportOrGame"],
        message: "Enter a name for this sport or game.",
      });
    } else if (card.sportOrGame.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["sportOrGame"],
        message: "Enter a name for this sport or game.",
      });
    }

    if (card.gradingCompany === "Ungraded") {
      if (card.grade) {
        ctx.addIssue({
          code: "custom",
          path: ["grade"],
          message: "Ungraded cards do not have a grade.",
        });
      }
    } else if (!card.grade || !GRADES.includes(card.grade)) {
      ctx.addIssue({
        code: "custom",
        path: ["grade"],
        message: "Choose a grade.",
      });
    }
  })
  .transform((card) => ({
    ...card,
    year: card.year ?? null,
    setName: card.setName ?? null,
    cardNumber: card.cardNumber ?? null,
    notes: card.notes ?? null,
    grade: card.grade ?? null,
    value: roundMoney(card.value),
  }));

export function validateCard(input) {
  const result = cardInputSchema.safeParse(normalize(input));
  if (result.success) return { ok: true, data: result.data };

  const fields = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] ? String(issue.path[0]) : "form";
    if (!fields[key]) fields[key] = issue.message;
  }
  return { ok: false, fields };
}
