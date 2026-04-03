export default function NotFoundMessage() {
	return (
		<div className="text-center">
			<h1 className="text-4xl font-bold mb-4 text-foreground">404</h1>
			<p className="text-xl text-gray-600 mb-4">Página não encontrada</p>
			<div className="flex flex-col gap-2">
				<a href="/" className="text-accent-blue hover:text-blue-700 underline">
					Voltar
				</a>
				<span className="text-zinc-400">ou</span>
				<a
					href="/auth"
					className="text-accent-blue hover:text-blue-700 underline"
				>
					Fazer login
				</a>
			</div>
		</div>
	)
}
