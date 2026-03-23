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

export const enrollmentStatusEnum = pgEnum('enrollment_status', [
	'active',
	'completed',
	'canceled',
	'expired',
])

export const progressStatusEnum = pgEnum('progress_status', [
	'not_started',
	'in_progress',
	'completed',
])

export const enrollments = pgTable('enrollments', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	courseId: text('course_id').notNull(),
	status: enrollmentStatusEnum('status').notNull().default('active'),
	progressValue: real('progress_value').notNull().default(0),
	completedLessons: integer('completed_lessons').notNull().default(0),
	totalLessons: integer('total_lessons').notNull(),
	enrolledAt: timestamp('enrolled_at').notNull(),
	expiresAt: timestamp('expires_at'),
	lastAccessAt: timestamp('last_access_at'),
	certificateIssued: boolean('certificate_issued').notNull().default(false),
	certificateUrl: text('certificate_url'),
	completedAt: timestamp('completed_at'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const lessonProgress = pgTable('lesson_progress', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	courseId: text('course_id').notNull(),
	lessonId: text('lesson_id').notNull(),
	status: progressStatusEnum('status').notNull().default('in_progress'),
	watchTime: integer('watch_time').notNull().default(0),
	lastPosition: integer('last_position').notNull().default(0),
	completedAt: timestamp('completed_at'),
	notesIds: jsonb('notes_ids'),
	timeSpent: integer('time_spent').notNull().default(0),
	deviceType: text('device_type'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
