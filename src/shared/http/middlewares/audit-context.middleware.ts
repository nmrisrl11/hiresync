import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { auditContextStorage } from "../context";

@Injectable()
export class AuditContextMiddleware implements NestMiddleware {
	public use(req: Request, res: Response, next: NextFunction): void {
		const ipAddress = (req.headers["x-forwarded-for"] as string) || req.ip;
		const userAgent = req.headers["user-agent"];

		const auditContext = {
			ipAddress: ipAddress ? ipAddress.split(",")[0].trim() : undefined,
			userAgent: userAgent,
		};

		//! Run the entire downward execution pipeline inside this isolated context
		auditContextStorage.run(auditContext, () => {
			next();
		});
	}
}
