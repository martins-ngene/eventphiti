// Turn the database's wording into something a workshop room understands.
export function explain(message: string) {
  if (/row-level security|violates|permission denied|Unauthorized|403/i.test(message))
    return "Supabase blocked this because it doesn't know who you are yet. That's step 4: send your Clerk token.";
  if (/JWT|token|invalid claim|signature/i.test(message))
    return "Supabase couldn't verify your Clerk token. Check that Clerk is added under Supabase → Third-Party Auth.";
  return message;
}
