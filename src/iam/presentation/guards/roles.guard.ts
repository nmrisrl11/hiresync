import { JwtPayload } from "@/shared/application/types";
import { Role } from "@/shared/domain/types/role.type";
import { ROLES_KEY } from "@/shared/presentation/decorators/roles.decorator";
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
			context.getHandler(), //! Checks the speficic route
			context.getClass(), //! Checks the whole controller
		]);

		if (!requiredRoles || requiredRoles.length === 0) return true;

		const { user } = context.switchToHttp().getRequest<Request & { user: JwtPayload }>();

		if (!user || !user.role) throw new ForbiddenException("User has no role assigned.");

		const hasRole = requiredRoles.includes(user.role as Role);

		if (!hasRole)
			throw new ForbiddenException("You do not have permission to access this resource.");

		return true;
	}
}
