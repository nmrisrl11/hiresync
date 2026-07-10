import { TimeFormatterPort } from "@/iam/application/ports/outbound";
import { Injectable } from "@nestjs/common";
import ms, { StringValue } from "ms";

@Injectable()
export class MsTimeFormatterAdapter implements TimeFormatterPort {
	public parseToMilliseconds(timeString: StringValue): number {
		return ms(timeString);
	}

	public formatToHumanReadable(milliseconds: number): string {
		return ms(milliseconds, { long: true });
	}
}
