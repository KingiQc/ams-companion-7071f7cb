import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // Verify caller is superadmin
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const callerId = claimsData.claims.sub;

    // Use service role to check caller's role and perform admin actions
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: callerRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .single();

    if (!callerRole || callerRole.role !== "superadmin") {
      return new Response(JSON.stringify({ error: "Forbidden: superadmin only" }), { status: 403, headers: corsHeaders });
    }

    const { action, ...payload } = await req.json();

    // CREATE USER
    if (action === "create_user") {
      const { email, password, full_name, role } = payload;
      if (!email || !password || !full_name || !role) {
        return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers: corsHeaders });
      }
      if (!["superadmin", "admin", "manager"].includes(role)) {
        return new Response(JSON.stringify({ error: "Invalid role" }), { status: 400, headers: corsHeaders });
      }

      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name },
      });

      if (createErr) {
        return new Response(JSON.stringify({ error: createErr.message }), { status: 400, headers: corsHeaders });
      }

      // Assign role
      await supabaseAdmin.from("user_roles").insert({ user_id: newUser.user.id, role });

      return new Response(JSON.stringify({ success: true, user_id: newUser.user.id }), { headers: corsHeaders });
    }

    // SUSPEND USER
    if (action === "suspend_user") {
      const { user_id } = payload;
      if (user_id === callerId) {
        return new Response(JSON.stringify({ error: "Cannot suspend yourself" }), { status: 400, headers: corsHeaders });
      }
      await supabaseAdmin.from("profiles").update({ is_suspended: true }).eq("user_id", user_id);
      // Ban user in auth
      await supabaseAdmin.auth.admin.updateUserById(user_id, { ban_duration: "876000h" });
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // UNSUSPEND USER
    if (action === "unsuspend_user") {
      const { user_id } = payload;
      await supabaseAdmin.from("profiles").update({ is_suspended: false }).eq("user_id", user_id);
      await supabaseAdmin.auth.admin.updateUserById(user_id, { ban_duration: "none" });
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // DELETE USER
    if (action === "delete_user") {
      const { user_id } = payload;
      if (user_id === callerId) {
        return new Response(JSON.stringify({ error: "Cannot delete yourself" }), { status: 400, headers: corsHeaders });
      }
      await supabaseAdmin.auth.admin.deleteUser(user_id);
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // LIST USERS
    if (action === "list_users") {
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("*, user_roles(role)")
        .order("created_at", { ascending: false });

      return new Response(JSON.stringify({ users: profiles }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
