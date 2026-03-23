import { type UniqueId } from '@repo/core'
import { Course } from '../../../domain/models/course'
import { nullIdGenerator } from '@/modules/auth-and-users/infrastructure/database/repositories/null-id-generator'
import { courses } from '@/modules/catalog/infrastructure/database/schema'

type Row = typeof courses.$inferSelect

export class CourseMapper {
	static async toDomain(row: Row): Promise<Course> {
		return Course.create({
			idGenerator: nullIdGenerator,
			input: {
				id: row.id as UniqueId,
				slug: row.slug,
				title: row.title,
				subtitle: row.subtitle ?? undefined,
				description: row.description,
				thumbnail: row.thumbnail,
				coverImage: row.coverImage ?? undefined,
				totalLessons: row.totalLessons,
				publishedAt: row.publishedAt ?? undefined,
				createdAt: row.createdAt,
				updatedAt: row.updatedAt,
			},
		})
	}

	static toPersistence(course: Course) {
		return {
			id: course.id,
			slug: course.slug,
			title: course.title,
			subtitle: course.subtitle,
			description: course.description,
			thumbnail: course.thumbnail,
			coverImage: course.coverImage,
			totalLessons: course.totalLessons,
			publishedAt: course.publishedAt,
			createdAt: course.createdAt,
			updatedAt: course.updatedAt,
		}
	}
}
