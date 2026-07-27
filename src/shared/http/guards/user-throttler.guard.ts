import { JwtPayload } from "@/shared/types";
import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { Request } from "express";

type RequestWithUser = Request & { user?: JwtPayload };

@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
	protected getTracker(req: Record<string, any>): Promise<string> {
		const request = req as unknown as RequestWithUser;

		//! If the user is authenticated, rate limit based on their strict User ID
		if (request.user?.sub) return Promise.resolve(request.user.sub);

		//! Fallback to IP address for public/unauthenticated routes
		const ip = request.ips?.length ? request.ips[0] : request.ip;

		return Promise.resolve(ip ?? "Unknown IP");
	}
}
