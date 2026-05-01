import imagekit from "../configs/imageKit.js";
import Resume from "../models/Resume.js";
import fs from "fs";

// CREATE
export const createResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { title } = req.body;

    const newResume = await Resume.create({
      userId,
      title
    });

    return res.status(201).json({
      message: "Resume created successfully",
      resume: newResume,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// DELETE
export const deleteResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    await Resume.findOneAndDelete({
      userId,
      _id: resumeId
    });

    return res.status(200).json({
      message: "Resume deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// GET PRIVATE
export const getResumeById = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    const resume = await Resume.findOne({
      userId,
      _id: resumeId
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found"
      });
    }

    return res.status(200).json({
      resume
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// GET PUBLIC
export const getPublicResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findOne({
      public: true,
      _id: resumeId,
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found"
      });
    }

    return res.status(200).json({
      resume
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// UPDATE
export const updateResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId, resumeData } = req.body;
    const image = req.file;

    let resumeDataCopy =
      typeof resumeData === "string"
        ? JSON.parse(resumeData)
        : JSON.parse(JSON.stringify(resumeData));

    // ensure personal_info exists
    if (!resumeDataCopy.personal_info) {
      resumeDataCopy.personal_info = {};
    }

    // ensure experience always exists
    if (!Array.isArray(resumeDataCopy.experience)) {
      resumeDataCopy.experience = [];
    }

    // get remove background value from personal_info
    const removeBackground =
      resumeDataCopy.personal_info.removeBackground || false;

    // image upload with optional background removal
    if (image) {
      const response = await imagekit.files.upload({
        file: fs.readFileSync(image.path).toString("base64"),
        fileName: image.originalname || "resume.png",
        folder: "user_resumes",
        transformation: {
          pre:
            "w-300,h-300,fo-face,z-0.75" +
            (removeBackground ? ",e-bgremove" : ""),
        },
      });

      resumeDataCopy.personal_info.image = response.url;

      if (fs.existsSync(image.path)) {
        fs.unlinkSync(image.path);
      }
    }

    const updatedResume = await Resume.findOneAndUpdate(
      {
        userId,
        _id: resumeId
      },
      {
        $set: {
          title: resumeDataCopy.title,
          personal_info: resumeDataCopy.personal_info,
          professional_summary: resumeDataCopy.professional_summary,
          experience: resumeDataCopy.experience,
          education: resumeDataCopy.education,
          project: resumeDataCopy.project,
          skills: resumeDataCopy.skills,
          template: resumeDataCopy.template,
          accent_color: resumeDataCopy.accent_color,
          public: resumeDataCopy.public
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    return res.status(200).json({
      message: "Saved successfully",
      resume: updatedResume
    });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error("Update Error:", error);

    return res.status(400).json({
      message: error.message
    });
  }
};