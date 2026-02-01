/**
 * Client
 **/

import * as runtime from "./runtime/client.js";
import $Types = runtime.Types; // general types
import $Public = runtime.Types.Public;
import $Utils = runtime.Types.Utils;
import $Extensions = runtime.Types.Extensions;
import $Result = runtime.Types.Result;

export type PrismaPromise<T> = $Public.PrismaPromise<T>;

/**
 * Model Dump
 *
 */
export type Dump = $Result.DefaultSelection<Prisma.$DumpPayload>;
/**
 * Model Chunk
 *
 */
export type Chunk = $Result.DefaultSelection<Prisma.$ChunkPayload>;
/**
 * Model Embedding
 *
 */
export type Embedding = $Result.DefaultSelection<Prisma.$EmbeddingPayload>;

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Dumps
 * const dumps = await prisma.dump.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
	ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
	const U = "log" extends keyof ClientOptions
		? ClientOptions["log"] extends Array<Prisma.LogLevel | Prisma.LogDefinition>
			? Prisma.GetEvents<ClientOptions["log"]>
			: never
		: never,
	ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
> {
	[K: symbol]: { types: Prisma.TypeMap<ExtArgs>["other"] };

	/**
	 * ##  Prisma Client ʲˢ
	 *
	 * Type-safe database client for TypeScript & Node.js
	 * @example
	 * ```
	 * const prisma = new PrismaClient()
	 * // Fetch zero or more Dumps
	 * const dumps = await prisma.dump.findMany()
	 * ```
	 *
	 *
	 * Read more in our [docs](https://pris.ly/d/client).
	 */

	constructor(
		optionsArg?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>,
	);
	$on<V extends U>(
		eventType: V,
		callback: (
			event: V extends "query" ? Prisma.QueryEvent : Prisma.LogEvent,
		) => void,
	): PrismaClient;

	/**
	 * Connect with the database
	 */
	$connect(): $Utils.JsPromise<void>;

	/**
	 * Disconnect from the database
	 */
	$disconnect(): $Utils.JsPromise<void>;

	/**
	 * Executes a prepared raw query and returns the number of affected rows.
	 * @example
	 * ```
	 * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
	 * ```
	 *
	 * Read more in our [docs](https://pris.ly/d/raw-queries).
	 */
	$executeRaw<T = unknown>(
		query: TemplateStringsArray | Prisma.Sql,
		...values: any[]
	): Prisma.PrismaPromise<number>;

	/**
	 * Executes a raw query and returns the number of affected rows.
	 * Susceptible to SQL injections, see documentation.
	 * @example
	 * ```
	 * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
	 * ```
	 *
	 * Read more in our [docs](https://pris.ly/d/raw-queries).
	 */
	$executeRawUnsafe<T = unknown>(
		query: string,
		...values: any[]
	): Prisma.PrismaPromise<number>;

	/**
	 * Performs a prepared raw query and returns the `SELECT` data.
	 * @example
	 * ```
	 * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
	 * ```
	 *
	 * Read more in our [docs](https://pris.ly/d/raw-queries).
	 */
	$queryRaw<T = unknown>(
		query: TemplateStringsArray | Prisma.Sql,
		...values: any[]
	): Prisma.PrismaPromise<T>;

	/**
	 * Performs a raw query and returns the `SELECT` data.
	 * Susceptible to SQL injections, see documentation.
	 * @example
	 * ```
	 * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
	 * ```
	 *
	 * Read more in our [docs](https://pris.ly/d/raw-queries).
	 */
	$queryRawUnsafe<T = unknown>(
		query: string,
		...values: any[]
	): Prisma.PrismaPromise<T>;

	/**
	 * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
	 * @example
	 * ```
	 * const [george, bob, alice] = await prisma.$transaction([
	 *   prisma.user.create({ data: { name: 'George' } }),
	 *   prisma.user.create({ data: { name: 'Bob' } }),
	 *   prisma.user.create({ data: { name: 'Alice' } }),
	 * ])
	 * ```
	 *
	 * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
	 */
	$transaction<P extends Prisma.PrismaPromise<any>[]>(
		arg: [...P],
		options?: { isolationLevel?: Prisma.TransactionIsolationLevel },
	): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;

	$transaction<R>(
		fn: (
			prisma: Omit<PrismaClient, runtime.ITXClientDenyList>,
		) => $Utils.JsPromise<R>,
		options?: {
			maxWait?: number;
			timeout?: number;
			isolationLevel?: Prisma.TransactionIsolationLevel;
		},
	): $Utils.JsPromise<R>;

	$extends: $Extensions.ExtendsHook<
		"extends",
		Prisma.TypeMapCb<ClientOptions>,
		ExtArgs,
		$Utils.Call<
			Prisma.TypeMapCb<ClientOptions>,
			{
				extArgs: ExtArgs;
			}
		>
	>;

	/**
	 * `prisma.dump`: Exposes CRUD operations for the **Dump** model.
	 * Example usage:
	 * ```ts
	 * // Fetch zero or more Dumps
	 * const dumps = await prisma.dump.findMany()
	 * ```
	 */
	get dump(): Prisma.DumpDelegate<ExtArgs, ClientOptions>;

	/**
	 * `prisma.chunk`: Exposes CRUD operations for the **Chunk** model.
	 * Example usage:
	 * ```ts
	 * // Fetch zero or more Chunks
	 * const chunks = await prisma.chunk.findMany()
	 * ```
	 */
	get chunk(): Prisma.ChunkDelegate<ExtArgs, ClientOptions>;

	/**
	 * `prisma.embedding`: Exposes CRUD operations for the **Embedding** model.
	 * Example usage:
	 * ```ts
	 * // Fetch zero or more Embeddings
	 * const embeddings = await prisma.embedding.findMany()
	 * ```
	 */
	get embedding(): Prisma.EmbeddingDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
	export import DMMF = runtime.DMMF;

	export type PrismaPromise<T> = $Public.PrismaPromise<T>;

	/**
	 * Validator
	 */
	export import validator = runtime.Public.validator;

	/**
	 * Prisma Errors
	 */
	export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
	export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
	export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
	export import PrismaClientInitializationError = runtime.PrismaClientInitializationError;
	export import PrismaClientValidationError = runtime.PrismaClientValidationError;

	/**
	 * Re-export of sql-template-tag
	 */
	export import sql = runtime.sqltag;
	export import empty = runtime.empty;
	export import join = runtime.join;
	export import raw = runtime.raw;
	export import Sql = runtime.Sql;

	/**
	 * Decimal.js
	 */
	export import Decimal = runtime.Decimal;

	export type DecimalJsLike = runtime.DecimalJsLike;

	/**
	 * Extensions
	 */
	export import Extension = $Extensions.UserArgs;
	export import getExtensionContext = runtime.Extensions.getExtensionContext;
	export import Args = $Public.Args;
	export import Payload = $Public.Payload;
	export import Result = $Public.Result;
	export import Exact = $Public.Exact;

	/**
	 * Prisma Client JS version: 7.3.0
	 * Query Engine version: 9d6ad21cbbceab97458517b147a6a09ff43aa735
	 */
	export type PrismaVersion = {
		client: string;
		engine: string;
	};

	export const prismaVersion: PrismaVersion;

	/**
	 * Utility Types
	 */

	export import Bytes = runtime.Bytes;
	export import JsonObject = runtime.JsonObject;
	export import JsonArray = runtime.JsonArray;
	export import JsonValue = runtime.JsonValue;
	export import InputJsonObject = runtime.InputJsonObject;
	export import InputJsonArray = runtime.InputJsonArray;
	export import InputJsonValue = runtime.InputJsonValue;

	/**
	 * Types of the values used to represent different kinds of `null` values when working with JSON fields.
	 *
	 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
	 */
	namespace NullTypes {
		/**
		 * Type of `Prisma.DbNull`.
		 *
		 * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
		 *
		 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
		 */
		class DbNull {
			private DbNull: never;
			private constructor();
		}

		/**
		 * Type of `Prisma.JsonNull`.
		 *
		 * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
		 *
		 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
		 */
		class JsonNull {
			private JsonNull: never;
			private constructor();
		}

		/**
		 * Type of `Prisma.AnyNull`.
		 *
		 * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
		 *
		 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
		 */
		class AnyNull {
			private AnyNull: never;
			private constructor();
		}
	}

	/**
	 * Helper for filtering JSON entries that have `null` on the database (empty on the db)
	 *
	 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
	 */
	export const DbNull: NullTypes.DbNull;

	/**
	 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
	 *
	 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
	 */
	export const JsonNull: NullTypes.JsonNull;

	/**
	 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
	 *
	 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
	 */
	export const AnyNull: NullTypes.AnyNull;

	type SelectAndInclude = {
		select: any;
		include: any;
	};

	type SelectAndOmit = {
		select: any;
		omit: any;
	};

	/**
	 * Get the type of the value, that the Promise holds.
	 */
	export type PromiseType<T extends PromiseLike<any>> =
		T extends PromiseLike<infer U> ? U : T;

	/**
	 * Get the return type of a function which returns a Promise.
	 */
	export type PromiseReturnType<
		T extends (...args: any) => $Utils.JsPromise<any>,
	> = PromiseType<ReturnType<T>>;

	/**
	 * From T, pick a set of properties whose keys are in the union K
	 */
	type Prisma__Pick<T, K extends keyof T> = {
		[P in K]: T[P];
	};

	export type Enumerable<T> = T | Array<T>;

	export type RequiredKeys<T> = {
		[K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K;
	}[keyof T];

	export type TruthyKeys<T> = keyof {
		[K in keyof T as T[K] extends false | undefined | null ? never : K]: K;
	};

	export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>;

	/**
	 * Subset
	 * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
	 */
	export type Subset<T, U> = {
		[key in keyof T]: key extends keyof U ? T[key] : never;
	};

	/**
	 * SelectSubset
	 * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
	 * Additionally, it validates, if both select and include are present. If the case, it errors.
	 */
	export type SelectSubset<T, U> = {
		[key in keyof T]: key extends keyof U ? T[key] : never;
	} & (T extends SelectAndInclude
		? "Please either choose `select` or `include`."
		: T extends SelectAndOmit
			? "Please either choose `select` or `omit`."
			: {});

	/**
	 * Subset + Intersection
	 * @desc From `T` pick properties that exist in `U` and intersect `K`
	 */
	export type SubsetIntersection<T, U, K> = {
		[key in keyof T]: key extends keyof U ? T[key] : never;
	} & K;

	type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

	/**
	 * XOR is needed to have a real mutually exclusive union type
	 * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
	 */
	type XOR<T, U> = T extends object
		? U extends object
			? (Without<T, U> & U) | (Without<U, T> & T)
			: U
		: T;

	/**
	 * Is T a Record?
	 */
	type IsObject<T> =
		T extends Array<any>
			? False
			: T extends Date
				? False
				: T extends Uint8Array
					? False
					: T extends bigint
						? False
						: T extends object
							? True
							: False;

	/**
	 * If it's T[], return T
	 */
	export type UnEnumerate<T> = T extends Array<infer U> ? U : T;

	/**
	 * From ts-toolbelt
	 */

	type __Either<O extends object, K extends Key> = Omit<O, K> &
		{
			// Merge all but K
			[P in K]: Prisma__Pick<O, P & keyof O>; // With K possibilities
		}[K];

	type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;

	type EitherLoose<O extends object, K extends Key> = ComputeRaw<
		__Either<O, K>
	>;

	type _Either<O extends object, K extends Key, strict extends Boolean> = {
		1: EitherStrict<O, K>;
		0: EitherLoose<O, K>;
	}[strict];

	type Either<
		O extends object,
		K extends Key,
		strict extends Boolean = 1,
	> = O extends unknown ? _Either<O, K, strict> : never;

	export type Union = any;

	type PatchUndefined<O extends object, O1 extends object> = {
		[K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
	} & {};

	/** Helper Types for "Merge" **/
	export type IntersectOf<U extends Union> = (
		U extends unknown
			? (k: U) => void
			: never
	) extends (k: infer I) => void
		? I
		: never;

	export type Overwrite<O extends object, O1 extends object> = {
		[K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
	} & {};

	type _Merge<U extends object> = IntersectOf<
		Overwrite<
			U,
			{
				[K in keyof U]-?: At<U, K>;
			}
		>
	>;

	type Key = string | number | symbol;
	type AtBasic<O extends object, K extends Key> = K extends keyof O
		? O[K]
		: never;
	type AtStrict<O extends object, K extends Key> = O[K & keyof O];
	type AtLoose<O extends object, K extends Key> = O extends unknown
		? AtStrict<O, K>
		: never;
	export type At<
		O extends object,
		K extends Key,
		strict extends Boolean = 1,
	> = {
		1: AtStrict<O, K>;
		0: AtLoose<O, K>;
	}[strict];

	export type ComputeRaw<A> = A extends Function
		? A
		: {
				[K in keyof A]: A[K];
			} & {};

	export type OptionalFlat<O> = {
		[K in keyof O]?: O[K];
	} & {};

	type _Record<K extends keyof any, T> = {
		[P in K]: T;
	};

	// cause typescript not to expand types and preserve names
	type NoExpand<T> = T extends unknown ? T : never;

	// this type assumes the passed object is entirely optional
	type AtLeast<O extends object, K extends string> = NoExpand<
		O extends unknown
			?
					| (K extends keyof O ? { [P in K]: O[P] } & O : O)
					| ({ [P in keyof O as P extends K ? P : never]-?: O[P] } & O)
			: never
	>;

	type _Strict<U, _U = U> = U extends unknown
		? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>>
		: never;

	export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
	/** End Helper Types for "Merge" **/

	export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

	/**
  A [[Boolean]]
  */
	export type Boolean = True | False;

	// /**
	// 1
	// */
	export type True = 1;

	/**
  0
  */
	export type False = 0;

	export type Not<B extends Boolean> = {
		0: 1;
		1: 0;
	}[B];

	export type Extends<A1, A2> = [A1] extends [never]
		? 0 // anything `never` is false
		: A1 extends A2
			? 1
			: 0;

	export type Has<U extends Union, U1 extends Union> = Not<
		Extends<Exclude<U1, U>, U1>
	>;

	export type Or<B1 extends Boolean, B2 extends Boolean> = {
		0: {
			0: 0;
			1: 1;
		};
		1: {
			0: 1;
			1: 1;
		};
	}[B1][B2];

	export type Keys<U extends Union> = U extends unknown ? keyof U : never;

	type Cast<A, B> = A extends B ? A : B;

	export const type: unique symbol;

	/**
	 * Used by group by
	 */

	export type GetScalarType<T, O> = O extends object
		? {
				[P in keyof T]: P extends keyof O ? O[P] : never;
			}
		: never;

	type FieldPaths<
		T,
		U = Omit<T, "_avg" | "_sum" | "_count" | "_min" | "_max">,
	> = IsObject<T> extends True ? U : T;

	type GetHavingFields<T> = {
		[K in keyof T]: Or<
			Or<Extends<"OR", K>, Extends<"AND", K>>,
			Extends<"NOT", K>
		> extends True
			? // infer is only needed to not hit TS limit
				// based on the brilliant idea of Pierre-Antoine Mills
				// https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
				T[K] extends infer TK
				? GetHavingFields<
						UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never
					>
				: never
			: {} extends FieldPaths<T[K]>
				? never
				: K;
	}[keyof T];

	/**
	 * Convert tuple to union
	 */
	type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
	type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
	type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;

	/**
	 * Like `Pick`, but additionally can also accept an array of keys
	 */
	type PickEnumerable<
		T,
		K extends Enumerable<keyof T> | keyof T,
	> = Prisma__Pick<T, MaybeTupleToUnion<K>>;

	/**
	 * Exclude all keys with underscores
	 */
	type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}`
		? never
		: T;

	export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;

	type FieldRefInputType<Model, FieldType> = Model extends never
		? never
		: FieldRef<Model, FieldType>;

	export const ModelName: {
		Dump: "Dump";
		Chunk: "Chunk";
		Embedding: "Embedding";
	};

	export type ModelName = (typeof ModelName)[keyof typeof ModelName];

	interface TypeMapCb<ClientOptions = {}>
		extends $Utils.Fn<
			{ extArgs: $Extensions.InternalArgs },
			$Utils.Record<string, any>
		> {
		returns: Prisma.TypeMap<
			this["params"]["extArgs"],
			ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}
		>;
	}

	export type TypeMap<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
		GlobalOmitOptions = {},
	> = {
		globalOmitOptions: {
			omit: GlobalOmitOptions;
		};
		meta: {
			modelProps: "dump" | "chunk" | "embedding";
			txIsolationLevel: Prisma.TransactionIsolationLevel;
		};
		model: {
			Dump: {
				payload: Prisma.$DumpPayload<ExtArgs>;
				fields: Prisma.DumpFieldRefs;
				operations: {
					findUnique: {
						args: Prisma.DumpFindUniqueArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$DumpPayload> | null;
					};
					findUniqueOrThrow: {
						args: Prisma.DumpFindUniqueOrThrowArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$DumpPayload>;
					};
					findFirst: {
						args: Prisma.DumpFindFirstArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$DumpPayload> | null;
					};
					findFirstOrThrow: {
						args: Prisma.DumpFindFirstOrThrowArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$DumpPayload>;
					};
					findMany: {
						args: Prisma.DumpFindManyArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$DumpPayload>[];
					};
					create: {
						args: Prisma.DumpCreateArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$DumpPayload>;
					};
					createMany: {
						args: Prisma.DumpCreateManyArgs<ExtArgs>;
						result: BatchPayload;
					};
					createManyAndReturn: {
						args: Prisma.DumpCreateManyAndReturnArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$DumpPayload>[];
					};
					delete: {
						args: Prisma.DumpDeleteArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$DumpPayload>;
					};
					update: {
						args: Prisma.DumpUpdateArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$DumpPayload>;
					};
					deleteMany: {
						args: Prisma.DumpDeleteManyArgs<ExtArgs>;
						result: BatchPayload;
					};
					updateMany: {
						args: Prisma.DumpUpdateManyArgs<ExtArgs>;
						result: BatchPayload;
					};
					updateManyAndReturn: {
						args: Prisma.DumpUpdateManyAndReturnArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$DumpPayload>[];
					};
					upsert: {
						args: Prisma.DumpUpsertArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$DumpPayload>;
					};
					aggregate: {
						args: Prisma.DumpAggregateArgs<ExtArgs>;
						result: $Utils.Optional<AggregateDump>;
					};
					groupBy: {
						args: Prisma.DumpGroupByArgs<ExtArgs>;
						result: $Utils.Optional<DumpGroupByOutputType>[];
					};
					count: {
						args: Prisma.DumpCountArgs<ExtArgs>;
						result: $Utils.Optional<DumpCountAggregateOutputType> | number;
					};
				};
			};
			Chunk: {
				payload: Prisma.$ChunkPayload<ExtArgs>;
				fields: Prisma.ChunkFieldRefs;
				operations: {
					findUnique: {
						args: Prisma.ChunkFindUniqueArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$ChunkPayload> | null;
					};
					findUniqueOrThrow: {
						args: Prisma.ChunkFindUniqueOrThrowArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$ChunkPayload>;
					};
					findFirst: {
						args: Prisma.ChunkFindFirstArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$ChunkPayload> | null;
					};
					findFirstOrThrow: {
						args: Prisma.ChunkFindFirstOrThrowArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$ChunkPayload>;
					};
					findMany: {
						args: Prisma.ChunkFindManyArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$ChunkPayload>[];
					};
					create: {
						args: Prisma.ChunkCreateArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$ChunkPayload>;
					};
					createMany: {
						args: Prisma.ChunkCreateManyArgs<ExtArgs>;
						result: BatchPayload;
					};
					createManyAndReturn: {
						args: Prisma.ChunkCreateManyAndReturnArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$ChunkPayload>[];
					};
					delete: {
						args: Prisma.ChunkDeleteArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$ChunkPayload>;
					};
					update: {
						args: Prisma.ChunkUpdateArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$ChunkPayload>;
					};
					deleteMany: {
						args: Prisma.ChunkDeleteManyArgs<ExtArgs>;
						result: BatchPayload;
					};
					updateMany: {
						args: Prisma.ChunkUpdateManyArgs<ExtArgs>;
						result: BatchPayload;
					};
					updateManyAndReturn: {
						args: Prisma.ChunkUpdateManyAndReturnArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$ChunkPayload>[];
					};
					upsert: {
						args: Prisma.ChunkUpsertArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$ChunkPayload>;
					};
					aggregate: {
						args: Prisma.ChunkAggregateArgs<ExtArgs>;
						result: $Utils.Optional<AggregateChunk>;
					};
					groupBy: {
						args: Prisma.ChunkGroupByArgs<ExtArgs>;
						result: $Utils.Optional<ChunkGroupByOutputType>[];
					};
					count: {
						args: Prisma.ChunkCountArgs<ExtArgs>;
						result: $Utils.Optional<ChunkCountAggregateOutputType> | number;
					};
				};
			};
			Embedding: {
				payload: Prisma.$EmbeddingPayload<ExtArgs>;
				fields: Prisma.EmbeddingFieldRefs;
				operations: {
					findUnique: {
						args: Prisma.EmbeddingFindUniqueArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$EmbeddingPayload> | null;
					};
					findUniqueOrThrow: {
						args: Prisma.EmbeddingFindUniqueOrThrowArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$EmbeddingPayload>;
					};
					findFirst: {
						args: Prisma.EmbeddingFindFirstArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$EmbeddingPayload> | null;
					};
					findFirstOrThrow: {
						args: Prisma.EmbeddingFindFirstOrThrowArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$EmbeddingPayload>;
					};
					findMany: {
						args: Prisma.EmbeddingFindManyArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$EmbeddingPayload>[];
					};
					delete: {
						args: Prisma.EmbeddingDeleteArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$EmbeddingPayload>;
					};
					update: {
						args: Prisma.EmbeddingUpdateArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$EmbeddingPayload>;
					};
					deleteMany: {
						args: Prisma.EmbeddingDeleteManyArgs<ExtArgs>;
						result: BatchPayload;
					};
					updateMany: {
						args: Prisma.EmbeddingUpdateManyArgs<ExtArgs>;
						result: BatchPayload;
					};
					updateManyAndReturn: {
						args: Prisma.EmbeddingUpdateManyAndReturnArgs<ExtArgs>;
						result: $Utils.PayloadToResult<Prisma.$EmbeddingPayload>[];
					};
					aggregate: {
						args: Prisma.EmbeddingAggregateArgs<ExtArgs>;
						result: $Utils.Optional<AggregateEmbedding>;
					};
					groupBy: {
						args: Prisma.EmbeddingGroupByArgs<ExtArgs>;
						result: $Utils.Optional<EmbeddingGroupByOutputType>[];
					};
					count: {
						args: Prisma.EmbeddingCountArgs<ExtArgs>;
						result: $Utils.Optional<EmbeddingCountAggregateOutputType> | number;
					};
				};
			};
		};
	} & {
		other: {
			payload: any;
			operations: {
				$executeRaw: {
					args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
					result: any;
				};
				$executeRawUnsafe: {
					args: [query: string, ...values: any[]];
					result: any;
				};
				$queryRaw: {
					args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
					result: any;
				};
				$queryRawUnsafe: {
					args: [query: string, ...values: any[]];
					result: any;
				};
			};
		};
	};
	export const defineExtension: $Extensions.ExtendsHook<
		"define",
		Prisma.TypeMapCb,
		$Extensions.DefaultArgs
	>;
	export type DefaultPrismaClient = PrismaClient;
	export type ErrorFormat = "pretty" | "colorless" | "minimal";
	export interface PrismaClientOptions {
		/**
		 * @default "colorless"
		 */
		errorFormat?: ErrorFormat;
		/**
		 * @example
		 * ```
		 * // Shorthand for `emit: 'stdout'`
		 * log: ['query', 'info', 'warn', 'error']
		 *
		 * // Emit as events only
		 * log: [
		 *   { emit: 'event', level: 'query' },
		 *   { emit: 'event', level: 'info' },
		 *   { emit: 'event', level: 'warn' }
		 *   { emit: 'event', level: 'error' }
		 * ]
		 *
		 * / Emit as events and log to stdout
		 * og: [
		 *  { emit: 'stdout', level: 'query' },
		 *  { emit: 'stdout', level: 'info' },
		 *  { emit: 'stdout', level: 'warn' }
		 *  { emit: 'stdout', level: 'error' }
		 *
		 * ```
		 * Read more in our [docs](https://pris.ly/d/logging).
		 */
		log?: (LogLevel | LogDefinition)[];
		/**
		 * The default values for transactionOptions
		 * maxWait ?= 2000
		 * timeout ?= 5000
		 */
		transactionOptions?: {
			maxWait?: number;
			timeout?: number;
			isolationLevel?: Prisma.TransactionIsolationLevel;
		};
		/**
		 * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
		 */
		adapter?: runtime.SqlDriverAdapterFactory;
		/**
		 * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
		 */
		accelerateUrl?: string;
		/**
		 * Global configuration for omitting model fields by default.
		 *
		 * @example
		 * ```
		 * const prisma = new PrismaClient({
		 *   omit: {
		 *     user: {
		 *       password: true
		 *     }
		 *   }
		 * })
		 * ```
		 */
		omit?: Prisma.GlobalOmitConfig;
		/**
		 * SQL commenter plugins that add metadata to SQL queries as comments.
		 * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
		 *
		 * @example
		 * ```
		 * const prisma = new PrismaClient({
		 *   adapter,
		 *   comments: [
		 *     traceContext(),
		 *     queryInsights(),
		 *   ],
		 * })
		 * ```
		 */
		comments?: runtime.SqlCommenterPlugin[];
	}
	export type GlobalOmitConfig = {
		dump?: DumpOmit;
		chunk?: ChunkOmit;
		embedding?: EmbeddingOmit;
	};

	/* Types for Logging */
	export type LogLevel = "info" | "query" | "warn" | "error";
	export type LogDefinition = {
		level: LogLevel;
		emit: "stdout" | "event";
	};

	export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

	export type GetLogType<T> = CheckIsLogLevel<
		T extends LogDefinition ? T["level"] : T
	>;

	export type GetEvents<T extends any[]> =
		T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;

	export type QueryEvent = {
		timestamp: Date;
		query: string;
		params: string;
		duration: number;
		target: string;
	};

	export type LogEvent = {
		timestamp: Date;
		message: string;
		target: string;
	};
	/* End Types for Logging */

	export type PrismaAction =
		| "findUnique"
		| "findUniqueOrThrow"
		| "findMany"
		| "findFirst"
		| "findFirstOrThrow"
		| "create"
		| "createMany"
		| "createManyAndReturn"
		| "update"
		| "updateMany"
		| "updateManyAndReturn"
		| "upsert"
		| "delete"
		| "deleteMany"
		| "executeRaw"
		| "queryRaw"
		| "aggregate"
		| "count"
		| "runCommandRaw"
		| "findRaw"
		| "groupBy";

	// tested in getLogLevel.test.ts
	export function getLogLevel(
		log: Array<LogLevel | LogDefinition>,
	): LogLevel | undefined;

	/**
	 * `PrismaClient` proxy available in interactive transactions.
	 */
	export type TransactionClient = Omit<
		Prisma.DefaultPrismaClient,
		runtime.ITXClientDenyList
	>;

	export type Datasource = {
		url?: string;
	};

	/**
	 * Count Types
	 */

	/**
	 * Count Type DumpCountOutputType
	 */

	export type DumpCountOutputType = {
		chunks: number;
	};

	export type DumpCountOutputTypeSelect<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		chunks?: boolean | DumpCountOutputTypeCountChunksArgs;
	};

	// Custom InputTypes
	/**
	 * DumpCountOutputType without action
	 */
	export type DumpCountOutputTypeDefaultArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the DumpCountOutputType
		 */
		select?: DumpCountOutputTypeSelect<ExtArgs> | null;
	};

	/**
	 * DumpCountOutputType without action
	 */
	export type DumpCountOutputTypeCountChunksArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		where?: ChunkWhereInput;
	};

	/**
	 * Models
	 */

	/**
	 * Model Dump
	 */

	export type AggregateDump = {
		_count: DumpCountAggregateOutputType | null;
		_min: DumpMinAggregateOutputType | null;
		_max: DumpMaxAggregateOutputType | null;
	};

	export type DumpMinAggregateOutputType = {
		id: string | null;
		content: string | null;
		createdAt: Date | null;
	};

	export type DumpMaxAggregateOutputType = {
		id: string | null;
		content: string | null;
		createdAt: Date | null;
	};

	export type DumpCountAggregateOutputType = {
		id: number;
		content: number;
		createdAt: number;
		_all: number;
	};

	export type DumpMinAggregateInputType = {
		id?: true;
		content?: true;
		createdAt?: true;
	};

	export type DumpMaxAggregateInputType = {
		id?: true;
		content?: true;
		createdAt?: true;
	};

	export type DumpCountAggregateInputType = {
		id?: true;
		content?: true;
		createdAt?: true;
		_all?: true;
	};

	export type DumpAggregateArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Filter which Dump to aggregate.
		 */
		where?: DumpWhereInput;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
		 *
		 * Determine the order of Dumps to fetch.
		 */
		orderBy?: DumpOrderByWithRelationInput | DumpOrderByWithRelationInput[];
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
		 *
		 * Sets the start position
		 */
		cursor?: DumpWhereUniqueInput;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
		 *
		 * Take `±n` Dumps from the position of the cursor.
		 */
		take?: number;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
		 *
		 * Skip the first `n` Dumps.
		 */
		skip?: number;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
		 *
		 * Count returned Dumps
		 **/
		_count?: true | DumpCountAggregateInputType;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
		 *
		 * Select which fields to find the minimum value
		 **/
		_min?: DumpMinAggregateInputType;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
		 *
		 * Select which fields to find the maximum value
		 **/
		_max?: DumpMaxAggregateInputType;
	};

	export type GetDumpAggregateType<T extends DumpAggregateArgs> = {
		[P in keyof T & keyof AggregateDump]: P extends "_count" | "count"
			? T[P] extends true
				? number
				: GetScalarType<T[P], AggregateDump[P]>
			: GetScalarType<T[P], AggregateDump[P]>;
	};

	export type DumpGroupByArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		where?: DumpWhereInput;
		orderBy?:
			| DumpOrderByWithAggregationInput
			| DumpOrderByWithAggregationInput[];
		by: DumpScalarFieldEnum[] | DumpScalarFieldEnum;
		having?: DumpScalarWhereWithAggregatesInput;
		take?: number;
		skip?: number;
		_count?: DumpCountAggregateInputType | true;
		_min?: DumpMinAggregateInputType;
		_max?: DumpMaxAggregateInputType;
	};

	export type DumpGroupByOutputType = {
		id: string;
		content: string;
		createdAt: Date;
		_count: DumpCountAggregateOutputType | null;
		_min: DumpMinAggregateOutputType | null;
		_max: DumpMaxAggregateOutputType | null;
	};

	type GetDumpGroupByPayload<T extends DumpGroupByArgs> = Prisma.PrismaPromise<
		Array<
			PickEnumerable<DumpGroupByOutputType, T["by"]> & {
				[P in keyof T & keyof DumpGroupByOutputType]: P extends "_count"
					? T[P] extends boolean
						? number
						: GetScalarType<T[P], DumpGroupByOutputType[P]>
					: GetScalarType<T[P], DumpGroupByOutputType[P]>;
			}
		>
	>;

	export type DumpSelect<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = $Extensions.GetSelect<
		{
			id?: boolean;
			content?: boolean;
			createdAt?: boolean;
			chunks?: boolean | Dump$chunksArgs<ExtArgs>;
			_count?: boolean | DumpCountOutputTypeDefaultArgs<ExtArgs>;
		},
		ExtArgs["result"]["dump"]
	>;

	export type DumpSelectCreateManyAndReturn<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = $Extensions.GetSelect<
		{
			id?: boolean;
			content?: boolean;
			createdAt?: boolean;
		},
		ExtArgs["result"]["dump"]
	>;

	export type DumpSelectUpdateManyAndReturn<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = $Extensions.GetSelect<
		{
			id?: boolean;
			content?: boolean;
			createdAt?: boolean;
		},
		ExtArgs["result"]["dump"]
	>;

	export type DumpSelectScalar = {
		id?: boolean;
		content?: boolean;
		createdAt?: boolean;
	};

	export type DumpOmit<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = $Extensions.GetOmit<
		"id" | "content" | "createdAt",
		ExtArgs["result"]["dump"]
	>;
	export type DumpInclude<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		chunks?: boolean | Dump$chunksArgs<ExtArgs>;
		_count?: boolean | DumpCountOutputTypeDefaultArgs<ExtArgs>;
	};
	export type DumpIncludeCreateManyAndReturn<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {};
	export type DumpIncludeUpdateManyAndReturn<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {};

	export type $DumpPayload<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		name: "Dump";
		objects: {
			chunks: Prisma.$ChunkPayload<ExtArgs>[];
		};
		scalars: $Extensions.GetPayloadResult<
			{
				id: string;
				content: string;
				createdAt: Date;
			},
			ExtArgs["result"]["dump"]
		>;
		composites: {};
	};

	type DumpGetPayload<S extends boolean | null | undefined | DumpDefaultArgs> =
		$Result.GetResult<Prisma.$DumpPayload, S>;

	type DumpCountArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = Omit<DumpFindManyArgs, "select" | "include" | "distinct" | "omit"> & {
		select?: DumpCountAggregateInputType | true;
	};

	export interface DumpDelegate<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
		GlobalOmitOptions = {},
	> {
		[K: symbol]: {
			types: Prisma.TypeMap<ExtArgs>["model"]["Dump"];
			meta: { name: "Dump" };
		};
		/**
		 * Find zero or one Dump that matches the filter.
		 * @param {DumpFindUniqueArgs} args - Arguments to find a Dump
		 * @example
		 * // Get one Dump
		 * const dump = await prisma.dump.findUnique({
		 *   where: {
		 *     // ... provide filter here
		 *   }
		 * })
		 */
		findUnique<T extends DumpFindUniqueArgs>(
			args: SelectSubset<T, DumpFindUniqueArgs<ExtArgs>>,
		): Prisma__DumpClient<
			$Result.GetResult<
				Prisma.$DumpPayload<ExtArgs>,
				T,
				"findUnique",
				GlobalOmitOptions
			> | null,
			null,
			ExtArgs,
			GlobalOmitOptions
		>;

		/**
		 * Find one Dump that matches the filter or throw an error with `error.code='P2025'`
		 * if no matches were found.
		 * @param {DumpFindUniqueOrThrowArgs} args - Arguments to find a Dump
		 * @example
		 * // Get one Dump
		 * const dump = await prisma.dump.findUniqueOrThrow({
		 *   where: {
		 *     // ... provide filter here
		 *   }
		 * })
		 */
		findUniqueOrThrow<T extends DumpFindUniqueOrThrowArgs>(
			args: SelectSubset<T, DumpFindUniqueOrThrowArgs<ExtArgs>>,
		): Prisma__DumpClient<
			$Result.GetResult<
				Prisma.$DumpPayload<ExtArgs>,
				T,
				"findUniqueOrThrow",
				GlobalOmitOptions
			>,
			never,
			ExtArgs,
			GlobalOmitOptions
		>;

		/**
		 * Find the first Dump that matches the filter.
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 * @param {DumpFindFirstArgs} args - Arguments to find a Dump
		 * @example
		 * // Get one Dump
		 * const dump = await prisma.dump.findFirst({
		 *   where: {
		 *     // ... provide filter here
		 *   }
		 * })
		 */
		findFirst<T extends DumpFindFirstArgs>(
			args?: SelectSubset<T, DumpFindFirstArgs<ExtArgs>>,
		): Prisma__DumpClient<
			$Result.GetResult<
				Prisma.$DumpPayload<ExtArgs>,
				T,
				"findFirst",
				GlobalOmitOptions
			> | null,
			null,
			ExtArgs,
			GlobalOmitOptions
		>;

		/**
		 * Find the first Dump that matches the filter or
		 * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 * @param {DumpFindFirstOrThrowArgs} args - Arguments to find a Dump
		 * @example
		 * // Get one Dump
		 * const dump = await prisma.dump.findFirstOrThrow({
		 *   where: {
		 *     // ... provide filter here
		 *   }
		 * })
		 */
		findFirstOrThrow<T extends DumpFindFirstOrThrowArgs>(
			args?: SelectSubset<T, DumpFindFirstOrThrowArgs<ExtArgs>>,
		): Prisma__DumpClient<
			$Result.GetResult<
				Prisma.$DumpPayload<ExtArgs>,
				T,
				"findFirstOrThrow",
				GlobalOmitOptions
			>,
			never,
			ExtArgs,
			GlobalOmitOptions
		>;

		/**
		 * Find zero or more Dumps that matches the filter.
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 * @param {DumpFindManyArgs} args - Arguments to filter and select certain fields only.
		 * @example
		 * // Get all Dumps
		 * const dumps = await prisma.dump.findMany()
		 *
		 * // Get first 10 Dumps
		 * const dumps = await prisma.dump.findMany({ take: 10 })
		 *
		 * // Only select the `id`
		 * const dumpWithIdOnly = await prisma.dump.findMany({ select: { id: true } })
		 *
		 */
		findMany<T extends DumpFindManyArgs>(
			args?: SelectSubset<T, DumpFindManyArgs<ExtArgs>>,
		): Prisma.PrismaPromise<
			$Result.GetResult<
				Prisma.$DumpPayload<ExtArgs>,
				T,
				"findMany",
				GlobalOmitOptions
			>
		>;

		/**
		 * Create a Dump.
		 * @param {DumpCreateArgs} args - Arguments to create a Dump.
		 * @example
		 * // Create one Dump
		 * const Dump = await prisma.dump.create({
		 *   data: {
		 *     // ... data to create a Dump
		 *   }
		 * })
		 *
		 */
		create<T extends DumpCreateArgs>(
			args: SelectSubset<T, DumpCreateArgs<ExtArgs>>,
		): Prisma__DumpClient<
			$Result.GetResult<
				Prisma.$DumpPayload<ExtArgs>,
				T,
				"create",
				GlobalOmitOptions
			>,
			never,
			ExtArgs,
			GlobalOmitOptions
		>;

		/**
		 * Create many Dumps.
		 * @param {DumpCreateManyArgs} args - Arguments to create many Dumps.
		 * @example
		 * // Create many Dumps
		 * const dump = await prisma.dump.createMany({
		 *   data: [
		 *     // ... provide data here
		 *   ]
		 * })
		 *
		 */
		createMany<T extends DumpCreateManyArgs>(
			args?: SelectSubset<T, DumpCreateManyArgs<ExtArgs>>,
		): Prisma.PrismaPromise<BatchPayload>;

		/**
		 * Create many Dumps and returns the data saved in the database.
		 * @param {DumpCreateManyAndReturnArgs} args - Arguments to create many Dumps.
		 * @example
		 * // Create many Dumps
		 * const dump = await prisma.dump.createManyAndReturn({
		 *   data: [
		 *     // ... provide data here
		 *   ]
		 * })
		 *
		 * // Create many Dumps and only return the `id`
		 * const dumpWithIdOnly = await prisma.dump.createManyAndReturn({
		 *   select: { id: true },
		 *   data: [
		 *     // ... provide data here
		 *   ]
		 * })
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 *
		 */
		createManyAndReturn<T extends DumpCreateManyAndReturnArgs>(
			args?: SelectSubset<T, DumpCreateManyAndReturnArgs<ExtArgs>>,
		): Prisma.PrismaPromise<
			$Result.GetResult<
				Prisma.$DumpPayload<ExtArgs>,
				T,
				"createManyAndReturn",
				GlobalOmitOptions
			>
		>;

		/**
		 * Delete a Dump.
		 * @param {DumpDeleteArgs} args - Arguments to delete one Dump.
		 * @example
		 * // Delete one Dump
		 * const Dump = await prisma.dump.delete({
		 *   where: {
		 *     // ... filter to delete one Dump
		 *   }
		 * })
		 *
		 */
		delete<T extends DumpDeleteArgs>(
			args: SelectSubset<T, DumpDeleteArgs<ExtArgs>>,
		): Prisma__DumpClient<
			$Result.GetResult<
				Prisma.$DumpPayload<ExtArgs>,
				T,
				"delete",
				GlobalOmitOptions
			>,
			never,
			ExtArgs,
			GlobalOmitOptions
		>;

		/**
		 * Update one Dump.
		 * @param {DumpUpdateArgs} args - Arguments to update one Dump.
		 * @example
		 * // Update one Dump
		 * const dump = await prisma.dump.update({
		 *   where: {
		 *     // ... provide filter here
		 *   },
		 *   data: {
		 *     // ... provide data here
		 *   }
		 * })
		 *
		 */
		update<T extends DumpUpdateArgs>(
			args: SelectSubset<T, DumpUpdateArgs<ExtArgs>>,
		): Prisma__DumpClient<
			$Result.GetResult<
				Prisma.$DumpPayload<ExtArgs>,
				T,
				"update",
				GlobalOmitOptions
			>,
			never,
			ExtArgs,
			GlobalOmitOptions
		>;

		/**
		 * Delete zero or more Dumps.
		 * @param {DumpDeleteManyArgs} args - Arguments to filter Dumps to delete.
		 * @example
		 * // Delete a few Dumps
		 * const { count } = await prisma.dump.deleteMany({
		 *   where: {
		 *     // ... provide filter here
		 *   }
		 * })
		 *
		 */
		deleteMany<T extends DumpDeleteManyArgs>(
			args?: SelectSubset<T, DumpDeleteManyArgs<ExtArgs>>,
		): Prisma.PrismaPromise<BatchPayload>;

		/**
		 * Update zero or more Dumps.
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 * @param {DumpUpdateManyArgs} args - Arguments to update one or more rows.
		 * @example
		 * // Update many Dumps
		 * const dump = await prisma.dump.updateMany({
		 *   where: {
		 *     // ... provide filter here
		 *   },
		 *   data: {
		 *     // ... provide data here
		 *   }
		 * })
		 *
		 */
		updateMany<T extends DumpUpdateManyArgs>(
			args: SelectSubset<T, DumpUpdateManyArgs<ExtArgs>>,
		): Prisma.PrismaPromise<BatchPayload>;

		/**
		 * Update zero or more Dumps and returns the data updated in the database.
		 * @param {DumpUpdateManyAndReturnArgs} args - Arguments to update many Dumps.
		 * @example
		 * // Update many Dumps
		 * const dump = await prisma.dump.updateManyAndReturn({
		 *   where: {
		 *     // ... provide filter here
		 *   },
		 *   data: [
		 *     // ... provide data here
		 *   ]
		 * })
		 *
		 * // Update zero or more Dumps and only return the `id`
		 * const dumpWithIdOnly = await prisma.dump.updateManyAndReturn({
		 *   select: { id: true },
		 *   where: {
		 *     // ... provide filter here
		 *   },
		 *   data: [
		 *     // ... provide data here
		 *   ]
		 * })
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 *
		 */
		updateManyAndReturn<T extends DumpUpdateManyAndReturnArgs>(
			args: SelectSubset<T, DumpUpdateManyAndReturnArgs<ExtArgs>>,
		): Prisma.PrismaPromise<
			$Result.GetResult<
				Prisma.$DumpPayload<ExtArgs>,
				T,
				"updateManyAndReturn",
				GlobalOmitOptions
			>
		>;

		/**
		 * Create or update one Dump.
		 * @param {DumpUpsertArgs} args - Arguments to update or create a Dump.
		 * @example
		 * // Update or create a Dump
		 * const dump = await prisma.dump.upsert({
		 *   create: {
		 *     // ... data to create a Dump
		 *   },
		 *   update: {
		 *     // ... in case it already exists, update
		 *   },
		 *   where: {
		 *     // ... the filter for the Dump we want to update
		 *   }
		 * })
		 */
		upsert<T extends DumpUpsertArgs>(
			args: SelectSubset<T, DumpUpsertArgs<ExtArgs>>,
		): Prisma__DumpClient<
			$Result.GetResult<
				Prisma.$DumpPayload<ExtArgs>,
				T,
				"upsert",
				GlobalOmitOptions
			>,
			never,
			ExtArgs,
			GlobalOmitOptions
		>;

		/**
		 * Count the number of Dumps.
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 * @param {DumpCountArgs} args - Arguments to filter Dumps to count.
		 * @example
		 * // Count the number of Dumps
		 * const count = await prisma.dump.count({
		 *   where: {
		 *     // ... the filter for the Dumps we want to count
		 *   }
		 * })
		 **/
		count<T extends DumpCountArgs>(
			args?: Subset<T, DumpCountArgs>,
		): Prisma.PrismaPromise<
			T extends $Utils.Record<"select", any>
				? T["select"] extends true
					? number
					: GetScalarType<T["select"], DumpCountAggregateOutputType>
				: number
		>;

		/**
		 * Allows you to perform aggregations operations on a Dump.
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 * @param {DumpAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
		 * @example
		 * // Ordered by age ascending
		 * // Where email contains prisma.io
		 * // Limited to the 10 users
		 * const aggregations = await prisma.user.aggregate({
		 *   _avg: {
		 *     age: true,
		 *   },
		 *   where: {
		 *     email: {
		 *       contains: "prisma.io",
		 *     },
		 *   },
		 *   orderBy: {
		 *     age: "asc",
		 *   },
		 *   take: 10,
		 * })
		 **/
		aggregate<T extends DumpAggregateArgs>(
			args: Subset<T, DumpAggregateArgs>,
		): Prisma.PrismaPromise<GetDumpAggregateType<T>>;

		/**
		 * Group by Dump.
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 * @param {DumpGroupByArgs} args - Group by arguments.
		 * @example
		 * // Group by city, order by createdAt, get count
		 * const result = await prisma.user.groupBy({
		 *   by: ['city', 'createdAt'],
		 *   orderBy: {
		 *     createdAt: true
		 *   },
		 *   _count: {
		 *     _all: true
		 *   },
		 * })
		 *
		 **/
		groupBy<
			T extends DumpGroupByArgs,
			HasSelectOrTake extends Or<
				Extends<"skip", Keys<T>>,
				Extends<"take", Keys<T>>
			>,
			OrderByArg extends True extends HasSelectOrTake
				? { orderBy: DumpGroupByArgs["orderBy"] }
				: { orderBy?: DumpGroupByArgs["orderBy"] },
			OrderFields extends ExcludeUnderscoreKeys<
				Keys<MaybeTupleToUnion<T["orderBy"]>>
			>,
			ByFields extends MaybeTupleToUnion<T["by"]>,
			ByValid extends Has<ByFields, OrderFields>,
			HavingFields extends GetHavingFields<T["having"]>,
			HavingValid extends Has<ByFields, HavingFields>,
			ByEmpty extends T["by"] extends never[] ? True : False,
			InputErrors extends ByEmpty extends True
				? `Error: "by" must not be empty.`
				: HavingValid extends False
					? {
							[P in HavingFields]: P extends ByFields
								? never
								: P extends string
									? `Error: Field "${P}" used in "having" needs to be provided in "by".`
									: [
											Error,
											"Field ",
											P,
											` in "having" needs to be provided in "by"`,
										];
						}[HavingFields]
					: "take" extends Keys<T>
						? "orderBy" extends Keys<T>
							? ByValid extends True
								? {}
								: {
										[P in OrderFields]: P extends ByFields
											? never
											: `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
									}[OrderFields]
							: 'Error: If you provide "take", you also need to provide "orderBy"'
						: "skip" extends Keys<T>
							? "orderBy" extends Keys<T>
								? ByValid extends True
									? {}
									: {
											[P in OrderFields]: P extends ByFields
												? never
												: `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
										}[OrderFields]
								: 'Error: If you provide "skip", you also need to provide "orderBy"'
							: ByValid extends True
								? {}
								: {
										[P in OrderFields]: P extends ByFields
											? never
											: `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
									}[OrderFields],
		>(
			args: SubsetIntersection<T, DumpGroupByArgs, OrderByArg> & InputErrors,
		): {} extends InputErrors
			? GetDumpGroupByPayload<T>
			: Prisma.PrismaPromise<InputErrors>;
		/**
		 * Fields of the Dump model
		 */
		readonly fields: DumpFieldRefs;
	}

	/**
	 * The delegate class that acts as a "Promise-like" for Dump.
	 * Why is this prefixed with `Prisma__`?
	 * Because we want to prevent naming conflicts as mentioned in
	 * https://github.com/prisma/prisma-client-js/issues/707
	 */
	export interface Prisma__DumpClient<
		T,
		Null = never,
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
		GlobalOmitOptions = {},
	> extends Prisma.PrismaPromise<T> {
		readonly [Symbol.toStringTag]: "PrismaPromise";
		chunks<T extends Dump$chunksArgs<ExtArgs> = {}>(
			args?: Subset<T, Dump$chunksArgs<ExtArgs>>,
		): Prisma.PrismaPromise<
			| $Result.GetResult<
					Prisma.$ChunkPayload<ExtArgs>,
					T,
					"findMany",
					GlobalOmitOptions
			  >
			| Null
		>;
		/**
		 * Attaches callbacks for the resolution and/or rejection of the Promise.
		 * @param onfulfilled The callback to execute when the Promise is resolved.
		 * @param onrejected The callback to execute when the Promise is rejected.
		 * @returns A Promise for the completion of which ever callback is executed.
		 */
		then<TResult1 = T, TResult2 = never>(
			onfulfilled?:
				| ((value: T) => TResult1 | PromiseLike<TResult1>)
				| undefined
				| null,
			onrejected?:
				| ((reason: any) => TResult2 | PromiseLike<TResult2>)
				| undefined
				| null,
		): $Utils.JsPromise<TResult1 | TResult2>;
		/**
		 * Attaches a callback for only the rejection of the Promise.
		 * @param onrejected The callback to execute when the Promise is rejected.
		 * @returns A Promise for the completion of the callback.
		 */
		catch<TResult = never>(
			onrejected?:
				| ((reason: any) => TResult | PromiseLike<TResult>)
				| undefined
				| null,
		): $Utils.JsPromise<T | TResult>;
		/**
		 * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
		 * resolved value cannot be modified from the callback.
		 * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
		 * @returns A Promise for the completion of the callback.
		 */
		finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
	}

	/**
	 * Fields of the Dump model
	 */
	interface DumpFieldRefs {
		readonly id: FieldRef<"Dump", "String">;
		readonly content: FieldRef<"Dump", "String">;
		readonly createdAt: FieldRef<"Dump", "DateTime">;
	}

	// Custom InputTypes
	/**
	 * Dump findUnique
	 */
	export type DumpFindUniqueArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Dump
		 */
		select?: DumpSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Dump
		 */
		omit?: DumpOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: DumpInclude<ExtArgs> | null;
		/**
		 * Filter, which Dump to fetch.
		 */
		where: DumpWhereUniqueInput;
	};

	/**
	 * Dump findUniqueOrThrow
	 */
	export type DumpFindUniqueOrThrowArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Dump
		 */
		select?: DumpSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Dump
		 */
		omit?: DumpOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: DumpInclude<ExtArgs> | null;
		/**
		 * Filter, which Dump to fetch.
		 */
		where: DumpWhereUniqueInput;
	};

	/**
	 * Dump findFirst
	 */
	export type DumpFindFirstArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Dump
		 */
		select?: DumpSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Dump
		 */
		omit?: DumpOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: DumpInclude<ExtArgs> | null;
		/**
		 * Filter, which Dump to fetch.
		 */
		where?: DumpWhereInput;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
		 *
		 * Determine the order of Dumps to fetch.
		 */
		orderBy?: DumpOrderByWithRelationInput | DumpOrderByWithRelationInput[];
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
		 *
		 * Sets the position for searching for Dumps.
		 */
		cursor?: DumpWhereUniqueInput;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
		 *
		 * Take `±n` Dumps from the position of the cursor.
		 */
		take?: number;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
		 *
		 * Skip the first `n` Dumps.
		 */
		skip?: number;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
		 *
		 * Filter by unique combinations of Dumps.
		 */
		distinct?: DumpScalarFieldEnum | DumpScalarFieldEnum[];
	};

	/**
	 * Dump findFirstOrThrow
	 */
	export type DumpFindFirstOrThrowArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Dump
		 */
		select?: DumpSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Dump
		 */
		omit?: DumpOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: DumpInclude<ExtArgs> | null;
		/**
		 * Filter, which Dump to fetch.
		 */
		where?: DumpWhereInput;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
		 *
		 * Determine the order of Dumps to fetch.
		 */
		orderBy?: DumpOrderByWithRelationInput | DumpOrderByWithRelationInput[];
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
		 *
		 * Sets the position for searching for Dumps.
		 */
		cursor?: DumpWhereUniqueInput;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
		 *
		 * Take `±n` Dumps from the position of the cursor.
		 */
		take?: number;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
		 *
		 * Skip the first `n` Dumps.
		 */
		skip?: number;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
		 *
		 * Filter by unique combinations of Dumps.
		 */
		distinct?: DumpScalarFieldEnum | DumpScalarFieldEnum[];
	};

	/**
	 * Dump findMany
	 */
	export type DumpFindManyArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Dump
		 */
		select?: DumpSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Dump
		 */
		omit?: DumpOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: DumpInclude<ExtArgs> | null;
		/**
		 * Filter, which Dumps to fetch.
		 */
		where?: DumpWhereInput;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
		 *
		 * Determine the order of Dumps to fetch.
		 */
		orderBy?: DumpOrderByWithRelationInput | DumpOrderByWithRelationInput[];
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
		 *
		 * Sets the position for listing Dumps.
		 */
		cursor?: DumpWhereUniqueInput;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
		 *
		 * Take `±n` Dumps from the position of the cursor.
		 */
		take?: number;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
		 *
		 * Skip the first `n` Dumps.
		 */
		skip?: number;
		distinct?: DumpScalarFieldEnum | DumpScalarFieldEnum[];
	};

	/**
	 * Dump create
	 */
	export type DumpCreateArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Dump
		 */
		select?: DumpSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Dump
		 */
		omit?: DumpOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: DumpInclude<ExtArgs> | null;
		/**
		 * The data needed to create a Dump.
		 */
		data: XOR<DumpCreateInput, DumpUncheckedCreateInput>;
	};

	/**
	 * Dump createMany
	 */
	export type DumpCreateManyArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * The data used to create many Dumps.
		 */
		data: DumpCreateManyInput | DumpCreateManyInput[];
		skipDuplicates?: boolean;
	};

	/**
	 * Dump createManyAndReturn
	 */
	export type DumpCreateManyAndReturnArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Dump
		 */
		select?: DumpSelectCreateManyAndReturn<ExtArgs> | null;
		/**
		 * Omit specific fields from the Dump
		 */
		omit?: DumpOmit<ExtArgs> | null;
		/**
		 * The data used to create many Dumps.
		 */
		data: DumpCreateManyInput | DumpCreateManyInput[];
		skipDuplicates?: boolean;
	};

	/**
	 * Dump update
	 */
	export type DumpUpdateArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Dump
		 */
		select?: DumpSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Dump
		 */
		omit?: DumpOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: DumpInclude<ExtArgs> | null;
		/**
		 * The data needed to update a Dump.
		 */
		data: XOR<DumpUpdateInput, DumpUncheckedUpdateInput>;
		/**
		 * Choose, which Dump to update.
		 */
		where: DumpWhereUniqueInput;
	};

	/**
	 * Dump updateMany
	 */
	export type DumpUpdateManyArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * The data used to update Dumps.
		 */
		data: XOR<DumpUpdateManyMutationInput, DumpUncheckedUpdateManyInput>;
		/**
		 * Filter which Dumps to update
		 */
		where?: DumpWhereInput;
		/**
		 * Limit how many Dumps to update.
		 */
		limit?: number;
	};

	/**
	 * Dump updateManyAndReturn
	 */
	export type DumpUpdateManyAndReturnArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Dump
		 */
		select?: DumpSelectUpdateManyAndReturn<ExtArgs> | null;
		/**
		 * Omit specific fields from the Dump
		 */
		omit?: DumpOmit<ExtArgs> | null;
		/**
		 * The data used to update Dumps.
		 */
		data: XOR<DumpUpdateManyMutationInput, DumpUncheckedUpdateManyInput>;
		/**
		 * Filter which Dumps to update
		 */
		where?: DumpWhereInput;
		/**
		 * Limit how many Dumps to update.
		 */
		limit?: number;
	};

	/**
	 * Dump upsert
	 */
	export type DumpUpsertArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Dump
		 */
		select?: DumpSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Dump
		 */
		omit?: DumpOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: DumpInclude<ExtArgs> | null;
		/**
		 * The filter to search for the Dump to update in case it exists.
		 */
		where: DumpWhereUniqueInput;
		/**
		 * In case the Dump found by the `where` argument doesn't exist, create a new Dump with this data.
		 */
		create: XOR<DumpCreateInput, DumpUncheckedCreateInput>;
		/**
		 * In case the Dump was found with the provided `where` argument, update it with this data.
		 */
		update: XOR<DumpUpdateInput, DumpUncheckedUpdateInput>;
	};

	/**
	 * Dump delete
	 */
	export type DumpDeleteArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Dump
		 */
		select?: DumpSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Dump
		 */
		omit?: DumpOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: DumpInclude<ExtArgs> | null;
		/**
		 * Filter which Dump to delete.
		 */
		where: DumpWhereUniqueInput;
	};

	/**
	 * Dump deleteMany
	 */
	export type DumpDeleteManyArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Filter which Dumps to delete
		 */
		where?: DumpWhereInput;
		/**
		 * Limit how many Dumps to delete.
		 */
		limit?: number;
	};

	/**
	 * Dump.chunks
	 */
	export type Dump$chunksArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Chunk
		 */
		select?: ChunkSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Chunk
		 */
		omit?: ChunkOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: ChunkInclude<ExtArgs> | null;
		where?: ChunkWhereInput;
		orderBy?: ChunkOrderByWithRelationInput | ChunkOrderByWithRelationInput[];
		cursor?: ChunkWhereUniqueInput;
		take?: number;
		skip?: number;
		distinct?: ChunkScalarFieldEnum | ChunkScalarFieldEnum[];
	};

	/**
	 * Dump without action
	 */
	export type DumpDefaultArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Dump
		 */
		select?: DumpSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Dump
		 */
		omit?: DumpOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: DumpInclude<ExtArgs> | null;
	};

	/**
	 * Model Chunk
	 */

	export type AggregateChunk = {
		_count: ChunkCountAggregateOutputType | null;
		_avg: ChunkAvgAggregateOutputType | null;
		_sum: ChunkSumAggregateOutputType | null;
		_min: ChunkMinAggregateOutputType | null;
		_max: ChunkMaxAggregateOutputType | null;
	};

	export type ChunkAvgAggregateOutputType = {
		order: number | null;
	};

	export type ChunkSumAggregateOutputType = {
		order: number | null;
	};

	export type ChunkMinAggregateOutputType = {
		id: string | null;
		dumpId: string | null;
		content: string | null;
		order: number | null;
		createdAt: Date | null;
	};

	export type ChunkMaxAggregateOutputType = {
		id: string | null;
		dumpId: string | null;
		content: string | null;
		order: number | null;
		createdAt: Date | null;
	};

	export type ChunkCountAggregateOutputType = {
		id: number;
		dumpId: number;
		content: number;
		order: number;
		createdAt: number;
		_all: number;
	};

	export type ChunkAvgAggregateInputType = {
		order?: true;
	};

	export type ChunkSumAggregateInputType = {
		order?: true;
	};

	export type ChunkMinAggregateInputType = {
		id?: true;
		dumpId?: true;
		content?: true;
		order?: true;
		createdAt?: true;
	};

	export type ChunkMaxAggregateInputType = {
		id?: true;
		dumpId?: true;
		content?: true;
		order?: true;
		createdAt?: true;
	};

	export type ChunkCountAggregateInputType = {
		id?: true;
		dumpId?: true;
		content?: true;
		order?: true;
		createdAt?: true;
		_all?: true;
	};

	export type ChunkAggregateArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Filter which Chunk to aggregate.
		 */
		where?: ChunkWhereInput;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
		 *
		 * Determine the order of Chunks to fetch.
		 */
		orderBy?: ChunkOrderByWithRelationInput | ChunkOrderByWithRelationInput[];
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
		 *
		 * Sets the start position
		 */
		cursor?: ChunkWhereUniqueInput;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
		 *
		 * Take `±n` Chunks from the position of the cursor.
		 */
		take?: number;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
		 *
		 * Skip the first `n` Chunks.
		 */
		skip?: number;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
		 *
		 * Count returned Chunks
		 **/
		_count?: true | ChunkCountAggregateInputType;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
		 *
		 * Select which fields to average
		 **/
		_avg?: ChunkAvgAggregateInputType;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
		 *
		 * Select which fields to sum
		 **/
		_sum?: ChunkSumAggregateInputType;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
		 *
		 * Select which fields to find the minimum value
		 **/
		_min?: ChunkMinAggregateInputType;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
		 *
		 * Select which fields to find the maximum value
		 **/
		_max?: ChunkMaxAggregateInputType;
	};

	export type GetChunkAggregateType<T extends ChunkAggregateArgs> = {
		[P in keyof T & keyof AggregateChunk]: P extends "_count" | "count"
			? T[P] extends true
				? number
				: GetScalarType<T[P], AggregateChunk[P]>
			: GetScalarType<T[P], AggregateChunk[P]>;
	};

	export type ChunkGroupByArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		where?: ChunkWhereInput;
		orderBy?:
			| ChunkOrderByWithAggregationInput
			| ChunkOrderByWithAggregationInput[];
		by: ChunkScalarFieldEnum[] | ChunkScalarFieldEnum;
		having?: ChunkScalarWhereWithAggregatesInput;
		take?: number;
		skip?: number;
		_count?: ChunkCountAggregateInputType | true;
		_avg?: ChunkAvgAggregateInputType;
		_sum?: ChunkSumAggregateInputType;
		_min?: ChunkMinAggregateInputType;
		_max?: ChunkMaxAggregateInputType;
	};

	export type ChunkGroupByOutputType = {
		id: string;
		dumpId: string;
		content: string;
		order: number;
		createdAt: Date;
		_count: ChunkCountAggregateOutputType | null;
		_avg: ChunkAvgAggregateOutputType | null;
		_sum: ChunkSumAggregateOutputType | null;
		_min: ChunkMinAggregateOutputType | null;
		_max: ChunkMaxAggregateOutputType | null;
	};

	type GetChunkGroupByPayload<T extends ChunkGroupByArgs> =
		Prisma.PrismaPromise<
			Array<
				PickEnumerable<ChunkGroupByOutputType, T["by"]> & {
					[P in keyof T & keyof ChunkGroupByOutputType]: P extends "_count"
						? T[P] extends boolean
							? number
							: GetScalarType<T[P], ChunkGroupByOutputType[P]>
						: GetScalarType<T[P], ChunkGroupByOutputType[P]>;
				}
			>
		>;

	export type ChunkSelect<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = $Extensions.GetSelect<
		{
			id?: boolean;
			dumpId?: boolean;
			content?: boolean;
			order?: boolean;
			createdAt?: boolean;
			dump?: boolean | DumpDefaultArgs<ExtArgs>;
			embedding?: boolean | Chunk$embeddingArgs<ExtArgs>;
		},
		ExtArgs["result"]["chunk"]
	>;

	export type ChunkSelectCreateManyAndReturn<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = $Extensions.GetSelect<
		{
			id?: boolean;
			dumpId?: boolean;
			content?: boolean;
			order?: boolean;
			createdAt?: boolean;
			dump?: boolean | DumpDefaultArgs<ExtArgs>;
		},
		ExtArgs["result"]["chunk"]
	>;

	export type ChunkSelectUpdateManyAndReturn<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = $Extensions.GetSelect<
		{
			id?: boolean;
			dumpId?: boolean;
			content?: boolean;
			order?: boolean;
			createdAt?: boolean;
			dump?: boolean | DumpDefaultArgs<ExtArgs>;
		},
		ExtArgs["result"]["chunk"]
	>;

	export type ChunkSelectScalar = {
		id?: boolean;
		dumpId?: boolean;
		content?: boolean;
		order?: boolean;
		createdAt?: boolean;
	};

	export type ChunkOmit<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = $Extensions.GetOmit<
		"id" | "dumpId" | "content" | "order" | "createdAt",
		ExtArgs["result"]["chunk"]
	>;
	export type ChunkInclude<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		dump?: boolean | DumpDefaultArgs<ExtArgs>;
		embedding?: boolean | Chunk$embeddingArgs<ExtArgs>;
	};
	export type ChunkIncludeCreateManyAndReturn<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		dump?: boolean | DumpDefaultArgs<ExtArgs>;
	};
	export type ChunkIncludeUpdateManyAndReturn<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		dump?: boolean | DumpDefaultArgs<ExtArgs>;
	};

	export type $ChunkPayload<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		name: "Chunk";
		objects: {
			dump: Prisma.$DumpPayload<ExtArgs>;
			embedding: Prisma.$EmbeddingPayload<ExtArgs> | null;
		};
		scalars: $Extensions.GetPayloadResult<
			{
				id: string;
				dumpId: string;
				content: string;
				order: number;
				createdAt: Date;
			},
			ExtArgs["result"]["chunk"]
		>;
		composites: {};
	};

	type ChunkGetPayload<
		S extends boolean | null | undefined | ChunkDefaultArgs,
	> = $Result.GetResult<Prisma.$ChunkPayload, S>;

	type ChunkCountArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = Omit<ChunkFindManyArgs, "select" | "include" | "distinct" | "omit"> & {
		select?: ChunkCountAggregateInputType | true;
	};

	export interface ChunkDelegate<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
		GlobalOmitOptions = {},
	> {
		[K: symbol]: {
			types: Prisma.TypeMap<ExtArgs>["model"]["Chunk"];
			meta: { name: "Chunk" };
		};
		/**
		 * Find zero or one Chunk that matches the filter.
		 * @param {ChunkFindUniqueArgs} args - Arguments to find a Chunk
		 * @example
		 * // Get one Chunk
		 * const chunk = await prisma.chunk.findUnique({
		 *   where: {
		 *     // ... provide filter here
		 *   }
		 * })
		 */
		findUnique<T extends ChunkFindUniqueArgs>(
			args: SelectSubset<T, ChunkFindUniqueArgs<ExtArgs>>,
		): Prisma__ChunkClient<
			$Result.GetResult<
				Prisma.$ChunkPayload<ExtArgs>,
				T,
				"findUnique",
				GlobalOmitOptions
			> | null,
			null,
			ExtArgs,
			GlobalOmitOptions
		>;

		/**
		 * Find one Chunk that matches the filter or throw an error with `error.code='P2025'`
		 * if no matches were found.
		 * @param {ChunkFindUniqueOrThrowArgs} args - Arguments to find a Chunk
		 * @example
		 * // Get one Chunk
		 * const chunk = await prisma.chunk.findUniqueOrThrow({
		 *   where: {
		 *     // ... provide filter here
		 *   }
		 * })
		 */
		findUniqueOrThrow<T extends ChunkFindUniqueOrThrowArgs>(
			args: SelectSubset<T, ChunkFindUniqueOrThrowArgs<ExtArgs>>,
		): Prisma__ChunkClient<
			$Result.GetResult<
				Prisma.$ChunkPayload<ExtArgs>,
				T,
				"findUniqueOrThrow",
				GlobalOmitOptions
			>,
			never,
			ExtArgs,
			GlobalOmitOptions
		>;

		/**
		 * Find the first Chunk that matches the filter.
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 * @param {ChunkFindFirstArgs} args - Arguments to find a Chunk
		 * @example
		 * // Get one Chunk
		 * const chunk = await prisma.chunk.findFirst({
		 *   where: {
		 *     // ... provide filter here
		 *   }
		 * })
		 */
		findFirst<T extends ChunkFindFirstArgs>(
			args?: SelectSubset<T, ChunkFindFirstArgs<ExtArgs>>,
		): Prisma__ChunkClient<
			$Result.GetResult<
				Prisma.$ChunkPayload<ExtArgs>,
				T,
				"findFirst",
				GlobalOmitOptions
			> | null,
			null,
			ExtArgs,
			GlobalOmitOptions
		>;

		/**
		 * Find the first Chunk that matches the filter or
		 * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 * @param {ChunkFindFirstOrThrowArgs} args - Arguments to find a Chunk
		 * @example
		 * // Get one Chunk
		 * const chunk = await prisma.chunk.findFirstOrThrow({
		 *   where: {
		 *     // ... provide filter here
		 *   }
		 * })
		 */
		findFirstOrThrow<T extends ChunkFindFirstOrThrowArgs>(
			args?: SelectSubset<T, ChunkFindFirstOrThrowArgs<ExtArgs>>,
		): Prisma__ChunkClient<
			$Result.GetResult<
				Prisma.$ChunkPayload<ExtArgs>,
				T,
				"findFirstOrThrow",
				GlobalOmitOptions
			>,
			never,
			ExtArgs,
			GlobalOmitOptions
		>;

		/**
		 * Find zero or more Chunks that matches the filter.
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 * @param {ChunkFindManyArgs} args - Arguments to filter and select certain fields only.
		 * @example
		 * // Get all Chunks
		 * const chunks = await prisma.chunk.findMany()
		 *
		 * // Get first 10 Chunks
		 * const chunks = await prisma.chunk.findMany({ take: 10 })
		 *
		 * // Only select the `id`
		 * const chunkWithIdOnly = await prisma.chunk.findMany({ select: { id: true } })
		 *
		 */
		findMany<T extends ChunkFindManyArgs>(
			args?: SelectSubset<T, ChunkFindManyArgs<ExtArgs>>,
		): Prisma.PrismaPromise<
			$Result.GetResult<
				Prisma.$ChunkPayload<ExtArgs>,
				T,
				"findMany",
				GlobalOmitOptions
			>
		>;

		/**
		 * Create a Chunk.
		 * @param {ChunkCreateArgs} args - Arguments to create a Chunk.
		 * @example
		 * // Create one Chunk
		 * const Chunk = await prisma.chunk.create({
		 *   data: {
		 *     // ... data to create a Chunk
		 *   }
		 * })
		 *
		 */
		create<T extends ChunkCreateArgs>(
			args: SelectSubset<T, ChunkCreateArgs<ExtArgs>>,
		): Prisma__ChunkClient<
			$Result.GetResult<
				Prisma.$ChunkPayload<ExtArgs>,
				T,
				"create",
				GlobalOmitOptions
			>,
			never,
			ExtArgs,
			GlobalOmitOptions
		>;

		/**
		 * Create many Chunks.
		 * @param {ChunkCreateManyArgs} args - Arguments to create many Chunks.
		 * @example
		 * // Create many Chunks
		 * const chunk = await prisma.chunk.createMany({
		 *   data: [
		 *     // ... provide data here
		 *   ]
		 * })
		 *
		 */
		createMany<T extends ChunkCreateManyArgs>(
			args?: SelectSubset<T, ChunkCreateManyArgs<ExtArgs>>,
		): Prisma.PrismaPromise<BatchPayload>;

		/**
		 * Create many Chunks and returns the data saved in the database.
		 * @param {ChunkCreateManyAndReturnArgs} args - Arguments to create many Chunks.
		 * @example
		 * // Create many Chunks
		 * const chunk = await prisma.chunk.createManyAndReturn({
		 *   data: [
		 *     // ... provide data here
		 *   ]
		 * })
		 *
		 * // Create many Chunks and only return the `id`
		 * const chunkWithIdOnly = await prisma.chunk.createManyAndReturn({
		 *   select: { id: true },
		 *   data: [
		 *     // ... provide data here
		 *   ]
		 * })
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 *
		 */
		createManyAndReturn<T extends ChunkCreateManyAndReturnArgs>(
			args?: SelectSubset<T, ChunkCreateManyAndReturnArgs<ExtArgs>>,
		): Prisma.PrismaPromise<
			$Result.GetResult<
				Prisma.$ChunkPayload<ExtArgs>,
				T,
				"createManyAndReturn",
				GlobalOmitOptions
			>
		>;

		/**
		 * Delete a Chunk.
		 * @param {ChunkDeleteArgs} args - Arguments to delete one Chunk.
		 * @example
		 * // Delete one Chunk
		 * const Chunk = await prisma.chunk.delete({
		 *   where: {
		 *     // ... filter to delete one Chunk
		 *   }
		 * })
		 *
		 */
		delete<T extends ChunkDeleteArgs>(
			args: SelectSubset<T, ChunkDeleteArgs<ExtArgs>>,
		): Prisma__ChunkClient<
			$Result.GetResult<
				Prisma.$ChunkPayload<ExtArgs>,
				T,
				"delete",
				GlobalOmitOptions
			>,
			never,
			ExtArgs,
			GlobalOmitOptions
		>;

		/**
		 * Update one Chunk.
		 * @param {ChunkUpdateArgs} args - Arguments to update one Chunk.
		 * @example
		 * // Update one Chunk
		 * const chunk = await prisma.chunk.update({
		 *   where: {
		 *     // ... provide filter here
		 *   },
		 *   data: {
		 *     // ... provide data here
		 *   }
		 * })
		 *
		 */
		update<T extends ChunkUpdateArgs>(
			args: SelectSubset<T, ChunkUpdateArgs<ExtArgs>>,
		): Prisma__ChunkClient<
			$Result.GetResult<
				Prisma.$ChunkPayload<ExtArgs>,
				T,
				"update",
				GlobalOmitOptions
			>,
			never,
			ExtArgs,
			GlobalOmitOptions
		>;

		/**
		 * Delete zero or more Chunks.
		 * @param {ChunkDeleteManyArgs} args - Arguments to filter Chunks to delete.
		 * @example
		 * // Delete a few Chunks
		 * const { count } = await prisma.chunk.deleteMany({
		 *   where: {
		 *     // ... provide filter here
		 *   }
		 * })
		 *
		 */
		deleteMany<T extends ChunkDeleteManyArgs>(
			args?: SelectSubset<T, ChunkDeleteManyArgs<ExtArgs>>,
		): Prisma.PrismaPromise<BatchPayload>;

		/**
		 * Update zero or more Chunks.
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 * @param {ChunkUpdateManyArgs} args - Arguments to update one or more rows.
		 * @example
		 * // Update many Chunks
		 * const chunk = await prisma.chunk.updateMany({
		 *   where: {
		 *     // ... provide filter here
		 *   },
		 *   data: {
		 *     // ... provide data here
		 *   }
		 * })
		 *
		 */
		updateMany<T extends ChunkUpdateManyArgs>(
			args: SelectSubset<T, ChunkUpdateManyArgs<ExtArgs>>,
		): Prisma.PrismaPromise<BatchPayload>;

		/**
		 * Update zero or more Chunks and returns the data updated in the database.
		 * @param {ChunkUpdateManyAndReturnArgs} args - Arguments to update many Chunks.
		 * @example
		 * // Update many Chunks
		 * const chunk = await prisma.chunk.updateManyAndReturn({
		 *   where: {
		 *     // ... provide filter here
		 *   },
		 *   data: [
		 *     // ... provide data here
		 *   ]
		 * })
		 *
		 * // Update zero or more Chunks and only return the `id`
		 * const chunkWithIdOnly = await prisma.chunk.updateManyAndReturn({
		 *   select: { id: true },
		 *   where: {
		 *     // ... provide filter here
		 *   },
		 *   data: [
		 *     // ... provide data here
		 *   ]
		 * })
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 *
		 */
		updateManyAndReturn<T extends ChunkUpdateManyAndReturnArgs>(
			args: SelectSubset<T, ChunkUpdateManyAndReturnArgs<ExtArgs>>,
		): Prisma.PrismaPromise<
			$Result.GetResult<
				Prisma.$ChunkPayload<ExtArgs>,
				T,
				"updateManyAndReturn",
				GlobalOmitOptions
			>
		>;

		/**
		 * Create or update one Chunk.
		 * @param {ChunkUpsertArgs} args - Arguments to update or create a Chunk.
		 * @example
		 * // Update or create a Chunk
		 * const chunk = await prisma.chunk.upsert({
		 *   create: {
		 *     // ... data to create a Chunk
		 *   },
		 *   update: {
		 *     // ... in case it already exists, update
		 *   },
		 *   where: {
		 *     // ... the filter for the Chunk we want to update
		 *   }
		 * })
		 */
		upsert<T extends ChunkUpsertArgs>(
			args: SelectSubset<T, ChunkUpsertArgs<ExtArgs>>,
		): Prisma__ChunkClient<
			$Result.GetResult<
				Prisma.$ChunkPayload<ExtArgs>,
				T,
				"upsert",
				GlobalOmitOptions
			>,
			never,
			ExtArgs,
			GlobalOmitOptions
		>;

		/**
		 * Count the number of Chunks.
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 * @param {ChunkCountArgs} args - Arguments to filter Chunks to count.
		 * @example
		 * // Count the number of Chunks
		 * const count = await prisma.chunk.count({
		 *   where: {
		 *     // ... the filter for the Chunks we want to count
		 *   }
		 * })
		 **/
		count<T extends ChunkCountArgs>(
			args?: Subset<T, ChunkCountArgs>,
		): Prisma.PrismaPromise<
			T extends $Utils.Record<"select", any>
				? T["select"] extends true
					? number
					: GetScalarType<T["select"], ChunkCountAggregateOutputType>
				: number
		>;

		/**
		 * Allows you to perform aggregations operations on a Chunk.
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 * @param {ChunkAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
		 * @example
		 * // Ordered by age ascending
		 * // Where email contains prisma.io
		 * // Limited to the 10 users
		 * const aggregations = await prisma.user.aggregate({
		 *   _avg: {
		 *     age: true,
		 *   },
		 *   where: {
		 *     email: {
		 *       contains: "prisma.io",
		 *     },
		 *   },
		 *   orderBy: {
		 *     age: "asc",
		 *   },
		 *   take: 10,
		 * })
		 **/
		aggregate<T extends ChunkAggregateArgs>(
			args: Subset<T, ChunkAggregateArgs>,
		): Prisma.PrismaPromise<GetChunkAggregateType<T>>;

		/**
		 * Group by Chunk.
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 * @param {ChunkGroupByArgs} args - Group by arguments.
		 * @example
		 * // Group by city, order by createdAt, get count
		 * const result = await prisma.user.groupBy({
		 *   by: ['city', 'createdAt'],
		 *   orderBy: {
		 *     createdAt: true
		 *   },
		 *   _count: {
		 *     _all: true
		 *   },
		 * })
		 *
		 **/
		groupBy<
			T extends ChunkGroupByArgs,
			HasSelectOrTake extends Or<
				Extends<"skip", Keys<T>>,
				Extends<"take", Keys<T>>
			>,
			OrderByArg extends True extends HasSelectOrTake
				? { orderBy: ChunkGroupByArgs["orderBy"] }
				: { orderBy?: ChunkGroupByArgs["orderBy"] },
			OrderFields extends ExcludeUnderscoreKeys<
				Keys<MaybeTupleToUnion<T["orderBy"]>>
			>,
			ByFields extends MaybeTupleToUnion<T["by"]>,
			ByValid extends Has<ByFields, OrderFields>,
			HavingFields extends GetHavingFields<T["having"]>,
			HavingValid extends Has<ByFields, HavingFields>,
			ByEmpty extends T["by"] extends never[] ? True : False,
			InputErrors extends ByEmpty extends True
				? `Error: "by" must not be empty.`
				: HavingValid extends False
					? {
							[P in HavingFields]: P extends ByFields
								? never
								: P extends string
									? `Error: Field "${P}" used in "having" needs to be provided in "by".`
									: [
											Error,
											"Field ",
											P,
											` in "having" needs to be provided in "by"`,
										];
						}[HavingFields]
					: "take" extends Keys<T>
						? "orderBy" extends Keys<T>
							? ByValid extends True
								? {}
								: {
										[P in OrderFields]: P extends ByFields
											? never
											: `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
									}[OrderFields]
							: 'Error: If you provide "take", you also need to provide "orderBy"'
						: "skip" extends Keys<T>
							? "orderBy" extends Keys<T>
								? ByValid extends True
									? {}
									: {
											[P in OrderFields]: P extends ByFields
												? never
												: `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
										}[OrderFields]
								: 'Error: If you provide "skip", you also need to provide "orderBy"'
							: ByValid extends True
								? {}
								: {
										[P in OrderFields]: P extends ByFields
											? never
											: `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
									}[OrderFields],
		>(
			args: SubsetIntersection<T, ChunkGroupByArgs, OrderByArg> & InputErrors,
		): {} extends InputErrors
			? GetChunkGroupByPayload<T>
			: Prisma.PrismaPromise<InputErrors>;
		/**
		 * Fields of the Chunk model
		 */
		readonly fields: ChunkFieldRefs;
	}

	/**
	 * The delegate class that acts as a "Promise-like" for Chunk.
	 * Why is this prefixed with `Prisma__`?
	 * Because we want to prevent naming conflicts as mentioned in
	 * https://github.com/prisma/prisma-client-js/issues/707
	 */
	export interface Prisma__ChunkClient<
		T,
		Null = never,
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
		GlobalOmitOptions = {},
	> extends Prisma.PrismaPromise<T> {
		readonly [Symbol.toStringTag]: "PrismaPromise";
		dump<T extends DumpDefaultArgs<ExtArgs> = {}>(
			args?: Subset<T, DumpDefaultArgs<ExtArgs>>,
		): Prisma__DumpClient<
			| $Result.GetResult<
					Prisma.$DumpPayload<ExtArgs>,
					T,
					"findUniqueOrThrow",
					GlobalOmitOptions
			  >
			| Null,
			Null,
			ExtArgs,
			GlobalOmitOptions
		>;
		embedding<T extends Chunk$embeddingArgs<ExtArgs> = {}>(
			args?: Subset<T, Chunk$embeddingArgs<ExtArgs>>,
		): Prisma__EmbeddingClient<
			$Result.GetResult<
				Prisma.$EmbeddingPayload<ExtArgs>,
				T,
				"findUniqueOrThrow",
				GlobalOmitOptions
			> | null,
			null,
			ExtArgs,
			GlobalOmitOptions
		>;
		/**
		 * Attaches callbacks for the resolution and/or rejection of the Promise.
		 * @param onfulfilled The callback to execute when the Promise is resolved.
		 * @param onrejected The callback to execute when the Promise is rejected.
		 * @returns A Promise for the completion of which ever callback is executed.
		 */
		then<TResult1 = T, TResult2 = never>(
			onfulfilled?:
				| ((value: T) => TResult1 | PromiseLike<TResult1>)
				| undefined
				| null,
			onrejected?:
				| ((reason: any) => TResult2 | PromiseLike<TResult2>)
				| undefined
				| null,
		): $Utils.JsPromise<TResult1 | TResult2>;
		/**
		 * Attaches a callback for only the rejection of the Promise.
		 * @param onrejected The callback to execute when the Promise is rejected.
		 * @returns A Promise for the completion of the callback.
		 */
		catch<TResult = never>(
			onrejected?:
				| ((reason: any) => TResult | PromiseLike<TResult>)
				| undefined
				| null,
		): $Utils.JsPromise<T | TResult>;
		/**
		 * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
		 * resolved value cannot be modified from the callback.
		 * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
		 * @returns A Promise for the completion of the callback.
		 */
		finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
	}

	/**
	 * Fields of the Chunk model
	 */
	interface ChunkFieldRefs {
		readonly id: FieldRef<"Chunk", "String">;
		readonly dumpId: FieldRef<"Chunk", "String">;
		readonly content: FieldRef<"Chunk", "String">;
		readonly order: FieldRef<"Chunk", "Int">;
		readonly createdAt: FieldRef<"Chunk", "DateTime">;
	}

	// Custom InputTypes
	/**
	 * Chunk findUnique
	 */
	export type ChunkFindUniqueArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Chunk
		 */
		select?: ChunkSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Chunk
		 */
		omit?: ChunkOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: ChunkInclude<ExtArgs> | null;
		/**
		 * Filter, which Chunk to fetch.
		 */
		where: ChunkWhereUniqueInput;
	};

	/**
	 * Chunk findUniqueOrThrow
	 */
	export type ChunkFindUniqueOrThrowArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Chunk
		 */
		select?: ChunkSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Chunk
		 */
		omit?: ChunkOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: ChunkInclude<ExtArgs> | null;
		/**
		 * Filter, which Chunk to fetch.
		 */
		where: ChunkWhereUniqueInput;
	};

	/**
	 * Chunk findFirst
	 */
	export type ChunkFindFirstArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Chunk
		 */
		select?: ChunkSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Chunk
		 */
		omit?: ChunkOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: ChunkInclude<ExtArgs> | null;
		/**
		 * Filter, which Chunk to fetch.
		 */
		where?: ChunkWhereInput;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
		 *
		 * Determine the order of Chunks to fetch.
		 */
		orderBy?: ChunkOrderByWithRelationInput | ChunkOrderByWithRelationInput[];
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
		 *
		 * Sets the position for searching for Chunks.
		 */
		cursor?: ChunkWhereUniqueInput;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
		 *
		 * Take `±n` Chunks from the position of the cursor.
		 */
		take?: number;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
		 *
		 * Skip the first `n` Chunks.
		 */
		skip?: number;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
		 *
		 * Filter by unique combinations of Chunks.
		 */
		distinct?: ChunkScalarFieldEnum | ChunkScalarFieldEnum[];
	};

	/**
	 * Chunk findFirstOrThrow
	 */
	export type ChunkFindFirstOrThrowArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Chunk
		 */
		select?: ChunkSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Chunk
		 */
		omit?: ChunkOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: ChunkInclude<ExtArgs> | null;
		/**
		 * Filter, which Chunk to fetch.
		 */
		where?: ChunkWhereInput;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
		 *
		 * Determine the order of Chunks to fetch.
		 */
		orderBy?: ChunkOrderByWithRelationInput | ChunkOrderByWithRelationInput[];
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
		 *
		 * Sets the position for searching for Chunks.
		 */
		cursor?: ChunkWhereUniqueInput;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
		 *
		 * Take `±n` Chunks from the position of the cursor.
		 */
		take?: number;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
		 *
		 * Skip the first `n` Chunks.
		 */
		skip?: number;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
		 *
		 * Filter by unique combinations of Chunks.
		 */
		distinct?: ChunkScalarFieldEnum | ChunkScalarFieldEnum[];
	};

	/**
	 * Chunk findMany
	 */
	export type ChunkFindManyArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Chunk
		 */
		select?: ChunkSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Chunk
		 */
		omit?: ChunkOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: ChunkInclude<ExtArgs> | null;
		/**
		 * Filter, which Chunks to fetch.
		 */
		where?: ChunkWhereInput;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
		 *
		 * Determine the order of Chunks to fetch.
		 */
		orderBy?: ChunkOrderByWithRelationInput | ChunkOrderByWithRelationInput[];
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
		 *
		 * Sets the position for listing Chunks.
		 */
		cursor?: ChunkWhereUniqueInput;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
		 *
		 * Take `±n` Chunks from the position of the cursor.
		 */
		take?: number;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
		 *
		 * Skip the first `n` Chunks.
		 */
		skip?: number;
		distinct?: ChunkScalarFieldEnum | ChunkScalarFieldEnum[];
	};

	/**
	 * Chunk create
	 */
	export type ChunkCreateArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Chunk
		 */
		select?: ChunkSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Chunk
		 */
		omit?: ChunkOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: ChunkInclude<ExtArgs> | null;
		/**
		 * The data needed to create a Chunk.
		 */
		data: XOR<ChunkCreateInput, ChunkUncheckedCreateInput>;
	};

	/**
	 * Chunk createMany
	 */
	export type ChunkCreateManyArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * The data used to create many Chunks.
		 */
		data: ChunkCreateManyInput | ChunkCreateManyInput[];
		skipDuplicates?: boolean;
	};

	/**
	 * Chunk createManyAndReturn
	 */
	export type ChunkCreateManyAndReturnArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Chunk
		 */
		select?: ChunkSelectCreateManyAndReturn<ExtArgs> | null;
		/**
		 * Omit specific fields from the Chunk
		 */
		omit?: ChunkOmit<ExtArgs> | null;
		/**
		 * The data used to create many Chunks.
		 */
		data: ChunkCreateManyInput | ChunkCreateManyInput[];
		skipDuplicates?: boolean;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: ChunkIncludeCreateManyAndReturn<ExtArgs> | null;
	};

	/**
	 * Chunk update
	 */
	export type ChunkUpdateArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Chunk
		 */
		select?: ChunkSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Chunk
		 */
		omit?: ChunkOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: ChunkInclude<ExtArgs> | null;
		/**
		 * The data needed to update a Chunk.
		 */
		data: XOR<ChunkUpdateInput, ChunkUncheckedUpdateInput>;
		/**
		 * Choose, which Chunk to update.
		 */
		where: ChunkWhereUniqueInput;
	};

	/**
	 * Chunk updateMany
	 */
	export type ChunkUpdateManyArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * The data used to update Chunks.
		 */
		data: XOR<ChunkUpdateManyMutationInput, ChunkUncheckedUpdateManyInput>;
		/**
		 * Filter which Chunks to update
		 */
		where?: ChunkWhereInput;
		/**
		 * Limit how many Chunks to update.
		 */
		limit?: number;
	};

	/**
	 * Chunk updateManyAndReturn
	 */
	export type ChunkUpdateManyAndReturnArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Chunk
		 */
		select?: ChunkSelectUpdateManyAndReturn<ExtArgs> | null;
		/**
		 * Omit specific fields from the Chunk
		 */
		omit?: ChunkOmit<ExtArgs> | null;
		/**
		 * The data used to update Chunks.
		 */
		data: XOR<ChunkUpdateManyMutationInput, ChunkUncheckedUpdateManyInput>;
		/**
		 * Filter which Chunks to update
		 */
		where?: ChunkWhereInput;
		/**
		 * Limit how many Chunks to update.
		 */
		limit?: number;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: ChunkIncludeUpdateManyAndReturn<ExtArgs> | null;
	};

	/**
	 * Chunk upsert
	 */
	export type ChunkUpsertArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Chunk
		 */
		select?: ChunkSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Chunk
		 */
		omit?: ChunkOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: ChunkInclude<ExtArgs> | null;
		/**
		 * The filter to search for the Chunk to update in case it exists.
		 */
		where: ChunkWhereUniqueInput;
		/**
		 * In case the Chunk found by the `where` argument doesn't exist, create a new Chunk with this data.
		 */
		create: XOR<ChunkCreateInput, ChunkUncheckedCreateInput>;
		/**
		 * In case the Chunk was found with the provided `where` argument, update it with this data.
		 */
		update: XOR<ChunkUpdateInput, ChunkUncheckedUpdateInput>;
	};

	/**
	 * Chunk delete
	 */
	export type ChunkDeleteArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Chunk
		 */
		select?: ChunkSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Chunk
		 */
		omit?: ChunkOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: ChunkInclude<ExtArgs> | null;
		/**
		 * Filter which Chunk to delete.
		 */
		where: ChunkWhereUniqueInput;
	};

	/**
	 * Chunk deleteMany
	 */
	export type ChunkDeleteManyArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Filter which Chunks to delete
		 */
		where?: ChunkWhereInput;
		/**
		 * Limit how many Chunks to delete.
		 */
		limit?: number;
	};

	/**
	 * Chunk.embedding
	 */
	export type Chunk$embeddingArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Embedding
		 */
		select?: EmbeddingSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Embedding
		 */
		omit?: EmbeddingOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: EmbeddingInclude<ExtArgs> | null;
		where?: EmbeddingWhereInput;
	};

	/**
	 * Chunk without action
	 */
	export type ChunkDefaultArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Chunk
		 */
		select?: ChunkSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Chunk
		 */
		omit?: ChunkOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: ChunkInclude<ExtArgs> | null;
	};

	/**
	 * Model Embedding
	 */

	export type AggregateEmbedding = {
		_count: EmbeddingCountAggregateOutputType | null;
		_min: EmbeddingMinAggregateOutputType | null;
		_max: EmbeddingMaxAggregateOutputType | null;
	};

	export type EmbeddingMinAggregateOutputType = {
		id: string | null;
		chunkId: string | null;
		createdAt: Date | null;
	};

	export type EmbeddingMaxAggregateOutputType = {
		id: string | null;
		chunkId: string | null;
		createdAt: Date | null;
	};

	export type EmbeddingCountAggregateOutputType = {
		id: number;
		chunkId: number;
		createdAt: number;
		_all: number;
	};

	export type EmbeddingMinAggregateInputType = {
		id?: true;
		chunkId?: true;
		createdAt?: true;
	};

	export type EmbeddingMaxAggregateInputType = {
		id?: true;
		chunkId?: true;
		createdAt?: true;
	};

	export type EmbeddingCountAggregateInputType = {
		id?: true;
		chunkId?: true;
		createdAt?: true;
		_all?: true;
	};

	export type EmbeddingAggregateArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Filter which Embedding to aggregate.
		 */
		where?: EmbeddingWhereInput;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
		 *
		 * Determine the order of Embeddings to fetch.
		 */
		orderBy?:
			| EmbeddingOrderByWithRelationInput
			| EmbeddingOrderByWithRelationInput[];
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
		 *
		 * Sets the start position
		 */
		cursor?: EmbeddingWhereUniqueInput;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
		 *
		 * Take `±n` Embeddings from the position of the cursor.
		 */
		take?: number;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
		 *
		 * Skip the first `n` Embeddings.
		 */
		skip?: number;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
		 *
		 * Count returned Embeddings
		 **/
		_count?: true | EmbeddingCountAggregateInputType;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
		 *
		 * Select which fields to find the minimum value
		 **/
		_min?: EmbeddingMinAggregateInputType;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
		 *
		 * Select which fields to find the maximum value
		 **/
		_max?: EmbeddingMaxAggregateInputType;
	};

	export type GetEmbeddingAggregateType<T extends EmbeddingAggregateArgs> = {
		[P in keyof T & keyof AggregateEmbedding]: P extends "_count" | "count"
			? T[P] extends true
				? number
				: GetScalarType<T[P], AggregateEmbedding[P]>
			: GetScalarType<T[P], AggregateEmbedding[P]>;
	};

	export type EmbeddingGroupByArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		where?: EmbeddingWhereInput;
		orderBy?:
			| EmbeddingOrderByWithAggregationInput
			| EmbeddingOrderByWithAggregationInput[];
		by: EmbeddingScalarFieldEnum[] | EmbeddingScalarFieldEnum;
		having?: EmbeddingScalarWhereWithAggregatesInput;
		take?: number;
		skip?: number;
		_count?: EmbeddingCountAggregateInputType | true;
		_min?: EmbeddingMinAggregateInputType;
		_max?: EmbeddingMaxAggregateInputType;
	};

	export type EmbeddingGroupByOutputType = {
		id: string;
		chunkId: string;
		createdAt: Date;
		_count: EmbeddingCountAggregateOutputType | null;
		_min: EmbeddingMinAggregateOutputType | null;
		_max: EmbeddingMaxAggregateOutputType | null;
	};

	type GetEmbeddingGroupByPayload<T extends EmbeddingGroupByArgs> =
		Prisma.PrismaPromise<
			Array<
				PickEnumerable<EmbeddingGroupByOutputType, T["by"]> & {
					[P in keyof T & keyof EmbeddingGroupByOutputType]: P extends "_count"
						? T[P] extends boolean
							? number
							: GetScalarType<T[P], EmbeddingGroupByOutputType[P]>
						: GetScalarType<T[P], EmbeddingGroupByOutputType[P]>;
				}
			>
		>;

	export type EmbeddingSelect<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = $Extensions.GetSelect<
		{
			id?: boolean;
			chunkId?: boolean;
			createdAt?: boolean;
			chunk?: boolean | ChunkDefaultArgs<ExtArgs>;
		},
		ExtArgs["result"]["embedding"]
	>;

	export type EmbeddingSelectUpdateManyAndReturn<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = $Extensions.GetSelect<
		{
			id?: boolean;
			chunkId?: boolean;
			createdAt?: boolean;
			chunk?: boolean | ChunkDefaultArgs<ExtArgs>;
		},
		ExtArgs["result"]["embedding"]
	>;

	export type EmbeddingSelectScalar = {
		id?: boolean;
		chunkId?: boolean;
		createdAt?: boolean;
	};

	export type EmbeddingOmit<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = $Extensions.GetOmit<
		"id" | "chunkId" | "createdAt",
		ExtArgs["result"]["embedding"]
	>;
	export type EmbeddingInclude<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		chunk?: boolean | ChunkDefaultArgs<ExtArgs>;
	};
	export type EmbeddingIncludeUpdateManyAndReturn<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		chunk?: boolean | ChunkDefaultArgs<ExtArgs>;
	};

	export type $EmbeddingPayload<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		name: "Embedding";
		objects: {
			chunk: Prisma.$ChunkPayload<ExtArgs>;
		};
		scalars: $Extensions.GetPayloadResult<
			{
				id: string;
				chunkId: string;
				createdAt: Date;
			},
			ExtArgs["result"]["embedding"]
		>;
		composites: {};
	};

	type EmbeddingGetPayload<
		S extends boolean | null | undefined | EmbeddingDefaultArgs,
	> = $Result.GetResult<Prisma.$EmbeddingPayload, S>;

	type EmbeddingCountArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = Omit<
		EmbeddingFindManyArgs,
		"select" | "include" | "distinct" | "omit"
	> & {
		select?: EmbeddingCountAggregateInputType | true;
	};

	export interface EmbeddingDelegate<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
		GlobalOmitOptions = {},
	> {
		[K: symbol]: {
			types: Prisma.TypeMap<ExtArgs>["model"]["Embedding"];
			meta: { name: "Embedding" };
		};
		/**
		 * Find zero or one Embedding that matches the filter.
		 * @param {EmbeddingFindUniqueArgs} args - Arguments to find a Embedding
		 * @example
		 * // Get one Embedding
		 * const embedding = await prisma.embedding.findUnique({
		 *   where: {
		 *     // ... provide filter here
		 *   }
		 * })
		 */
		findUnique<T extends EmbeddingFindUniqueArgs>(
			args: SelectSubset<T, EmbeddingFindUniqueArgs<ExtArgs>>,
		): Prisma__EmbeddingClient<
			$Result.GetResult<
				Prisma.$EmbeddingPayload<ExtArgs>,
				T,
				"findUnique",
				GlobalOmitOptions
			> | null,
			null,
			ExtArgs,
			GlobalOmitOptions
		>;

		/**
		 * Find one Embedding that matches the filter or throw an error with `error.code='P2025'`
		 * if no matches were found.
		 * @param {EmbeddingFindUniqueOrThrowArgs} args - Arguments to find a Embedding
		 * @example
		 * // Get one Embedding
		 * const embedding = await prisma.embedding.findUniqueOrThrow({
		 *   where: {
		 *     // ... provide filter here
		 *   }
		 * })
		 */
		findUniqueOrThrow<T extends EmbeddingFindUniqueOrThrowArgs>(
			args: SelectSubset<T, EmbeddingFindUniqueOrThrowArgs<ExtArgs>>,
		): Prisma__EmbeddingClient<
			$Result.GetResult<
				Prisma.$EmbeddingPayload<ExtArgs>,
				T,
				"findUniqueOrThrow",
				GlobalOmitOptions
			>,
			never,
			ExtArgs,
			GlobalOmitOptions
		>;

		/**
		 * Find the first Embedding that matches the filter.
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 * @param {EmbeddingFindFirstArgs} args - Arguments to find a Embedding
		 * @example
		 * // Get one Embedding
		 * const embedding = await prisma.embedding.findFirst({
		 *   where: {
		 *     // ... provide filter here
		 *   }
		 * })
		 */
		findFirst<T extends EmbeddingFindFirstArgs>(
			args?: SelectSubset<T, EmbeddingFindFirstArgs<ExtArgs>>,
		): Prisma__EmbeddingClient<
			$Result.GetResult<
				Prisma.$EmbeddingPayload<ExtArgs>,
				T,
				"findFirst",
				GlobalOmitOptions
			> | null,
			null,
			ExtArgs,
			GlobalOmitOptions
		>;

		/**
		 * Find the first Embedding that matches the filter or
		 * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 * @param {EmbeddingFindFirstOrThrowArgs} args - Arguments to find a Embedding
		 * @example
		 * // Get one Embedding
		 * const embedding = await prisma.embedding.findFirstOrThrow({
		 *   where: {
		 *     // ... provide filter here
		 *   }
		 * })
		 */
		findFirstOrThrow<T extends EmbeddingFindFirstOrThrowArgs>(
			args?: SelectSubset<T, EmbeddingFindFirstOrThrowArgs<ExtArgs>>,
		): Prisma__EmbeddingClient<
			$Result.GetResult<
				Prisma.$EmbeddingPayload<ExtArgs>,
				T,
				"findFirstOrThrow",
				GlobalOmitOptions
			>,
			never,
			ExtArgs,
			GlobalOmitOptions
		>;

		/**
		 * Find zero or more Embeddings that matches the filter.
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 * @param {EmbeddingFindManyArgs} args - Arguments to filter and select certain fields only.
		 * @example
		 * // Get all Embeddings
		 * const embeddings = await prisma.embedding.findMany()
		 *
		 * // Get first 10 Embeddings
		 * const embeddings = await prisma.embedding.findMany({ take: 10 })
		 *
		 * // Only select the `id`
		 * const embeddingWithIdOnly = await prisma.embedding.findMany({ select: { id: true } })
		 *
		 */
		findMany<T extends EmbeddingFindManyArgs>(
			args?: SelectSubset<T, EmbeddingFindManyArgs<ExtArgs>>,
		): Prisma.PrismaPromise<
			$Result.GetResult<
				Prisma.$EmbeddingPayload<ExtArgs>,
				T,
				"findMany",
				GlobalOmitOptions
			>
		>;

		/**
		 * Delete a Embedding.
		 * @param {EmbeddingDeleteArgs} args - Arguments to delete one Embedding.
		 * @example
		 * // Delete one Embedding
		 * const Embedding = await prisma.embedding.delete({
		 *   where: {
		 *     // ... filter to delete one Embedding
		 *   }
		 * })
		 *
		 */
		delete<T extends EmbeddingDeleteArgs>(
			args: SelectSubset<T, EmbeddingDeleteArgs<ExtArgs>>,
		): Prisma__EmbeddingClient<
			$Result.GetResult<
				Prisma.$EmbeddingPayload<ExtArgs>,
				T,
				"delete",
				GlobalOmitOptions
			>,
			never,
			ExtArgs,
			GlobalOmitOptions
		>;

		/**
		 * Update one Embedding.
		 * @param {EmbeddingUpdateArgs} args - Arguments to update one Embedding.
		 * @example
		 * // Update one Embedding
		 * const embedding = await prisma.embedding.update({
		 *   where: {
		 *     // ... provide filter here
		 *   },
		 *   data: {
		 *     // ... provide data here
		 *   }
		 * })
		 *
		 */
		update<T extends EmbeddingUpdateArgs>(
			args: SelectSubset<T, EmbeddingUpdateArgs<ExtArgs>>,
		): Prisma__EmbeddingClient<
			$Result.GetResult<
				Prisma.$EmbeddingPayload<ExtArgs>,
				T,
				"update",
				GlobalOmitOptions
			>,
			never,
			ExtArgs,
			GlobalOmitOptions
		>;

		/**
		 * Delete zero or more Embeddings.
		 * @param {EmbeddingDeleteManyArgs} args - Arguments to filter Embeddings to delete.
		 * @example
		 * // Delete a few Embeddings
		 * const { count } = await prisma.embedding.deleteMany({
		 *   where: {
		 *     // ... provide filter here
		 *   }
		 * })
		 *
		 */
		deleteMany<T extends EmbeddingDeleteManyArgs>(
			args?: SelectSubset<T, EmbeddingDeleteManyArgs<ExtArgs>>,
		): Prisma.PrismaPromise<BatchPayload>;

		/**
		 * Update zero or more Embeddings.
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 * @param {EmbeddingUpdateManyArgs} args - Arguments to update one or more rows.
		 * @example
		 * // Update many Embeddings
		 * const embedding = await prisma.embedding.updateMany({
		 *   where: {
		 *     // ... provide filter here
		 *   },
		 *   data: {
		 *     // ... provide data here
		 *   }
		 * })
		 *
		 */
		updateMany<T extends EmbeddingUpdateManyArgs>(
			args: SelectSubset<T, EmbeddingUpdateManyArgs<ExtArgs>>,
		): Prisma.PrismaPromise<BatchPayload>;

		/**
		 * Update zero or more Embeddings and returns the data updated in the database.
		 * @param {EmbeddingUpdateManyAndReturnArgs} args - Arguments to update many Embeddings.
		 * @example
		 * // Update many Embeddings
		 * const embedding = await prisma.embedding.updateManyAndReturn({
		 *   where: {
		 *     // ... provide filter here
		 *   },
		 *   data: [
		 *     // ... provide data here
		 *   ]
		 * })
		 *
		 * // Update zero or more Embeddings and only return the `id`
		 * const embeddingWithIdOnly = await prisma.embedding.updateManyAndReturn({
		 *   select: { id: true },
		 *   where: {
		 *     // ... provide filter here
		 *   },
		 *   data: [
		 *     // ... provide data here
		 *   ]
		 * })
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 *
		 */
		updateManyAndReturn<T extends EmbeddingUpdateManyAndReturnArgs>(
			args: SelectSubset<T, EmbeddingUpdateManyAndReturnArgs<ExtArgs>>,
		): Prisma.PrismaPromise<
			$Result.GetResult<
				Prisma.$EmbeddingPayload<ExtArgs>,
				T,
				"updateManyAndReturn",
				GlobalOmitOptions
			>
		>;

		/**
		 * Count the number of Embeddings.
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 * @param {EmbeddingCountArgs} args - Arguments to filter Embeddings to count.
		 * @example
		 * // Count the number of Embeddings
		 * const count = await prisma.embedding.count({
		 *   where: {
		 *     // ... the filter for the Embeddings we want to count
		 *   }
		 * })
		 **/
		count<T extends EmbeddingCountArgs>(
			args?: Subset<T, EmbeddingCountArgs>,
		): Prisma.PrismaPromise<
			T extends $Utils.Record<"select", any>
				? T["select"] extends true
					? number
					: GetScalarType<T["select"], EmbeddingCountAggregateOutputType>
				: number
		>;

		/**
		 * Allows you to perform aggregations operations on a Embedding.
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 * @param {EmbeddingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
		 * @example
		 * // Ordered by age ascending
		 * // Where email contains prisma.io
		 * // Limited to the 10 users
		 * const aggregations = await prisma.user.aggregate({
		 *   _avg: {
		 *     age: true,
		 *   },
		 *   where: {
		 *     email: {
		 *       contains: "prisma.io",
		 *     },
		 *   },
		 *   orderBy: {
		 *     age: "asc",
		 *   },
		 *   take: 10,
		 * })
		 **/
		aggregate<T extends EmbeddingAggregateArgs>(
			args: Subset<T, EmbeddingAggregateArgs>,
		): Prisma.PrismaPromise<GetEmbeddingAggregateType<T>>;

		/**
		 * Group by Embedding.
		 * Note, that providing `undefined` is treated as the value not being there.
		 * Read more here: https://pris.ly/d/null-undefined
		 * @param {EmbeddingGroupByArgs} args - Group by arguments.
		 * @example
		 * // Group by city, order by createdAt, get count
		 * const result = await prisma.user.groupBy({
		 *   by: ['city', 'createdAt'],
		 *   orderBy: {
		 *     createdAt: true
		 *   },
		 *   _count: {
		 *     _all: true
		 *   },
		 * })
		 *
		 **/
		groupBy<
			T extends EmbeddingGroupByArgs,
			HasSelectOrTake extends Or<
				Extends<"skip", Keys<T>>,
				Extends<"take", Keys<T>>
			>,
			OrderByArg extends True extends HasSelectOrTake
				? { orderBy: EmbeddingGroupByArgs["orderBy"] }
				: { orderBy?: EmbeddingGroupByArgs["orderBy"] },
			OrderFields extends ExcludeUnderscoreKeys<
				Keys<MaybeTupleToUnion<T["orderBy"]>>
			>,
			ByFields extends MaybeTupleToUnion<T["by"]>,
			ByValid extends Has<ByFields, OrderFields>,
			HavingFields extends GetHavingFields<T["having"]>,
			HavingValid extends Has<ByFields, HavingFields>,
			ByEmpty extends T["by"] extends never[] ? True : False,
			InputErrors extends ByEmpty extends True
				? `Error: "by" must not be empty.`
				: HavingValid extends False
					? {
							[P in HavingFields]: P extends ByFields
								? never
								: P extends string
									? `Error: Field "${P}" used in "having" needs to be provided in "by".`
									: [
											Error,
											"Field ",
											P,
											` in "having" needs to be provided in "by"`,
										];
						}[HavingFields]
					: "take" extends Keys<T>
						? "orderBy" extends Keys<T>
							? ByValid extends True
								? {}
								: {
										[P in OrderFields]: P extends ByFields
											? never
											: `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
									}[OrderFields]
							: 'Error: If you provide "take", you also need to provide "orderBy"'
						: "skip" extends Keys<T>
							? "orderBy" extends Keys<T>
								? ByValid extends True
									? {}
									: {
											[P in OrderFields]: P extends ByFields
												? never
												: `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
										}[OrderFields]
								: 'Error: If you provide "skip", you also need to provide "orderBy"'
							: ByValid extends True
								? {}
								: {
										[P in OrderFields]: P extends ByFields
											? never
											: `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
									}[OrderFields],
		>(
			args: SubsetIntersection<T, EmbeddingGroupByArgs, OrderByArg> &
				InputErrors,
		): {} extends InputErrors
			? GetEmbeddingGroupByPayload<T>
			: Prisma.PrismaPromise<InputErrors>;
		/**
		 * Fields of the Embedding model
		 */
		readonly fields: EmbeddingFieldRefs;
	}

	/**
	 * The delegate class that acts as a "Promise-like" for Embedding.
	 * Why is this prefixed with `Prisma__`?
	 * Because we want to prevent naming conflicts as mentioned in
	 * https://github.com/prisma/prisma-client-js/issues/707
	 */
	export interface Prisma__EmbeddingClient<
		T,
		Null = never,
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
		GlobalOmitOptions = {},
	> extends Prisma.PrismaPromise<T> {
		readonly [Symbol.toStringTag]: "PrismaPromise";
		chunk<T extends ChunkDefaultArgs<ExtArgs> = {}>(
			args?: Subset<T, ChunkDefaultArgs<ExtArgs>>,
		): Prisma__ChunkClient<
			| $Result.GetResult<
					Prisma.$ChunkPayload<ExtArgs>,
					T,
					"findUniqueOrThrow",
					GlobalOmitOptions
			  >
			| Null,
			Null,
			ExtArgs,
			GlobalOmitOptions
		>;
		/**
		 * Attaches callbacks for the resolution and/or rejection of the Promise.
		 * @param onfulfilled The callback to execute when the Promise is resolved.
		 * @param onrejected The callback to execute when the Promise is rejected.
		 * @returns A Promise for the completion of which ever callback is executed.
		 */
		then<TResult1 = T, TResult2 = never>(
			onfulfilled?:
				| ((value: T) => TResult1 | PromiseLike<TResult1>)
				| undefined
				| null,
			onrejected?:
				| ((reason: any) => TResult2 | PromiseLike<TResult2>)
				| undefined
				| null,
		): $Utils.JsPromise<TResult1 | TResult2>;
		/**
		 * Attaches a callback for only the rejection of the Promise.
		 * @param onrejected The callback to execute when the Promise is rejected.
		 * @returns A Promise for the completion of the callback.
		 */
		catch<TResult = never>(
			onrejected?:
				| ((reason: any) => TResult | PromiseLike<TResult>)
				| undefined
				| null,
		): $Utils.JsPromise<T | TResult>;
		/**
		 * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
		 * resolved value cannot be modified from the callback.
		 * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
		 * @returns A Promise for the completion of the callback.
		 */
		finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
	}

	/**
	 * Fields of the Embedding model
	 */
	interface EmbeddingFieldRefs {
		readonly id: FieldRef<"Embedding", "String">;
		readonly chunkId: FieldRef<"Embedding", "String">;
		readonly createdAt: FieldRef<"Embedding", "DateTime">;
	}

	// Custom InputTypes
	/**
	 * Embedding findUnique
	 */
	export type EmbeddingFindUniqueArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Embedding
		 */
		select?: EmbeddingSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Embedding
		 */
		omit?: EmbeddingOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: EmbeddingInclude<ExtArgs> | null;
		/**
		 * Filter, which Embedding to fetch.
		 */
		where: EmbeddingWhereUniqueInput;
	};

	/**
	 * Embedding findUniqueOrThrow
	 */
	export type EmbeddingFindUniqueOrThrowArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Embedding
		 */
		select?: EmbeddingSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Embedding
		 */
		omit?: EmbeddingOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: EmbeddingInclude<ExtArgs> | null;
		/**
		 * Filter, which Embedding to fetch.
		 */
		where: EmbeddingWhereUniqueInput;
	};

	/**
	 * Embedding findFirst
	 */
	export type EmbeddingFindFirstArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Embedding
		 */
		select?: EmbeddingSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Embedding
		 */
		omit?: EmbeddingOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: EmbeddingInclude<ExtArgs> | null;
		/**
		 * Filter, which Embedding to fetch.
		 */
		where?: EmbeddingWhereInput;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
		 *
		 * Determine the order of Embeddings to fetch.
		 */
		orderBy?:
			| EmbeddingOrderByWithRelationInput
			| EmbeddingOrderByWithRelationInput[];
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
		 *
		 * Sets the position for searching for Embeddings.
		 */
		cursor?: EmbeddingWhereUniqueInput;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
		 *
		 * Take `±n` Embeddings from the position of the cursor.
		 */
		take?: number;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
		 *
		 * Skip the first `n` Embeddings.
		 */
		skip?: number;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
		 *
		 * Filter by unique combinations of Embeddings.
		 */
		distinct?: EmbeddingScalarFieldEnum | EmbeddingScalarFieldEnum[];
	};

	/**
	 * Embedding findFirstOrThrow
	 */
	export type EmbeddingFindFirstOrThrowArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Embedding
		 */
		select?: EmbeddingSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Embedding
		 */
		omit?: EmbeddingOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: EmbeddingInclude<ExtArgs> | null;
		/**
		 * Filter, which Embedding to fetch.
		 */
		where?: EmbeddingWhereInput;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
		 *
		 * Determine the order of Embeddings to fetch.
		 */
		orderBy?:
			| EmbeddingOrderByWithRelationInput
			| EmbeddingOrderByWithRelationInput[];
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
		 *
		 * Sets the position for searching for Embeddings.
		 */
		cursor?: EmbeddingWhereUniqueInput;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
		 *
		 * Take `±n` Embeddings from the position of the cursor.
		 */
		take?: number;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
		 *
		 * Skip the first `n` Embeddings.
		 */
		skip?: number;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
		 *
		 * Filter by unique combinations of Embeddings.
		 */
		distinct?: EmbeddingScalarFieldEnum | EmbeddingScalarFieldEnum[];
	};

	/**
	 * Embedding findMany
	 */
	export type EmbeddingFindManyArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Embedding
		 */
		select?: EmbeddingSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Embedding
		 */
		omit?: EmbeddingOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: EmbeddingInclude<ExtArgs> | null;
		/**
		 * Filter, which Embeddings to fetch.
		 */
		where?: EmbeddingWhereInput;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
		 *
		 * Determine the order of Embeddings to fetch.
		 */
		orderBy?:
			| EmbeddingOrderByWithRelationInput
			| EmbeddingOrderByWithRelationInput[];
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
		 *
		 * Sets the position for listing Embeddings.
		 */
		cursor?: EmbeddingWhereUniqueInput;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
		 *
		 * Take `±n` Embeddings from the position of the cursor.
		 */
		take?: number;
		/**
		 * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
		 *
		 * Skip the first `n` Embeddings.
		 */
		skip?: number;
		distinct?: EmbeddingScalarFieldEnum | EmbeddingScalarFieldEnum[];
	};

	/**
	 * Embedding update
	 */
	export type EmbeddingUpdateArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Embedding
		 */
		select?: EmbeddingSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Embedding
		 */
		omit?: EmbeddingOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: EmbeddingInclude<ExtArgs> | null;
		/**
		 * The data needed to update a Embedding.
		 */
		data: XOR<EmbeddingUpdateInput, EmbeddingUncheckedUpdateInput>;
		/**
		 * Choose, which Embedding to update.
		 */
		where: EmbeddingWhereUniqueInput;
	};

	/**
	 * Embedding updateMany
	 */
	export type EmbeddingUpdateManyArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * The data used to update Embeddings.
		 */
		data: XOR<
			EmbeddingUpdateManyMutationInput,
			EmbeddingUncheckedUpdateManyInput
		>;
		/**
		 * Filter which Embeddings to update
		 */
		where?: EmbeddingWhereInput;
		/**
		 * Limit how many Embeddings to update.
		 */
		limit?: number;
	};

	/**
	 * Embedding updateManyAndReturn
	 */
	export type EmbeddingUpdateManyAndReturnArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Embedding
		 */
		select?: EmbeddingSelectUpdateManyAndReturn<ExtArgs> | null;
		/**
		 * Omit specific fields from the Embedding
		 */
		omit?: EmbeddingOmit<ExtArgs> | null;
		/**
		 * The data used to update Embeddings.
		 */
		data: XOR<
			EmbeddingUpdateManyMutationInput,
			EmbeddingUncheckedUpdateManyInput
		>;
		/**
		 * Filter which Embeddings to update
		 */
		where?: EmbeddingWhereInput;
		/**
		 * Limit how many Embeddings to update.
		 */
		limit?: number;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: EmbeddingIncludeUpdateManyAndReturn<ExtArgs> | null;
	};

	/**
	 * Embedding delete
	 */
	export type EmbeddingDeleteArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Embedding
		 */
		select?: EmbeddingSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Embedding
		 */
		omit?: EmbeddingOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: EmbeddingInclude<ExtArgs> | null;
		/**
		 * Filter which Embedding to delete.
		 */
		where: EmbeddingWhereUniqueInput;
	};

	/**
	 * Embedding deleteMany
	 */
	export type EmbeddingDeleteManyArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Filter which Embeddings to delete
		 */
		where?: EmbeddingWhereInput;
		/**
		 * Limit how many Embeddings to delete.
		 */
		limit?: number;
	};

	/**
	 * Embedding without action
	 */
	export type EmbeddingDefaultArgs<
		ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
	> = {
		/**
		 * Select specific fields to fetch from the Embedding
		 */
		select?: EmbeddingSelect<ExtArgs> | null;
		/**
		 * Omit specific fields from the Embedding
		 */
		omit?: EmbeddingOmit<ExtArgs> | null;
		/**
		 * Choose, which related nodes to fetch as well
		 */
		include?: EmbeddingInclude<ExtArgs> | null;
	};

	/**
	 * Enums
	 */

	export const TransactionIsolationLevel: {
		ReadUncommitted: "ReadUncommitted";
		ReadCommitted: "ReadCommitted";
		RepeatableRead: "RepeatableRead";
		Serializable: "Serializable";
	};

	export type TransactionIsolationLevel =
		(typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];

	export const DumpScalarFieldEnum: {
		id: "id";
		content: "content";
		createdAt: "createdAt";
	};

	export type DumpScalarFieldEnum =
		(typeof DumpScalarFieldEnum)[keyof typeof DumpScalarFieldEnum];

	export const ChunkScalarFieldEnum: {
		id: "id";
		dumpId: "dumpId";
		content: "content";
		order: "order";
		createdAt: "createdAt";
	};

	export type ChunkScalarFieldEnum =
		(typeof ChunkScalarFieldEnum)[keyof typeof ChunkScalarFieldEnum];

	export const EmbeddingScalarFieldEnum: {
		id: "id";
		chunkId: "chunkId";
		createdAt: "createdAt";
	};

	export type EmbeddingScalarFieldEnum =
		(typeof EmbeddingScalarFieldEnum)[keyof typeof EmbeddingScalarFieldEnum];

	export const SortOrder: {
		asc: "asc";
		desc: "desc";
	};

	export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

	export const QueryMode: {
		default: "default";
		insensitive: "insensitive";
	};

	export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];

	/**
	 * Field references
	 */

	/**
	 * Reference to a field of type 'String'
	 */
	export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<
		$PrismaModel,
		"String"
	>;

	/**
	 * Reference to a field of type 'String[]'
	 */
	export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<
		$PrismaModel,
		"String[]"
	>;

	/**
	 * Reference to a field of type 'DateTime'
	 */
	export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<
		$PrismaModel,
		"DateTime"
	>;

	/**
	 * Reference to a field of type 'DateTime[]'
	 */
	export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<
		$PrismaModel,
		"DateTime[]"
	>;

	/**
	 * Reference to a field of type 'Int'
	 */
	export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<
		$PrismaModel,
		"Int"
	>;

	/**
	 * Reference to a field of type 'Int[]'
	 */
	export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<
		$PrismaModel,
		"Int[]"
	>;

	/**
	 * Reference to a field of type 'Float'
	 */
	export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<
		$PrismaModel,
		"Float"
	>;

	/**
	 * Reference to a field of type 'Float[]'
	 */
	export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<
		$PrismaModel,
		"Float[]"
	>;

	/**
	 * Deep Input Types
	 */

	export type DumpWhereInput = {
		AND?: DumpWhereInput | DumpWhereInput[];
		OR?: DumpWhereInput[];
		NOT?: DumpWhereInput | DumpWhereInput[];
		id?: StringFilter<"Dump"> | string;
		content?: StringFilter<"Dump"> | string;
		createdAt?: DateTimeFilter<"Dump"> | Date | string;
		chunks?: ChunkListRelationFilter;
	};

	export type DumpOrderByWithRelationInput = {
		id?: SortOrder;
		content?: SortOrder;
		createdAt?: SortOrder;
		chunks?: ChunkOrderByRelationAggregateInput;
	};

	export type DumpWhereUniqueInput = Prisma.AtLeast<
		{
			id?: string;
			AND?: DumpWhereInput | DumpWhereInput[];
			OR?: DumpWhereInput[];
			NOT?: DumpWhereInput | DumpWhereInput[];
			content?: StringFilter<"Dump"> | string;
			createdAt?: DateTimeFilter<"Dump"> | Date | string;
			chunks?: ChunkListRelationFilter;
		},
		"id"
	>;

	export type DumpOrderByWithAggregationInput = {
		id?: SortOrder;
		content?: SortOrder;
		createdAt?: SortOrder;
		_count?: DumpCountOrderByAggregateInput;
		_max?: DumpMaxOrderByAggregateInput;
		_min?: DumpMinOrderByAggregateInput;
	};

	export type DumpScalarWhereWithAggregatesInput = {
		AND?:
			| DumpScalarWhereWithAggregatesInput
			| DumpScalarWhereWithAggregatesInput[];
		OR?: DumpScalarWhereWithAggregatesInput[];
		NOT?:
			| DumpScalarWhereWithAggregatesInput
			| DumpScalarWhereWithAggregatesInput[];
		id?: StringWithAggregatesFilter<"Dump"> | string;
		content?: StringWithAggregatesFilter<"Dump"> | string;
		createdAt?: DateTimeWithAggregatesFilter<"Dump"> | Date | string;
	};

	export type ChunkWhereInput = {
		AND?: ChunkWhereInput | ChunkWhereInput[];
		OR?: ChunkWhereInput[];
		NOT?: ChunkWhereInput | ChunkWhereInput[];
		id?: StringFilter<"Chunk"> | string;
		dumpId?: StringFilter<"Chunk"> | string;
		content?: StringFilter<"Chunk"> | string;
		order?: IntFilter<"Chunk"> | number;
		createdAt?: DateTimeFilter<"Chunk"> | Date | string;
		dump?: XOR<DumpScalarRelationFilter, DumpWhereInput>;
		embedding?: XOR<
			EmbeddingNullableScalarRelationFilter,
			EmbeddingWhereInput
		> | null;
	};

	export type ChunkOrderByWithRelationInput = {
		id?: SortOrder;
		dumpId?: SortOrder;
		content?: SortOrder;
		order?: SortOrder;
		createdAt?: SortOrder;
		dump?: DumpOrderByWithRelationInput;
		embedding?: EmbeddingOrderByWithRelationInput;
	};

	export type ChunkWhereUniqueInput = Prisma.AtLeast<
		{
			id?: string;
			AND?: ChunkWhereInput | ChunkWhereInput[];
			OR?: ChunkWhereInput[];
			NOT?: ChunkWhereInput | ChunkWhereInput[];
			dumpId?: StringFilter<"Chunk"> | string;
			content?: StringFilter<"Chunk"> | string;
			order?: IntFilter<"Chunk"> | number;
			createdAt?: DateTimeFilter<"Chunk"> | Date | string;
			dump?: XOR<DumpScalarRelationFilter, DumpWhereInput>;
			embedding?: XOR<
				EmbeddingNullableScalarRelationFilter,
				EmbeddingWhereInput
			> | null;
		},
		"id"
	>;

	export type ChunkOrderByWithAggregationInput = {
		id?: SortOrder;
		dumpId?: SortOrder;
		content?: SortOrder;
		order?: SortOrder;
		createdAt?: SortOrder;
		_count?: ChunkCountOrderByAggregateInput;
		_avg?: ChunkAvgOrderByAggregateInput;
		_max?: ChunkMaxOrderByAggregateInput;
		_min?: ChunkMinOrderByAggregateInput;
		_sum?: ChunkSumOrderByAggregateInput;
	};

	export type ChunkScalarWhereWithAggregatesInput = {
		AND?:
			| ChunkScalarWhereWithAggregatesInput
			| ChunkScalarWhereWithAggregatesInput[];
		OR?: ChunkScalarWhereWithAggregatesInput[];
		NOT?:
			| ChunkScalarWhereWithAggregatesInput
			| ChunkScalarWhereWithAggregatesInput[];
		id?: StringWithAggregatesFilter<"Chunk"> | string;
		dumpId?: StringWithAggregatesFilter<"Chunk"> | string;
		content?: StringWithAggregatesFilter<"Chunk"> | string;
		order?: IntWithAggregatesFilter<"Chunk"> | number;
		createdAt?: DateTimeWithAggregatesFilter<"Chunk"> | Date | string;
	};

	export type EmbeddingWhereInput = {
		AND?: EmbeddingWhereInput | EmbeddingWhereInput[];
		OR?: EmbeddingWhereInput[];
		NOT?: EmbeddingWhereInput | EmbeddingWhereInput[];
		id?: StringFilter<"Embedding"> | string;
		chunkId?: StringFilter<"Embedding"> | string;
		createdAt?: DateTimeFilter<"Embedding"> | Date | string;
		chunk?: XOR<ChunkScalarRelationFilter, ChunkWhereInput>;
	};

	export type EmbeddingOrderByWithRelationInput = {
		id?: SortOrder;
		chunkId?: SortOrder;
		createdAt?: SortOrder;
		chunk?: ChunkOrderByWithRelationInput;
	};

	export type EmbeddingWhereUniqueInput = Prisma.AtLeast<
		{
			id?: string;
			chunkId?: string;
			AND?: EmbeddingWhereInput | EmbeddingWhereInput[];
			OR?: EmbeddingWhereInput[];
			NOT?: EmbeddingWhereInput | EmbeddingWhereInput[];
			createdAt?: DateTimeFilter<"Embedding"> | Date | string;
			chunk?: XOR<ChunkScalarRelationFilter, ChunkWhereInput>;
		},
		"id" | "chunkId"
	>;

	export type EmbeddingOrderByWithAggregationInput = {
		id?: SortOrder;
		chunkId?: SortOrder;
		createdAt?: SortOrder;
		_count?: EmbeddingCountOrderByAggregateInput;
		_max?: EmbeddingMaxOrderByAggregateInput;
		_min?: EmbeddingMinOrderByAggregateInput;
	};

	export type EmbeddingScalarWhereWithAggregatesInput = {
		AND?:
			| EmbeddingScalarWhereWithAggregatesInput
			| EmbeddingScalarWhereWithAggregatesInput[];
		OR?: EmbeddingScalarWhereWithAggregatesInput[];
		NOT?:
			| EmbeddingScalarWhereWithAggregatesInput
			| EmbeddingScalarWhereWithAggregatesInput[];
		id?: StringWithAggregatesFilter<"Embedding"> | string;
		chunkId?: StringWithAggregatesFilter<"Embedding"> | string;
		createdAt?: DateTimeWithAggregatesFilter<"Embedding"> | Date | string;
	};

	export type DumpCreateInput = {
		id?: string;
		content: string;
		createdAt?: Date | string;
		chunks?: ChunkCreateNestedManyWithoutDumpInput;
	};

	export type DumpUncheckedCreateInput = {
		id?: string;
		content: string;
		createdAt?: Date | string;
		chunks?: ChunkUncheckedCreateNestedManyWithoutDumpInput;
	};

	export type DumpUpdateInput = {
		id?: StringFieldUpdateOperationsInput | string;
		content?: StringFieldUpdateOperationsInput | string;
		createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
		chunks?: ChunkUpdateManyWithoutDumpNestedInput;
	};

	export type DumpUncheckedUpdateInput = {
		id?: StringFieldUpdateOperationsInput | string;
		content?: StringFieldUpdateOperationsInput | string;
		createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
		chunks?: ChunkUncheckedUpdateManyWithoutDumpNestedInput;
	};

	export type DumpCreateManyInput = {
		id?: string;
		content: string;
		createdAt?: Date | string;
	};

	export type DumpUpdateManyMutationInput = {
		id?: StringFieldUpdateOperationsInput | string;
		content?: StringFieldUpdateOperationsInput | string;
		createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
	};

	export type DumpUncheckedUpdateManyInput = {
		id?: StringFieldUpdateOperationsInput | string;
		content?: StringFieldUpdateOperationsInput | string;
		createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
	};

	export type ChunkCreateInput = {
		id?: string;
		content: string;
		order: number;
		createdAt?: Date | string;
		dump: DumpCreateNestedOneWithoutChunksInput;
		embedding?: EmbeddingCreateNestedOneWithoutChunkInput;
	};

	export type ChunkUncheckedCreateInput = {
		id?: string;
		dumpId: string;
		content: string;
		order: number;
		createdAt?: Date | string;
		embedding?: EmbeddingUncheckedCreateNestedOneWithoutChunkInput;
	};

	export type ChunkUpdateInput = {
		id?: StringFieldUpdateOperationsInput | string;
		content?: StringFieldUpdateOperationsInput | string;
		order?: IntFieldUpdateOperationsInput | number;
		createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
		dump?: DumpUpdateOneRequiredWithoutChunksNestedInput;
		embedding?: EmbeddingUpdateOneWithoutChunkNestedInput;
	};

	export type ChunkUncheckedUpdateInput = {
		id?: StringFieldUpdateOperationsInput | string;
		dumpId?: StringFieldUpdateOperationsInput | string;
		content?: StringFieldUpdateOperationsInput | string;
		order?: IntFieldUpdateOperationsInput | number;
		createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
		embedding?: EmbeddingUncheckedUpdateOneWithoutChunkNestedInput;
	};

	export type ChunkCreateManyInput = {
		id?: string;
		dumpId: string;
		content: string;
		order: number;
		createdAt?: Date | string;
	};

	export type ChunkUpdateManyMutationInput = {
		id?: StringFieldUpdateOperationsInput | string;
		content?: StringFieldUpdateOperationsInput | string;
		order?: IntFieldUpdateOperationsInput | number;
		createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
	};

	export type ChunkUncheckedUpdateManyInput = {
		id?: StringFieldUpdateOperationsInput | string;
		dumpId?: StringFieldUpdateOperationsInput | string;
		content?: StringFieldUpdateOperationsInput | string;
		order?: IntFieldUpdateOperationsInput | number;
		createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
	};

	export type EmbeddingUpdateInput = {
		id?: StringFieldUpdateOperationsInput | string;
		createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
		chunk?: ChunkUpdateOneRequiredWithoutEmbeddingNestedInput;
	};

	export type EmbeddingUncheckedUpdateInput = {
		id?: StringFieldUpdateOperationsInput | string;
		chunkId?: StringFieldUpdateOperationsInput | string;
		createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
	};

	export type EmbeddingUpdateManyMutationInput = {
		id?: StringFieldUpdateOperationsInput | string;
		createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
	};

	export type EmbeddingUncheckedUpdateManyInput = {
		id?: StringFieldUpdateOperationsInput | string;
		chunkId?: StringFieldUpdateOperationsInput | string;
		createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
	};

	export type StringFilter<$PrismaModel = never> = {
		equals?: string | StringFieldRefInput<$PrismaModel>;
		in?: string[] | ListStringFieldRefInput<$PrismaModel>;
		notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
		lt?: string | StringFieldRefInput<$PrismaModel>;
		lte?: string | StringFieldRefInput<$PrismaModel>;
		gt?: string | StringFieldRefInput<$PrismaModel>;
		gte?: string | StringFieldRefInput<$PrismaModel>;
		contains?: string | StringFieldRefInput<$PrismaModel>;
		startsWith?: string | StringFieldRefInput<$PrismaModel>;
		endsWith?: string | StringFieldRefInput<$PrismaModel>;
		mode?: QueryMode;
		not?: NestedStringFilter<$PrismaModel> | string;
	};

	export type DateTimeFilter<$PrismaModel = never> = {
		equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
		in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
		notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
		lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
		lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
		gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
		gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
		not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
	};

	export type ChunkListRelationFilter = {
		every?: ChunkWhereInput;
		some?: ChunkWhereInput;
		none?: ChunkWhereInput;
	};

	export type ChunkOrderByRelationAggregateInput = {
		_count?: SortOrder;
	};

	export type DumpCountOrderByAggregateInput = {
		id?: SortOrder;
		content?: SortOrder;
		createdAt?: SortOrder;
	};

	export type DumpMaxOrderByAggregateInput = {
		id?: SortOrder;
		content?: SortOrder;
		createdAt?: SortOrder;
	};

	export type DumpMinOrderByAggregateInput = {
		id?: SortOrder;
		content?: SortOrder;
		createdAt?: SortOrder;
	};

	export type StringWithAggregatesFilter<$PrismaModel = never> = {
		equals?: string | StringFieldRefInput<$PrismaModel>;
		in?: string[] | ListStringFieldRefInput<$PrismaModel>;
		notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
		lt?: string | StringFieldRefInput<$PrismaModel>;
		lte?: string | StringFieldRefInput<$PrismaModel>;
		gt?: string | StringFieldRefInput<$PrismaModel>;
		gte?: string | StringFieldRefInput<$PrismaModel>;
		contains?: string | StringFieldRefInput<$PrismaModel>;
		startsWith?: string | StringFieldRefInput<$PrismaModel>;
		endsWith?: string | StringFieldRefInput<$PrismaModel>;
		mode?: QueryMode;
		not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
		_count?: NestedIntFilter<$PrismaModel>;
		_min?: NestedStringFilter<$PrismaModel>;
		_max?: NestedStringFilter<$PrismaModel>;
	};

	export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
		equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
		in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
		notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
		lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
		lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
		gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
		gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
		not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
		_count?: NestedIntFilter<$PrismaModel>;
		_min?: NestedDateTimeFilter<$PrismaModel>;
		_max?: NestedDateTimeFilter<$PrismaModel>;
	};

	export type IntFilter<$PrismaModel = never> = {
		equals?: number | IntFieldRefInput<$PrismaModel>;
		in?: number[] | ListIntFieldRefInput<$PrismaModel>;
		notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
		lt?: number | IntFieldRefInput<$PrismaModel>;
		lte?: number | IntFieldRefInput<$PrismaModel>;
		gt?: number | IntFieldRefInput<$PrismaModel>;
		gte?: number | IntFieldRefInput<$PrismaModel>;
		not?: NestedIntFilter<$PrismaModel> | number;
	};

	export type DumpScalarRelationFilter = {
		is?: DumpWhereInput;
		isNot?: DumpWhereInput;
	};

	export type EmbeddingNullableScalarRelationFilter = {
		is?: EmbeddingWhereInput | null;
		isNot?: EmbeddingWhereInput | null;
	};

	export type ChunkCountOrderByAggregateInput = {
		id?: SortOrder;
		dumpId?: SortOrder;
		content?: SortOrder;
		order?: SortOrder;
		createdAt?: SortOrder;
	};

	export type ChunkAvgOrderByAggregateInput = {
		order?: SortOrder;
	};

	export type ChunkMaxOrderByAggregateInput = {
		id?: SortOrder;
		dumpId?: SortOrder;
		content?: SortOrder;
		order?: SortOrder;
		createdAt?: SortOrder;
	};

	export type ChunkMinOrderByAggregateInput = {
		id?: SortOrder;
		dumpId?: SortOrder;
		content?: SortOrder;
		order?: SortOrder;
		createdAt?: SortOrder;
	};

	export type ChunkSumOrderByAggregateInput = {
		order?: SortOrder;
	};

	export type IntWithAggregatesFilter<$PrismaModel = never> = {
		equals?: number | IntFieldRefInput<$PrismaModel>;
		in?: number[] | ListIntFieldRefInput<$PrismaModel>;
		notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
		lt?: number | IntFieldRefInput<$PrismaModel>;
		lte?: number | IntFieldRefInput<$PrismaModel>;
		gt?: number | IntFieldRefInput<$PrismaModel>;
		gte?: number | IntFieldRefInput<$PrismaModel>;
		not?: NestedIntWithAggregatesFilter<$PrismaModel> | number;
		_count?: NestedIntFilter<$PrismaModel>;
		_avg?: NestedFloatFilter<$PrismaModel>;
		_sum?: NestedIntFilter<$PrismaModel>;
		_min?: NestedIntFilter<$PrismaModel>;
		_max?: NestedIntFilter<$PrismaModel>;
	};

	export type ChunkScalarRelationFilter = {
		is?: ChunkWhereInput;
		isNot?: ChunkWhereInput;
	};

	export type EmbeddingCountOrderByAggregateInput = {
		id?: SortOrder;
		chunkId?: SortOrder;
		createdAt?: SortOrder;
	};

	export type EmbeddingMaxOrderByAggregateInput = {
		id?: SortOrder;
		chunkId?: SortOrder;
		createdAt?: SortOrder;
	};

	export type EmbeddingMinOrderByAggregateInput = {
		id?: SortOrder;
		chunkId?: SortOrder;
		createdAt?: SortOrder;
	};

	export type ChunkCreateNestedManyWithoutDumpInput = {
		create?:
			| XOR<ChunkCreateWithoutDumpInput, ChunkUncheckedCreateWithoutDumpInput>
			| ChunkCreateWithoutDumpInput[]
			| ChunkUncheckedCreateWithoutDumpInput[];
		connectOrCreate?:
			| ChunkCreateOrConnectWithoutDumpInput
			| ChunkCreateOrConnectWithoutDumpInput[];
		createMany?: ChunkCreateManyDumpInputEnvelope;
		connect?: ChunkWhereUniqueInput | ChunkWhereUniqueInput[];
	};

	export type ChunkUncheckedCreateNestedManyWithoutDumpInput = {
		create?:
			| XOR<ChunkCreateWithoutDumpInput, ChunkUncheckedCreateWithoutDumpInput>
			| ChunkCreateWithoutDumpInput[]
			| ChunkUncheckedCreateWithoutDumpInput[];
		connectOrCreate?:
			| ChunkCreateOrConnectWithoutDumpInput
			| ChunkCreateOrConnectWithoutDumpInput[];
		createMany?: ChunkCreateManyDumpInputEnvelope;
		connect?: ChunkWhereUniqueInput | ChunkWhereUniqueInput[];
	};

	export type StringFieldUpdateOperationsInput = {
		set?: string;
	};

	export type DateTimeFieldUpdateOperationsInput = {
		set?: Date | string;
	};

	export type ChunkUpdateManyWithoutDumpNestedInput = {
		create?:
			| XOR<ChunkCreateWithoutDumpInput, ChunkUncheckedCreateWithoutDumpInput>
			| ChunkCreateWithoutDumpInput[]
			| ChunkUncheckedCreateWithoutDumpInput[];
		connectOrCreate?:
			| ChunkCreateOrConnectWithoutDumpInput
			| ChunkCreateOrConnectWithoutDumpInput[];
		upsert?:
			| ChunkUpsertWithWhereUniqueWithoutDumpInput
			| ChunkUpsertWithWhereUniqueWithoutDumpInput[];
		createMany?: ChunkCreateManyDumpInputEnvelope;
		set?: ChunkWhereUniqueInput | ChunkWhereUniqueInput[];
		disconnect?: ChunkWhereUniqueInput | ChunkWhereUniqueInput[];
		delete?: ChunkWhereUniqueInput | ChunkWhereUniqueInput[];
		connect?: ChunkWhereUniqueInput | ChunkWhereUniqueInput[];
		update?:
			| ChunkUpdateWithWhereUniqueWithoutDumpInput
			| ChunkUpdateWithWhereUniqueWithoutDumpInput[];
		updateMany?:
			| ChunkUpdateManyWithWhereWithoutDumpInput
			| ChunkUpdateManyWithWhereWithoutDumpInput[];
		deleteMany?: ChunkScalarWhereInput | ChunkScalarWhereInput[];
	};

	export type ChunkUncheckedUpdateManyWithoutDumpNestedInput = {
		create?:
			| XOR<ChunkCreateWithoutDumpInput, ChunkUncheckedCreateWithoutDumpInput>
			| ChunkCreateWithoutDumpInput[]
			| ChunkUncheckedCreateWithoutDumpInput[];
		connectOrCreate?:
			| ChunkCreateOrConnectWithoutDumpInput
			| ChunkCreateOrConnectWithoutDumpInput[];
		upsert?:
			| ChunkUpsertWithWhereUniqueWithoutDumpInput
			| ChunkUpsertWithWhereUniqueWithoutDumpInput[];
		createMany?: ChunkCreateManyDumpInputEnvelope;
		set?: ChunkWhereUniqueInput | ChunkWhereUniqueInput[];
		disconnect?: ChunkWhereUniqueInput | ChunkWhereUniqueInput[];
		delete?: ChunkWhereUniqueInput | ChunkWhereUniqueInput[];
		connect?: ChunkWhereUniqueInput | ChunkWhereUniqueInput[];
		update?:
			| ChunkUpdateWithWhereUniqueWithoutDumpInput
			| ChunkUpdateWithWhereUniqueWithoutDumpInput[];
		updateMany?:
			| ChunkUpdateManyWithWhereWithoutDumpInput
			| ChunkUpdateManyWithWhereWithoutDumpInput[];
		deleteMany?: ChunkScalarWhereInput | ChunkScalarWhereInput[];
	};

	export type DumpCreateNestedOneWithoutChunksInput = {
		create?: XOR<
			DumpCreateWithoutChunksInput,
			DumpUncheckedCreateWithoutChunksInput
		>;
		connectOrCreate?: DumpCreateOrConnectWithoutChunksInput;
		connect?: DumpWhereUniqueInput;
	};

	export type EmbeddingCreateNestedOneWithoutChunkInput = {
		connect?: EmbeddingWhereUniqueInput;
	};

	export type EmbeddingUncheckedCreateNestedOneWithoutChunkInput = {
		connect?: EmbeddingWhereUniqueInput;
	};

	export type IntFieldUpdateOperationsInput = {
		set?: number;
		increment?: number;
		decrement?: number;
		multiply?: number;
		divide?: number;
	};

	export type DumpUpdateOneRequiredWithoutChunksNestedInput = {
		create?: XOR<
			DumpCreateWithoutChunksInput,
			DumpUncheckedCreateWithoutChunksInput
		>;
		connectOrCreate?: DumpCreateOrConnectWithoutChunksInput;
		upsert?: DumpUpsertWithoutChunksInput;
		connect?: DumpWhereUniqueInput;
		update?: XOR<
			XOR<
				DumpUpdateToOneWithWhereWithoutChunksInput,
				DumpUpdateWithoutChunksInput
			>,
			DumpUncheckedUpdateWithoutChunksInput
		>;
	};

	export type EmbeddingUpdateOneWithoutChunkNestedInput = {
		disconnect?: EmbeddingWhereInput | boolean;
		delete?: EmbeddingWhereInput | boolean;
		connect?: EmbeddingWhereUniqueInput;
		update?: XOR<
			XOR<
				EmbeddingUpdateToOneWithWhereWithoutChunkInput,
				EmbeddingUpdateWithoutChunkInput
			>,
			EmbeddingUncheckedUpdateWithoutChunkInput
		>;
	};

	export type EmbeddingUncheckedUpdateOneWithoutChunkNestedInput = {
		disconnect?: EmbeddingWhereInput | boolean;
		delete?: EmbeddingWhereInput | boolean;
		connect?: EmbeddingWhereUniqueInput;
		update?: XOR<
			XOR<
				EmbeddingUpdateToOneWithWhereWithoutChunkInput,
				EmbeddingUpdateWithoutChunkInput
			>,
			EmbeddingUncheckedUpdateWithoutChunkInput
		>;
	};

	export type ChunkUpdateOneRequiredWithoutEmbeddingNestedInput = {
		create?: XOR<
			ChunkCreateWithoutEmbeddingInput,
			ChunkUncheckedCreateWithoutEmbeddingInput
		>;
		connectOrCreate?: ChunkCreateOrConnectWithoutEmbeddingInput;
		upsert?: ChunkUpsertWithoutEmbeddingInput;
		connect?: ChunkWhereUniqueInput;
		update?: XOR<
			XOR<
				ChunkUpdateToOneWithWhereWithoutEmbeddingInput,
				ChunkUpdateWithoutEmbeddingInput
			>,
			ChunkUncheckedUpdateWithoutEmbeddingInput
		>;
	};

	export type NestedStringFilter<$PrismaModel = never> = {
		equals?: string | StringFieldRefInput<$PrismaModel>;
		in?: string[] | ListStringFieldRefInput<$PrismaModel>;
		notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
		lt?: string | StringFieldRefInput<$PrismaModel>;
		lte?: string | StringFieldRefInput<$PrismaModel>;
		gt?: string | StringFieldRefInput<$PrismaModel>;
		gte?: string | StringFieldRefInput<$PrismaModel>;
		contains?: string | StringFieldRefInput<$PrismaModel>;
		startsWith?: string | StringFieldRefInput<$PrismaModel>;
		endsWith?: string | StringFieldRefInput<$PrismaModel>;
		not?: NestedStringFilter<$PrismaModel> | string;
	};

	export type NestedDateTimeFilter<$PrismaModel = never> = {
		equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
		in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
		notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
		lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
		lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
		gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
		gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
		not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
	};

	export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
		equals?: string | StringFieldRefInput<$PrismaModel>;
		in?: string[] | ListStringFieldRefInput<$PrismaModel>;
		notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
		lt?: string | StringFieldRefInput<$PrismaModel>;
		lte?: string | StringFieldRefInput<$PrismaModel>;
		gt?: string | StringFieldRefInput<$PrismaModel>;
		gte?: string | StringFieldRefInput<$PrismaModel>;
		contains?: string | StringFieldRefInput<$PrismaModel>;
		startsWith?: string | StringFieldRefInput<$PrismaModel>;
		endsWith?: string | StringFieldRefInput<$PrismaModel>;
		not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
		_count?: NestedIntFilter<$PrismaModel>;
		_min?: NestedStringFilter<$PrismaModel>;
		_max?: NestedStringFilter<$PrismaModel>;
	};

	export type NestedIntFilter<$PrismaModel = never> = {
		equals?: number | IntFieldRefInput<$PrismaModel>;
		in?: number[] | ListIntFieldRefInput<$PrismaModel>;
		notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
		lt?: number | IntFieldRefInput<$PrismaModel>;
		lte?: number | IntFieldRefInput<$PrismaModel>;
		gt?: number | IntFieldRefInput<$PrismaModel>;
		gte?: number | IntFieldRefInput<$PrismaModel>;
		not?: NestedIntFilter<$PrismaModel> | number;
	};

	export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
		equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
		in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
		notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
		lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
		lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
		gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
		gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
		not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
		_count?: NestedIntFilter<$PrismaModel>;
		_min?: NestedDateTimeFilter<$PrismaModel>;
		_max?: NestedDateTimeFilter<$PrismaModel>;
	};

	export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
		equals?: number | IntFieldRefInput<$PrismaModel>;
		in?: number[] | ListIntFieldRefInput<$PrismaModel>;
		notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
		lt?: number | IntFieldRefInput<$PrismaModel>;
		lte?: number | IntFieldRefInput<$PrismaModel>;
		gt?: number | IntFieldRefInput<$PrismaModel>;
		gte?: number | IntFieldRefInput<$PrismaModel>;
		not?: NestedIntWithAggregatesFilter<$PrismaModel> | number;
		_count?: NestedIntFilter<$PrismaModel>;
		_avg?: NestedFloatFilter<$PrismaModel>;
		_sum?: NestedIntFilter<$PrismaModel>;
		_min?: NestedIntFilter<$PrismaModel>;
		_max?: NestedIntFilter<$PrismaModel>;
	};

	export type NestedFloatFilter<$PrismaModel = never> = {
		equals?: number | FloatFieldRefInput<$PrismaModel>;
		in?: number[] | ListFloatFieldRefInput<$PrismaModel>;
		notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>;
		lt?: number | FloatFieldRefInput<$PrismaModel>;
		lte?: number | FloatFieldRefInput<$PrismaModel>;
		gt?: number | FloatFieldRefInput<$PrismaModel>;
		gte?: number | FloatFieldRefInput<$PrismaModel>;
		not?: NestedFloatFilter<$PrismaModel> | number;
	};

	export type ChunkCreateWithoutDumpInput = {
		id?: string;
		content: string;
		order: number;
		createdAt?: Date | string;
		embedding?: EmbeddingCreateNestedOneWithoutChunkInput;
	};

	export type ChunkUncheckedCreateWithoutDumpInput = {
		id?: string;
		content: string;
		order: number;
		createdAt?: Date | string;
		embedding?: EmbeddingUncheckedCreateNestedOneWithoutChunkInput;
	};

	export type ChunkCreateOrConnectWithoutDumpInput = {
		where: ChunkWhereUniqueInput;
		create: XOR<
			ChunkCreateWithoutDumpInput,
			ChunkUncheckedCreateWithoutDumpInput
		>;
	};

	export type ChunkCreateManyDumpInputEnvelope = {
		data: ChunkCreateManyDumpInput | ChunkCreateManyDumpInput[];
		skipDuplicates?: boolean;
	};

	export type ChunkUpsertWithWhereUniqueWithoutDumpInput = {
		where: ChunkWhereUniqueInput;
		update: XOR<
			ChunkUpdateWithoutDumpInput,
			ChunkUncheckedUpdateWithoutDumpInput
		>;
		create: XOR<
			ChunkCreateWithoutDumpInput,
			ChunkUncheckedCreateWithoutDumpInput
		>;
	};

	export type ChunkUpdateWithWhereUniqueWithoutDumpInput = {
		where: ChunkWhereUniqueInput;
		data: XOR<
			ChunkUpdateWithoutDumpInput,
			ChunkUncheckedUpdateWithoutDumpInput
		>;
	};

	export type ChunkUpdateManyWithWhereWithoutDumpInput = {
		where: ChunkScalarWhereInput;
		data: XOR<
			ChunkUpdateManyMutationInput,
			ChunkUncheckedUpdateManyWithoutDumpInput
		>;
	};

	export type ChunkScalarWhereInput = {
		AND?: ChunkScalarWhereInput | ChunkScalarWhereInput[];
		OR?: ChunkScalarWhereInput[];
		NOT?: ChunkScalarWhereInput | ChunkScalarWhereInput[];
		id?: StringFilter<"Chunk"> | string;
		dumpId?: StringFilter<"Chunk"> | string;
		content?: StringFilter<"Chunk"> | string;
		order?: IntFilter<"Chunk"> | number;
		createdAt?: DateTimeFilter<"Chunk"> | Date | string;
	};

	export type DumpCreateWithoutChunksInput = {
		id?: string;
		content: string;
		createdAt?: Date | string;
	};

	export type DumpUncheckedCreateWithoutChunksInput = {
		id?: string;
		content: string;
		createdAt?: Date | string;
	};

	export type DumpCreateOrConnectWithoutChunksInput = {
		where: DumpWhereUniqueInput;
		create: XOR<
			DumpCreateWithoutChunksInput,
			DumpUncheckedCreateWithoutChunksInput
		>;
	};

	export type DumpUpsertWithoutChunksInput = {
		update: XOR<
			DumpUpdateWithoutChunksInput,
			DumpUncheckedUpdateWithoutChunksInput
		>;
		create: XOR<
			DumpCreateWithoutChunksInput,
			DumpUncheckedCreateWithoutChunksInput
		>;
		where?: DumpWhereInput;
	};

	export type DumpUpdateToOneWithWhereWithoutChunksInput = {
		where?: DumpWhereInput;
		data: XOR<
			DumpUpdateWithoutChunksInput,
			DumpUncheckedUpdateWithoutChunksInput
		>;
	};

	export type DumpUpdateWithoutChunksInput = {
		id?: StringFieldUpdateOperationsInput | string;
		content?: StringFieldUpdateOperationsInput | string;
		createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
	};

	export type DumpUncheckedUpdateWithoutChunksInput = {
		id?: StringFieldUpdateOperationsInput | string;
		content?: StringFieldUpdateOperationsInput | string;
		createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
	};

	export type EmbeddingUpdateToOneWithWhereWithoutChunkInput = {
		where?: EmbeddingWhereInput;
		data: XOR<
			EmbeddingUpdateWithoutChunkInput,
			EmbeddingUncheckedUpdateWithoutChunkInput
		>;
	};

	export type EmbeddingUpdateWithoutChunkInput = {
		id?: StringFieldUpdateOperationsInput | string;
		createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
	};

	export type EmbeddingUncheckedUpdateWithoutChunkInput = {
		id?: StringFieldUpdateOperationsInput | string;
		createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
	};

	export type ChunkCreateWithoutEmbeddingInput = {
		id?: string;
		content: string;
		order: number;
		createdAt?: Date | string;
		dump: DumpCreateNestedOneWithoutChunksInput;
	};

	export type ChunkUncheckedCreateWithoutEmbeddingInput = {
		id?: string;
		dumpId: string;
		content: string;
		order: number;
		createdAt?: Date | string;
	};

	export type ChunkCreateOrConnectWithoutEmbeddingInput = {
		where: ChunkWhereUniqueInput;
		create: XOR<
			ChunkCreateWithoutEmbeddingInput,
			ChunkUncheckedCreateWithoutEmbeddingInput
		>;
	};

	export type ChunkUpsertWithoutEmbeddingInput = {
		update: XOR<
			ChunkUpdateWithoutEmbeddingInput,
			ChunkUncheckedUpdateWithoutEmbeddingInput
		>;
		create: XOR<
			ChunkCreateWithoutEmbeddingInput,
			ChunkUncheckedCreateWithoutEmbeddingInput
		>;
		where?: ChunkWhereInput;
	};

	export type ChunkUpdateToOneWithWhereWithoutEmbeddingInput = {
		where?: ChunkWhereInput;
		data: XOR<
			ChunkUpdateWithoutEmbeddingInput,
			ChunkUncheckedUpdateWithoutEmbeddingInput
		>;
	};

	export type ChunkUpdateWithoutEmbeddingInput = {
		id?: StringFieldUpdateOperationsInput | string;
		content?: StringFieldUpdateOperationsInput | string;
		order?: IntFieldUpdateOperationsInput | number;
		createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
		dump?: DumpUpdateOneRequiredWithoutChunksNestedInput;
	};

	export type ChunkUncheckedUpdateWithoutEmbeddingInput = {
		id?: StringFieldUpdateOperationsInput | string;
		dumpId?: StringFieldUpdateOperationsInput | string;
		content?: StringFieldUpdateOperationsInput | string;
		order?: IntFieldUpdateOperationsInput | number;
		createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
	};

	export type ChunkCreateManyDumpInput = {
		id?: string;
		content: string;
		order: number;
		createdAt?: Date | string;
	};

	export type ChunkUpdateWithoutDumpInput = {
		id?: StringFieldUpdateOperationsInput | string;
		content?: StringFieldUpdateOperationsInput | string;
		order?: IntFieldUpdateOperationsInput | number;
		createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
		embedding?: EmbeddingUpdateOneWithoutChunkNestedInput;
	};

	export type ChunkUncheckedUpdateWithoutDumpInput = {
		id?: StringFieldUpdateOperationsInput | string;
		content?: StringFieldUpdateOperationsInput | string;
		order?: IntFieldUpdateOperationsInput | number;
		createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
		embedding?: EmbeddingUncheckedUpdateOneWithoutChunkNestedInput;
	};

	export type ChunkUncheckedUpdateManyWithoutDumpInput = {
		id?: StringFieldUpdateOperationsInput | string;
		content?: StringFieldUpdateOperationsInput | string;
		order?: IntFieldUpdateOperationsInput | number;
		createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
	};

	/**
	 * Batch Payload for updateMany & deleteMany & createMany
	 */

	export type BatchPayload = {
		count: number;
	};

	/**
	 * DMMF
	 */
	export const dmmf: runtime.BaseDMMF;
}
