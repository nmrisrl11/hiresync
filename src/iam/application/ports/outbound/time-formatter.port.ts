export abstract class TimeFormatterPort {
	abstract parseToMilliseconds(timeString: string): number;
	abstract formatToHumanReadable(milliseconds: number): string;
}
