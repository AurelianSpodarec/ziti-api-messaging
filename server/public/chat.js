document.addEventListener("DOMContentLoaded", () => {
  // DOM element references
  var conversationIdInput = document.getElementById("conversationId");
  var userIdSelect = document.getElementById("userId");
  var recipientIdSelect = document.getElementById("recipientId");
  var messageInput = document.getElementById("message");
  var sendButton = document.getElementById("sendButton");
  var messagesDiv = document.getElementById("messages");

  // Socket.io related variables
  var socket = null; // Socket.io connection instance
  var mySocketId = ""; // Variable to store the socket ID

  function scrollToBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // Function to set up an IntersectionObserver for read receipt functionality
  function setupReadObserver() {
    const options = {
      root: null, // Use the viewport as the root
      threshold: 1.0, // Require 100% of the target to be visible
    };

    // Observer checks each entry to see if it's intersecting (visible)
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        // Check if the message is visible and the window is focused
        if (entry.isIntersecting && document.hasFocus()) {
          // Emit messageStatus event for the visible message
          const messageId = entry.target.getAttribute("data-message-id");
          socket.emit("messageStatus", { messageId: messageId, status: 'read' });
          observer.unobserve(entry.target); // Stop observing the target
        }
      });
    }, options);

    return observer;
  }

  // Initialize the read receipt observer
  var readObserver = setupReadObserver();

  // Event listener to handle message reads when window gains focus
  window.addEventListener("focus", () => {
    document.querySelectorAll("#messages div").forEach((msgDiv) => {
      if (
        msgDiv.getAttribute("data-message-id") &&
        msgDiv.getBoundingClientRect().top >= 0 &&
        msgDiv.getBoundingClientRect().bottom <= window.innerHeight &&
        !msgDiv.hasAttribute("data-read-emitted")
      ) {
        // Emit messageStatus for visible messages when window gains focus
        const messageId = msgDiv.getAttribute("data-message-id");
        socket.emit("messageStatus", { messageId: messageId, status: 'read' });
        msgDiv.setAttribute("data-read-emitted", "true"); // Mark as read
      }
    });
  });

  // Event listener to handle user selection changes
  userIdSelect.addEventListener("change", function () {
    // Create or update socket connection when a user is selected
    if (socket === null) {
      socket = io("http://localhost:3002");

      // Handle socket connection events
      socket.on("connect", () => {
        mySocketId = socket.id; // Store the socket ID
        console.log("Connected to server. Socket ID: ", mySocketId);
        socket.emit("register", { userId: userIdSelect.value });
      });

      // Handle incoming private messages
      socket.on("private_message", (msg) => {
        console.log("Message received:", msg);
        var msgDiv = document.createElement("div");
        msgDiv.textContent = msg.message;
        msgDiv.setAttribute("data-message-id", msg.messageId);
        msgDiv.classList.add("received"); // Add class for styling
        messagesDiv.appendChild(msgDiv);
        scrollToBottom();
        if (msg.messageId && !msgDiv.hasAttribute("data-read-emitted")) {
          readObserver.observe(msgDiv); // Observe new message for read receipt
        }
        socket.emit("messageStatus", { messageId: msg.messageId, status: 'delivered' });
      });

      socket.on("message-status-updated", (data) => {
        // Log the updated status of the message
        console.log("Message status updated:", data.messageId, "Status:", data.status);
      });
    } else {
      socket.emit("register", { userId: userIdSelect.value });
    }
  });

  // Event listener for the send button
  sendButton.addEventListener("click", function () {
    sendMessage();
  });

  // Function to send a message
  function sendMessage() {
    var message = messageInput.value;
    socket.emit("private_message", {
      senderId: userIdSelect.value,
      recipientId: recipientIdSelect.value,
      conversationId: conversationIdInput.value,
      message: message,
    });

    // Display the sent message
    var sentMsgDiv = document.createElement("div");
    sentMsgDiv.textContent = message;
    sentMsgDiv.classList.add("sent"); // Add class for styling
    messagesDiv.appendChild(sentMsgDiv);
    scrollToBottom();
    messageInput.value = ''; // Clear the input field after sending
  }

  // Event listener to send message when Enter key is pressed
  messageInput.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });
});
