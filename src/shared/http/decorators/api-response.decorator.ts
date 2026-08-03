import { applyDecorators, Type } from "@nestjs/common";
import { ApiExtraModels, ApiResponse, getSchemaPath } from "@nestjs/swagger";

//! Wraps a DTO inside the standardized SuccessResponse envelope
export const ApiSuccessResponse = <TModel extends Type<unknown>>(
	model: TModel,
	statusCode: number = 200,
	description: string = "Request successful",
) => {
	return applyDecorators(
		ApiExtraModels(model),
		ApiResponse({
			status: statusCode,
			description,
			schema: {
				type: "object",
				properties: {
					statusCode: { type: "number", example: statusCode },
					message: { type: "string", example: description },
					data: {
						$ref: getSchemaPath(model),
					},
					timestamp: { type: "string", format: "date-time", example: "2026-08-03T05:05:24.000Z" },
				},
			},
		}),
	);
};

//! Defines a standard success envelope where NO data is returned (data is null)
//! Ideal for DELETE requests or action triggers (e.g., password changes, sending emails)
export const ApiMessageResponse = (
	statusCode: number = 200,
	description: string = "Action completed successfully",
) => {
	return applyDecorators(
		ApiResponse({
			status: statusCode,
			description,
			schema: {
				type: "object",
				properties: {
					statusCode: { type: "number", example: statusCode },
					message: { type: "string", example: description },
					data: { enum: ["null"], example: null },
					timestamp: { type: "string", format: "date-time", example: "2026-08-03T05:05:24.000Z" },
				},
			},
		}),
	);
};

//! Standardized Error Response envelope for Swagger documentation
export const ApiErrorResponse = (
	statusCode: number = 400,
	description: string = "Bad Request",
	errorName: string = "BadRequestException",
) => {
	return applyDecorators(
		ApiResponse({
			status: statusCode,
			description,
			schema: {
				type: "object",
				properties: {
					statusCode: { type: "number", example: statusCode },
					message: {
						oneOf: [
							{ type: "string", example: description },
							{ type: "array", items: { type: "string" }, example: [description] },
						],
					},
					error: { type: "string", example: errorName },
					path: { type: "string", example: "/api/path/to/endpoint" },
					timestamp: { type: "string", format: "date-time", example: "2026-08-03T05:05:24.000Z" },
				},
			},
		}),
	);
};
