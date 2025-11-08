import fs from "fs";
import { sync as globSync } from "glob";
import swaggerJSDoc from "swagger-jsdoc";

const routeFiles = globSync("./src/routes/**/*.js");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Banking Transaction Service API",
      version: "1.0.0",
      description:
        "API documentation for the Transaction Microservice (includes customer, account, and transaction endpoints)",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: routeFiles,
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

fs.writeFileSync("./swagger-output.json", JSON.stringify(swaggerSpec, null, 2));
console.log("✅ Swagger spec generated: swagger-output.json");
