import { useState, useRef, useEffect } from "react";
import api from "../services/api";
import { Upload, Sparkles, Bot, User } from "lucide-react";

export default function VisionAnalysis() {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const messagesEndRef = useRef(null);

  // AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // CLEANUP IMAGE URL
  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image);
    };
  }, [image]);

  // IMAGE UPLOAD
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(file.type)) {
      alert("Only JPG PNG WEBP allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Max size 10MB");
      return;
    }

    if (image) URL.revokeObjectURL(image);

    const preview = URL.createObjectURL(file);

    setImage(preview);
    setImageFile(file);
  };

  // ANALYZE IMAGE
  const analyzeVision = async () => {
    if (!imageFile || loading) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: question || "Analyze this image",
      },
    ]);

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("question", question);

      const response = await api.post("/vision/analyze", formData);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          analysis: response.data.response,
        },
      ]);

      setQuestion("");
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Something went wrong while analyzing the image.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">

      <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">

        {/* LEFT PANEL */}
        <div className="col-span-4 h-full min-h-0">
          <div className="bg-[#041b14] rounded-3xl p-5 h-full flex flex-col">

            <h2 className="text-green-400 font-semibold mb-4">
              Upload Image
            </h2>

            <label className="relative min-h-[260px] rounded-2xl bg-[#061d16] flex items-center justify-center cursor-pointer overflow-hidden">
              {image ? (
                <img
                  src={image}
                  alt="preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <Upload className="text-green-400 mx-auto mb-4" size={50} />
                  <p>Click to upload</p>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>

            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about image..."
              className="mt-5 w-full h-[120px] rounded-2xl bg-[#061d16] p-4 resize-none outline-none"
            />

            <button
              onClick={analyzeVision}
              disabled={loading}
              className="mt-4 py-4 rounded-2xl bg-green-700 flex justify-center gap-2"
            >
              <Sparkles size={18} />
              {loading ? "Analyzing..." : "Analyze"}
            </button>

          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="col-span-8 h-full min-h-0">
          <div className="bg-[#041b14] rounded-3xl p-5 h-full flex flex-col overflow-hidden">

            {/* SCROLL AREA */}
            <div className="flex-1 overflow-y-auto pr-2">

              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  Upload image to begin
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-4 flex ${
                      msg.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                        msg.role === "user"
                          ? "bg-green-700"
                          : "bg-[#061d16]"
                      }`}
                    >

                      <div className="flex gap-2 mb-2 items-center">
                        {msg.role === "assistant" ? (
                          <Bot size={18} />
                        ) : (
                          <User size={18} />
                        )}

                        <span>
                          {msg.role === "assistant"
                            ? "Vision AI"
                            : "You"}
                        </span>
                      </div>

                      {msg.analysis ? (
                        <div className="space-y-4">

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#0b2d22] p-4 rounded-xl">
                              <h3 className="text-green-400 font-semibold">
                                🌱 Crop Name
                              </h3>
                              <p>{msg.analysis.crop_name}</p>
                            </div>

                            <div className="bg-[#0b2d22] p-4 rounded-xl">
                              <h3 className="text-green-400 font-semibold">
                                📊 Health Status
                              </h3>
                              <p>{msg.analysis.health_status}</p>
                            </div>
                          </div>

                          <div className="bg-[#0b2d22] p-4 rounded-xl">
                            <h3 className="text-green-400 font-semibold">
                              🦠 Disease Detected
                            </h3>
                            <p>{msg.analysis.disease_detected}</p>
                          </div>

                          <div className="bg-[#0b2d22] p-4 rounded-xl">
                            <h3 className="text-green-400 font-semibold">
                              ⚠ Severity
                            </h3>
                            <p>{msg.analysis.severity}</p>
                          </div>

                          <div className="bg-[#0b2d22] p-4 rounded-xl">
                            <h3 className="text-green-400 font-semibold">
                              💊 Recommendations
                            </h3>

                            <div className="max-h-40 overflow-y-auto">
                              <ul className="list-disc pl-5">
                                {msg.analysis.recommendations?.map(
                                  (item, idx) => (
                                    <li key={idx}>{item}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>

                          <div className="bg-[#0b2d22] p-4 rounded-xl">
                            <h3 className="text-green-400 font-semibold">
                              📝 Summary
                            </h3>
                            <p>{msg.analysis.summary}</p>
                          </div>

                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      )}

                    </div>
                  </div>
                ))
              )}

              <div ref={messagesEndRef} />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
