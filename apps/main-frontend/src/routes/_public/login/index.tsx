import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { FaGoogle } from 'react-icons/fa'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { postApiV1AuthLogin } from '@/api/generated/auth/auth'

export const Route = createFileRoute('/_public/login/')({
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ to: '/account' })
		}
	},
	component: RouteComponent,
})

const schema = z.object({
	email: z.email('Email inválido'),
	password: z.string().min(1, 'Senha obrigatória'),
})

function RouteComponent() {
	const { control, handleSubmit } = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: { email: '', password: '' },
	})

	async function onSubmit(data: z.infer<typeof schema>) {
		const res = await postApiV1AuthLogin(data)
		res.data
		console.log(data)
	}

	async function onGoogleLogin() {
		console.log('google login')
	}

	return (
		<div className="bg-surface-container-lowest text-on-surface flex min-h-screen overflow-hidden">
			{/* Left Panel: Editorial Visual */}
			<aside className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-surface">
				<div className="relative z-10">
					<div className="text-2xl font-extrabold tracking-tighter text-white uppercase">
						Class Platform
					</div>
				</div>
				<div className="relative z-10 max-w-lg">
					<h1 className="text-5xl font-extrabold tracking-tighter leading-none text-white mb-6">
						SECURE
						<br />
						KNOWLEDGE
						<br />
						COLLECTIVE.
					</h1>
				</div>
				{/* Background Image with data-alt */}
				<div className="absolute inset-0 z-0">
					<img
						className="w-full h-full object-cover opacity-20 grayscale brightness-50"
						alt="Monochromatic high-contrast architectural detail of a brutalist concrete library interior with dramatic shadows and sharp lines"
						src="https://lh3.googleusercontent.com/aida-public/AB6AXuAG9rkcwND2d7UBWUZH6N045PBSPc2Rm4o5JFRzdXFVxzBBg2kO4ffZN7m9x_IS-a_1aICrbD5_QXYliz0ASXbSY4NKU-7YOER9pI9YTyK68SFopRdRrFbGo11kgUS8Zkd1C9NYwBFUtIVFtSN8Q2ojiJjJ5xPOz4Lcap-xel4KSrjzTgkvc8kXjvkzvOTbhntyRzUMsc2JCbzpMkYZs49SPJsSFsj-itDV7UVc63HAm-txRtoNINJdH8QR2ixyxuI_rQWCP2L2mmRB"
					/>
					<div className="absolute inset-0 bg-linear-to-t from-surface-container-lowest via-transparent to-transparent"></div>
				</div>
			</aside>
			{/* Right Panel: Login Form */}
			<main className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-surface">
				<div className="w-full max-w-md">
					{/* Mobile Logo */}
					<div className="lg:hidden mb-12">
						<div className="text-xl font-extrabold tracking-tighter text-white uppercase">
							Class Platform
						</div>
					</div>
					<header className="mb-12">
						<h2 className="text-3xl font-bold text-white tracking-tight">
							Enter the Class Platform
						</h2>
						<p className="text-on-surface-variant text-sm mt-2 font-medium">
							Verify your credentials to continue.
						</p>
					</header>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
						{/* Email Field */}
						<Controller
							name="email"
							control={control}
							render={({ field, fieldState }) => (
								<div className="group">
									<label
										className="block text-[0.6875rem] font-bold uppercase tracking-widest text-md3-outline transition-colors group-focus-within:text-primary mb-1"
										htmlFor="email"
									>
										Email
									</label>
									<Input
										id="email"
										type="email"
										placeholder="archivist@institution.org"
										className="w-full bg-transparent border-0 border-b border-outline-variant rounded-none py-3 px-0 focus-visible:ring-0 focus-visible:border-primary placeholder:text-surface-container-highest"
										aria-invalid={fieldState.invalid}
										{...field}
									/>
									{fieldState.error && (
										<p className="text-xs text-error mt-1">
											{fieldState.error.message}
										</p>
									)}
								</div>
							)}
						/>
						{/* Password Field */}
						<Controller
							name="password"
							control={control}
							render={({ field, fieldState }) => (
								<div className="group">
									<div className="flex justify-between items-center mb-1">
										<label
											className="block text-[0.6875rem] font-bold uppercase tracking-widest text-md3-outline transition-colors group-focus-within:text-primary"
											htmlFor="password"
										>
											Password
										</label>
										<a
											className="text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-primary hover:text-on-primary-container transition-colors"
											href="#"
										>
											Forgot Password?
										</a>
									</div>
									<Input
										id="password"
										type="password"
										placeholder="••••••••••••"
										className="w-full bg-transparent border-0 border-b border-outline-variant rounded-none py-3 px-0 focus-visible:ring-0 focus-visible:border-primary placeholder:text-surface-container-highest"
										aria-invalid={fieldState.invalid}
										{...field}
									/>
									{fieldState.error && (
										<p className="text-xs text-error mt-1">
											{fieldState.error.message}
										</p>
									)}
								</div>
							)}
						/>
						{/* Login Button */}
						<Button
							type="submit"
							className="w-full bg-linear-to-br from-primary to-primary-container text-on-primary font-bold py-4 px-6 h-auto uppercase tracking-widest text-sm active:scale-[0.98]"
						>
							Login
							<ArrowRight className="size-4" />
						</Button>
					</form>
					{/* Divider */}
					<div className="relative my-12 flex items-center">
						<div className="grow border-t border-outline-variant/30"></div>
						<span className="px-4 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-md3-outline">
							Third Party Authentication
						</span>
						<div className="grow border-t border-outline-variant/30"></div>
					</div>
					{/* Social Logins */}
					<div className="">
						<Button
							type="button"
							onClick={onGoogleLogin}
							className="w-full flex items-center justify-center gap-3 bg-surface-container-highest/30 hover:bg-surface-container-highest transition-colors py-3 px-4 rounded-sm border border-outline-variant/10 group h-auto"
						>
							<FaGoogle className="w-4 h-4 text-on-surface group-hover:text-primary transition-colors" />
							<span className="text-[0.6875rem] font-bold uppercase tracking-wider text-on-surface">
								Google
							</span>
						</Button>
					</div>
					{/* Footer */}
					<footer className="mt-16 text-center">
						<p className="text-[0.6875rem] text-md3-outline font-medium tracking-tight uppercase">
							No account?
							<a
								className="text-primary font-bold ml-1 hover:underline underline-offset-4"
								href="#"
							>
								Make Account
							</a>
						</p>
					</footer>
				</div>
			</main>
			{/* Aesthetic Decorative Corner Element (Bottom Right) */}
			<div className="fixed bottom-0 right-0 p-4 pointer-events-none opacity-10 hidden md:block">
				<div className="text-[0.5rem] font-mono tracking-tighter text-on-surface text-right">
					AUTH_TOKEN: 0x88F2A1
					<br />
					ENCRYPTION: AES-256-GCM
					<br />
					LOCATION: ARCHIVE_SECTOR_07
				</div>
			</div>
		</div>
	)
}
