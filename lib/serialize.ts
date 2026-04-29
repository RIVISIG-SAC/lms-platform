import type { Course } from "@prisma/client";

export type SerializedCourse = Omit<Course, "price" | "certificateFee"> & {
  price: number;
  certificateFee: number | null;
};

export function serializeCourse<T extends { price: Course["price"]; certificateFee: Course["certificateFee"] }>(
  course: T,
): Omit<T, "price" | "certificateFee"> & { price: number; certificateFee: number | null } {
  const { price, certificateFee, ...rest } = course;
  return {
    ...rest,
    price: Number(price),
    certificateFee: certificateFee != null ? Number(certificateFee) : null,
  } as Omit<T, "price" | "certificateFee"> & { price: number; certificateFee: number | null };
}
