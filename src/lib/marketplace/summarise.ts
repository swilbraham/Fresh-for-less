import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * One-line gist of a DM conversation, so the enquiries page can be scanned
 * without reading every thread. Best-effort and optional: without an
 * ANTHROPIC_API_KEY (or on any failure) it returns "" and the page simply
 * shows the full messages, which it does anyway.
 */
export async function summariseEnquiry(conversation: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) return "";

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 200,
      output_config: { effort: "low" },
      system:
        "You summarise incoming Facebook/Instagram messages for the office of a " +
        "carpet and upholstery cleaning business. Reply with a single line of at " +
        "most 15 words stating what the customer wants — items, location, and " +
        "timing if mentioned. No preamble, no quotes, just the line.",
      messages: [{ role: "user", content: conversation.slice(0, 8000) }],
    });
    if (response.stop_reason === "refusal") return "";

    const block = response.content.find((b) => b.type === "text");
    return (block?.type === "text" ? block.text : "").trim().slice(0, 200);
  } catch {
    // A lead without a summary is fine; a lost lead is not.
    return "";
  }
}
