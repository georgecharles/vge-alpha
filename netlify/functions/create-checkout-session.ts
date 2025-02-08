import { Handler } from "@netlify/functions";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const { priceId, userId } = JSON.parse(event.body || "{}");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `https://clever-chaplygin6-vbfae.dev.tempolabs.ai/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://clever-chaplygin6-vbfae.dev.tempolabs.ai/subscription/cancel`,
      customer_email: userId,
      metadata: {
        userId,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (error) {
    console.error("Error creating checkout session:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to create checkout session" }),
    };
  }
};

export { handler };
