async function initChat() {
  /* DOM elements */
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  const chatWindow = document.getElementById("chatWindow");

  // All frontend requests go through the Cloudflare Worker endpoint.
  const workerApiUrl = "https://chatbot-worker.3248613716.workers.dev";
  const prompt =
    "You are a L'Oreal beauty advisor chatbot. Only answer questions about L'Oreal products, routines, and recommendations. If a question is not related to L'Oreal beauty topics, politely refuse and ask the user to ask about L'Oreal products or routines.";

  const messages = [
    {
      role: "system",
      content: prompt,
    },
  ];

  function addChatMessage(role, content) {
    const messageEl = document.createElement("div");
    messageEl.classList.add("msg", role === "user" ? "user" : "assistant");
    messageEl.textContent = `${role === "user" ? "You" : "AI Advisor"}: ${content}`;
    chatWindow.appendChild(messageEl);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  // Set initial message
  chatWindow.textContent = "👋 Hello! How can I help you today?";

  /* Handle form submit */
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userMessage = userInput.value.trim();
    if (!userMessage) {
      return;
    }

    addChatMessage("user", userMessage);

    // clear user input
    userInput.value = "";

    messages.push({
      role: "user",
      content: userMessage,
    });

    try {
      const response = await fetch(workerApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;

      addChatMessage("assistant", assistantMessage);

      messages.push({
        role: "assistant",
        content: assistantMessage,
      });
    } catch (error) {
      addChatMessage(
        "assistant",
        "Sorry, I could not get a response right now. Please try again.",
      );
      console.error("Cloudflare Worker request error:", error);
    }
  });
}

initChat();
