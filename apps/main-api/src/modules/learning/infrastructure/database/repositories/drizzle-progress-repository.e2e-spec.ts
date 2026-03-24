import { setupSchema, teardownSchema } from '@/test/setup-schema'
import { drizzle } from '@/lib/drizzle'
import { UniqueId } from '@repo/core'
import { lessonProgress } from '@/modules/learning/infrastructure/database/schema'
import {
	courses,
	courseModules,
	lessons,
} from '@/modules/catalog/infrastructure/database/schema'
import {
	students,
	instructors,
} from '@/modules/auth-and-users/infrastructure/database/schema'
import { enrollments } from '@/modules/learning/infrastructure/database/schema'
import { DrizzleProgressRepository } from './drizzle-progress-repository'
import { DrizzleStudentRepository } from '@/modules/auth-and-users/infrastructure/database/repositories/drizzle-student-repository'
import { DrizzleInstructorRepository } from '@/modules/auth-and-users/infrastructure/database/repositories/drizzle-instructor-repository'
import { DrizzleCourseRepository } from '@/modules/catalog/infrastructure/database/repositories/drizzle-course-repository'
import { DrizzleModuleRepository } from '@/modules/catalog/infrastructure/database/repositories/drizzle-module-repository'
import { DrizzleLessonRepository } from '@/modules/catalog/infrastructure/database/repositories/drizzle-lesson-repository'
import { makeProgress } from '@/modules/learning/test/factories/make-progress'
import { makeStudent } from '@/modules/auth-and-users/test/factories/make-student'
import { makeInstructor } from '@/modules/auth-and-users/test/factories/make-instructor'
import { makeCourse } from '@/modules/catalog/test/factories/make-course'
import { makeModule } from '@/modules/catalog/test/factories/make-module'
import { makeLesson } from '@/modules/catalog/test/factories/make-lesson'

describe('DrizzleProgressRepository', () => {
	const repo = new DrizzleProgressRepository()
	const studentRepo = new DrizzleStudentRepository()
	const instructorRepo = new DrizzleInstructorRepository()
	const catalogCourseRepo = new DrizzleCourseRepository()
	const moduleRepo = new DrizzleModuleRepository()
	const lessonRepo = new DrizzleLessonRepository()

	beforeAll(async () => {
		await setupSchema()
	})
	afterAll(async () => {
		await teardownSchema()
	})

	beforeEach(async () => {
		await drizzle.delete(lessonProgress)
		await drizzle.delete(lessons)
		await drizzle.delete(courseModules)
		await drizzle.delete(enrollments)
		await drizzle.delete(courses)
		await drizzle.delete(students)
		await drizzle.delete(instructors)
	})

	async function createDependencies() {
		const instructor = await makeInstructor()
		await instructorRepo.save(instructor)

		const student = await makeStudent()
		await studentRepo.save(student)

		const course = await makeCourse({ instructorId: instructor.id })
		await catalogCourseRepo.save(course)

		const module = await makeModule({ courseId: course.id })
		await moduleRepo.save(module)

		const lesson = await makeLesson({
			moduleId: module.id,
			courseId: course.id,
		})
		await lessonRepo.save(lesson)

		return { instructor, student, course, module, lesson }
	}

	describe('save', () => {
		it('should persist a progress record', async () => {
			const { student, course, lesson } = await createDependencies()

			const progress = await makeProgress({
				userId: student.id,
				courseId: course.id,
				lessonId: lesson.id,
			})

			await repo.save(progress)

			const found = await repo.findByUserAndLesson(student.id, lesson.id)
			expect(found).not.toBeNull()
			expect(found!.id).toBe(progress.id)
			expect(found!.userId).toBe(student.id)
			expect(found!.courseId).toBe(course.id)
			expect(found!.lessonId).toBe(lesson.id)
			expect(found!.status).toBe('in_progress')
		})
	})

	describe('findByUserAndLesson', () => {
		it('should return progress by userId and lessonId', async () => {
			const { student, course, lesson } = await createDependencies()

			const progress = await makeProgress({
				userId: student.id,
				courseId: course.id,
				lessonId: lesson.id,
			})
			await repo.save(progress)

			const found = await repo.findByUserAndLesson(student.id, lesson.id)
			expect(found).not.toBeNull()
			expect(found!.id).toBe(progress.id)
		})

		it('should return null when no progress exists', async () => {
			const found = await repo.findByUserAndLesson(
				UniqueId('no-user'),
				UniqueId('no-lesson')
			)
			expect(found).toBeNull()
		})
	})

	describe('findManyByUserAndCourse', () => {
		it('should return all progress records for a user in a course', async () => {
			const { student, course, module, lesson } = await createDependencies()

			const lesson2 = await makeLesson({
				moduleId: module.id,
				courseId: course.id,
				order: 2,
			})
			await lessonRepo.save(lesson2)

			const progressA = await makeProgress({
				userId: student.id,
				courseId: course.id,
				lessonId: lesson.id,
			})
			const progressB = await makeProgress({
				userId: student.id,
				courseId: course.id,
				lessonId: lesson2.id,
			})

			await repo.save(progressA)
			await repo.save(progressB)

			const found = await repo.findManyByUserAndCourse(student.id, course.id)
			expect(found).toHaveLength(2)

			const ids = found.map(p => p.id)
			expect(ids).toContain(progressA.id)
			expect(ids).toContain(progressB.id)
		})

		it('should return empty array when no progress exists', async () => {
			const found = await repo.findManyByUserAndCourse(
				UniqueId('no-user'),
				UniqueId('no-course')
			)
			expect(found).toEqual([])
		})
	})

	describe('update', () => {
		it('should update progress fields', async () => {
			const { student, course, lesson } = await createDependencies()

			const progress = await makeProgress({
				userId: student.id,
				courseId: course.id,
				lessonId: lesson.id,
			})
			await repo.save(progress)

			const updated = progress.update({
				status: 'completed',
				watchTime: 300,
				lastPosition: 300,
				timeSpent: 350,
				completedAt: new Date(),
			})
			await repo.update(updated)

			const found = await repo.findByUserAndLesson(student.id, lesson.id)
			expect(found).not.toBeNull()
			expect(found!.status).toBe('completed')
			expect(found!.watchTime).toBe(300)
			expect(found!.lastPosition).toBe(300)
			expect(found!.timeSpent).toBe(350)
			expect(found!.completedAt).toBeInstanceOf(Date)
		})
	})
})
