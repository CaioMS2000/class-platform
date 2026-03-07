/**
 * Cria um slug totalmente URL-safe a partir de uma string
 * @param text Texto para converter em slug
 * @param options Opções de configuração
 * @returns Slug URL-safe
 */
function _createSlug(
	text: string,
	options: {
		separator?: string
		maxLength?: number
		lowercase?: boolean
		removeStopWords?: boolean
		transliterate?: boolean
	} = {}
): string {
	const {
		maxLength,
		separator = '-',
		lowercase = true,
		removeStopWords = false,
		transliterate = true,
	} = options

	if (!text) return ''

	let slug = text

	// 1. Transliteração (converte caracteres acentuados para ASCII)
	if (transliterate) {
		const map: Record<string, string> = {
			ä: 'ae',
			æ: 'ae',
			ǽ: 'ae',
			ö: 'oe',
			œ: 'oe',
			ü: 'ue',
			Ä: 'Ae',
			Æ: 'Ae',
			Ǽ: 'Ae',
			Ö: 'Oe',
			Œ: 'Oe',
			Ü: 'Ue',
			ß: 'ss',
			á: 'a',
			à: 'a',
			â: 'a',
			ã: 'a',
			ª: 'a',
			Á: 'A',
			À: 'A',
			Â: 'A',
			Ã: 'A',
			é: 'e',
			è: 'e',
			ê: 'e',
			ë: 'e',
			É: 'E',
			È: 'E',
			Ê: 'E',
			Ë: 'E',
			í: 'i',
			ì: 'i',
			î: 'i',
			ï: 'i',
			Í: 'I',
			Ì: 'I',
			Î: 'I',
			Ï: 'I',
			ó: 'o',
			ò: 'o',
			ô: 'o',
			õ: 'o',
			º: 'o',
			Ó: 'O',
			Ò: 'O',
			Ô: 'O',
			Õ: 'O',
			ú: 'u',
			ù: 'u',
			û: 'u',
			ũ: 'u',
			Ú: 'U',
			Ù: 'U',
			Û: 'U',
			Ũ: 'U',
			ñ: 'n',
			Ñ: 'N',
			ç: 'c',
			Ç: 'C',
			ý: 'y',
			ÿ: 'y',
			Ý: 'Y',
			ð: 'd',
			Ð: 'D',
			þ: 'th',
			Þ: 'Th',
			ø: 'o',
			Ø: 'O',
		}

		slug = slug.replace(/[^\w\s-]/g, char => map[char] || char)
	}

	// 2. Remover stop words (opcional)
	if (removeStopWords) {
		const stopWords = new Set([
			'a',
			'an',
			'and',
			'as',
			'at',
			'but',
			'by',
			'for',
			'if',
			'in',
			'into',
			'is',
			'it',
			'no',
			'not',
			'of',
			'on',
			'or',
			'such',
			'that',
			'the',
			'their',
			'then',
			'there',
			'these',
			'they',
			'this',
			'to',
			'was',
			'will',
			'with',
			'um',
			'um',
			'uma',
			'e',
			'ou',
			'mas',
			'por',
			'para',
			'com',
			'sem',
			'sob',
			'sobre',
			'após',
			'antes',
			'durante',
		])

		slug = slug
			.split(/\s+/)
			.filter(word => !stopWords.has(word.toLowerCase()))
			.join(' ')
	}

	// 3. Converter para minúsculas
	if (lowercase) {
		slug = slug.toLowerCase()
	}

	// 4. Substituir caracteres não permitidos por separador
	slug = slug
		// Substituir caracteres especiais (exceto letras, números, espaço e separador)
		.replace(new RegExp(`[^\\w\\s${separator}]`, 'g'), '')
		// Substituir espaços e underscores pelo separador
		.replace(/[\s_]+/g, separator)
		// Remover separadores consecutivos
		.replace(new RegExp(`\\${separator}{2,}`, 'g'), separator)
		// Remover separador do início e fim
		.replace(new RegExp(`^\\${separator}|\\${separator}$`, 'g'), '')

	// 5. Limitar tamanho
	if (maxLength && maxLength > 0 && slug.length > maxLength) {
		slug = slug.substring(0, maxLength)
		// Remover separador parcial no final
		slug = slug.replace(new RegExp(`\\${separator}[^\\${separator}]*$`), '')
	}

	return slug
}

/**
 * Versão simples para slugs básicos (apenas letras, números e hífens)
 */
function createSimpleSlug(text: string): string {
	return text
		.toString()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // Remove acentos
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
		.replace(/\s+/g, '-') // Espaços viram hífen
		.replace(/-+/g, '-') // Remove hífens consecutivos
}

// export const createSlug = createSimpleSlug
export const createSlug = _createSlug
