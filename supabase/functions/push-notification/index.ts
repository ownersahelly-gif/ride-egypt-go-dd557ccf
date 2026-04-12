import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { type, record } = await req.json();

    // This function is designed to be called by a database webhook
    // when a new ride_message is inserted
    if (type === "INSERT" && record?.booking_id && record?.sender_id) {
      const bookingId = record.booking_id;
      const senderId = record.sender_id;

      // Get the booking to find the other party
      const { data: booking } = await supabase
        .from("bookings")
        .select("user_id, shuttle_id")
        .eq("id", bookingId)
        .single();

      if (!booking) {
        return new Response(
          JSON.stringify({ error: "Booking not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Determine recipient: if sender is passenger, notify driver; vice versa
      let recipientId: string | null = null;

      if (senderId === booking.user_id) {
        // Sender is passenger → notify driver
        if (booking.shuttle_id) {
          const { data: shuttle } = await supabase
            .from("shuttles")
            .select("driver_id")
            .eq("id", booking.shuttle_id)
            .single();
          recipientId = shuttle?.driver_id || null;
        }
      } else {
        // Sender is driver → notify passenger
        recipientId = booking.user_id;
      }

      if (!recipientId) {
        return new Response(
          JSON.stringify({ message: "No recipient found" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get device tokens for recipient
      const { data: tokens } = await supabase
        .from("device_tokens")
        .select("token, platform")
        .eq("user_id", recipientId);

      if (!tokens || tokens.length === 0) {
        return new Response(
          JSON.stringify({ message: "No device tokens for recipient" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get sender name
      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", senderId)
        .single();

      const senderName = senderProfile?.full_name || "Someone";

      // TODO: Send push notification via FCM
      // This requires FCM_SERVER_KEY secret to be configured
      // For now, log the notification that would be sent
      const fcmKey = Deno.env.get("FCM_SERVER_KEY");

      if (fcmKey) {
        // Send via FCM
        for (const tokenEntry of tokens) {
          const payload = {
            to: tokenEntry.token,
            notification: {
              title: `New message from ${senderName}`,
              body: record.message?.substring(0, 100) || "New message",
              sound: "default",
            },
            data: {
              booking_id: bookingId,
              type: "ride_message",
            },
          };

          await fetch("https://fcm.googleapis.com/fcm/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `key=${fcmKey}`,
            },
            body: JSON.stringify(payload),
          });
        }
      }

      return new Response(
        JSON.stringify({
          message: "Notification processed",
          recipient: recipientId,
          tokenCount: tokens.length,
          fcmConfigured: !!fcmKey,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: "No action taken" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
