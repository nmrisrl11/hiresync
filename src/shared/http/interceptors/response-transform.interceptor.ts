import { SuccessResponse } from "@/shared/types";
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Response } from "express";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { RESPONSE_MESSAGE_METADATA } from "../decorators";

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
	constructor(private readonly reflector: Reflector) {}

	public intercept(context: ExecutionContext, next: CallHandler): Observable<SuccessResponse<T>> {
		const ctx = context.switchToHttp();
		const response = ctx.getResponse<Response>();
		const statusCode = response.statusCode;

		// Read the custom message set by @ApiSuccessResponse or @ApiMessageResponse
		const customMessage = this.reflector.get<string>(
			RESPONSE_MESSAGE_METADATA,
			context.getHandler(),
		);

		return next.handle().pipe(
			//! Strictly type resData as unknown and use type guards
			map((resData: unknown) => {
				const isObject = typeof resData === "object" && resData !== null;
				const objData = isObject ? (resData as Record<string, unknown>) : null;

				// If the controller already returned our exact format, pass it through safely
				if (objData && "statusCode" in objData && "timestamp" in objData) {
					return resData as SuccessResponse<T>;
				}

				// Safely check for an explicit message
				const hasExplicitMessage = objData !== null && "message" in objData;

				// Priority: 1. Controller Object Message, 2. Decorator Metadata, 3. Default
				const message =
					hasExplicitMessage && typeof objData.message === "string"
						? objData.message
						: customMessage || "Request successful";

				// Safely extract data
				let data: unknown = null;
				if (resData !== undefined && resData !== null) {
					if (objData && hasExplicitMessage && "data" in objData) {
						data = objData.data;
					} else if (objData && hasExplicitMessage && Object.keys(objData).length === 1) {
						data = null; // Only a message was returned
					} else {
						data = resData; // The whole payload is the data
					}
				}

				return {
					statusCode,
					message,
					data: data as T | null,
					timestamp: new Date().toISOString(),
				};
			}),
		);
	}
}
