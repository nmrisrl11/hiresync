import { OmitType } from "@nestjs/swagger";
import { CreateJobListingRequestDto } from "./create-job-listing.request.dto";

export class EditJobListingRequestDto extends OmitType(CreateJobListingRequestDto, [
	"expiresAt",
] as const) {}
