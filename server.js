const express = require("express"); 
const cors = require("cors"); 
const Detection = require("./models/Detection"); 
const dotenv = require("dotenv"); 
 
const connectDB = require("./config/db"); 
const authRoutes = require("./routes/auth"); 
const adminRoutes = require("./routes/admin"); 
const historyRoutes = require("./routes/history");
const videoRoutes = require("./routes/video"); 
 
dotenv.config(); 
 
connectDB(); 
 
const app = express(); 
 
app.use(cors()); 
app.use(express.json()); 
app.use(express.static("../frontend")); 
 
 
// Home 
app.get("/", (req, res) => { 
    res.json({ 
        success: true, 
        message: "Online Crime Detection API is running 🚀" 
    }); 
}); 
 
 
// Authentication 
app.use("/api/auth", authRoutes); 
app.use("/api/admin", adminRoutes); 
app.use("/api/history", historyRoutes); 
app.use("/api/video", videoRoutes); 
 
 
 
// Crime Detection 
app.post("/api/detect", async (req, res) => { 
 
    try { 
 
        const { text, userId } = req.body; 
 
        // Check empty input 
        if (!text || text.trim() === "") { 
 
            return res.status(400).json({ 
                success: false, 
                message: "Please enter a message" 
            }); 
 
        } 
 
        // Check userId 
        if (!userId) { 
 
            return res.status(400).json({ 
                success: false, 
                message: "User ID is required" 
            }); 
 
        } 
 
        // Suspicious keywords 
        const suspiciousWords = [ 
            "winner", 
            "won", 
            "prize", 
            "lottery", 
            "urgent", 
            "click here", 
            "verify account", 
            "otp", 
            "bank", 
            "password", 
            "free money", 
            "claim now", 
            "congratulations" 
        ]; 
 
        const lowerText = text.toLowerCase(); 
 
        const matchedWords = 
            suspiciousWords.filter(word => 
                lowerText.includes(word) 
            ); 
 
 
        // Calculate risk 
        let riskLevel; 
        let category; 
        let recommendation; 
        let confidence; 
 
 
        if (matchedWords.length >= 3) { 
 
            riskLevel = "HIGH"; 
            category = "Possible Online Scam"; 
            confidence = "90%"; 
 
            recommendation = 
                "Do not click links or share OTP, password or banking information."; 
 
        } else if (matchedWords.length >= 1) { 
 
            riskLevel = "MEDIUM"; 
            category = "Suspicious Content"; 
            confidence = "70%"; 
 
            recommendation = 
                "Verify the sender before taking any action."; 
 
        } else { 
 
            riskLevel = "LOW"; 
            category = "No Major Threat Detected"; 
            confidence = "95%"; 
 
            recommendation = 
                "Always stay alert while using online services."; 
        } 
 
 
        // Save detection in MongoDB 
        const detection = new Detection({ 
 
            userId: userId, 
 
            text: text, 
 
            riskLevel: riskLevel, 
 
            category: category, 
 
            confidence: confidence, 
 
            suspiciousKeywords: matchedWords, 
 
            recommendation: recommendation 
        }); 
 
 
        await detection.save(); 
 
 
        // Send result 
        res.json({ 
 
            success: true, 
 
            message: "Crime detection completed", 
 
            result: { 
 
                riskLevel, 
 
                category, 
 
                confidence, 
 
                suspiciousKeywords: matchedWords, 
 
                recommendation 
            } 
        }); 
 
 
    } catch (error) { 
 
        console.error( 
            "Detection error:", 
            error 
        ); 
 
        res.status(500).json({ 
 
            success: false, 
 
            message: "Server error" 
        }); 
    } 
 
}); 
 
const PORT = process.env.PORT || 5000; 
 
app.listen(PORT, () => { 
 
    console.log("================================="); 
    console.log("🛡️ Online Crime Detection System"); 
    console.log("================================="); 
    console.log(`🚀 Server running at: http://localhost:${PORT}`); 
 
});   