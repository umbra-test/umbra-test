/**
 * The type-safe map of all event names to their payloads.
 *
 * TODO: Move this to function signatures.
 */
export interface EventMap {
	/**
	 * Fired before the file source for the test changes.
	 *
	 * @param path - The absolute path of the next file containing the next function to be executed.
	 */
	"activeFileChanged": [string];
	/**
	 * Fired before every test is evaluated.
	 *
	 * @param title - The title of the test being evaluated.
	 */
	"beforeTest": [string];
	/**
	 * Fired before a test has successfully completed. Enables tooling to change succeeding tests into failures
	 * via returning a Promise or throwing an error.
	 *
	 * @param title - The title of the test having been evaluated.
	 */
	"beforeTestSuccess": [string];
	/**
	 * Fired after a test has completed successfully. This will be fired in addition to "afterTest".
	 *
	 * @param title - The title for the test having been evaluated.
	 * @param elapsedMs - The amount of time it took the test to be evaluated.
	 */
	"testSuccess": [string, number];
	/**
	 * Fired after a test has failed. This will be fired in addition to "afterTest".
	 *
	 * @param title - The title of the test being evaluated.
	 * @param error - The error which resulted in the test failing.
	 * @param elapsedMs - The amount of time it took the test to be evaluated.
	 */
	"testFail": [string, Error, number];
	/**
	 * Fired after a test has timed out. This will be fired in addition to "afterTest"
	 *
	 * @param title - The title of the test being evaluated.
	 * @param elapsedMs - The amount of time it took the test to be evaluated.
	 * @param timeoutMs - The timeout value for this specific test.
	 */
	"testTimeout": [string, number, number];
	/**
	 * Fired after a test has been skipped. This will be fired in addition to "afterTest"
	 *
	 * @param title - The title of the test that was skipped.
	 */
	"testSkipped": [string];
	/**
	 * Fired before a describe block is evaluated.
	 *
	 * @param title -- The title of the describe block being evaluated.
	 */
	"beforeDescribe": [string];
	/**
	 * Fired after all tests in a describe block have been evaluated.
	 *
	 * @param title - The title of the describe block having been evaluated.
	 * @param elapsedMs - The amount of time it took for the describe block to be fully evaluated, including any tests,
	 *                     setup, and before/beforeEach/after/afterEach.
	 */
	"afterDescribe": [string, number];
}
export interface TestInfo {
	callback: () => void | Promise<any>;
	title: string;
	timeoutMs?: number;
}
/**
 * Results from the end of the test run. These results only include the tests that have been evaluated; if `only` or
 * `cancel()` is used then the skipped tests are not included in the total test count.
 */
export interface RunResults {
	/**
	 * The total elapsed time for the test run.
	 */
	elapsedTimeMs: number;
	/**
	 * The total number of tests evaluated.
	 */
	totalTests: number;
	/**
	 * The total number of successful tests.
	 */
	totalSuccesses: number;
	/**
	 * The total number of test failures.
	 */
	totalFailures: number;
	/**
	 * The total number of test timeouts.
	 */
	totalTimeouts: number;
	/**
	 * A list of information for each and every test failure.
	 */
	failureInfo: {
		/**
		 * The chain of describes leading to the test itself.
		 */
		describeChain: string[];
		/**
		 * The title of the test. This is not guaranteed to be unique.
		 */
		title: string;
		/**
		 * The error which caused this test to fail.
		 */
		error: Error;
	}[];
	/**
	 * A list of information for each and every test failure.
	 */
	timeoutInfo: {
		/**
		 * The chain of describes leading to the test itself.
		 */
		describeChain: string[];
		/**
		 * The title of the test. This is not guaranteed to be unique.
		 */
		title: string;
		/**
		 * The amount of time it took for the test to timeout. This may be greater than timeoutMs due to the
		 * single-threaded nature of many long-running tests.
		 */
		elapsedMs: number;
		/**
		 * The timeout value set for thie test itself.
		 */
		timeoutMs: number;
	}[];
}
/**
 * Async-method-specific timeout config. These timeout values are applied to each named method accordingly.
 */
export interface TimeoutConfig {
	it?: number;
	before?: number;
	beforeEach?: number;
	after?: number;
	afterEach?: number;
}
/**
 * Configuration to be set by the user for an instance of an Umbra Test Runner.
 */
export interface TestRunnerConfig {
	/**
	 * The amount of time to wait until cancelling a long-running test. If a single value is given, this timeout is
	 * applied to all asynchronous execution (it, before, beforeEach, after, afterEach).
	 *
	 * Alternatively, an object may be used to set these individually.
	 */
	timeoutMs?: number | TimeoutConfig;
	/**
	 * Whether test execution should stop on the first seen failure. Defaults to false.
	 */
	stopOnFirstFail?: boolean;
}
/**
 * A set of options which can be passed into individual `it` blocks, overriding the behavior for the individual test.
 */
export interface ItOptions {
	/**
	 * The amount of time (in milliseconds) to wait before considering this test a timeout failure. This option
	 * overwrites any option defined by the user either via constructor or other defaults.
	 */
	timeoutMs: number;
}
export declare type EventArgs<EventMap, Event extends keyof EventMap> = EventMap[Event] extends any[] ? EventMap[Event] : [EventMap[Event]];
export declare type EventCallback<EventMap, Event extends keyof EventMap> = (...args: EventArgs<EventMap, Event>) => void;
declare class SimpleEventEmitter<EventMap> {
	private readonly onListeners;
	private readonly onceListeners;
	on<Event extends keyof EventMap>(event: Event, callback: EventCallback<EventMap, Event>): void;
	once<Event extends keyof EventMap>(event: Event, callback: EventCallback<EventMap, Event>): void;
	off<Event extends keyof EventMap>(event: Event, callback: EventCallback<EventMap, Event>): void;
	emit<Event extends keyof EventMap>(event: Event, ...args: EventArgs<EventMap, Event>): void;
	/**
	 * Evaluates each function synchronously, but waits for all to asynchronously complete before returning.
	 *
	 * TODO: Find a better name for this.
	 *
	 * @param event - The event to emit.
	 * @param args - All args to be emitted for the event.
	 */
	emitAndWaitForCompletion<Event extends keyof EventMap>(event: Event, ...args: EventArgs<EventMap, Event>): Promise<void>;
}
export interface ItWithSubMethods {
	(title: string, execBlock: (done?: (result?: Error | any) => void) => Promise<Error | any> | any, options?: Partial<ItOptions>): void;
	only(title: string, execBlock: (done?: (result?: Error | any) => void) => Promise<Error | any> | any, options?: Partial<ItOptions>): any;
	skip(title: string, execBlock: (done?: (result?: Error | any) => void) => Promise<Error | any> | any, options?: Partial<ItOptions>): any;
}
export interface DescribeWithSubMethods {
	(title: string, execBlock: (done?: (result?: Error | any) => void) => Promise<Error | any> | any): void;
	only(title: string, execBlock: (done?: (result?: Error | any) => void) => Promise<Error | any> | any): any;
	skip(title: string, execBlock: (done?: (result?: Error | any) => void) => Promise<Error | any> | any, options?: Partial<ItOptions>): any;
}
/**
 * before -> beforeEach -> beforeHook -> it -> afterHook -> afterEach -> after
 */
export declare class TestRunner {
	private readonly asyncPromisifier;
	private readonly timeoutPromisifier;
	private readonly eventEmitter;
	private readonly config;
	private testQueueStack;
	private queueStacks;
	private currentTest;
	private testRunCancelled;
	private currentlyExecutingFilePath;
	private lastFilePathSet;
	private currentRun;
	private runResults;
	constructor(config?: TestRunnerConfig, eventEmitter?: SimpleEventEmitter<EventMap>);
	/**
	 * Sets the current file name for all subsequent calls to describe/it/etc. This is used for logging where tests
	 * are sourced from.
	 */
	setCurrentFile(absolutePath: string): void;
	on<Event extends keyof EventMap>(event: Event, callback: EventCallback<EventMap, Event>): void;
	once<Event extends keyof EventMap>(event: Event, callback: EventCallback<EventMap, Event>): void;
	off<Event extends keyof EventMap>(event: Event, callback: EventCallback<EventMap, Event>): void;
	readonly describe: DescribeWithSubMethods;
	private describeOnly;
	private describeSkip;
	readonly it: ItWithSubMethods;
	private itOnly;
	private itSkip;
	before(execBlock: (done?: (result?: Error | any) => void) => Promise<Error | any> | any): void;
	beforeEach(execBlock: (done?: (result?: Error | any) => void) => Promise<Error | any> | any): void;
	after(execBlock: (done?: (result?: Error | any) => void) => Promise<Error | any> | any): void;
	afterEach(execBlock: (done?: (result?: Error | any) => void) => Promise<Error | any> | any): void;
	/**
	 * Triggers a test run based on the describes and its added previously.
	 *
	 * If a test is already in progress, an error will be returned.
	 */
	run(): Promise<RunResults>;
	/**
	 * If a test is in progress, the current information for the test will be returned.
	 *
	 * If not, an error will be thrown.
	 */
	getCurrentTestInfo(): TestInfo;
	/**
	 * Resets all pending state, including all attached before, beforeEach, after, afterEach, tests, describes, etc.
	 *
	 * If a test run is already in progress, an error will be thrown.
	 */
	reset(): void;
	cancel(): Promise<RunResults>;
	private pushToCurrentTestQueue;
	private runNextTestQueue;
	private executeTest;
	private evaluateDescribe;
	private evaluateTest;
	private executeTestCallback;
	private evaluateQueueWithTimeout;
	private evaluateQueue;
	private getTimeoutValue;
	private throwIfTestInProgress;
	private resetRunResults;
}
export declare type ExtractArrayType<T> = T extends any[] ? T[number] : T extends object ? Partial<T> : T;
export declare class Assert {
	static that<T>(output: boolean): void;
	static equal(expected: any, actual: any, message?: string): void;
	static notEqual(expected: any, actual: any, message?: string): void;
	static looseEqual(actual: any, expected: any, message?: string): void;
	static notLooseEqual(actual: any, expected: any, message?: string): void;
	static strictEqual<T>(actual: T, expected: T, message?: string): void;
	static notStrictEqual<T>(actual: T, expected: T, message?: string): void;
	static is(actual: any, expected: any, message?: string): void;
	static has<T, U>(target: T, keyPath: string, expected: U, message?: string): void;
	static regexMatches(actual: string, expected: RegExp, message?: string): void;
	static resolvesTo<T>(actual: Promise<T>, expected: T, message?: string): Promise<void>;
	static rejects<T>(actual: Promise<T>, expected?: Error | string, message?: string): Promise<void>;
	static fail(message?: string): void;
	static isTrue(value: boolean, message?: string): void;
	static isFalse(value: boolean, message?: string): void;
	static isTruthy(value: any, message?: string): void;
	static isFalsy(value: any, message?: string): void;
	static exists<T>(expected: T | null | undefined, message?: string): expected is T;
	static contains<T extends any[] | string | any>(target: T, value: ExtractArrayType<T>, message?: string): void;
	static containsAll<T>(target: T[], values: T[], message?: string): void;
}
declare global {
	const it: TestRunner["it"];
	const describe: TestRunner["describe"];
	const after: TestRunner["after"];
	const afterEach: TestRunner["afterEach"];
	const before: TestRunner["before"];
	const beforeEach: TestRunner["beforeEach"];
	const __testRunner: TestRunner;
}
export declare function any<T>(): T;
export declare function gt<T extends number>(value: T): T;
export declare function lt<T extends number>(value: T): T;
export declare function gte<T extends number>(value: T): T;
export declare function lte<T extends number>(value: T): T;
export declare function eq<T>(value: T): T;
export declare function startsWith(value: string): string;
export declare function regexMatches(value: RegExp): string;
export declare function matcher<T>(func: (arg: T) => boolean): T;
export interface ArgumentValidator<T> {
	precedence?: number;
	matches(arg: T): boolean;
	description(): string;
	equals(otherValidator: ArgumentValidator<any>): boolean;
}
export interface CaptureInternalInterface<T> extends ArgumentValidator<T> {
	first: T | null;
	last: T | null;
	all: T[];
}
export declare type Capture<T> = CaptureInternalInterface<T> & T;
export declare function newCapture<T>(): Capture<T>;
export declare type UnwrapPromise<T extends Promise<any>> = T extends Promise<infer P> ? P : never;
export interface OngoingStubbing<F extends MockableFunction> {
	withArgs(...args: Parameters<F>): OngoingStubbing<F>;
	andReturn(...values: ReturnType<F>[]): OngoingStubbing<F>;
	andStubReturn(...values: ReturnType<F>[]): void;
	andThrow(...error: Error[]): OngoingStubbing<F>;
	andResolve(...values: UnwrapPromise<ReturnType<F>>[]): OngoingStubbing<F>;
	andReject(...values: Error[]): OngoingStubbing<F>;
	andCallRealMethod(): OngoingStubbing<F>;
	andAnswer(answer: Answer<F>): OngoingStubbing<F>;
	times(wantedNumberOfInvocations: number): OngoingStubbing<F>;
	atLeast(atLeastInvocations: number): OngoingStubbing<F>;
	atMost(atMostInvocations: number): OngoingStubbing<F>;
	once(): OngoingStubbing<F>;
	twice(): OngoingStubbing<F>;
}
export declare type Answer<F extends MockableFunction> = (...args: Parameters<F>) => ReturnType<F>;
export declare type MockableFunction = (...args: any[]) => any;
declare enum StrictnessMode {
	Strict = 0,
	Loose = 1
}
export interface MockOptions {
	strictMode: StrictnessMode;
	inOrder: boolean;
}
export declare type ClassConstructor<T> = (new (...args: any[]) => T) | (new () => T);
export declare function setDefaultOptions(options: Partial<MockOptions>): void;
export declare function mock<T>(object?: ClassConstructor<T>, mockName?: string): T;
export declare function mock<T extends object>(mockName: string): T;
export declare function spy<T extends object>(realObject: T, options?: MockOptions): T;
export declare function expect<F extends MockableFunction>(mockedFunction: F): OngoingStubbing<F>;
export declare function inOrder(...stubs: OngoingStubbing<any>[]): void;
export declare function verify(...mocks: any[]): void;

export {};
