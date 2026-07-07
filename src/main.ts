import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { env } from "./env";
import cookieParser from "cookie-parser";
import { ValidationPipe } from "@nestjs/common";

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

	const port = env.PORT;
	await app.listen(port);

	console.log(`Application running on http://localhost:${port}/api`);
}
bootstrap();
