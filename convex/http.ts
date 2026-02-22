import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { webhookVerify, webhookIncoming } from "./whatsapp/webhook";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/webhook",
  method: "GET",
  handler: webhookVerify,
});

http.route({
  path: "/webhook",
  method: "POST",
  handler: webhookIncoming,
});

export default http;
