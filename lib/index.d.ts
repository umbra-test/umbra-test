export interface TestInfo {
	callback: () => void | Promise<any>;
	describeTitleChain: string[];
	title: string;
	absoluteFilePath: string;
	skip: boolean;
	timeoutMs?: number;
}
/**
 * Results from an individual test. This will be fired for each and every test, including those which have failed.
 */
export interface TestResult {
	result: "success" | "fail" | "timeout" | "skipped";
	/**
	 * Information regarding the test case, including title, timeout values, and other metadata.
	 */
	testInfo: TestInfo;
	/**
	 * The amount of time it took the test case to fully run.
	 */
	elapsedMs: number;
	/**
	 * If the result is "fail", then this is the associated error.
	 */
	error?: Error;
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
	 * The total number of test failures. This does NOT include test timeouts.
	 */
	totalFailures: number;
	/**
	 * The total number of tests which failed due to timeout.
	 */
	totalTimeouts: number;
	/**
	 * A list of information for each and every test success.
	 */
	testResults: TestResult[];
}
/**
 * The type-safe map of all event names to their payloads.
 *
 * TODO: Move this to function signatures.
 */
export interface EventMap {
	/**
	 * Fired directly before a test has started.
	 *
	 * @param TestInfo
	 */
	"onTestStart": [TestInfo];
	/**
	 * Fired directly after a test has completed.
	 */
	"onTestEnd": [TestResult];
	/**
	 * Fired once all tests have been executed.
	 */
	"onRunEnd": [RunResults];
	/**
	 * Fired before a test has successfully completed. Enables tooling to change succeeding tests into failures
	 * via returning a Promise or throwing an error.
	 */
	"onBeforeTestEnd": [TestResult];
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
declare global {
	const it: TestRunner["it"];
	const describe: TestRunner["describe"];
	const after: TestRunner["after"];
	const afterEach: TestRunner["afterEach"];
	const before: TestRunner["before"];
	const beforeEach: TestRunner["beforeEach"];
	const __testRunner: TestRunner;
}
export declare type ExtractArrayType<T> = T extends any[] ? T[number] : T extends object ? Partial<T> : T;
export declare class assert {
	static that<T>(output: boolean): void;
	static equal<T>(expected: T, actual: T, message?: string): void;
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
	static matchesSnapshotFile(snapshot: any): void;
	static matchesSnapshotString(snapshot: any, snapshotString: string): void;
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
export declare type OngoingStubbing<T> = T extends never ? never : any extends T ? PromiseOnGoingStubbing<any, PromiseOnGoingStubbing<any, any>> : T extends (...args: any) => never ? BaseOngoingStubbing<T, BaseOngoingStubbing<T, any>> : T extends (...args: any) => infer R ? (any extends R ? PromiseOnGoingStubbing<T, PromiseOnGoingStubbing<T, any>> : R extends Promise<any> ? PromiseOnGoingStubbing<T, PromiseOnGoingStubbing<T, any>> : R extends void ? BaseOngoingStubbing<T, BaseOngoingStubbing<T, any>> : ReturnableOnGoingStubbing<T, ReturnableOnGoingStubbing<T, any>>) : PromiseOnGoingStubbing<any, PromiseOnGoingStubbing<any, any>>;
export interface PromiseOnGoingStubbing<F extends MockableFunction, G extends PromiseOnGoingStubbing<F, G>> extends ReturnableOnGoingStubbing<F, G> {
	andResolve(values: UnwrapPromise<ReturnType<F>>): G;
	andStubResolve(values: UnwrapPromise<ReturnType<F>>): void;
	andReject(values: Error): G;
	andStubReject(values: Error): void;
}
export interface ReturnableOnGoingStubbing<F extends MockableFunction, G extends ReturnableOnGoingStubbing<F, G>> extends BaseOngoingStubbing<F, G> {
	andReturn(values: ReturnType<F>): G;
	andStubReturn(values: ReturnType<F>): void;
}
export interface BaseOngoingStubbing<F extends MockableFunction, G extends BaseOngoingStubbing<F, G>> {
	withArgs(...args: Parameters<F>): G;
	andThrow(error: Error): G;
	andStubThrow(error: Error): void;
	andCallRealMethod(): G;
	andAnswer(answer: Answer<F>): G;
	andStubAnswer(answer: Answer<F>): void;
	times(wantedNumberOfInvocations: number): G;
	atLeast(atLeastInvocations: number): G;
	atMost(atMostInvocations: number): G;
	once(): G;
	twice(): G;
}
export declare type ClassConstructor<T> = (new (...args: any[]) => T) | (new () => T);
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
export declare function setDefaultOptions(options: Partial<MockOptions>): void;
export declare function mock<T>(object?: ClassConstructor<T>, mockName?: string): T;
export declare function mock<T extends object>(mockName: string): T;
export declare function staticMock<T extends object>(clazz?: T): T;
export declare function partialMock<T extends object>(realObject: T, mockName?: string | null, options?: MockOptions): T;
export declare function expect<F extends MockableFunction>(mockedFunction: F): OngoingStubbing<F>;
export declare function expect<C extends object, F extends MockableFunction>(mockedFunction: ClassConstructor<C>): ReturnableOnGoingStubbing<F, ReturnableOnGoingStubbing<F, any>>;
export declare function expect<F extends any>(data: F): OngoingStubbing<any>;
export declare function inOrder(...stubs: BaseOngoingStubbing<any, any>[]): void;
export declare function verify(...mocks: any[]): void;
export declare function reset(...mocks: any[]): void;

export {};
