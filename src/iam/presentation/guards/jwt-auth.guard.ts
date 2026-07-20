import { env } from "@/env";
import { JwtPayload } from "@/shared/application/types";
import { IS_PUBLIC_KEY } from "@/shared/presentation/decorators/public.decorator";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly reflector: Reflector, //! To read metadata
	) {}

	private extractTokenFromHeader(request: Request): string | undefined {
		const authorization = request.headers.authorization;

		if (Array.isArray(authorization)) return undefined;

		const [type, token] = authorization?.split(" ") ?? [];

		return type === "Bearer" ? token : undefined;
	}

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		//! Secure by Default: Check if route is public by using @Public() decorator metadata
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(), //! Checks the speficic route (Example: Login method)
			context.getClass(), //! Checks the whole controller (Example: AuthController)
		]);

		if (isPublic) return true;

		const request = context.switchToHttp().getRequest<Request>();
		const token = this.extractTokenFromHeader(request);

		if (!token) throw new UnauthorizedException("Authentication token is missing.");

		try {
			const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
				secret: env.JWT_ACCESS_SECRET,
			});

			/**
			 *  Attach the validated payload to the request object.
			 *  When @CurrentUser() runs, it will find request.user.
			 *  Use Object.assign or bracket notation to bypass strict TS typing on the Express Request
			 */
			request["user"] = payload;
		} catch {
			throw new UnauthorizedException("Invalid or expired authentication token.");
		}

		return true;
	}
}
