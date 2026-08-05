

async function run(input, context, systemInstruction) {
    const text = input.toLowerCase();
    const hasOrderNumberRule =
      systemInstruction && systemInstruction.toLowerCase().includes("order number");

    if (hasOrderNumberRule && (text.includes("refund") || text.includes("return"))) {
      return "Can you provide your order number so I can look into this?";
    }
  
    if (text.includes("refund")) {
      return "Sorry to hear that! I can help you get that sorted.";
    }
    if (text.includes("arrive") || text.includes("package")) {
      return "You can track your package at ourstore.com/track";
    }
    if (text.includes("weekend")) {
      return "Yes, we're open on weekends!";
    }
    if (text.includes("return policy")) {
      return "Our return policy allows returns within 30 days of purchase.";
    }
    return "Thanks for reaching out, how can I help?";
  }
  
  module.exports = { run };