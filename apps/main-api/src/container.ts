import { asFunction, createContainer, InjectionMode } from 'awilix'
import type { HashGenerator } from './modules/auth-and-users/domain/application/cryptography/hash-generator'
import type { HashVerifier } from './modules/auth-and-users/domain/application/cryptography/hash-verifier'
import type {
	JwtService,
	JwtTokenGenerator,
} from './modules/auth-and-users/domain/application/jwt'
import type { AdminRepository } from './modules/auth-and-users/domain/application/repositories/admin-repository'
import type { InstructorRepository } from './modules/auth-and-users/domain/application/repositories/instructor-repository'
import type { OAuthAccountRepository } from './modules/auth-and-users/domain/application/repositories/oauth-account-repository'
import type { OAuthStateRepository } from './modules/auth-and-users/domain/application/repositories/oauth-state-repository'
import type { RefreshTokenRepository } from './modules/auth-and-users/domain/application/repositories/refresh-token-repository'
import type { StudentRepository as AuthStudentRepository } from './modules/auth-and-users/domain/application/repositories/student-repository'
import type { AdminRouter } from './modules/auth-and-users/infrastructure/http/routes/admin/router'
import type { AuthRouter } from './modules/auth-and-users/infrastructure/http/routes/auth/router'
import type { CategoryRepository } from './modules/catalog/application/repositories/category-repository'
import type { CourseRepository as CatalogCourseRepository } from './modules/catalog/application/repositories/course-repository'
import type { LessonRepository } from './modules/catalog/application/repositories/lesson-repository'
import type { ModuleRepository } from './modules/catalog/application/repositories/module-repository'
import type { CourseRepository as LearningCourseRepository } from './modules/learning/application/repositories/course-repository'
import type { EnrollmentRepository } from './modules/learning/application/repositories/enrollment-repository'
import type { NoteRepository } from './modules/learning/application/repositories/note-repository'
import type { ProgressRepository } from './modules/learning/application/repositories/progress-repository'
import type { StudentRepository as LearningStudentRepository } from './modules/learning/application/repositories/student-repository'
import type { WatchHistoryRepository } from './modules/learning/application/repositories/watch-history-repository'
import type {
	GetAdminUseCase,
	LoginUseCase,
	LogoutUseCase,
	RefreshTokenUseCase,
	RegisterUseCase,
	SocialLoginUseCase,
} from './modules/auth-and-users/domain/application/use-cases'
import type { OAuthProviderService } from './modules/auth-and-users/infrastructure/auth/oauth-provider-service'
import type {
	BrowsePublicCatalogUseCase,
	CreateCategoryUseCase,
	GetAllCategoriesUseCase,
	InstructorCreateCourseUseCase,
	InstructorCreateModuleUseCase,
	InstructorCreateLessonUseCase,
} from './modules/catalog/application/use-cases'
import type { CategoryRouter } from './modules/catalog/infrastructure/http/routes/category/router'
import type { CourseRouter } from './modules/catalog/infrastructure/http/routes/course/router'
import type { InstructorRouter } from './modules/catalog/infrastructure/http/routes/instructor/router'
import type { IdGenerator } from '@repo/core'

interface CradleInterface {
	// auth-and-users repositories
	adminRepository: AdminRepository
	instructorRepository: InstructorRepository
	authStudentRepository: AuthStudentRepository
	refreshTokenRepository: RefreshTokenRepository
	oauthStateRepository: OAuthStateRepository
	oauthAccountRepository: OAuthAccountRepository

	// catalog repositories
	catalogCourseRepository: CatalogCourseRepository
	categoryRepository: CategoryRepository
	lessonRepository: LessonRepository
	moduleRepository: ModuleRepository

	// learning repositories
	learningStudentRepository: LearningStudentRepository
	learningCourseRepository: LearningCourseRepository
	enrollmentRepository: EnrollmentRepository
	noteRepository: NoteRepository
	progressRepository: ProgressRepository
	watchHistoryRepository: WatchHistoryRepository

	// catalog use cases
	getAllCategoriesUseCase: GetAllCategoriesUseCase
	createCategoryUseCase: CreateCategoryUseCase
	browsePublicCatalogUseCase: BrowsePublicCatalogUseCase
	createCourseUseCase: InstructorCreateCourseUseCase
	createModuleUseCase: InstructorCreateModuleUseCase
	createLessonUseCase: InstructorCreateLessonUseCase

	// auth-and-users use cases
	loginUseCase: LoginUseCase
	getAdminUseCase: GetAdminUseCase
	registerUseCase: RegisterUseCase
	socialLoginUseCase: SocialLoginUseCase
	refreshTokenUseCase: RefreshTokenUseCase
	logoutUseCase: LogoutUseCase

	// infrastructure
	jwtService: JwtService
	jwtTokenGenerator: JwtTokenGenerator
	adminRouter: AdminRouter
	authRouter: AuthRouter
	categoryRouter: CategoryRouter
	courseRouter: CourseRouter
	instructorRouter: InstructorRouter
	hashVerifier: HashVerifier
	hashGenerator: HashGenerator
	tokenGenerator: JwtTokenGenerator
	idGenerator: IdGenerator
	oauthProviderService: OAuthProviderService
	// x: X
}

const _container = Object.assign(
	createContainer<CradleInterface>({ injectionMode: InjectionMode.PROXY }),
	{
		asFunction<T>(fn: (cradle: CradleInterface) => T) {
			return asFunction(fn)
		},
	}
)

declare global {
	const container: typeof _container
	type Container = typeof _container
}

Object.assign(globalThis, {
	container: _container,
})
