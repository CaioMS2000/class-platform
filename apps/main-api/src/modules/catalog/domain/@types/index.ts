export type Category = string & { readonly __brand: 'Category' }

export const CourseStatus = ['draft', 'published', 'archived'] as const
export type CourseStatus = (typeof CourseStatus)[number]

export const CourseLevel = ['beginner', 'intermediate', 'advanced'] as const
export type CourseLevel = (typeof CourseLevel)[number]

export type Attachment = {
	title: string
	url: string
}

export const LessonType = ['video', 'article', 'quiz', 'exercise'] as const
export type LessonType = (typeof LessonType)[number]

export type LessonContent = {
	videoUrl?: string
	article?: string
	attachments?: Attachment[]
}
