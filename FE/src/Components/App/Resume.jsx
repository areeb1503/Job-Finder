import React, { useEffect, useState } from "react";
import { useAuth } from "../../Contexts/AuthContext.jsx";
import axios from "../../api/axios.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import parse from "html-react-parser";
import { Modal } from "antd";
import { CloseOutlined } from "@ant-design/icons";

function Resume() {
  const { auth } = useAuth();
  const { user, accessToken } = auth;
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const [suggestion, setSuggestion] = useState(""); // State for the user's suggestion
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
  const [isLoading, setIsLoading] = useState(false); // State to manage loading modal visibility

  const generateContentAI = async (resume, improvement) => {
    const gemini_api_key = "AIzaSyBSh0ajPfzfr5UQoASQ-vfBA8O5WnFcjjY";
    const genAI = new GoogleGenerativeAI(gemini_api_key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Create a clean JSX(no comments and no {" "} spaces) representation of the following resume text: "${resume}". 
      - Do not include any imports, function definitions, or extra code, or any explanation.
      - Only generate JSX content.
      - Divide into sections: Contact Information, Skills, Experience, Education. Format it just like an actual Resume.
      - Use orange-700, gray, and white for text and use Tailwind CSS for styling.
      - Make links open in new tabs and style links with underline and text-orange-700.
      - If improvements are provided, embed them as inline <span> elements styled with "text-green-700 font-semibold".
      ${improvement ? `Here are the improvements: "${improvement}"` : ""}
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text;
  };

  useEffect(() => {
    const fetchResumeText = async () => {
      try {
        // Fetch resume text from backend
        const response = await axios.post(
          "/api/v1/jobs/get-resume-text",
          { user },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        );

        const resumeText = response.data?.data;
        if (!resumeText) {
          throw new Error("Resume text is empty.");
        }
        console.log(resumeText);

        const generatedText = await generateContentAI(resumeText, "");
        const cleanText = generatedText.replace(/^```(?:jsx)?\n/, "").replace(/```[\n\s]*$/, "");
        setText(cleanText);
      } catch (err) {
        console.error("Error generating resume JSX:", err);
        setError(err.message);
      }
    };

    fetchResumeText();
  }, [accessToken, user]);

  const handleSuggestImprovements = async () => {
    try {
      setIsModalOpen(false); // Close the modal
      setIsLoading(true); // Show the loading modal
      const generatedText = await generateContentAI(text, suggestion);
      const cleanText = generatedText.replace(/^```(?:jsx)?\n/, "").replace(/```[\n\s]*$/, "");
      setText(cleanText); // Update the resume text with suggested improvements
      setSuggestion(""); // Reset the suggestion input
    } catch (err) {
      console.error("Error generating suggestions:", err);
      setError("Failed to generate suggestions. Please try again.");
    } finally {
      setIsLoading(false); // Hide the loading modal
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-xl max-w-full sm:max-w-lg md:max-w-3xl lg:max-w-4xl">
      {error ? (
        <p className="text-red-500 text-center text-lg font-semibold">{`Error: ${error}`}</p>
      ) : text ? (
        <div className="text-orange-700">{parse(text)}</div>
      ) : (
        <div className="flex justify-center items-center">
          <div
            className="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-orange-700 rounded-full"
            role="status"
            aria-label="loading"
          >
            <span className="sr-only">Loading...</span>
          </div>
          <p className="text-orange-700 p-5">Loading your Resume...</p>
        </div>
      )}

      {/* Suggest Improvements Button */}
      <div className="mt-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="border border-orange-700 bg-orange-700 text-white px-5 py-2 rounded-md transition-colors duration-300 ease-out hover:bg-white hover:text-orange-700 hover:border-orange-700 w-full"
        >
          Use Kaam AI to Suggest Improvements in your Resume
        </button>
      </div>

      {/* Modal for Suggesting Improvements */}
      <Modal
        title={<h3 className="text-orange-700 text-lg font-semibold">Use Kaam AI to Suggest Improvements</h3>}
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        closable
        closeIcon={<CloseOutlined className="text-orange-700" />}
        style={{
          borderRadius: "8px",
        }}
      >
        <textarea
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          placeholder="Enter your query here..."
          className="w-full p-4 border border-gray-300 rounded-md"
          rows="5"
        ></textarea>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSuggestImprovements}
            className="ml-3 px-4 py-2 bg-orange-700 text-white rounded-md"
          >
            Generate Suggestion
          </button>
        </div>
      </Modal>

      {/* Loading Modal */}
      <Modal
        visible={isLoading}
        footer={null}
        closable={false}
        centered
        bodyStyle={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <div
          className="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-orange-700 rounded-full"
          role="status"
          aria-label="loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
        <p className="text-orange-700 p-5">Loading suggestions in Resume...</p>
      </Modal>
    </div>
  );
}

export default Resume;
