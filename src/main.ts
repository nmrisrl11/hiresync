import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { env } from "./env";
import cookieParser from "cookie-parser";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.use(cookieParser()); //! Middleware that reads the Cookie header sent by the browser and converts it into an easy-to-use JavaScript object.

	app.setGlobalPrefix("api");

	//! Runs before the Controller Methods.
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true, //! Removes properties that are not defined in the DTO.
			forbidNonWhitelisted: true, //! Instead of silently removing extra properties, Nest throws an error.
			transform: true, //! Automatically converts incoming values into the types expected by DTO.
		}),
	);

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

	const port = env.PORT;
	await app.listen(port);

	console.log(`Application running on http://localhost:${port}/api`);
	console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
