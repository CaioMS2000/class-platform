// fix-openapi.mjs
import { writeFileSync } from 'fs'

// Converte anyOf[{const}] → enum
function fixSchema(schema) {
	if (!schema || typeof schema !== 'object' || Array.isArray(schema))
		return schema

	if (Array.isArray(schema.anyOf) && schema.anyOf.every(s => 'const' in s)) {
		const { anyOf, ...rest } = schema
		return {
			...rest,
			type: anyOf[0]?.type ?? 'string',
			enum: anyOf.map(s => s.const),
		}
	}

	const result = {}
	for (const [key, value] of Object.entries(schema)) {
		if (Array.isArray(value)) result[key] = value.map(v => fixSchema(v))
		else if (typeof value === 'object' && value !== null)
			result[key] = fixSchema(value)
		else result[key] = value
	}
	return result
}

// Corrige um Response Object do OpenAPI 3.0:
// - remove `items`, `type` soltos no nível do response (pertencem só a schemas)
// - garante que `description` existe (obrigatório no 3.0)
function fixResponseObject(response) {
	if (!response || typeof response !== 'object') return response

	const RESPONSE_ALLOWED_KEYS = new Set([
		'description',
		'headers',
		'content',
		'links',
		'$ref',
	])

	const cleaned = {}
	for (const [key, value] of Object.entries(response)) {
		if (RESPONSE_ALLOWED_KEYS.has(key)) {
			cleaned[key] = value
		}
		// ignora chaves inválidas como `items`, `type`, etc. no nível do response
	}

	// description é obrigatório no OpenAPI 3.0
	if (!cleaned.description) {
		cleaned.description = ''
	}

	// Recursão nos schemas dentro de content
	if (cleaned.content) {
		for (const mediaType of Object.values(cleaned.content)) {
			if (mediaType.schema) {
				mediaType.schema = fixSchema(mediaType.schema)
			}
		}
	}

	return cleaned
}

function fixSpec(spec) {
	for (const pathItem of Object.values(spec.paths ?? {})) {
		for (const operation of Object.values(pathItem)) {
			if (!operation?.responses) continue

			for (const [code, response] of Object.entries(operation.responses)) {
				operation.responses[code] = fixResponseObject(response)
			}

			// Corrige schemas em requestBody também
			if (operation.requestBody?.content) {
				for (const mediaType of Object.values(operation.requestBody.content)) {
					if (mediaType.schema) mediaType.schema = fixSchema(mediaType.schema)
				}
			}

			// Corrige schemas em parameters
			if (Array.isArray(operation.parameters)) {
				for (const param of operation.parameters) {
					if (param.schema) param.schema = fixSchema(param.schema)
				}
			}
		}
	}
	return spec
}

const res = await fetch('http://localhost:8005/doc/json')
const spec = await res.json()
const fixed = fixSpec(spec)

writeFileSync('./openapi-fixed.json', JSON.stringify(fixed, null, 2))
console.log('✅ openapi-fixed.json gerado')
