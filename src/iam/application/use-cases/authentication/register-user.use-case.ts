import { User } from "@/iam/domain/entities";
import { RoleRepository, UserRepository } from "@/iam/domain/repositories";
import { Email, RoleCode } from "@/iam/domain/value-objects";
import { DomainEventDispatcherPort, IdGeneratorPort } from "@/shared/application/ports/outbound";
import { Injectable } from "@nestjs/common";
import {
	RoleNotFoundException,
	UnauthorizedRoleException,
	UserAlreadyExistsException,
} from "../../exceptions";
import {
	RegisterUserCommand,
	RegisterUserResult,
	RegisterUserUseCasePort,
} from "../../ports/inbound/authentication";
import {
	AuthConfigPort,
	HashServicePort,
	TimeFormatterPort,
	VerificationTokenGeneratorPort,
} from "../../ports/outbound";

@Injectable()
export class RegisterUserUseCase implements RegisterUserUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly roleRepository: RoleRepository,
		private readonly hashService: HashServicePort,
		private readonly idGenerator: IdGeneratorPort,
		private readonly verificationTokenGenerator: VerificationTokenGeneratorPort,
		private readonly timeFormatter: TimeFormatterPort,
		private readonly authConfig: AuthConfigPort,
		private readonly eventDispatcher: DomainEventDispatcherPort,
	) {}

	public async execute(command: RegisterUserCommand): Promise<RegisterUserResult> {
		const emailVo = new Email(command.email);

		const existingUser = await this.userRepository.findByEmail(emailVo);
		if (existingUser) throw new UserAlreadyExistsException();

		const roleVo = new RoleCode(command.roleCode);
		const role = await this.roleRepository.findByCode(roleVo);
		if (!role) throw new RoleNotFoundException();

		if (role.isAdmin()) throw new UnauthorizedRoleException();

		const passwordHash = await this.hashService.hash(command.password, 12);

		const verificationToken = this.verificationTokenGenerator.generateHexToken(32);

		const expiresInEnv = this.authConfig.getVerificationTokenExpiration();
		const tokenExpiresInMs = this.timeFormatter.parseToMilliseconds(expiresInEnv);

		const newUser = User.createForRegistration(
			this.idGenerator.generateId(),
			this.idGenerator.generateId(),
			command.email,
			command.name,
			role,
			passwordHash,
			verificationToken,
			tokenExpiresInMs,
		);

		await this.userRepository.save(newUser);

		await this.eventDispatcher.dispatchMultiple(newUser.domainEvents);
		newUser.clearEvents();

		return { userId: newUser.id.getValue() };
	}
}
