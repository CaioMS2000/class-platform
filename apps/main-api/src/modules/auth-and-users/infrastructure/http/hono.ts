import type { H } from 'hono/types'
import type { ZodObject, ZodPipe, ZodType } from 'zod'
interface ContentObject {
	[mediatype: string]: MediaTypeObject
}
interface ExamplesObject {
	[name: string]: ExampleObject | ReferenceObject
}
interface MediaTypeObject extends ISpecificationExtension {
	schema?: SchemaObject | ReferenceObject
	examples?: ExamplesObject
	example?: any
	encoding?: EncodingObject
}
type ParameterStyle =
	| 'matrix'
	| 'label'
	| 'form'
	| 'simple'
	| 'spaceDelimited'
	| 'pipeDelimited'
	| 'deepObject'
interface BaseParameterObject extends ISpecificationExtension {
	description?: string
	required?: boolean
	deprecated?: boolean
	allowEmptyValue?: boolean
	style?: ParameterStyle
	explode?: boolean
	allowReserved?: boolean
	schema?: SchemaObject | ReferenceObject
	examples?: {
		[param: string]: ExampleObject | ReferenceObject
	}
	example?: any
	content?: ContentObject
}
interface HeaderObject extends BaseParameterObject {
	$ref?: string
}
interface EncodingPropertyObject {
	contentType?: string
	headers?: {
		[key: string]: HeaderObject | ReferenceObject
	}
	style?: string
	explode?: boolean
	allowReserved?: boolean
	[key: string]: any
}
interface EncodingObject30 extends ISpecificationExtension {
	[property: string]: EncodingPropertyObject | any
}
interface EncodingObject31 extends ISpecificationExtension {
	[property: string]: EncodingPropertyObject | any
}
interface ExampleObject31 {
	summary?: string
	description?: string
	value?: any
	externalValue?: string
	[property: string]: any
}
interface ExampleObject30 {
	summary?: string
	description?: string
	value?: any
	externalValue?: string
	[property: string]: any
}
type SchemaObjectFormat =
	| 'int32'
	| 'int64'
	| 'float'
	| 'double'
	| 'byte'
	| 'binary'
	| 'date'
	| 'date-time'
	| 'password'
	| string
interface SchemaObject30 extends ISpecificationExtension {
	nullable?: boolean
	discriminator?: DiscriminatorObject
	readOnly?: boolean
	writeOnly?: boolean
	xml?: XmlObject
	externalDocs?: ExternalDocumentationObject
	example?: any
	examples?: any[]
	deprecated?: boolean
	type?: SchemaObjectType | SchemaObjectType[]
	format?: SchemaObjectFormat
	allOf?: (SchemaObject | ReferenceObject)[]
	oneOf?: (SchemaObject | ReferenceObject)[]
	anyOf?: (SchemaObject | ReferenceObject)[]
	not?: SchemaObject | ReferenceObject
	items?: SchemaObject | ReferenceObject
	properties?: {
		[propertyName: string]: SchemaObject | ReferenceObject
	}
	additionalProperties?: SchemaObject | ReferenceObject | boolean
	description?: string
	default?: any
	title?: string
	multipleOf?: number
	maximum?: number
	exclusiveMaximum?: boolean
	minimum?: number
	exclusiveMinimum?: boolean
	maxLength?: number
	minLength?: number
	pattern?: string
	maxItems?: number
	minItems?: number
	uniqueItems?: boolean
	maxProperties?: number
	minProperties?: number
	required?: string[]
	enum?: any[]
}
interface DiscriminatorObject {
	propertyName: string
	mapping?: {
		[key: string]: string
	}
}
interface XmlObject extends ISpecificationExtension {
	name?: string
	namespace?: string
	prefix?: string
	attribute?: boolean
	wrapped?: boolean
}
interface ExternalDocumentationObject extends ISpecificationExtension {
	description?: string
	url: string
}
type SchemaObjectType =
	| 'integer'
	| 'number'
	| 'string'
	| 'boolean'
	| 'object'
	| 'null'
	| 'array'
interface SchemaObject31 extends ISpecificationExtension {
	$ref?: string
	discriminator?: DiscriminatorObject
	readOnly?: boolean
	writeOnly?: boolean
	xml?: XmlObject
	externalDocs?: ExternalDocumentationObject
	example?: any
	examples?: any[]
	deprecated?: boolean
	type?: SchemaObjectType | SchemaObjectType[]
	format?:
		| 'int32'
		| 'int64'
		| 'float'
		| 'double'
		| 'byte'
		| 'binary'
		| 'date'
		| 'date-time'
		| 'password'
		| string
	allOf?: (SchemaObject | ReferenceObject)[]
	oneOf?: (SchemaObject | ReferenceObject)[]
	anyOf?: (SchemaObject | ReferenceObject)[]
	not?: SchemaObject | ReferenceObject
	items?: SchemaObject | ReferenceObject
	properties?: {
		[propertyName: string]: SchemaObject | ReferenceObject
	}
	additionalProperties?: SchemaObject | ReferenceObject | boolean
	propertyNames?: SchemaObject | ReferenceObject
	description?: string
	default?: any
	title?: string
	multipleOf?: number
	maximum?: number
	const?: any
	exclusiveMaximum?: number
	minimum?: number
	exclusiveMinimum?: number
	maxLength?: number
	minLength?: number
	pattern?: string
	maxItems?: number
	minItems?: number
	uniqueItems?: boolean
	maxProperties?: number
	minProperties?: number
	required?: string[]
	enum?: any[]
	prefixItems?: (SchemaObject | ReferenceObject)[]
	contentMediaType?: string
	contentEncoding?: string
}
type EncodingObject = EncodingObject30 | EncodingObject31
type ExampleObject = ExampleObject30 | ExampleObject31
type SchemaObject = SchemaObject30 | SchemaObject31
interface ZodMediaTypeObject {
	schema: ZodType<unknown> | SchemaObject | ReferenceObject
	examples?: ExamplesObject
	example?: any
	encoding?: EncodingObject
}
type ZodMediaType =
	| 'application/json'
	| 'text/html'
	| 'text/plain'
	| 'application/xml'
	| (string & {})
type ZodContentObject = Partial<Record<ZodMediaType, ZodMediaTypeObject>>
type Method =
	| 'get'
	| 'post'
	| 'put'
	| 'delete'
	| 'patch'
	| 'head'
	| 'options'
	| 'trace'
type IExtensionName = `x-${string}`
type IExtensionType = any
type ISpecificationExtension = {
	[extensionName: IExtensionName]: IExtensionType
}
interface ZodRequestBody {
	description?: string
	content: ZodContentObject
	required?: boolean
}
interface ServerVariableObject extends ISpecificationExtension {
	enum?: string[] | boolean[] | number[]
	default: string | boolean | number
	description?: string
}
interface ServerObject extends ISpecificationExtension {
	url: string
	description?: string
	variables?: {
		[v: string]: ServerVariableObject
	}
}
type ParameterLocation = 'query' | 'header' | 'path' | 'cookie'
interface ParameterObject extends BaseParameterObject {
	name: string
	in: ParameterLocation
}
interface HeadersObject {
	[name: string]: HeaderObject | ReferenceObject
}
interface LinksObject {
	[name: string]: LinkObject | ReferenceObject
}
interface LinkParametersObject {
	[name: string]: any | string
}
interface LinkObject extends ISpecificationExtension {
	operationRef?: string
	operationId?: string
	parameters?: LinkParametersObject
	requestBody?: any | string
	description?: string
	server?: ServerObject
	[property: string]: any
}
interface ResponseObject extends ISpecificationExtension {
	description: string
	headers?: HeadersObject
	content?: ContentObject
	links?: LinksObject
}
interface ResponsesObject extends ISpecificationExtension {
	default?: ResponseObject | ReferenceObject
	[statuscode: string]: ResponseObject | ReferenceObject | any
}
interface RequestBodyObject extends ISpecificationExtension {
	description?: string
	content: ContentObject
	required?: boolean
}
interface PathItemObject extends ISpecificationExtension {
	$ref?: string
	summary?: string
	description?: string
	get?: OperationObject
	put?: OperationObject
	post?: OperationObject
	delete?: OperationObject
	options?: OperationObject
	head?: OperationObject
	patch?: OperationObject
	trace?: OperationObject
	servers?: ServerObject[]
	parameters?: (ParameterObject | ReferenceObject)[]
}
interface CallbackObject extends ISpecificationExtension {
	[name: string]: PathItemObject | any
}
interface CallbacksObject extends ISpecificationExtension {
	[name: string]: CallbackObject | ReferenceObject | any
}
interface SecurityRequirementObject {
	[name: string]: string[]
}
interface OperationObject30 extends ISpecificationExtension {
	tags?: string[]
	summary?: string
	description?: string
	externalDocs?: ExternalDocumentationObject
	operationId?: string
	parameters?: (ParameterObject | ReferenceObject)[]
	requestBody?: RequestBodyObject | ReferenceObject
	responses: ResponsesObject
	callbacks?: CallbacksObject
	deprecated?: boolean
	security?: SecurityRequirementObject[]
	servers?: ServerObject[]
}
interface OperationObject31 extends ISpecificationExtension {
	tags?: string[]
	summary?: string
	description?: string
	externalDocs?: ExternalDocumentationObject
	operationId?: string
	parameters?: (ParameterObject | ReferenceObject)[]
	requestBody?: RequestBodyObject | ReferenceObject
	responses?: ResponsesObject
	callbacks?: CallbacksObject
	deprecated?: boolean
	security?: SecurityRequirementObject[]
	servers?: ServerObject[]
}
type ZodObjectWithEffect = ZodObject | ZodPipe
type RouteParameter = ZodObjectWithEffect | undefined
type OperationObject = OperationObject30 | OperationObject31
interface ReferenceObject30 {
	$ref: string
}
interface ReferenceObject31 {
	$ref: string
	summary?: string
	description?: string
}
type ReferenceObject = ReferenceObject30 | ReferenceObject31
interface ResponseConfig {
	description: string
	headers?: ZodObject | HeadersObject
	links?: LinksObject
	content?: ZodContentObject
	middleware?: H | H[]
	hide?: boolean
}
export type RouteConfig = OperationObject & {
	method: Method
	path: string
	request?: {
		body?: ZodRequestBody
		params?: RouteParameter
		query?: RouteParameter
		cookies?: RouteParameter
		headers?: RouteParameter | ZodType<unknown>[]
	}
	responses: {
		[statusCode: string]: ResponseConfig | ReferenceObject
	}
	middleware?: H | H[]
	hide?: boolean
}
