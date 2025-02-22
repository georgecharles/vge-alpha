import { Handler } from "@netlify/functions";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

const handler: Handler = async (event) => {
  const signature = event.headers["stripe-signature"]!;

  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body!,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    let userId: string | undefined;
    let tier: string = "free"; // Default tier

    if (stripeEvent.type === "checkout.session.completed") {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;
      userId = session.metadata?.userId;

      // Get subscription details
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
      );

      // Map Stripe price to subscription tier
      const priceId = subscription.items.data[0].price.id;
      if (priceId === "price_1QnikjCOhalwhG2QUgRtMAco") {
        tier = "premium";
      } else if (priceId === "price_1QnikPCOhalwhG2QVYfxwG5D") {
        tier = "pro";
      } else {
        tier = "basic";
      }
    } else if (
      stripeEvent.type === "customer.subscription.updated" ||
      stripeEvent.type === "customer.subscription.deleted"
    ) {
      const subscription = stripeEvent.data.object as Stripe.Subscription;
      userId = subscription.metadata?.userId;

      if (stripeEvent.type === "customer.subscription.updated") {
        // Map Stripe price to subscription tier
        const priceId = subscription.items.data[0].price.id;
        if (priceId === "price_1QnikjCOhalwhG2QUgRtMAco") {
          tier = "premium";
        } else if (priceId === "price_1QnikPCOhalwhG2QVYfxwG5D") {
          tier = "pro";
        } else {
          tier = "basic";
        }
      } else if (stripeEvent.type === "customer.subscription.deleted") {
        tier = "free"; // Downgrade to free tier
      }
    }

    if (userId) {
      let subscriptionStatus = "active";
      if (stripeEvent.type === "customer.subscription.deleted") {
        subscriptionStatus = "cancelled";
      }

      // Update user's subscription in Supabase
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_tier: tier,
          subscription_status: subscriptionStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error("Webhook error:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Webhook error" }),
    };
  }
};

export { handler };
