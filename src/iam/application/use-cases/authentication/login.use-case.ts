import { Session } from "@/iam/domain/entities";
import { UserRepository } from "@/iam/domain/repositories";
import { Email, SessionId } from "@/iam/domain/value-objects";
import { IdGeneratorPort } from "@/shared/utils/ports";
import { Injectable } from "@nestjs/common";
import {
	AccountLockedException,
	AccountPendingDeletionException,
	InvalidLoginException,
} from "../../exceptions";
import { LoginCommand, LoginResult, LoginUseCasePort } from "../../ports/inbound/authentication";
import {
	EnvConfigPort,
	HashServicePort,
	JwtServicePort,
	TimeFormatterPort,
} from "../../ports/outbound";

@Injectable()
export class LoginUseCase implements LoginUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly jwtService: JwtServicePort,
		private readonly hashService: HashServicePort,
		private readonly idGenerator: IdGeneratorPort,
		private readonly envConfig: EnvConfigPort,
		private readonly timeFormatter: TimeFormatterPort,
	) {}

	public async execute(command: LoginCommand): Promise<LoginResult> {
		const emailVo = new Email(command.email);

		const user = await this.userRepository.findByEmail(emailVo);

		if (!user || !user.account) throw new InvalidLoginException();

		//! If the account is locked, throw an exception with the lockout duration
		if (user.account.isLocked()) {
			const lockedUntil = user.account.getFailedLoginState().getLockedUntil()!;
			throw new AccountLockedException(lockedUntil);
		}

		const passwordMatch = await this.hashService.compare(
			command.password,
			user.account?.getPasswordHash(),
		);

		if (!passwordMatch) {
			//! Record the failed login attempt and save the user
			const maxLoginAttempts = this.envConfig.getMaxLoginAttempts();
			const lockOutDurationInEnv = this.envConfig.getAccountLockoutDuration();
			const lockOutDurationInMs = this.timeFormatter.parseToMilliseconds(lockOutDurationInEnv);

			user.account.handleFailedLogin(maxLoginAttempts, lockOutDurationInMs);

			await this.userRepository.save(user);
			throw new InvalidLoginException();
		}

		//! Clear failed attempts on successful login
		user.account.resetFailedLogins();

		//! Check for pending deletion
		const scheduledForDeletionDate = user.account.getScheduledForDeletionAt();
		if (scheduledForDeletionDate) {
			//! Save just in case resetFailedLogins mutated the state before hitting this block
			await this.userRepository.save(user);
			throw new AccountPendingDeletionException(scheduledForDeletionDate);
		}

		//! Check verification status
		if (!user.isVerified) {
			//! Save any reset states
			await this.userRepository.save(user);
			throw new InvalidLoginException("Please verify your email address before logging in.");
		}

		//! Generate session ID
		const sessionIdStr = this.idGenerator.generateId();

		//! Generate tokens and update session
		const tokens = await this.jwtService.generateTokens({
			sub: user.id.getValue(),
			email: user.email.getValue(),
			role: user.role.code.getValue(),
			sessionId: sessionIdStr,
		});

		const refreshTokenHash = await this.hashService.hash(tokens.refreshToken, 10);
		const expiresInEnv = this.envConfig.getRefreshTokenExpiration();
		const expiresInMs = this.timeFormatter.parseToMilliseconds(expiresInEnv);
		const expiresAt = new Date(Date.now() + expiresInMs);

		const session = new Session(
			new SessionId(sessionIdStr),
			user.id,
			refreshTokenHash,
			command.userAgent,
			command.ipAddress,
			false, // isRevoked
			new Date(), // lastActiveAt
			expiresAt,
			new Date(), // createdAt
		);

		user.addSession(session);
		await this.userRepository.save(user);

		return {
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
			user: {
				id: user.id.getValue(),
				email: user.email.getValue(),
				name: user.name,
				role: user.role.code.getValue(),
			},
		};
	}
}
