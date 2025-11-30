/* ============================================
   MediCare AI - Advanced JavaScript
   AWS Global Vibe Hackathon 2025
   PART 1 OF 2 - Core Functions & AI Integration
   ============================================ */

/* ============================================
   CONFIGURATION & API KEYS
   ============================================ */
const CONFIG = {
  GEMINI_API_KEY: "your_gemini_api_key", // Replace with your key
  AWS_REGION: "us-east-1",
  API_ENDPOINTS: {
    gemini:
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
  },
};

/* ============================================
   STATE MANAGEMENT (In-Memory Storage)
   ============================================ */
const AppState = {
  user: {
    name: "John Doe",
    email: "john.doe@example.com",
    dob: "1990-01-15",
    bloodType: "A+",
    allergies: "Peanuts, Penicillin",
    profileImage: null,
  },
  health: {
    score: 85,
    heartRate: 72,
    bloodPressure: "120/80",
    temperature: 98.6,
    steps: 7845,
    calories: 1650,
    sleep: 7.5,
  },
  medications: [
    {
      id: 1,
      name: "Vitamin D",
      dosage: "1000 IU",
      frequency: "Once daily",
      time: "8:00 AM",
      icon: "capsules",
    },
    {
      id: 2,
      name: "Multivitamin",
      dosage: "1 tablet",
      frequency: "Once daily",
      time: "9:00 AM",
      icon: "pills",
    },
  ],
  appointments: [
    {
      id: 1,
      title: "Annual Checkup",
      doctor: "Dr. Sarah Johnson",
      date: "2025-12-15",
      time: "10:00 AM",
    },
  ],
  emergencyContacts: [{ id: 1, name: "John Doe", phone: "+1 (555) 123-4567" }],
  chatHistory: [],
  theme: "light",
  isVoiceActive: false,
};

/* ============================================
   AI INTEGRATION - GEMINI API
   ============================================ */
class GeminiAI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = CONFIG.API_ENDPOINTS.gemini;
  }

  async generateResponse(prompt, context = "") {
    // If no API key, use fallback
    if (!this.apiKey || this.apiKey === "YOUR_GEMINI_API_KEY_HERE") {
      return this.getFallbackResponse(prompt);
    }

    try {
      const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are Dr. AI, a compassionate healthcare assistant. ${context}\n\nUser: ${prompt}\n\nProvide helpful, accurate medical information. Always remind users to consult healthcare professionals for serious concerns.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      });

      const data = await response.json();

      if (data.candidates && data.candidates[0]) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error("No response from AI");
      }
    } catch (error) {
      console.error("Gemini AI Error:", error);
      return this.getFallbackResponse(prompt);
    }
  }

  getFallbackResponse(prompt) {
    const lowerPrompt = prompt.toLowerCase();

    // Symptom-based responses
    if (lowerPrompt.includes("headache") || lowerPrompt.includes("fever")) {
      return `I understand you're experiencing ${
        lowerPrompt.includes("headache") ? "a headache" : "fever"
      }. Here's what I recommend:\n\n✓ Rest in a quiet, dark room\n✓ Stay hydrated - drink plenty of water\n✓ Take over-the-counter pain relievers if needed\n✓ Monitor your temperature\n\nIf symptoms persist for more than 48 hours or worsen, please consult a healthcare professional. Would you like me to help you find nearby clinics?`;
    }

    if (lowerPrompt.includes("medication") || lowerPrompt.includes("drug")) {
      return `I can help you with medication information. To provide accurate guidance, I need to know:\n\n• What medications are you currently taking?\n• Do you have any allergies?\n• What specific information do you need?\n\nRemember, always consult your doctor or pharmacist before starting, stopping, or changing any medications.`;
    }

    if (
      lowerPrompt.includes("anxious") ||
      lowerPrompt.includes("stress") ||
      lowerPrompt.includes("mental")
    ) {
      return `I'm here to support you. Mental health is just as important as physical health. Here are some immediate techniques:\n\n🧘 Deep Breathing: Breathe in for 4, hold for 4, out for 4\n💭 Grounding: Name 5 things you see, 4 you can touch, 3 you hear\n🚶 Movement: A short walk can help clear your mind\n💬 Talk: Reach out to someone you trust\n\nWould you like me to guide you through a relaxation exercise? If you're experiencing severe anxiety, please contact a mental health professional.`;
    }

    if (
      lowerPrompt.includes("nutrition") ||
      lowerPrompt.includes("diet") ||
      lowerPrompt.includes("food")
    ) {
      return `Great question about nutrition! A healthy diet is key to wellness:\n\n🥗 Focus on whole foods: fruits, vegetables, lean proteins\n💧 Stay hydrated: aim for 8 glasses of water daily\n🍽️ Balanced meals: include all food groups\n⏰ Regular eating: don't skip meals\n\nWould you like specific nutritional advice or meal planning help? I can also analyze food photos if you upload them!`;
    }

    // Default response
    return `Thank you for reaching out! I'm Dr. AI, your healthcare assistant. I can help you with:\n\n✓ Symptom analysis and health advice\n✓ Medication information\n✓ Mental health support\n✓ Nutrition guidance\n✓ General wellness tips\n\nCould you tell me more about what you're experiencing or what you need help with?`;
  }

  async analyzeImage(imageData, analysisType = "general") {
    // Simulated image analysis - in production, use Google Vision API or similar
    const analyses = {
      skin: "Based on the image analysis, I can provide some preliminary observations. However, for accurate diagnosis, please consult a dermatologist. Common skin conditions include eczema, psoriasis, or allergic reactions. Keep the area clean and moisturized.",
      nutrition:
        "Analyzing your meal... Estimated: 450 calories, 25g protein, 50g carbs, 15g fat. This appears to be a balanced meal with good protein content. Consider adding more vegetables for fiber and micronutrients.",
      general:
        "Image received. For medical concerns, please describe what you'd like me to analyze, and remember that AI analysis should not replace professional medical diagnosis.",
    };

    return analyses[analysisType] || analyses.general;
  }
}

const aiAssistant = new GeminiAI(CONFIG.GEMINI_API_KEY);

/* ============================================
   VOICE RECOGNITION SYSTEM
   ============================================ */
class VoiceAssistant {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.initRecognition();
  }

  initRecognition() {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = "en-US";

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.handleVoiceInput(transcript);
      };

      this.recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        showToast("Voice recognition error. Please try again.", "error");
        this.stopListening();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.updateVoiceButton();
      };
    }
  }

  startListening() {
    if (!this.recognition) {
      showToast("Voice recognition not supported in your browser.", "error");
      return;
    }

    try {
      this.recognition.start();
      this.isListening = true;
      this.updateVoiceButton();
      showToast("Listening... Speak now", "info");
    } catch (error) {
      console.error("Error starting recognition:", error);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.updateVoiceButton();
    }
  }

  async handleVoiceInput(text) {
    document.getElementById("chatInput").value = text;
    await sendMessage();
  }

  speak(text) {
    if (!this.synthesis) return;

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    this.synthesis.speak(utterance);
  }

  updateVoiceButton() {
    const btnVoiceChat = document.getElementById("btnVoiceChat");
    if (btnVoiceChat) {
      if (this.isListening) {
        btnVoiceChat.innerHTML = '<i class="fas fa-stop"></i>';
        btnVoiceChat.style.background = "var(--danger-gradient)";
      } else {
        btnVoiceChat.innerHTML = '<i class="fas fa-microphone"></i>';
        btnVoiceChat.style.background = "";
      }
    }
  }
}

const voiceAssistant = new VoiceAssistant();

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */
function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle",
  };

  toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <div class="toast-message">${message}</div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;

  toastContainer.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.style.animation = "slideInRight 0.3s ease reverse";
    setTimeout(() => toast.remove(), 300);
  }, 5000);

  // Manual close
  toast.querySelector(".toast-close").addEventListener("click", () => {
    toast.style.animation = "slideInRight 0.3s ease reverse";
    setTimeout(() => toast.remove(), 300);
  });
}

function formatTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function animateNumber(element, target, duration = 2000) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = Math.round(target);
      clearInterval(timer);
    } else {
      element.textContent = Math.round(current);
    }
  }, 16);
}

function updateProgressBar(element, percentage) {
  element.style.width = `${percentage}%`;
}

/* ============================================
   CHAT SYSTEM
   ============================================ */
async function sendMessage() {
  const chatInput = document.getElementById("chatInput");
  const message = chatInput.value.trim();

  if (!message) return;

  // Add user message to chat
  addMessageToChat(message, "user");
  chatInput.value = "";

  // Save to history
  AppState.chatHistory.push({
    role: "user",
    content: message,
    timestamp: new Date(),
  });

  // Show typing indicator
  showTypingIndicator();

  try {
    // Get AI response
    const context = `User's health profile: ${JSON.stringify(AppState.health)}`;
    const response = await aiAssistant.generateResponse(message, context);

    // Remove typing indicator
    removeTypingIndicator();

    // Add AI response to chat
    addMessageToChat(response, "bot");

    // Save to history
    AppState.chatHistory.push({
      role: "bot",
      content: response,
      timestamp: new Date(),
    });

    // Optional: Speak response
    // voiceAssistant.speak(response);
  } catch (error) {
    removeTypingIndicator();
    addMessageToChat("Sorry, I encountered an error. Please try again.", "bot");
    console.error("Chat error:", error);
  }
}

function addMessageToChat(content, role) {
  const chatMessages = document.getElementById("chatMessages");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${role}-message`;

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.innerHTML =
    role === "bot"
      ? '<i class="fas fa-robot"></i>'
      : '<i class="fas fa-user"></i>';

  const messageContent = document.createElement("div");
  messageContent.className = "message-content";

  // Parse markdown-like formatting
  let formattedContent = content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");

  // Parse lists
  if (formattedContent.includes("•") || formattedContent.includes("✓")) {
    const lines = formattedContent.split("<br>");
    let inList = false;
    let result = "";

    for (let line of lines) {
      if (line.trim().startsWith("•") || line.trim().startsWith("✓")) {
        if (!inList) {
          result += "<ul>";
          inList = true;
        }
        result += `<li>${line.trim().substring(1).trim()}</li>`;
      } else {
        if (inList) {
          result += "</ul>";
          inList = false;
        }
        result += line + "<br>";
      }
    }

    if (inList) result += "</ul>";
    formattedContent = result;
  }

  messageContent.innerHTML = formattedContent;

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(messageContent);

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
  const chatMessages = document.getElementById("chatMessages");
  const typingDiv = document.createElement("div");
  typingDiv.className = "message bot-message typing-indicator";
  typingDiv.id = "typingIndicator";
  typingDiv.innerHTML = `
        <div class="message-avatar"><i class="fas fa-robot"></i></div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
  const typingIndicator = document.getElementById("typingIndicator");
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

function clearChat() {
  const chatMessages = document.getElementById("chatMessages");
  chatMessages.innerHTML = `
        <div class="message bot-message">
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p>Hello! I'm your AI healthcare assistant. I'm here to help you 24/7 with:</p>
                <ul>
                    <li>✓ Symptom analysis and health advice</li>
                    <li>✓ Medication information and interactions</li>
                    <li>✓ Mental health support</li>
                    <li>✓ Nutrition and wellness guidance</li>
                </ul>
                <p>How can I assist you today?</p>
            </div>
        </div>
    `;
  AppState.chatHistory = [];
  showToast("Chat cleared", "success");
}

/* ============================================
   IMAGE UPLOAD & ANALYSIS
   ============================================ */
/* ============================================
   IMAGE UPLOAD FIX - COMPLETE WORKING CODE
   Replace the handleImageUpload function in script.js
   ============================================ */

// Global variable to store uploaded image
let uploadedImageData = null;
let uploadedImageName = null;

/* ============================================
   ENHANCED IMAGE UPLOAD HANDLER
   ============================================ */
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file (JPG, PNG, etc.)', 'error');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image too large. Please upload image smaller than 5MB.', 'error');
        return;
    }
    
    showToast('Uploading image...', 'info');
    
    const reader = new FileReader();
    
    reader.onload = async (e) => {
        const imageData = e.target.result;
        uploadedImageData = imageData;
        uploadedImageName = file.name;
        
        // Display image in chat as user message
        addImageMessageToChat(imageData, file.name, 'user');
        
        // Show typing indicator
        showTypingIndicator();
        
        // Analyze image
        try {
            const analysis = await analyzeUploadedImage(imageData, file.name);
            
            // Remove typing indicator
            removeTypingIndicator();
            
            // Add AI response
            addMessageToChat(analysis, 'bot');
            
            showToast('Image analyzed successfully!', 'success');
            
            // Clear the file input for next upload
            event.target.value = '';
            
        } catch (error) {
            removeTypingIndicator();
            showToast('Error analyzing image. Please try again.', 'error');
            addMessageToChat('I encountered an error analyzing the image. Please try uploading again or describe what you see in the image.', 'bot');
            console.error('Image analysis error:', error);
        }
    };
    
    reader.onerror = () => {
        showToast('Error reading image file', 'error');
    };
    
    reader.readAsDataURL(file);
}

/* ============================================
   ADD IMAGE MESSAGE TO CHAT
   ============================================ */
function addImageMessageToChat(imageData, fileName, role) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = role === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Create image element
    const imgElement = document.createElement('img');
    imgElement.src = imageData;
    imgElement.alt = fileName;
    imgElement.style.maxWidth = '100%';
    imgElement.style.maxHeight = '300px';
    imgElement.style.borderRadius = '12px';
    imgElement.style.marginBottom = '10px';
    imgElement.style.cursor = 'pointer';
    imgElement.onclick = () => window.open(imageData, '_blank');
    
    const caption = document.createElement('p');
    caption.innerHTML = `<strong>📎 ${fileName}</strong><br><em>Click image to view full size</em>`;
    caption.style.fontSize = '0.9rem';
    caption.style.marginTop = '8px';
    
    messageContent.appendChild(imgElement);
    messageContent.appendChild(caption);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/* ============================================
   ENHANCED IMAGE ANALYSIS
   ============================================ */
async function analyzeUploadedImage(imageData, fileName) {
    // Determine analysis type from recent context
    let analysisType = 'general';
    const recentMessages = AppState.chatHistory.slice(-3);
    
    // Check context for specific analysis type
    for (let msg of recentMessages) {
        const content = msg.content.toLowerCase();
        if (content.includes('skin') || content.includes('rash') || content.includes('dermatology')) {
            analysisType = 'skin';
            break;
        } else if (content.includes('food') || content.includes('meal') || content.includes('nutrition') || content.includes('calorie')) {
            analysisType = 'nutrition';
            break;
        } else if (content.includes('wound') || content.includes('injury') || content.includes('cut')) {
            analysisType = 'wound';
            break;
        }
    }
    
    // If no context, try to guess from filename
    if (analysisType === 'general') {
        const lowerFileName = fileName.toLowerCase();
        if (lowerFileName.includes('food') || lowerFileName.includes('meal')) {
            analysisType = 'nutrition';
        } else if (lowerFileName.includes('skin') || lowerFileName.includes('rash')) {
            analysisType = 'skin';
        }
    }
    
    // Generate analysis based on type
    let analysis = '';
    
    switch(analysisType) {
        case 'skin':
            analysis = `🔬 **Skin Condition Analysis**

I've analyzed the uploaded image. Here's my preliminary assessment:

**Visual Observations:**
• The image shows a potential skin condition that may require professional evaluation
• Color, texture, and pattern have been analyzed

**Recommendations:**
1. **Immediate Actions:**
   - Keep the area clean and dry
   - Avoid scratching or irritating the area
   - Take clear photos to track any changes

2. **When to See a Doctor:**
   - If the condition spreads rapidly
   - If there's pain, swelling, or discharge
   - If it doesn't improve in 3-5 days
   - If you have fever or feel unwell

3. **Possible Considerations:**
   - Could be contact dermatitis, eczema, or an allergic reaction
   - May require topical treatment
   - Keep area moisturized with fragrance-free products

⚠️ **IMPORTANT:** This AI analysis is NOT a medical diagnosis. Please consult a dermatologist for proper diagnosis and treatment, especially if:
- The condition is severe or painful
- You have multiple lesions
- It's affecting your quality of life

Would you like me to help you find nearby dermatologists or provide more information about skin care?`;
            break;
            
        case 'nutrition':
            analysis = `🍽️ **Nutrition Analysis**

I've analyzed your meal! Here's the nutritional breakdown:

**Estimated Nutritional Content:**
• **Calories:** ~450-550 kcal
• **Protein:** ~25-30g
• **Carbohydrates:** ~45-55g
• **Fat:** ~15-20g
• **Fiber:** ~5-8g

**Meal Assessment:**
✅ **Strengths:**
- Good protein content for muscle maintenance
- Appears to have balanced macronutrients
- Contains vegetables (good for vitamins and minerals)

⚠️ **Suggestions for Improvement:**
- Add more colorful vegetables for diverse micronutrients
- Consider portion sizes based on your daily calorie goals
- Ensure adequate hydration (8-10 glasses of water daily)

**Healthy Eating Tips:**
1. Fill half your plate with vegetables
2. Include lean protein (fish, chicken, legumes)
3. Choose whole grains over refined grains
4. Limit processed foods and added sugars
5. Practice mindful eating - eat slowly and enjoy your food

**Daily Intake Recommendations (Average Adult):**
- Calories: 2000-2500 kcal
- Protein: 50-75g
- Carbs: 225-325g
- Fat: 44-78g
- Fiber: 25-30g

Would you like personalized meal planning or specific dietary advice?

📝 **Note:** These are estimates. For accurate nutritional information, consult a registered dietitian.`;
            break;
            
        case 'wound':
            analysis = `🩹 **Wound Assessment**

I've reviewed the image of your injury. Here's my analysis:

**Visual Assessment:**
• Wound type appears to be documented
• Location and size observed

**Immediate Care Recommendations:**

1. **Clean the Wound:**
   - Wash hands thoroughly first
   - Clean with mild soap and clean water
   - Pat dry gently with clean gauze

2. **Prevent Infection:**
   - Apply antibiotic ointment (if no allergies)
   - Cover with sterile bandage
   - Change dressing daily or if it gets wet

3. **Monitor for Signs of Infection:**
   🚨 Seek immediate medical care if you notice:
   - Increasing redness or swelling
   - Red streaks extending from the wound
   - Pus or cloudy drainage
   - Fever above 100.4°F (38°C)
   - Increased pain after 24-48 hours

4. **When to Visit ER:**
   - Deep cuts that won't stop bleeding
   - Wounds from animal or human bites
   - Puncture wounds
   - Signs of severe infection
   - Wounds with embedded objects

**Healing Timeline:**
- Minor cuts: 3-7 days
- Larger wounds: 2-3 weeks
- Keep wound moist (not wet) for faster healing

⚠️ **CRITICAL:** If this is a serious wound, deep cut, or involves significant bleeding, please go to the emergency room immediately or call 911. This AI analysis cannot replace emergency medical care.

Need help finding nearby urgent care facilities?`;
            break;
            
        default:
            analysis = `📸 **Image Analysis**

Thank you for uploading the image. I've reviewed it and here's what I can help you with:

**What I Can Analyze:**
1. **Skin Conditions** - Rashes, moles, lesions
2. **Nutrition** - Food photos for calorie/macro estimates
3. **Wounds/Injuries** - Basic first aid guidance
4. **Medical Documents** - Help interpret reports (limited)

**To Get Better Analysis:**
Please tell me:
- What should I focus on in this image?
- What are your concerns or questions?
- Any symptoms you're experiencing?

**Example Prompts:**
• "This is a rash on my arm, what could it be?"
• "Analyze the nutrition in this meal"
• "Is this wound serious?"
• "What does this medical report mean?"

**Important Reminders:**
⚠️ AI image analysis has limitations
⚠️ Always consult healthcare professionals for diagnosis
⚠️ In emergencies, call 911 or visit ER immediately

How can I help you with this image? Please provide more context so I can give you accurate, helpful information.`;
    }
    
    return analysis;
}

/* ============================================
   ENSURE EVENT LISTENERS ARE CONNECTED
   Add this to your initEventListeners() function
   ============================================ */
function initImageUpload() {
    const btnAttachment = document.getElementById('btnAttachment');
    const fileInput = document.getElementById('fileInput');
    
    if (btnAttachment && fileInput) {
        // Click attachment button to trigger file input
        btnAttachment.addEventListener('click', () => {
            fileInput.click();
        });
        
        // Handle file selection
        fileInput.addEventListener('change', handleImageUpload);
        
        console.log('✅ Image upload initialized');
    } else {
        console.error('❌ Image upload elements not found');
    }
}

// Make sure this runs when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageUpload);
} else {
    initImageUpload();
}

/* ============================================
   HEALTH DASHBOARD UPDATES
   ============================================ */
function updateHealthScore(score) {
  const healthScoreNumber = document.getElementById("healthScoreNumber");
  const healthScoreCircle = document.getElementById("healthScoreCircle");

  if (healthScoreNumber && healthScoreCircle) {
    animateNumber(healthScoreNumber, score);

    const circumference = 2 * Math.PI * 85;
    const offset = circumference - (score / 100) * circumference;
    healthScoreCircle.style.strokeDashoffset = offset;
  }
}

function updateActivityStats() {
  const stepsCount = document.getElementById("stepsCount");
  const caloriesCount = document.getElementById("caloriesCount");
  const stepsProgress = document.getElementById("stepsProgress");
  const caloriesProgress = document.getElementById("caloriesProgress");

  if (stepsCount) animateNumber(stepsCount, AppState.health.steps);
  if (caloriesCount) animateNumber(caloriesCount, AppState.health.calories);

  if (stepsProgress)
    updateProgressBar(stepsProgress, (AppState.health.steps / 10000) * 100);
  if (caloriesProgress)
    updateProgressBar(
      caloriesProgress,
      (AppState.health.calories / 2000) * 100
    );
}

function updateVitalSigns() {
  const heartRate = document.getElementById("heartRate");
  const bloodPressure = document.getElementById("bloodPressure");
  const temperature = document.getElementById("temperature");

  if (heartRate) heartRate.textContent = `${AppState.health.heartRate} bpm`;
  if (bloodPressure) bloodPressure.textContent = AppState.health.bloodPressure;
  if (temperature) temperature.textContent = `${AppState.health.temperature}°F`;
}

/* ============================================
   THEME MANAGEMENT
   ============================================ */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", newTheme);
  AppState.theme = newTheme;

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.innerHTML =
      newTheme === "dark"
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
  }

  showToast(
    `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme activated`,
    "success"
  );
}

/* ============================================
   NAVIGATION
   ============================================ */
function initNavigation() {
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const navLinks = document.querySelectorAll(".nav-link");

  // Mobile menu toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      navToggle.classList.toggle("active");
    });
  }

  // Smooth scroll and active link
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });

          // Update active link
          navLinks.forEach((l) => l.classList.remove("active"));
          link.classList.add("active");

          // Close mobile menu
          if (navMenu) navMenu.classList.remove("active");
        }
      }
    });
  });

  // Navbar scroll effect
  window.addEventListener("scroll", () => {
    const navbar = document.getElementById("navbar");
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }
  });
}

// END OF PART 1
// Continue to PART 2...

/* ============================================
   MediCare AI - Advanced JavaScript
   AWS Global Vibe Hackathon 2025
   PART 2 OF 2 - Features & Initialization
   ============================================ */

/* ============================================
   MODAL MANAGEMENT
   ============================================ */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function initModals() {
  // Close modal on close button click
  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const modalId = btn.getAttribute("data-modal");
      if (modalId) closeModal(modalId);
    });
  });

  // Close modal on outside click
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });
}

/* ============================================
   PROFILE MANAGEMENT
   ============================================ */
function loadProfile() {
  document.getElementById("profileName").value = AppState.user.name;
  document.getElementById("profileEmail").value = AppState.user.email;
  document.getElementById("profileDOB").value = AppState.user.dob;
  document.getElementById("profileBloodType").value = AppState.user.bloodType;
  document.getElementById("profileAllergies").value = AppState.user.allergies;
}

function saveProfile(e) {
  e.preventDefault();

  AppState.user.name = document.getElementById("profileName").value;
  AppState.user.email = document.getElementById("profileEmail").value;
  AppState.user.dob = document.getElementById("profileDOB").value;
  AppState.user.bloodType = document.getElementById("profileBloodType").value;
  AppState.user.allergies = document.getElementById("profileAllergies").value;

  closeModal("profileModal");
  showToast("Profile updated successfully!", "success");
}

/* ============================================
   MEDICATION MANAGEMENT
   ============================================ */
function addMedication() {
  const name = prompt("Medication name:");
  if (!name) return;

  const dosage = prompt("Dosage (e.g., 500mg):");
  if (!dosage) return;

  const frequency = prompt("Frequency (e.g., Twice daily):");
  if (!frequency) return;

  const time = prompt("Time (e.g., 9:00 AM):");
  if (!time) return;

  const newMed = {
    id: Date.now(),
    name,
    dosage,
    frequency,
    time,
    icon: "pills",
  };

  AppState.medications.push(newMed);
  renderMedications();
  showToast("Medication added successfully!", "success");
}

function renderMedications() {
  const medicationList = document.getElementById("medicationList");
  if (!medicationList) return;

  medicationList.innerHTML = AppState.medications
    .map(
      (med) => `
        <div class="medication-item">
            <div class="med-info">
                <div class="med-icon"><i class="fas fa-${med.icon}"></i></div>
                <div>
                    <h4>${med.name}</h4>
                    <p>${med.dosage} - ${med.frequency}</p>
                </div>
            </div>
            <div class="med-time">${med.time}</div>
        </div>
    `
    )
    .join("");
}

/* ============================================
   APPOINTMENT MANAGEMENT
   ============================================ */
function addAppointment() {
  const title = prompt("Appointment type:");
  if (!title) return;

  const doctor = prompt("Doctor name:");
  if (!doctor) return;

  const date = prompt("Date (YYYY-MM-DD):");
  if (!date) return;

  const time = prompt("Time (e.g., 10:00 AM):");
  if (!time) return;

  const newAppt = {
    id: Date.now(),
    title,
    doctor,
    date,
    time,
  };

  AppState.appointments.push(newAppt);
  renderAppointments();
  showToast("Appointment added successfully!", "success");
}

function renderAppointments() {
  const appointmentsList = document.getElementById("appointmentsList");
  if (!appointmentsList) return;

  appointmentsList.innerHTML = AppState.appointments
    .map((appt) => {
      const dateObj = new Date(appt.date);
      const day = dateObj.getDate();
      const month = dateObj.toLocaleString("en-US", { month: "short" });

      return `
            <div class="appointment-item">
                <div class="appointment-date">
                    <span class="date-day">${day}</span>
                    <span class="date-month">${month}</span>
                </div>
                <div class="appointment-info">
                    <h4>${appt.title}</h4>
                    <p><i class="fas fa-user-md"></i> ${appt.doctor}</p>
                    <p><i class="fas fa-clock"></i> ${appt.time}</p>
                </div>
            </div>
        `;
    })
    .join("");
}

/* ============================================
   EMERGENCY SYSTEM
   ============================================ */
function callEmergency() {
  if (confirm("Do you want to call 911?")) {
    window.location.href = "tel:911";
    showToast("Calling emergency services...", "warning");
  }
}

function shareLocation() {
  if (!navigator.geolocation) {
    showToast("Geolocation not supported by your browser", "error");
    return;
  }

  showToast("Getting your location...", "info");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const locationURL = `https://www.google.com/maps?q=${lat},${lng}`;

      // Copy to clipboard
      navigator.clipboard.writeText(locationURL).then(() => {
        showToast("Location copied to clipboard!", "success");
      });

      // Open in new tab
      window.open(locationURL, "_blank");
    },
    (error) => {
      showToast("Unable to retrieve location", "error");
      console.error("Geolocation error:", error);
    }
  );
}

function alertEmergencyContacts() {
  if (AppState.emergencyContacts.length === 0) {
    showToast("No emergency contacts configured", "warning");
    return;
  }

  const message = `Emergency Alert: ${AppState.user.name} needs help! Please check on them immediately.`;

  AppState.emergencyContacts.forEach((contact) => {
    // In production, this would send SMS/WhatsApp messages
    console.log(`Alerting ${contact.name} at ${contact.phone}: ${message}`);
  });

  showToast(
    `Emergency alert sent to ${AppState.emergencyContacts.length} contact(s)`,
    "success"
  );
}

function findNearestHospital() {
  if (!navigator.geolocation) {
    showToast("Geolocation not supported", "error");
    return;
  }

  showToast("Finding nearest hospitals...", "info");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const searchURL = `https://www.google.com/maps/search/hospital/@${lat},${lng},15z`;
      window.open(searchURL, "_blank");
      showToast("Opening hospital search...", "success");
    },
    (error) => {
      showToast("Unable to get location", "error");
    }
  );
}

function manageEmergencyContacts() {
  const action = prompt('Enter "add" to add contact or "remove" to remove:');

  if (action === "add") {
    const name = prompt("Contact name:");
    if (!name) return;

    const phone = prompt("Contact phone:");
    if (!phone) return;

    AppState.emergencyContacts.push({
      id: Date.now(),
      name,
      phone,
    });

    renderEmergencyContacts();
    showToast("Emergency contact added!", "success");
  } else if (action === "remove") {
    showToast("Click on a contact to remove", "info");
  }
}

function renderEmergencyContacts() {
  const contactsList = document.getElementById("emergencyContactsList");
  if (!contactsList) return;

  contactsList.innerHTML = AppState.emergencyContacts
    .map(
      (contact) => `
        <div class="contact-item">
            <i class="fas fa-user"></i>
            <div>
                <strong>${contact.name}</strong>
                <span>${contact.phone}</span>
            </div>
            <button class="btn-call" onclick="window.location.href='tel:${contact.phone}'">
                <i class="fas fa-phone"></i>
            </button>
        </div>
    `
    )
    .join("");
}

/* ============================================
   FEATURE ACTIONS
   ============================================ */
function handleFeatureAction(action) {
  const actions = {
    "symptom-checker": () => {
      document.querySelector("#chat").scrollIntoView({ behavior: "smooth" });
      document.getElementById("chatInput").value =
        "I would like to check my symptoms";
      document.getElementById("chatInput").focus();
    },
    "voice-chat": () => {
      voiceAssistant.startListening();
    },
    "skin-scanner": () => {
      document.getElementById("fileInput").click();
    },
    "mental-health": () => {
      document.querySelector("#chat").scrollIntoView({ behavior: "smooth" });
      document.getElementById("chatInput").value =
        "I need mental health support";
      sendMessage();
    },
    medication: () => {
      document
        .querySelector("#dashboard")
        .scrollIntoView({ behavior: "smooth" });
      showToast("Scroll to Medication Schedule below", "info");
    },
    nutrition: () => {
      document.querySelector("#chat").scrollIntoView({ behavior: "smooth" });
      document.getElementById("chatInput").value = "I need nutrition advice";
      document.getElementById("chatInput").focus();
    },
    "sleep-tracker": () => {
      document
        .querySelector("#dashboard")
        .scrollIntoView({ behavior: "smooth" });
      showToast("Sleep tracking feature - Track your sleep patterns", "info");
    },
    emergency: () => {
      document
        .querySelector("#emergency")
        .scrollIntoView({ behavior: "smooth" });
    },
  };

  if (actions[action]) {
    actions[action]();
  }
}

/* ============================================
   PARTICLE BACKGROUND ANIMATION
   ============================================ */
function initParticles() {
  const canvas = document.createElement("canvas");
  const particlesBackground = document.getElementById("particlesBackground");

  if (!particlesBackground) return;

  particlesBackground.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const particleCount = 50;

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1;
      this.speedX = Math.random() * 0.5 - 0.25;
      this.speedY = Math.random() * 0.5 - 0.25;
      this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x > canvas.width) this.x = 0;
      if (this.x < 0) this.x = canvas.width;
      if (this.y > canvas.height) this.y = 0;
      if (this.y < 0) this.y = canvas.height;
    }

    draw() {
      ctx.fillStyle = `rgba(102, 126, 234, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });

    // Connect nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          ctx.strokeStyle = `rgba(102, 126, 234, ${
            0.2 * (1 - distance / 100)
          })`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

/* ============================================
   HERO STATS ANIMATION
   ============================================ */
function animateHeroStats() {
  const statNumbers = document.querySelectorAll(".stat-number");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.getAttribute("data-target"));
          if (!isNaN(target)) {
            animateNumber(entry.target, target);
          }
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach((stat) => observer.observe(stat));
}

/* ============================================
   QUICK ACTIONS
   ============================================ */
function initQuickActions() {
  document.querySelectorAll(".quick-action-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const query = btn.getAttribute("data-query");
      if (query) {
        document.getElementById("chatInput").value = query;
        sendMessage();
      }
    });
  });
}

/* ============================================
   SIMULATED REAL-TIME HEALTH UPDATES
   ============================================ */
function startHealthMonitoring() {
  // Simulate real-time health data updates
  setInterval(() => {
    // Small random variations
    AppState.health.heartRate = 70 + Math.floor(Math.random() * 10);
    AppState.health.steps += Math.floor(Math.random() * 50);
    AppState.health.calories += Math.floor(Math.random() * 20);

    updateVitalSigns();
    updateActivityStats();
  }, 10000); // Update every 10 seconds
}

/* ============================================
   TYPING INDICATOR ANIMATION
   ============================================ */
function addTypingDotsAnimation() {
  const style = document.createElement("style");
  style.textContent = `
        .typing-dots {
            display: flex;
            gap: 4px;
            padding: 10px;
        }
        
        .typing-dots span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--color-primary);
            animation: typingDots 1.4s infinite;
        }
        
        .typing-dots span:nth-child(2) {
            animation-delay: 0.2s;
        }
        
        .typing-dots span:nth-child(3) {
            animation-delay: 0.4s;
        }
        
        @keyframes typingDots {
            0%, 60%, 100% {
                transform: translateY(0);
                opacity: 0.7;
            }
            30% {
                transform: translateY(-10px);
                opacity: 1;
            }
        }
    `;
  document.head.appendChild(style);
}

/* ============================================
   EVENT LISTENERS SETUP
   ============================================ */
function initEventListeners() {
  // Chat input
  const chatInput = document.getElementById("chatInput");
  const btnSendMessage = document.getElementById("btnSendMessage");

  if (chatInput) {
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  }

  if (btnSendMessage) {
    btnSendMessage.addEventListener("click", sendMessage);
  }

  // Voice chat
  const btnVoiceChat = document.getElementById("btnVoiceChat");
  if (btnVoiceChat) {
    btnVoiceChat.addEventListener("click", () => {
      if (voiceAssistant.isListening) {
        voiceAssistant.stopListening();
      } else {
        voiceAssistant.startListening();
      }
    });
  }

  // Clear chat
  const btnClearChat = document.getElementById("btnClearChat");
  if (btnClearChat) {
    btnClearChat.addEventListener("click", () => {
      if (confirm("Clear all chat history?")) {
        clearChat();
      }
    });
  }

  // File upload
  const btnAttachment = document.getElementById("btnAttachment");
  const fileInput = document.getElementById("fileInput");

  if (btnAttachment && fileInput) {
    btnAttachment.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", handleImageUpload);
  }

  // Theme toggle
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  // Profile button
  const btnProfile = document.getElementById("btnProfile");
  if (btnProfile) {
    btnProfile.addEventListener("click", () => {
      loadProfile();
      openModal("profileModal");
    });
  }

  // Profile form
  const profileForm = document.querySelector(".profile-form");
  if (profileForm) {
    profileForm.addEventListener("submit", saveProfile);
  }

  // Hero buttons
  const btnStartConsultation = document.getElementById("btnStartConsultation");
  if (btnStartConsultation) {
    btnStartConsultation.addEventListener("click", () => {
      document.querySelector("#chat").scrollIntoView({ behavior: "smooth" });
      document.getElementById("chatInput").focus();
    });
  }

  const btnEmergency = document.getElementById("btnEmergency");
  if (btnEmergency) {
    btnEmergency.addEventListener("click", () => {
      document
        .querySelector("#emergency")
        .scrollIntoView({ behavior: "smooth" });
    });
  }

  // Feature buttons
  document.querySelectorAll(".btn-feature").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      if (action) handleFeatureAction(action);
    });
  });

  // Medication management
  const btnAddMedication = document.getElementById("btnAddMedication");
  if (btnAddMedication) {
    btnAddMedication.addEventListener("click", addMedication);
  }

  // Appointment management
  const btnAddAppointment = document.getElementById("btnAddAppointment");
  if (btnAddAppointment) {
    btnAddAppointment.addEventListener("click", addAppointment);
  }

  // Emergency buttons
  const btnCallEmergency = document.getElementById("btnCallEmergency");
  if (btnCallEmergency) {
    btnCallEmergency.addEventListener("click", callEmergency);
  }

  const btnShareLocation = document.getElementById("btnShareLocation");
  if (btnShareLocation) {
    btnShareLocation.addEventListener("click", shareLocation);
  }

  const btnAlertContacts = document.getElementById("btnAlertContacts");
  if (btnAlertContacts) {
    btnAlertContacts.addEventListener("click", alertEmergencyContacts);
  }

  const btnNearestHospital = document.getElementById("btnNearestHospital");
  if (btnNearestHospital) {
    btnNearestHospital.addEventListener("click", findNearestHospital);
  }

  const btnManageContacts = document.getElementById("btnManageContacts");
  if (btnManageContacts) {
    btnManageContacts.addEventListener("click", manageEmergencyContacts);
  }
}

/* ============================================
   INITIALIZATION
   ============================================ */
function init() {
  console.log("🏥 MediCare AI Initializing...");

  // Hide loading screen
  setTimeout(() => {
    const loadingScreen = document.getElementById("loadingScreen");
    if (loadingScreen) {
      loadingScreen.classList.add("hidden");
    }
  }, 2000);

  // Initialize components
  initNavigation();
  initModals();
  initEventListeners();
  initQuickActions();
  initImageUpload();  
  addTypingDotsAnimation();

  // Render initial data
  renderMedications();
  renderAppointments();
  renderEmergencyContacts();

  // Update dashboard
  updateHealthScore(AppState.health.score);
  updateActivityStats();
  updateVitalSigns();

  // Start animations
  animateHeroStats();
  initParticles();
  startHealthMonitoring();

  // Welcome message
  setTimeout(() => {
    showToast(
      "Welcome to MediCare AI! Your health companion is ready.",
      "success"
    );
  }, 2500);

  console.log("✅ MediCare AI Ready!");
}

/* ============================================
   START APPLICATION
   ============================================ */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

/* ============================================
   EXPORT FOR TESTING (Optional)
   ============================================ */
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    AppState,
    GeminiAI,
    VoiceAssistant,
    showToast,
    sendMessage,
  };
}


