document.addEventListener('DOMContentLoaded', () => {
  // DOM element references
  const conversationIdInput = document.getElementById('conversationId')
  const userIdSelect = document.getElementById('userId')
  const recipientIdSelect = document.getElementById('recipientId')
  const messageInput = document.getElementById('message')
  const sendButton = document.getElementById('sendButton')
  const messagesDiv = document.getElementById('messages')

  // Socket.io related variables
  let socket = null // Socket.io connection instance
  let mySocketId = '' // Variable to store the socket ID

  function scrollToBottom () {
    messagesDiv.scrollTop = messagesDiv.scrollHeight
  }

  // Function to fetch and display messages
  async function fetchAndDisplayMessages (conversationId) {
    if (!userIdSelect.value) return // Exit if no user is selected

    try {
      const response = await fetch(`http://localhost:3002/conversation?c=${conversationId}&page=1&limit=20`)
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
      const data = await response.json()
      displayMessages(data.messages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  // Function to display messages in the messagesDiv
  function displayMessages (messages) {
    messagesDiv.innerHTML = '' // Clear existing messages

    let lastSentMessageId = ''
    if (messages.length > 0 && messages[0].senderId === userIdSelect.value) {
      // The first message in the array was sent by the current user
      lastSentMessageId = messages[0]._id
    }

    // Reverse the messages array to start appending from the newest message
    messages.slice().reverse().forEach((msg) => {
      const messageContainer = document.createElement('div')
      messageContainer.classList.add(msg.senderId === userIdSelect.value ? 'sent-container' : 'received-container')

      const msgDiv = document.createElement('div')
      msgDiv.setAttribute('data-message-id', msg._id)
      msgDiv.textContent = msg.textContent
      msgDiv.classList.add(msg.senderId === userIdSelect.value ? 'sent-message' : 'received-message')

      if (msg.status === 'Read') {
        msgDiv.setAttribute('data-read-emitted', 'true')
      }

      if (msg.senderId !== userIdSelect.value && msg.status !== 'Read') { // Check if it's an unread received messsage
        readObserver.observe(msgDiv) // Start observing the message for visibility
      }

      messageContainer.appendChild(msgDiv)

      if (msg.senderId === userIdSelect.value && msg._id === lastSentMessageId) {
        const statusSpan = document.createElement('span')
        statusSpan.classList.add('message-status')
        statusSpan.textContent = msg.status // Replace with actual status
        messageContainer.appendChild(statusSpan)
      }

      messagesDiv.appendChild(messageContainer)
    })

    scrollToBottom()
    emitReadStatusForVisibleMessages()
  }

  // Function to set up an IntersectionObserver for read receipt functionality
  function setupReadObserver () {
    const options = {
      root: null, // Use the viewport as the root
      threshold: 1.0 // Require 100% of the target to be visible
    }

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && document.hasFocus()) {
          // Ensure the target is a received message and not yet marked as read
          if (isReceivedMessage(entry.target) && !isReadEmitted(entry.target)) {
            const messageId = entry.target.getAttribute('data-message-id')
            socket.emit('messageStatus', { messageId, status: 'Read' })
            entry.target.setAttribute('data-read-emitted', 'true')
            observer.unobserve(entry.target) // Stop observing the target
          }
        }
      })
    }, options)

    return observer
  }

  function isReceivedMessage (element) {
    // Check if the element is a child of 'received-container' class
    return element.classList.contains('received-message')
  }

  function isReadEmitted (element) {
    // Check if 'data-read-emitted' attribute is present and true
    return element.getAttribute('data-read-emitted') === 'true'
  }

  // Initialize the read receipt observer
  const readObserver = setupReadObserver()

  // Event listener to handle message reads when window gains focus
  window.addEventListener('focus', () => {
    document.querySelectorAll('#messages .received-container .received-message').forEach((msgDiv) => {
      if (isVisible(msgDiv) && !msgDiv.hasAttribute('data-read-emitted')) {
        // Emit messageStatus for visible messages when window gains focus
        const messageId = msgDiv.getAttribute('data-message-id')
        socket.emit('messageStatus', { messageId, status: 'Read' })
        msgDiv.setAttribute('data-read-emitted', 'true') // Mark as read
      }
    })
  })

  function isVisible (element) {
    const rect = element.getBoundingClientRect()
    return rect.top >= 0 && rect.bottom <= window.innerHeight
  }

  // Event listener to handle user selection changes
  userIdSelect.addEventListener('change', function () {
    // Create or update socket connection when a user is selected
    if (socket === null) {
      // socket = io("http://localhost:3002");
      socket = io('ws://localhost:3002')

      // Handle socket connection events
      socket.on('connect', () => {
        mySocketId = socket.id // Store the socket ID
        console.log('Connected to server. Socket ID: ', mySocketId)
        socket.emit('register', { userId: userIdSelect.value })
        if (conversationIdInput.value) {
          fetchAndDisplayMessages(conversationIdInput.value)
        }
      })

      // Handle incoming private messages
      socket.on('private_message', (msg) => {
        document.querySelector('.activity').textContent = ''

        // Remove the status from the last sent message
        removeLastMessageStatus()

        // Create a container for the received message
        const receivedContainer = document.createElement('div')
        receivedContainer.classList.add('received-container')

        // Create the actual message div
        const msgDiv = document.createElement('div')
        msgDiv.textContent = msg.message
        msgDiv.setAttribute('data-message-id', msg.messageId)
        msgDiv.classList.add('received-message')

        // Append the message div to the container
        receivedContainer.appendChild(msgDiv)

        // Append the container to the messages div
        messagesDiv.appendChild(receivedContainer)
        scrollToBottom()

        if (msg.messageId && !msgDiv.hasAttribute('data-read-emitted')) {
          readObserver.observe(msgDiv) // Observe new message for read receipt
        }
        socket.emit('messageStatus', { messageId: msg.messageId, status: 'Delivered' })
      })

      socket.on('message-status-updated', (data) => {
        updateMessageStatus(data.messageId, data.status)
      })

      socket.on('sent-message-id', (data) => {
        updateLastSentMessageId(data.messageId)
      })

      let activityTimer
      socket.on('activity', (userId) => {
        document.querySelector('.activity').textContent = `${userId.slice(-4)} is typing...`

        // Clear after 3 seconds
        clearTimeout(activityTimer)
        activityTimer = setTimeout(() => {
          document.querySelector('.activity').textContent = ''
        }, 2000)
      })
    } else {
      socket.emit('register', { userId: userIdSelect.value })
    }
  })

  // Event listener for the send button
  sendButton.addEventListener('click', function () {
    sendMessage()
  })

  message.addEventListener('keypress', (e) => {
    if (e.key !== 'Enter') {
      socket.emit('activity', {
        type: 'typing',
        userId: userIdSelect.value,
        recipientId: recipientIdSelect.value
      })
    }
  })

  // Function to send a message
  function sendMessage () {
    const message = messageInput.value

    if (message.length > 0) {
      socket.emit('private_message', {
        senderId: userIdSelect.value,
        recipientId: recipientIdSelect.value,
        conversationId: conversationIdInput.value,
        message
      })

      // Remove the status from the last sent message
      removeLastMessageStatus()

      // Display the sent message
      const messageContainer = document.createElement('div')
      messageContainer.classList.add('sent-container') // Add class for the message container

      const sentMsgDiv = document.createElement('div')
      sentMsgDiv.textContent = message
      sentMsgDiv.classList.add('sent-message') // Add class for styling
      messageContainer.appendChild(sentMsgDiv)

      // Create and append status span
      const statusSpan = document.createElement('span')
      statusSpan.classList.add('message-status')
      statusSpan.textContent = 'Sent' // Default status
      messageContainer.appendChild(statusSpan)
      messagesDiv.appendChild(messageContainer)

      scrollToBottom()
      messageInput.value = '' // Clear the input field after sending
    }
  }

  // Event listener to send message when Enter key is pressed
  messageInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      sendMessage()
    }
  })

  function removeLastMessageStatus () {
    // Target the last sent-container
    const messagesDiv = document.getElementById('messages')
    const lastSentContainer = messagesDiv.querySelector('.sent-container:last-child')
    // var lastSentContainer = document.getElementById("messages").querySelector(".sent-container:last-child");
    if (lastSentContainer) {
      const statusSpan = lastSentContainer.querySelector('.message-status')
      if (statusSpan) {
        statusSpan.remove()
      }
    }
  }

  function updateMessageStatus (messageId, status) {
    const messagesDiv = document.getElementById('messages')
    const lastSentContainer = messagesDiv.querySelector('.sent-container:last-child')

    if (lastSentContainer) {
      const lastSentMsgDiv = lastSentContainer.querySelector('.sent-message')

      // Check if the last message's ID matches the provided messageId
      if (lastSentMsgDiv && lastSentMsgDiv.getAttribute('data-message-id') === messageId) {
        const statusSpan = lastSentContainer.querySelector('.message-status')

        // If there is no status span, create it
        if (!statusSpan) {
          console.log('Cannot update status. statusSpan not found.')
        }
        if (statusSpan) {
        // Fade out the status
          statusSpan.style.opacity = '0'

          // After transition duration, change the text and fade it back in
          setTimeout(() => {
            statusSpan.textContent = status
            statusSpan.style.opacity = '1'
          }, 200) // This duration should match the CSS transition duration
        }
      }
    }
  }

  function updateLastSentMessageId (messageId) {
    const lastSentContainer = messagesDiv.querySelector('.sent-container:last-child')
    if (lastSentContainer) {
      const lastSentMsgDiv = lastSentContainer.querySelector('.sent-message')
      if (lastSentMsgDiv && !lastSentMsgDiv.hasAttribute('data-message-id')) {
        lastSentMsgDiv.setAttribute('data-message-id', messageId)
      }
    }
  }

  // Call this function after messages are loaded/displayed and on scroll
  function emitReadStatusForVisibleMessages () {
    document.querySelectorAll('#messages .received-container .received-message').forEach((msgDiv) => {
      if (isVisible(msgDiv) && !msgDiv.hasAttribute('data-read-emitted')) {
        const messageId = msgDiv.getAttribute('data-message-id')
        socket.emit('messageStatus', { messageId, status: 'Read' })
        msgDiv.setAttribute('data-read-emitted', 'true')
      }
    })
  }

  // Add a scroll event listener to the messagesDiv
  messagesDiv.addEventListener('scroll', emitReadStatusForVisibleMessages)

  function isVisible (element) {
    const rect = element.getBoundingClientRect()
    return rect.top >= 0 && rect.bottom <= window.innerHeight
  }
})
