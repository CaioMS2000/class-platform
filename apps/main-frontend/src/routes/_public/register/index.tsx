import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Controller, useForm } from 'react-hook-form'
import { FaGoogle } from 'react-icons/fa'
import { toast } from 'sonner'
import { z } from 'zod'
import { usePostApiV1AuthRegister } from '@/api/generated/auth/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRegister } from '@/hooks/use-register'

export const Route = createFileRoute('/_public/register/')({
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ to: '/account' })
		}
	},
	component: RouteComponent,
})

const schema = z
	.object({
		fullName: z.string().min(1, 'Nome obrigatório'),
		email: z.email('Email inválido'),
		phoneNumber: z.string().min(1, 'Telefone obrigatório'),
		role: z.enum(['INSTRUCTOR', 'STUDENT'], {
			message: 'Selecione um papel',
		}),
		password: z.string().min(8, 'Mínimo de 8 caracteres'),
		confirmPassword: z.string(),
	})
	.refine(data => data.password === data.confirmPassword, {
		message: 'Senhas não coincidem',
		path: ['confirmPassword'],
	})

function RouteComponent() {
	const { mutateAsync } = useRegister({
		onError: error => {
			error.status
			console.log(error)
		},
	})
	const { control, handleSubmit } = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			fullName: '',
			email: '',
			phoneNumber: '',
			role: undefined,
			password: '',
			confirmPassword: '',
		},
	})

	async function onSubmit(data: z.infer<typeof schema>) {
		console.log(data)
		const response = await mutateAsync({
			data: {
				...data,
				phone: data.phoneNumber,
				name: data.fullName,
				role: data.role,
			},
		})
		const { email } = response.data
	}

	function onGoogleLogin() {
		console.log('google login')
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-6 overflow-x-hidden antialiased selection:bg-primary/30">
			{/* Background Aesthetic Elements */}
			<div className="fixed inset-0 z-0 pointer-events-none">
				<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[100px]"></div>
				<div
					className="absolute inset-0 opacity-10"
					style={{
						backgroundImage:
							'radial-gradient(#444651 0.5px, transparent 0.5px)',
						backgroundSize: '24px 24px',
					}}
				></div>
			</div>

			{/* Main Container */}
			<main className="relative z-10 w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden shadow-[0px_24px_48px_rgba(0,0,0,0.5)] rounded-lg bg-surface-container-lowest">
				{/* Left Section: Branding & Imagery */}
				<div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 overflow-hidden bg-surface">
					<div className="relative z-10">
						<span className="text-white font-bold tracking-tighter text-2xl uppercase">
							Class Platform
						</span>
						<div className="mt-24">
							<h2 className="text-4xl font-extrabold tracking-tighter text-on-surface leading-tight mb-4">
								Curating the <span className="text-primary">Infinite</span>.
							</h2>
							<p className="text-on-surface-variant text-sm leading-relaxed max-w-xs">
								Join an elite collective of thinkers, researchers, and digital
								custodians. Your intellectual legacy begins here.
							</p>
						</div>
					</div>
					<div className="relative z-10 mt-auto">
						<div className="flex items-center gap-4 mb-8">
							<div className="h-px w-12 bg-outline-variant"></div>
							<span className="text-[0.6875rem] uppercase tracking-widest text-outline">
								Established MMXXIV
							</span>
						</div>
					</div>
					{/* Ambient Image background */}
					<div className="absolute inset-0 z-0">
						<img
							className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
							alt="monolithic black obsidian architecture with sharp edges and subtle blue glowing light strips in a dark void"
							src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCN3Kud-GTyg27w_t_snWAK696ialkY679bEEk8DB5r8rhlsuFNhCT0JfKvbvssoDOY2a73Smnmd2EIxmZUIpNTU_7qJSx6qrSfaEbCAY59udJP77zuq51-ve8P6-EMIdokPV6RW_NsioPPCv6AXGzwqoz12bxOTCWIzdpGDgnTNcwXJn052_zAXn19yoPHB1jw2Io08IYXvBdbd09bEFFJWPIe_nslFLV1GoeeUJF2VDW5HXnc3qkhVr4A0avYCqqMH3mZx-Gfhpu"
						/>
						<div className="absolute inset-0 bg-linear-to-r from-surface-container-lowest via-transparent to-transparent"></div>
					</div>
				</div>

				{/* Right Section: Registration Form */}
				<div className="lg:col-span-7 bg-surface p-8 md:p-16 lg:p-20 flex flex-col justify-center">
					<div className="mb-10">
						<h1 className="text-[1.75rem] font-extrabold text-on-surface tracking-tight mb-2">
							Join the Library
						</h1>
						<p className="text-on-surface-variant text-sm tracking-tight">
							Begin your intellectual journey
						</p>
					</div>

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
						{/* Full Name Field */}
						<Controller
							name="fullName"
							control={control}
							render={({ field, fieldState }) => (
								<div className="group">
									<label
										className="block text-[0.6875rem] font-bold uppercase tracking-widest text-md3-outline transition-colors group-focus-within:text-primary mb-1"
										htmlFor="full-name"
									>
										Full Name
									</label>
									<Input
										id="full-name"
										type="text"
										className="w-full bg-transparent border-0 border-b border-outline-variant rounded-none py-3 px-0 focus-visible:ring-0 focus-visible:border-primary"
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
										Email Address
									</label>
									<Input
										id="email"
										type="email"
										className="w-full bg-transparent border-0 border-b border-outline-variant rounded-none py-3 px-0 focus-visible:ring-0 focus-visible:border-primary"
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

						{/* Phone Number Field */}
						<Controller
							name="phoneNumber"
							control={control}
							render={({ field, fieldState }) => (
								<div className="group">
									<label
										className="block text-[0.6875rem] font-bold uppercase tracking-widest text-md3-outline transition-colors group-focus-within:text-primary mb-1"
										htmlFor="phone-number"
									>
										Phone Number
									</label>
									<Input
										id="phone-number"
										type="tel"
										className="w-full bg-transparent border-0 border-b border-outline-variant rounded-none py-3 px-0 focus-visible:ring-0 focus-visible:border-primary"
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

						{/* Role Selection */}
						<Controller
							name="role"
							control={control}
							render={({ field, fieldState }) => (
								<fieldset className="space-y-3">
									<legend className="text-xs uppercase tracking-widest text-outline font-bold">
										Select Your Role
									</legend>
									<div className="grid grid-cols-2 gap-4">
										<label className="relative flex cursor-pointer rounded-lg border border-outline-variant/30 bg-surface-container-low p-4 focus:outline-none">
											<input
												className="sr-only peer"
												type="radio"
												value="INSTRUCTOR"
												checked={field.value === 'INSTRUCTOR'}
												onChange={() => field.onChange('INSTRUCTOR')}
											/>
											<div className="flex w-full items-center justify-between">
												<div className="flex items-center">
													<div className="text-sm">
														<p className="font-bold text-on-surface uppercase tracking-wider">
															Instructor
														</p>
														<p className="text-xs text-on-surface-variant">
															Curate and guide
														</p>
													</div>
												</div>
												<div className="ml-2 h-4 w-4 rounded-full border border-outline peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
													<div className="h-1.5 w-1.5 rounded-full bg-on-primary opacity-0 peer-checked:opacity-100"></div>
												</div>
											</div>
											<div
												aria-hidden="true"
												className="absolute -inset-px rounded-lg border-2 border-transparent peer-checked:border-primary pointer-events-none"
											></div>
										</label>
										<label className="relative flex cursor-pointer rounded-lg border border-outline-variant/30 bg-surface-container-low p-4 focus:outline-none">
											<input
												className="sr-only peer"
												type="radio"
												value="STUDENT"
												checked={field.value === 'STUDENT'}
												onChange={() => field.onChange('STUDENT')}
											/>
											<div className="flex w-full items-center justify-between">
												<div className="flex items-center">
													<div className="text-sm">
														<p className="font-bold text-on-surface uppercase tracking-wider">
															Student
														</p>
														<p className="text-xs text-on-surface-variant">
															Explore and learn
														</p>
													</div>
												</div>
												<div className="ml-2 h-4 w-4 rounded-full border border-outline peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
													<div className="h-1.5 w-1.5 rounded-full bg-on-primary opacity-0 peer-checked:opacity-100"></div>
												</div>
											</div>
											<div
												aria-hidden="true"
												className="absolute -inset-px rounded-lg border-2 border-transparent peer-checked:border-primary pointer-events-none"
											></div>
										</label>
									</div>
									{fieldState.error && (
										<p className="text-xs text-error mt-1">
											{fieldState.error.message}
										</p>
									)}
								</fieldset>
							)}
						/>

						{/* Password Fields */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							<Controller
								name="password"
								control={control}
								render={({ field, fieldState }) => (
									<div className="group">
										<label
											className="block text-[0.6875rem] font-bold uppercase tracking-widest text-md3-outline transition-colors group-focus-within:text-primary mb-1"
											htmlFor="password"
										>
											Password
										</label>
										<Input
											id="password"
											type="password"
											className="w-full bg-transparent border-0 border-b border-outline-variant rounded-none py-3 px-0 focus-visible:ring-0 focus-visible:border-primary"
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
							<Controller
								name="confirmPassword"
								control={control}
								render={({ field, fieldState }) => (
									<div className="group">
										<label
											className="block text-[0.6875rem] font-bold uppercase tracking-widest text-md3-outline transition-colors group-focus-within:text-primary mb-1"
											htmlFor="confirm-password"
										>
											Confirm Password
										</label>
										<Input
											id="confirm-password"
											type="password"
											className="w-full bg-transparent border-0 border-b border-outline-variant rounded-none py-3 px-0 focus-visible:ring-0 focus-visible:border-primary"
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
						</div>

						{/* Submit Button */}
						<div className="pt-4">
							<Button
								type="submit"
								className="w-full bg-primary hover:bg-primary/90 text-surface-container-lowest font-bold py-4 px-6 h-auto rounded transition-all active:scale-95 shadow-lg shadow-primary/20"
							>
								Create Account
							</Button>
						</div>

						{/* Divider */}
						<div className="flex items-center gap-4 text-outline-variant">
							<div className="h-px grow bg-outline-variant/30"></div>
							<span className="text-[0.6875rem] uppercase tracking-widest">
								Or authenticate via
							</span>
							<div className="h-px grow bg-outline-variant/30"></div>
						</div>

						{/* Social Login */}
						<div>
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

						{/* Terms */}
						<p className="text-center text-xs text-on-surface-variant leading-relaxed px-4">
							By clicking Create Account, you agree to our{' '}
							<a
								className="text-primary hover:underline underline-offset-4 decoration-primary/50 transition-all"
								href="#"
							>
								Terms of Access
							</a>{' '}
							and{' '}
							<a
								className="text-primary hover:underline underline-offset-4 decoration-primary/50 transition-all"
								href="#"
							>
								Privacy Policy
							</a>
							.
						</p>

						{/* Sign In Link */}
						<div className="pt-6 text-center border-t border-outline-variant/10">
							<span className="text-on-surface-variant text-sm">
								Already have an account?
							</span>
							<Link
								to="/login"
								className="ml-2 text-primary font-bold text-sm hover:underline underline-offset-4 transition-all"
							>
								Sign In
							</Link>
						</div>
					</form>
				</div>
				{/* Contextual Metadata */}
				<div className="absolute top-4 right-4 z-20 flex items-center gap-4 px-4 py-1.5 rounded-full border border-white/5 bg-surface/60 backdrop-blur-2xl">
					<div className="flex items-center gap-2">
						<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
						<span className="text-[0.6875rem] text-outline uppercase tracking-widest">
							Nodes Active: 14,291
						</span>
					</div>
					<div className="h-4 w-px bg-outline-variant"></div>
					<span className="text-[0.6875rem] text-outline uppercase tracking-widest">
						Latency: 12ms
					</span>
				</div>
			</main>
		</div>
	)
}
