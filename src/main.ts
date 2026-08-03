import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { env } from "./env";
import { HttpExceptionFilter } from "./shared/http/filters";
import { ResponseTransformInterceptor } from "./shared/http/interceptors";

const isSwaggerEnabled = env.NODE_ENV === "development" || env.NODE_ENV === "test";
const PORT = env.PORT;

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.use(cookieParser()); //! Middleware that reads the Cookie header sent by the browser and converts it into an easy-to-use JavaScript object.

	app.setGlobalPrefix("api");

	//! Runs before the Controller Methods.
	app.useGlobalInterceptors(new ResponseTransformInterceptor());
	app.useGlobalFilters(new HttpExceptionFilter());
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true, //! Removes properties that are not defined in the DTO.
			forbidNonWhitelisted: true, //! Instead of silently removing extra properties, Nest throws an error.
			transform: true, //! Automatically converts incoming values into the types expected by DTO.
		}),
	);

	if (isSwaggerEnabled) {
		const config = new DocumentBuilder()
			.setTitle("HireSync API")
			.setDescription(
				"A modern hiring platform that connects employers with qualified talent through a seamless job posting and application experience. Designed to simplify recruitment, it enables companies to manage job openings while helping job seekers discover and apply for opportunities with ease.",
			)
			.setVersion("1.0")
			.addBearerAuth()
			.build();

		const document = SwaggerModule.createDocument(app, config);
		SwaggerModule.setup("api/docs", app, document);

		console.log(`Swagger docs at http://localhost:${PORT}/api/docs`);
	}

	await app.listen(PORT);

	console.log(`Application running on http://localhost:${PORT}/api`);
}
bootstrap();
