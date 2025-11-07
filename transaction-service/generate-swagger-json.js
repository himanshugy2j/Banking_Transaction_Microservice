import fs from "fs";
import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Banking Transaction Service API",
      version: "1.0.0",
      description: "API documentation for the Transaction Microservice (includes customer, account, and transaction endpoints)",
    },
  },
  apis: ["./src/routes/*.js"], // adjust path to your route files
};

const swaggerSpec = swaggerJSDoc(options);

fs.writeFileSync("./swagger-output.json", JSON.stringify(swaggerSpec, null, 2));
console.log("✅ Swagger spec exported to swagger-output.json");
