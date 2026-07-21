import { EMPLOYMENT_TYPE, JOB_STATUS, LOCATION_TYPE } from "@/recruitment/domain/types";
import { Public } from "@/shared/presentation/decorators/public.decorator";
import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("Recruitment")
@Controller("recruitments/constants")
export class RecruitmentConstantsController {
	@Public()
	@Get("jobs")
	@ApiOperation({ summary: "Get job listing constants for dropdowns and filters." })
	public getJobConstants() {
		return {
			employmentTypes: Object.values(EMPLOYMENT_TYPE),
			locationTypes: Object.values(LOCATION_TYPE),
			jobStatuses: Object.values(JOB_STATUS),
		};
	}
}
