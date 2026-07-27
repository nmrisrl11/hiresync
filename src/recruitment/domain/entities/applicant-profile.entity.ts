import { AggregateRoot } from "@/shared/core";
import { ApplicantProfileCreatedDomainEvent, ApplicantProfileUpdatedDomainEvent } from "../events";
import { ApplicantId } from "../value-objects";

export class ApplicantProfile extends AggregateRoot {
	constructor(
		public readonly id: ApplicantId,
		public readonly userId: string,
		public firstName: string,
		public lastName: string,
		public headline: string | null,
		public bio: string | null,
		public readonly createdAt: Date,
		public updatedAt: Date,
	) {
		super();
	}

	public static create(
		id: ApplicantId,
		userId: string,
		firstName: string,
		lastName: string,
		headline: string | null = null,
		bio: string | null = null,
	): ApplicantProfile {
		const now = new Date();

		const profile = new ApplicantProfile(id, userId, firstName, lastName, headline, bio, now, now);

		profile.addDomainEvent(
			new ApplicantProfileCreatedDomainEvent(id.getValue(), firstName, lastName),
		);

		return profile;
	}

	public updateProfile(
		firstName: string,
		lastName: string,
		headline: string | null,
		bio: string | null,
	): void {
		this.firstName = firstName;
		this.lastName = lastName;
		this.headline = headline;
		this.bio = bio;
		this.updatedAt = new Date();

		this.addDomainEvent(new ApplicantProfileUpdatedDomainEvent(this.id.getValue()));
	}
}
