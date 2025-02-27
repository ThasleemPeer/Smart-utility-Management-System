import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const Chat = () => {
  const { booking_id } = useParams();
  const location = useLocation();
  const worker = location.state?.worker || "Unknown Worker";
  const user = JSON.parse(localStorage.getItem("user")) || { username: "Guest" };
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!booking_id) {
      console.error("Missing booking_id");
      return;
    }

    ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${booking_id}/`);

    ws.current.onmessage = (event) => {
      const receivedMessage = JSON.parse(event.data);
      setMessages((prev) => [
        ...prev,
        {
          ...receivedMessage,
          isRight: prev.length % 2 === 0, // Alternate right/left
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    };

    ws.current.onopen = () => console.log("WebSocket Connected");
    ws.current.onclose = () => console.log("WebSocket Disconnected");

    return () => ws.current?.close();
  }, [booking_id]);

  const sendMessage = () => {
    if (message.trim() && ws.current?.readyState === WebSocket.OPEN) {
      const messageToSend = { sender: user.username, message };
      ws.current.send(JSON.stringify(messageToSend));
      setMessage(""); // Clear input after sending
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between shadow-md sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-blue-800 rounded-full transition-all duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h2 className="text-lg font-bold">{worker}</h2>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-6 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-600 py-12">
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm opacity-75">Start chatting below!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.isRight ? "justify-end" : "justify-start"} mb-4`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-xl shadow-sm ${
                    msg.isRight
                      ? "bg-orange-600 text-white rounded-br-none"
                      : "bg-white text-gray-900 rounded-bl-none border border-gray-200"
                  }`}
                >
                  <div className="text-sm">{msg.message}</div>
                  <div className="text-xs text-right mt-1 opacity-70">{msg.timestamp}</div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-gray-200 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center space-x-3">
          <input
            type="text"
            className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 placeholder-gray-500 transition-all duration-200"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
          />
          <button
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200"
            onClick={sendMessage}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;