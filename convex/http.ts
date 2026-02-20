import { httpRouter } from "convex/server";
import { webhookVerify, webhookIncoming } from "./whatsapp/webhook";

const http = httpRouter();

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
