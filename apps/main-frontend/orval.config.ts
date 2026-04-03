import { defineConfig } from 'orval'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const apiTarget = `${process.env.API_URL}/doc/json`

console.log('API target:', apiTarget)

export default defineConfig({
	api: {
		input: {
			// target: apiTarget,
			target: './openapi-fixed.json',
		},
		output: {
			target: 'src/api/generated/index.ts',
			client: 'react-query',
			clean: true,
		},
	},
})
