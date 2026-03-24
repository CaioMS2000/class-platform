import { setupSchema, teardownSchema } from '@/test/setup-schema'
import { drizzle } from '@/lib/drizzle'
import { UniqueId } from '@repo/core'
import { enrollments } from '@/modules/learning/infrastructure/database/schema'
import { courses } from '@/modules/catalog/infrastructure/database/schema'
import {
	students,
	instructors,
} from '@/modules/auth-and-users/infrastructure/database/schema'
import { DrizzleEnrollmentRepository } from './drizzle-enrollment-repository'
import { DrizzleStudentRepository } from '@/modules/auth-and-users/infrastructure/database/repositories/drizzle-student-repository'
import { DrizzleInstructorRepository } from '@/modules/auth-and-users/infrastructure/database/repositories/drizzle-instructor-repository'
import { DrizzleCourseRepository } from '@/modules/catalog/infrastructure/database/repositories/drizzle-course-repository'
import { makeEnrollment } from '@/modules/learning/test/factories/make-enrollment'
import { makeStudent } from '@/modules/auth-and-users/test/factories/make-student'
import { makeInstructor } from '@/modules/auth-and-users/test/factories/make-instructor'
import { makeCourse } from '@/modules/catalog/test/factories/make-course'

describe('DrizzleEnrollmentRepository', () => {
	const repo = new DrizzleEnrollmentRepository()
	const studentRepo = new DrizzleStudentRepository()
	const instructorRepo = new DrizzleInstructorRepository()
	const catalogCourseRepo = new DrizzleCourseRepository()

	beforeAll(async () => {
		await setupSchema()
	})
	afterAll(async () => {
		await teardownSchema()
	})

	beforeEach(async () => {
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

		return { instructor, student, course }
	}

	describe('save', () => {
		it('should persist an enrollment', async () => {
			const { student, course } = await createDependencies()

			const enrollment = await makeEnrollment({
				userId: student.id,
				courseId: course.id,
			})

			await repo.save(enrollment)

			const found = await repo.findById(enrollment.id)
			expect(found).not.toBeNull()
			expect(found!.id).toBe(enrollment.id)
			expect(found!.userId).toBe(student.id)
			expect(found!.courseId).toBe(course.id)
			expect(found!.status).toBe('active')
			expect(found!.totalLessons).toBe(enrollment.totalLessons)
		})
	})

	describe('findById', () => {
		it('should return an enrollment by id', async () => {
			const { student, course } = await createDependencies()

			const enrollment = await makeEnrollment({
				userId: student.id,
				courseId: course.id,
			})
			await repo.save(enrollment)

			const found = await repo.findById(enrollment.id)
			expect(found).not.toBeNull()
			expect(found!.id).toBe(enrollment.id)
		})

		it('should return null when enrollment does not exist', async () => {
			const found = await repo.findById(UniqueId('non-existent-id'))
			expect(found).toBeNull()
		})
	})

	describe('findStudentCourseEnrollment', () => {
		it('should find enrollment by userId and courseId', async () => {
			const { student, course } = await createDependencies()

			const enrollment = await makeEnrollment({
				userId: student.id,
				courseId: course.id,
			})
			await repo.save(enrollment)

			const found = await repo.findStudentCourseEnrollment(
				student.id,
				course.id
			)
			expect(found).not.toBeNull()
			expect(found!.id).toBe(enrollment.id)
			expect(found!.userId).toBe(student.id)
			expect(found!.courseId).toBe(course.id)
		})

		it('should return null when no enrollment matches', async () => {
			const found = await repo.findStudentCourseEnrollment(
				UniqueId('no-user'),
				UniqueId('no-course')
			)
			expect(found).toBeNull()
		})
	})

	describe('findManyByStudent', () => {
		it('should return all enrollments for a student', async () => {
			const { student, course, instructor } = await createDependencies()

			const course2 = await makeCourse({ instructorId: instructor.id })
			await catalogCourseRepo.save(course2)

			const enrollment1 = await makeEnrollment({
				userId: student.id,
				courseId: course.id,
			})
			const enrollment2 = await makeEnrollment({
				userId: student.id,
				courseId: course2.id,
			})
			await repo.save(enrollment1)
			await repo.save(enrollment2)

			const found = await repo.findManyByStudent(student.id)
			expect(found).toHaveLength(2)

			const ids = found.map(e => e.id)
			expect(ids).toContain(enrollment1.id)
			expect(ids).toContain(enrollment2.id)
		})

		it('should return empty array when student has no enrollments', async () => {
			const found = await repo.findManyByStudent(UniqueId('no-student'))
			expect(found).toEqual([])
		})
	})

	describe('update', () => {
		it('should update enrollment fields', async () => {
			const { student, course } = await createDependencies()

			const enrollment = await makeEnrollment({
				userId: student.id,
				courseId: course.id,
			})
			await repo.save(enrollment)

			const updated = enrollment.update({
				status: 'completed',
				completedLessons: 10,
				certificateIssued: true,
				completedAt: new Date(),
			})
			await repo.update(updated)

			const found = await repo.findById(enrollment.id)
			expect(found).not.toBeNull()
			expect(found!.status).toBe('completed')
			expect(found!.completedLessons).toBe(10)
			expect(found!.certificateIssued).toBe(true)
			expect(found!.completedAt).toBeInstanceOf(Date)
		})
	})
})
