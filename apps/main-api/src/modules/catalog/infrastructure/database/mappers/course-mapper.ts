import { UniqueId, Money } from '@repo/core'
import type { Currency } from '@repo/core/domain/@types/currency'
import { nullIdGenerator } from '@/modules/auth-and-users/infrastructure/database/repositories/null-id-generator'
import { Course } from '@/modules/catalog/domain/entities/course'
import { Rating } from '@/modules/catalog/domain/value-objects'
import type { courses } from '../schema'

type Row = typeof courses.$inferSelect
type InsertRow = typeof courses.$inferInsert

export class CourseMapper {
	static async toDomain(row: Row): Promise<Course> {
		const priceResult = Money.create(
			row.priceInCents,
			row.priceCurrency as Currency
		)
		if (priceResult.isFailure()) throw new Error('Invalid price in database')
		const price = priceResult.value

		let promotionalPrice: Money | undefined
		if (
			row.promotionalPriceInCents != null &&
			row.promotionalPriceCurrency != null
		) {
			const promoResult = Money.create(
				row.promotionalPriceInCents,
				row.promotionalPriceCurrency as Currency
			)
			if (promoResult.isFailure())
				throw new Error('Invalid promotional price in database')
			promotionalPrice = promoResult.value
		}

		const ratingResult = Rating.create(row.rating)
		const rating = ratingResult.isSuccess() ? ratingResult.value : Rating.zero()

		return Course.create({
			idGenerator: nullIdGenerator,
			input: {
				id: UniqueId(row.id),
				instructorId: UniqueId(row.instructorId),
				slug: row.slug,
				title: row.title,
				subtitle: row.subtitle ?? undefined,
				description: row.description,
				thumbnail: row.thumbnail,
				coverImage: row.coverImage ?? undefined,
				modulesIds: (row.modulesIds as string[]).map(id => UniqueId(id)),
				totalLessons: row.totalLessons,
				totalDuration: row.totalDuration,
				categoriesIds: row.categoriesIds as string[],
				tags: row.tags as string[],
				level: row.level,
				price,
				promotionalPrice,
				rating,
				totalRatings: row.totalRatings,
				totalEnrollments: row.totalEnrollments,
				status: row.status,
				publishedAt: row.publishedAt ?? undefined,
				createdAt: row.createdAt,
				updatedAt: row.updatedAt,
			},
		})
	}

	static toPersistence(course: Course): InsertRow {
		return {
			id: course.id,
			instructorId: course.instructorId,
			slug: course.slug,
			title: course.title,
			subtitle: course.subtitle,
			description: course.description,
			thumbnail: course.thumbnail,
			coverImage: course.coverImage,
			modulesIds: course.modulesIds,
			totalLessons: course.totalLessons,
			totalDuration: course.totalDuration,
			categoriesIds: course.categoriesIds,
			tags: course.tags,
			level: course.level,
			priceInCents: course.price.valueInCents,
			priceCurrency: course.price.currency,
			promotionalPriceInCents: course.promotionalPrice?.valueInCents,
			promotionalPriceCurrency: course.promotionalPrice?.currency,
			rating: course.rating.value,
			totalRatings: course.totalRatings,
			totalEnrollments: course.totalEnrollments,
			status: course.status,
			publishedAt: course.publishedAt,
			createdAt: course.createdAt,
			updatedAt: course.updatedAt,
		}
	}
}
