import {
	boolean,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
} from 'drizzle-orm/pg-core'

export const userStatusEnum = pgEnum('user_status', [
	'active',
	'blocked',
	'pending',
])

const userColumns = {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash'),
	name: text('name').notNull(),
	avatar: text('avatar'),
	status: userStatusEnum('status').notNull().default('pending'),
	emailVerifiedAt: timestamp('email_verified_at'),
	lastLoginAt: timestamp('last_login_at'),
	lastLoginIp: text('last_login_ip'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
}

export const admins = pgTable('admins', userColumns)
export const students = pgTable('students', userColumns)
export const instructors = pgTable('instructors', userColumns)

export const refreshTokens = pgTable('refresh_tokens', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	tokenHash: text('token_hash').notNull().unique(),
	role: text('role').$type<'ADMIN' | 'INSTRUCTOR' | 'STUDENT'>().notNull(),
	used: boolean('used').notNull().default(false),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const oauthStates = pgTable('oauth_states', {
	state: text('state').primaryKey(),
	codeVerifier: text('code_verifier').notNull(),
	provider: text('provider').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const oauthAccounts = pgTable(
	'oauth_accounts',
	{
		id: text('id').primaryKey(),
		userId: text('user_id').notNull(),
		provider: text('provider').notNull(),
		providerAccountId: text('provider_account_id').notNull(),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	t => [unique().on(t.provider, t.providerAccountId)]
)
