import { Injectable } from "@nestjs/common";
import { DeleteAccountCommand, DeleteAccountUseCasePort } from "../../ports/inbound/account";
import { IamRepositoryPort } from "../../ports/outbound";
import { UserNotFoundException } from "../../exceptions";

@Injectable()
export class DeleteAccountUseCase implements DeleteAccountUseCasePort {
	constructor(private readonly iamRepository: IamRepositoryPort) {}

	public async execute(command: DeleteAccountCommand): Promise<void> {
		const user = await this.iamRepository.findById(command.userId);

		if (!user) throw new UserNotFoundException();

		await this.iamRepository.delete(command.userId);
	}
}
