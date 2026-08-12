import { AggregateRoot } from "@/shared/core";
import {
	CompanyLogoRemovedDomainEvent,
	CompanyLogoUploadedDomainEvent,
	EmployerProfileCreatedDomainEvent,
	EmployerProfileUpdatedDomainEvent,
} from "../events/employers";
import { CompanyWebsite, EmployerId } from "../value-objects";

export class EmployerProfile extends AggregateRoot {
	constructor(
		public readonly id: EmployerId,
		public readonly userId: string,
		public companyName: string,
		public description: string,
		public website: CompanyWebsite | null,
		public logoUrl: string | null,
		public industry: string | null,
		public readonly createdAt: Date,
		public updatedAt: Date,
	) {
		super();
	}

	public static create(
		id: EmployerId,
		userId: string,
		companyName: string,
		description: string,
		website: CompanyWebsite | null,
		logoUrl: string | null = null,
		industry: string | null = null,
	): EmployerProfile {
		const now = new Date();

		const profile = new EmployerProfile(
			id,
			userId,
			companyName,
			description,
			website,
			logoUrl,
			industry,
			now,
			now,
		);

		profile.addDomainEvent(new EmployerProfileCreatedDomainEvent(id.getValue(), companyName));

		return profile;
	}

	public updateProfile(
		companyName: string,
		description: string,
		website: CompanyWebsite | null,
		industry: string | null,
	): void {
		this.companyName = companyName;
		this.description = description;
		this.website = website;
		this.industry = industry;
		this.updatedAt = new Date();

		this.addDomainEvent(
			new EmployerProfileUpdatedDomainEvent(this.id.getValue(), this.companyName),
		);
	}

	public updateLogo(logoUrl: string | null): void {
		this.logoUrl = logoUrl;
		this.updatedAt = new Date();

		if (logoUrl) {
			this.addDomainEvent(new CompanyLogoUploadedDomainEvent(this.id.getValue(), logoUrl));
		} else {
			this.addDomainEvent(new CompanyLogoRemovedDomainEvent(this.id.getValue()));
		}
	}
}
