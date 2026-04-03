import React, { useState, useEffect, useRef } from 'react';
import Groq from "groq-sdk";
import { NavLink, Outlet } from 'react-router-dom';
import { FileTextOutlined, HeartOutlined, CheckCircleOutlined, SendOutlined, RobotOutlined } from '@ant-design/icons';
import { ReactTyped } from "react-typed";
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { SelectedJobsProvider } from '../../Contexts/SelectedJobsContext';
import { FetchedJobsProvider } from '../../Contexts/FetchedJobsContext';
import { useSelectedJobs } from '../../Contexts/SelectedJobsContext';
import { useFetchedJobs } from '../../Contexts/FetchedJobsContext';
import { useAuth } from '../../Contexts/AuthContext.jsx';


const ChatBot = () => {

  const { jobs } = useFetchedJobs();
  const { selectedJobs } = useSelectedJobs(); // Used to select a single job id from recommend component.
  const [filteredJob, setFilteredJob] = useState(null);
  const chatBoxRef = useRef(null); // Create a reference for the chat box
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { auth } = useAuth();

  useEffect(() => {
    if (!selectedJobs) {
      setFilteredJob('');
    }
    const filter = jobs.filter((job) => job.id === selectedJobs)[0]; // Filter the job with id === selectedJobs
    setFilteredJob(filter);
    console.log(filteredJob);
  }, [selectedJobs]);

  useEffect(() => {
    // Scroll to bottom when new message is added
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

 const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY, dangerouslyAllowBrowser: true// frontend env
});
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages); // Add the new message before any asynchronous operations

    setInput("");
    setIsTyping(true);

    try {
      const response = await sendToGroqAPI(input);
      setMessages((prevMessages) => [...prevMessages, { sender: "bot", text: response }]); // Ensure you access the latest state correctly
    } catch (error) {
      setMessages((prevMessages) => [...prevMessages, { sender: "bot", text: "Sorry, I couldn't process that." }]);
    }

    setIsTyping(false);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

 

const sendToGroqAPI = async (prompt) => {
  try {
    const KaamAI =
      "Call yourself Kaam AI. You can only help with generating cover letters and giving job details and tips. Do not use emojis.";

    const title = selectedJobs ? filteredJob.title : "";
    const description = selectedJobs ? filteredJob.description : "";
    const display_name = selectedJobs
      ? filteredJob.company.display_name
      : "";
    const contract_type = selectedJobs
      ? filteredJob.contract_type
      : "";
    const location = selectedJobs
      ? filteredJob.location.display_name
      : "";
    const username = auth?.user?.fullname;

    const AIprompt = `${KaamAI}
    Job Title: ${title}
    Description: ${description}
    Company: ${display_name}
    Contract: ${contract_type}
    Location: ${location}
    User: ${username}
    
    Query: ${prompt}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: AIprompt,
        },
      ],
    });

    return completion.choices[0]?.message?.content;
  } catch (error) {
    console.error("Error with Groq API:", error);
    throw new Error("API failed");
  }
};

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="bg-white p-4 shadow-lg flex items-center space-x-2 border-b border-gray-300">
        <RobotOutlined className="text-orange-700 text-3xl" />
        <span className="text-gray-700 text-2xl font-semibold hover:text-orange-700 transition-colors">
          Kaam AI
        </span>
      </div>

      {/* Chat Messages Section */}
      <div className="flex-grow p-4">
        <div
          ref={chatBoxRef} // Attach the ref to the chat box
          className={`h-[500px] overflow-y-auto p-4 rounded-lg bg-gray-50 shadow-inner ${selectedJobs ? 'border-orange-700' : 'border-gray-300'} border`}
        >
          <div className="flex-grow overflow-y-auto">
            {/* Render chat messages */}
            {messages.map((msg, index) => (
              <div key={index} className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                <p className={`inline-block p-2 rounded-lg ${msg.sender === "user" ? "bg-orange-700 text-white" : "bg-gray-200 text-black"}`}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </p>
              </div>
            ))}

            {/* Placeholder typing animation when no messages */}
            {messages.length === 0 && (
              <p className="text-center mb-2 text-gray-600">
                <ReactTyped
                  strings={["What can I help you with?"]}
                  typeSpeed={100}
                  loop
                  backSpeed={20}
                  cursorChar="|"
                  showCursor={true}
                />
              </p>
            )}

            {/* Show typing animation when waiting for a response */}
            {isTyping && (
              <div className="text-center mb-2 text-gray-600">
                <ReactTyped
                  strings={["Kaam AI is typing..."]}
                  typeSpeed={50}
                  loop={false}
                  cursorChar="|"
                  showCursor={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="flex items-center space-x-2 mt-4">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-grow rounded-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-700 transition-shadow"
        />
        <button
          className="bg-orange-700 text-white rounded-full p-3 hover:bg-orange-600 transition-colors"
          onClick={handleSendMessage}
        >
          <SendOutlined />
        </button>
      </div>
    </div>
  );
};


function Jobs() {
  const [showChatBot, setShowChatBot] = useState(false);
  const[showToggle,setShowToggle]=useState(false);

  const toggleChatBot = () => setShowChatBot(!showChatBot);
  const toggleToggle = () =>setShowToggle(!showToggle)

  return (
    <FetchedJobsProvider>
      <SelectedJobsProvider>
        <div className="grid grid-rows-[auto_1fr] grid-cols-1 md:grid-cols-3 h-screen gap-2 p-0 overflow-hidden relative">
          
          {/* Content Div - Display on the Left */}
          <div className="col-span-1 md:col-span-2 md:row-span-2 row-span-9 bg-white p-4 rounded-lg shadow-lg overflow-y-auto h-full flex flex-col">
            
            {/* Fixed Navigation */}
            <nav className="bg-white shadow-lg p-4 mt-0 rounded-lg mx-2 flex-shrink-0">
              <ul className="flex gap-5 md:gap-10 flex-wrap">
                <li>
                  <NavLink
                    to="/app/jobs/"
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 rounded-lg ${isActive ? 'text-orange-700' : 'text-gray-700'} hover:text-orange-700 hover:bg-gray-100 duration-200`
                    }
                  >
                    <FileTextOutlined className="mr-2" />
                    Recommended
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/app/jobs/liked"
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 rounded-lg ${isActive ? 'text-orange-700' : 'text-gray-700'} hover:text-orange-700 hover:bg-gray-100 duration-200`
                    }
                  >
                    <HeartOutlined className="mr-2" />
                    Liked
                  </NavLink>
                </li>
              </ul>
            </nav>

            {/* Outlet */}
            <div className="flex-grow overflow-y-auto p-4">
              <Outlet />
            </div>
          </div>

          {/* Chatbot Sidebar */}
          <aside className={`
  fixed md:static top-0 right-0 h-full w-full md:w-auto md:col-span-1 bg-white shadow-lg z-40
  transform transition-transform duration-300 ease-in-out
  ${showChatBot ? 'translate-x-0' : 'translate-x-full'} 
  md:translate-x-0 md:transform-none
`}>
  <ChatBot onClose={() => setShowChatBot(false)} />
</aside>


          {/* Floating Toggle Button (Mobile Only) */}
          <button
            onClick={toggleChatBot}
           
            className="md:hidden fixed bottom-20 right-4 bg-orange-700 text-white p-3 rounded-full shadow-lg z-50"
          >
            
            <RobotOutlined className="text-xl" />
          </button>
        </div>
      </SelectedJobsProvider>
    </FetchedJobsProvider>
  );
}
export default Jobs