import { User } from "@/iam/domain/entities/user.entity";
import { Email } from "@/iam/domain/value-objects/email.value-object";
import { Injectable, Logger } from "@nestjs/common";
import {
	RoleNotFoundException,
	UserAlreadyExistsException,
} from "../exceptions/application.exception";
import {
	RegisterUserCommand,
	RegisterUserResult,
	RegisterUserUseCasePort,
} from "../ports/inbound/register-user.in-port";
import { HashPasswordServicePort } from "../ports/outbound/hash-password.service.port";
import { IamRepositoryPort } from "../ports/outbound/iam.repository.port";
import { IdGeneratorPort } from "../ports/outbound/id-generator.port";
import { VerificationTokenGeneratorPort } from "../ports/outbound/verification-token-generator.port";
import { EmailQueueServicePort } from "../ports/outbound/email-queue.service.port";

@Injectable()
export class RegisterUserUseCase implements RegisterUserUseCasePort {
	private readonly logger = new Logger(RegisterUserUseCase.name);

	constructor(
		private readonly iamRepository: IamRepositoryPort,
		private readonly hashPasswordService: HashPasswordServicePort,
		private readonly idGenerator: IdGeneratorPort,
		private readonly verificationTokenGenerator: VerificationTokenGeneratorPort,
		private readonly emailQueueService: EmailQueueServicePort,
	) {}

	public async execute(command: RegisterUserCommand): Promise<RegisterUserResult> {
		const emailVo = new Email(command.email);

		const existingUser = await this.iamRepository.findByEmail(emailVo);
		if (existingUser)
			throw new UserAlreadyExistsException("An account with this email already exists.");

		const role = await this.iamRepository.findRoleByCode(command.roleCode);
		if (!role) throw new RoleNotFoundException("Invalid role specified.");

		const passwordHash = await this.hashPasswordService.hashPassword(command.password);

		const verificationToken = this.verificationTokenGenerator.generateHexToken(32);

		const verificationTokenExpiresAt = 24 * 60 * 60 * 1000; // 24 hours from now

		const newUser = User.createForRegistration(
			this.idGenerator.generateId(),
			this.idGenerator.generateId(),
			command.email,
			command.name,
			role,
			passwordHash,
			verificationToken,
			verificationTokenExpiresAt,
		);

		await this.iamRepository.save(newUser);

		const emailQueued = await this.emailQueueService.enqueueVerificationEmail(
			newUser.email.getValue(),
			verificationToken,
		);

		if (!emailQueued) {
			this.logger.warn(`Failed to queue verification email for ${newUser.email.getValue()}`);
		}

		return { isEmailQueued: emailQueued };
	}
}
