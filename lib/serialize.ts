import type { Course } from "@prisma/client";

export type SerializedCourse = Omit<Course, "price"> & { price: number };

export function serializeCourse<T extends { price: Course["price"] }>(
  course: T,
): Omit<T, "price"> & { price: number } {
  const { price, ...rest } = course;
  return { ...rest, price: Number(price) } as Omit<T, "price"> & { price: number };
}
