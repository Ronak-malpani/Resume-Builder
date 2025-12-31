import Contact from "../models/contactModel.js";

export const sendMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // 1. Validation
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // 2. Create new contact entry
    const newContact = new Contact({
      name,
      email,
      message
    });

    // 3. Save to MongoDB
    await newContact.save();

    console.log(" Message Saved to DB:", email);

    res.status(201).json({ success: true, message: "Message received successfully!" });

  } catch (error) {
    console.error("Contact API Error:", error);
    res.status(500).json({ success: false, message: "Server error, please try again." });
  }
};