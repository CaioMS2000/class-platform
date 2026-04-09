import { defineConfig } from 'orval'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const apiTarget = `${process.env.VITE_API_URL}/doc/json`

console.log('API target:', apiTarget)

export default defineConfig({
	api: {
		input: {
			// target: apiTarget,
			target: './openapi-fixed.json',
		},
		output: {
			mode: 'tags-split',
			target: 'src/api/generated',
			client: 'react-query',
			clean: true,
			override: {
				mutator: {
					path: './src/api/custom-fetch.ts',
					name: 'customFetch',
				},
			},
		},
	},
})
