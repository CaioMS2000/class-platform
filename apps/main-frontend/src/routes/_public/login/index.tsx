import { createFileRoute, redirect } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { FaGithub, FaGoogle } from 'react-icons/fa'

export const Route = createFileRoute('/_public/login/')({
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ to: '/account' })
		}
	},
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className="bg-surface-container-lowest text-on-surface flex min-h-screen overflow-hidden">
			{/* Left Panel: Editorial Visual */}
			<aside className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-surface">
				<div className="relative z-10">
					<div className="text-2xl font-extrabold tracking-tighter text-white uppercase">
						The Archivist
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
					<p className="text-on-surface-variant text-sm font-light tracking-wide leading-relaxed uppercase opacity-60">
						Authorized Personnel Only. Tier 4 Clearance required for global
						archive access and intelligence processing.
					</p>
				</div>
				{/* Background Image with data-alt */}
				<div className="absolute inset-0 z-0">
					<img
						className="w-full h-full object-cover opacity-20 grayscale brightness-50"
						alt="Monochromatic high-contrast architectural detail of a brutalist concrete library interior with dramatic shadows and sharp lines"
						src="https://lh3.googleusercontent.com/aida-public/AB6AXuAG9rkcwND2d7UBWUZH6N045PBSPc2Rm4o5JFRzdXFVxzBBg2kO4ffZN7m9x_IS-a_1aICrbD5_QXYliz0ASXbSY4NKU-7YOER9pI9YTyK68SFopRdRrFbGo11kgUS8Zkd1C9NYwBFUtIVFtSN8Q2ojiJjJ5xPOz4Lcap-xel4KSrjzTgkvc8kXjvkzvOTbhntyRzUMsc2JCbzpMkYZs49SPJsSFsj-itDV7UVc63HAm-txRtoNINJdH8QR2ixyxuI_rQWCP2L2mmRB"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent"></div>
				</div>
			</aside>
			{/* Right Panel: Login Form */}
			<main className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-surface">
				<div className="w-full max-w-md">
					{/* Mobile Logo */}
					<div className="lg:hidden mb-12">
						<div className="text-xl font-extrabold tracking-tighter text-white uppercase">
							The Archivist
						</div>
					</div>
					<header className="mb-12">
						<h2 className="text-3xl font-bold text-white tracking-tight">
							Enter the Digital Archive
						</h2>
						<p className="text-on-surface-variant text-sm mt-2 font-medium">
							Verify your credentials to continue research.
						</p>
					</header>
					<form className="space-y-8">
						{/* Email Field */}
						<div className="group">
							<label
								className="block text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-md3-outline transition-colors group-focus-within:text-primary mb-1"
								htmlFor="email"
							>
								Credential ID (Email)
							</label>
							<input
								className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 text-on-surface focus:ring-0 focus:border-primary transition-all placeholder:text-surface-container-highest"
								id="email"
								name="email"
								placeholder="archivist@institution.org"
								required
								type="email"
							/>
						</div>
						{/* Password Field */}
						<div className="group">
							<div className="flex justify-between items-center mb-1">
								<label
									className="block text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-md3-outline transition-colors group-focus-within:text-primary"
									htmlFor="password"
								>
									Access Key
								</label>
								<a
									className="text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-primary hover:text-on-primary-container transition-colors"
									href="#"
								>
									Forgot Key?
								</a>
							</div>
							<input
								className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 text-on-surface focus:ring-0 focus:border-primary transition-all placeholder:text-surface-container-highest"
								id="password"
								name="password"
								placeholder="••••••••••••"
								required
								type="password"
							/>
						</div>
						{/* Login Button */}
						<button
							className="w-full bg-linear-to-br from-primary to-primary-container text-on-primary font-bold py-4 px-6 rounded-sm uppercase tracking-widest text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2 group"
							type="submit"
						>
							Initialise Access
							<ArrowRight className="size-4" />
						</button>
					</form>
					{/* Divider */}
					<div className="relative my-12 flex items-center">
						<div className="flex-grow border-t border-outline-variant/30"></div>
						<span className="px-4 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-md3-outline">
							Third Party Authentication
						</span>
						<div className="flex-grow border-t border-outline-variant/30"></div>
					</div>
					{/* Social Logins */}
					<div
					// className="grid grid-cols-2 gap-4"
					>
						<button className=" w-full flex items-center justify-center gap-3 bg-surface-container-highest/30 hover:bg-surface-container-highest transition-colors py-3 px-4 rounded-sm border border-outline-variant/10 group">
							<FaGoogle className="w-4 h-4 text-on-surface group-hover:text-primary transition-colors" />
							<span className="text-[0.6875rem] font-bold uppercase tracking-wider text-on-surface">
								Google
							</span>
						</button>
						{/* <button className="flex items-center justify-center gap-3 bg-surface-container-highest/30 hover:bg-surface-container-highest transition-colors py-3 px-4 rounded-sm border border-outline-variant/10 group">
							<FaGithub className="w-4 h-4 text-on-surface group-hover:text-primary transition-colors" />
							<span className="text-[0.6875rem] font-bold uppercase tracking-wider text-on-surface">
								GitHub
							</span>
						</button> */}
					</div>
					{/* Footer */}
					<footer className="mt-16 text-center">
						<p className="text-[0.6875rem] text-md3-outline font-medium tracking-tight uppercase">
							New Archivist?
							<a
								className="text-primary font-bold ml-1 hover:underline underline-offset-4"
								href="#"
							>
								Request Access Account
							</a>
						</p>
						<div className="mt-12 flex justify-center gap-6 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-md3-outline/50">
							<a className="hover:text-on-surface transition-colors" href="#">
								Privacy Protocol
							</a>
							<a className="hover:text-on-surface transition-colors" href="#">
								System Status
							</a>
							<a className="hover:text-on-surface transition-colors" href="#">
								v.4.0.1
							</a>
						</div>
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
