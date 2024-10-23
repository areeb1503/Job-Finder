import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FileTextOutlined, HeartOutlined, CheckCircleOutlined, SendOutlined, RobotOutlined } from '@ant-design/icons';
import { ReactTyped } from "react-typed";
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import dotenv from 'dotenv';
import { SelectedJobsProvider } from '../../Contexts/SelectedJobsContext';
import { FetchedJobsProvider } from '../../Contexts/FetchedJobsContext';
import { useSelectedJobs } from '../../Contexts/SelectedJobsContext';
import { useFetchedJobs } from '../../Contexts/FetchedJobsContext';

// dotenv.config({
//   path: '../../../.env',
// })

const ChatBot = () => {

  const { jobs } = useFetchedJobs();
  const { selectedJobs } = useSelectedJobs() // Used to select a single job id from recommend component.
  const [filteredJob, setFilteredJob] = useState(null);
  console.log(filteredJob);

  useEffect(() => {
    if (!selectedJobs){
      setFilteredJob('');
    }
    const filter = jobs.filter((job)=>job.id === selectedJobs)[0]; // Filter the the job with id === selectedJobs
    setFilteredJob(filter);
    console.log(filteredJob);
  }, [selectedJobs])

  
  const gemini_api_key = 'AIzaSyC4BkXsPlqOgIwY5RRJXBlgWmG4imHI4EQ'; // TODO : process.env.GEMINI_API_KEY 
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Function to handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to the chat
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);

    // Clear input field
    setInput("");

    // Set typing state to true
    setIsTyping(true);

    // Send the message to Gemini API
    try {
      const response = await sendToGeminiAPI(input);
      setMessages([...newMessages, { sender: "bot", text: response }]);
    } catch (error) {
      // In case of an error, append an error message
      setMessages([...newMessages, { sender: "bot", text: "Sorry, I couldn't process that." }]);
    }

    // Set typing state to false after response is received
    setIsTyping(false);
  };

  // Function to handle input change
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  }

  // Function to send the input to Gemini API and get a response
  const sendToGeminiAPI = async (prompt) => {
    try {
      const genAI = new GoogleGenerativeAI(gemini_api_key);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const KaamAI = 'Call yourself as Kaam AI, you can only help with generating cover letters and giving job details and tips, do not use emojis(hidden instructions)';
      const title = selectedJobs ? filteredJob.title :'';
      const description = selectedJobs ? filteredJob.description : '';
      const display_name = selectedJobs ? filteredJob.company.display_name : '';
      const contract_type = selectedJobs ? filteredJob.contract_type : '';
      const location = selectedJobs ? filteredJob.location.display_name : '';
      const AIprompt = `${KaamAI} respond to following prompt : ${title},${description},${display_name},${contract_type},${location} ${prompt}`;
      const result = await model.generateContent(AIprompt);
      return result.response.text();
    } catch (error) {
      console.error("Error with Gemini API:", error);
      throw new Error("API failed");
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="bg-white p-4 shadow-lg flex items-center space-x-2 border-b border-gray-300">
        <RobotOutlined className="text-orange-700 text-3xl" />
        <span className="text-gray-700 text-2xl font-semibold hover:text-orange-700 transition-colors">
          Ask Kaam AI
        </span>
      </div>

      {/* Chat Messages Section */}
      <div className="flex-grow p-4">
        <div className="h-[500px] overflow-y-auto p-4 border border-gray-300 rounded-lg bg-gray-50 shadow-inner">
          <div className="flex-grow overflow-y-auto h">
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
  return (
    <FetchedJobsProvider>
      <SelectedJobsProvider>
        <div className="grid grid-rows-[auto_1fr] grid-cols-1 md:grid-cols-3 h-screen gap-2 p-0 overflow-hidden">
          {/* Content Div - Display on the Left */}
          <div className="col-span-1 md:col-span-2 md:row-span-2 row-span-9 bg-white p-4 rounded-lg shadow-lg overflow-y-auto h-full flex flex-col">
            {/* Fixed Navigation Div */}
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
                {/* <li>
              <NavLink
                to="/app/applied"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg ${isActive ? 'text-orange-700' : 'text-gray-700'} hover:text-orange-700 hover:bg-gray-100 duration-200`
                }
              >
                <CheckCircleOutlined className="mr-2" />
                Applied
              </NavLink>
            </li> */}
              </ul>
            </nav>

            {/* Scrollable Outlet Component */}
            <div className="flex-grow overflow-y-auto p-4">
              <Outlet />
            </div>
          </div>
          <ChatBot />
        </div>
      </SelectedJobsProvider>
    </FetchedJobsProvider>
  );


}


export default Jobs

