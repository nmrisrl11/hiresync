import { OmitType } from "@nestjs/swagger";
import { CreateJobListingDto } from "./create-job-listing.dto";

export class EditJobListingDto extends OmitType(CreateJobListingDto, ["expiresAt"] as const) {}
