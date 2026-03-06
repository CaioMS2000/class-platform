export type Category = string & { readonly __brand: 'Category' }

export const CourseStatus = ['draft', 'published', 'archived'] as const
export type CourseStatus = (typeof CourseStatus)[number]
