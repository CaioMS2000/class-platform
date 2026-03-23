import {
	boolean,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	real,
	text,
	timestamp,
} from 'drizzle-orm/pg-core'

export const courseStatusEnum = pgEnum('course_status', [
	'draft',
	'published',
	'archived',
])

export const courseLevelEnum = pgEnum('course_level', [
	'beginner',
	'intermediate',
	'advanced',
])

export const lessonTypeEnum = pgEnum('lesson_type', [
	'video',
	'article',
	'quiz',
	'exercise',
])

export const categories = pgTable('categories', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	parentId: text('parent_id'),
	icon: text('icon'),
})

export const courses = pgTable('courses', {
	id: text('id').primaryKey(),
	instructorId: text('instructor_id').notNull(),
	slug: text('slug').notNull().unique(),
	title: text('title').notNull(),
	subtitle: text('subtitle'),
	description: text('description').notNull(),
	thumbnail: text('thumbnail').notNull(),
	coverImage: text('cover_image'),

	modulesIds: jsonb('modules_ids').notNull().$type<string[]>().default([]),
	totalLessons: integer('total_lessons').notNull().default(0),
	totalDuration: integer('total_duration').notNull().default(0),

	categoriesIds: jsonb('categories_ids')
		.notNull()
		.$type<string[]>()
		.default([]),
	tags: jsonb('tags').notNull().$type<string[]>().default([]),
	level: courseLevelEnum('level').notNull(),

	priceInCents: integer('price_in_cents').notNull(),
	priceCurrency: text('price_currency').notNull(),
	promotionalPriceInCents: integer('promotional_price_in_cents'),
	promotionalPriceCurrency: text('promotional_price_currency'),

	rating: real('rating').notNull().default(0),
	totalRatings: integer('total_ratings').notNull().default(0),
	totalEnrollments: integer('total_enrollments').notNull().default(0),

	status: courseStatusEnum('status').notNull().default('draft'),

	publishedAt: timestamp('published_at'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const courseModules = pgTable('course_modules', {
	id: text('id').primaryKey(),
	courseId: text('course_id').notNull(),
	order: integer('order').notNull(),
	title: text('title').notNull(),
	description: text('description'),
	lessonsIds: jsonb('lessons_ids').notNull().$type<string[]>().default([]),
	totalLessons: integer('total_lessons').notNull().default(0),
	totalDuration: integer('total_duration').notNull().default(0),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const lessons = pgTable('lessons', {
	id: text('id').primaryKey(),
	moduleId: text('module_id').notNull(),
	courseId: text('course_id').notNull(),
	order: integer('order').notNull(),
	title: text('title').notNull(),
	description: text('description'),
	type: lessonTypeEnum('type').notNull(),
	content: jsonb('content')
		.notNull()
		.$type<Record<string, unknown>>()
		.default({}),
	duration: integer('duration').notNull(),
	isFree: boolean('is_free').notNull().default(false),
	requiresPrevious: boolean('requires_previous').notNull().default(false),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
