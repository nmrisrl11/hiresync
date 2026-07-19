export class SalaryRange {
	constructor(
		public readonly min: number,
		public readonly max: number,
		public readonly currency: string = "USD",
	) {
		if (min < 0 || max < 0) {
			throw new Error("Salary cannot be negative.");
		}
		if (min > max) {
			throw new Error("Minimum salary cannot be greater than maximum salary.");
		}
	}
}
