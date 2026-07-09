import { JwtPayload } from "@/iam/application/ports/outbound/jwt.service.port";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

type RequestWithUser = Request & { user: JwtPayload };

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest<RequestWithUser>();

	return request.user;
});
