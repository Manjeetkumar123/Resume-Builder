import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  FileText,
  FolderIcon,
  GraduationCap,
  Share2Icon,
  Sparkles,
  User
} from 'lucide-react';

import PersonalInfoForm from '../components/PersonalInfoForm';
import ResumePreview from '../components/ResumePreview';
import TemplateSelector from '../components/TemplateSelector';
import ColorPicker from '../components/ColorPicker';
import ProfessionalSummaryForm from '../components/ProfessionalSummaryForm';
import ExperienceForm from '../components/ExperienceForm';
import EducationForm from '../components/EducationForm';
import ProjectForm from '../components/ProjectForm';
import SkillsForm from '../components/SkillsForm';

import { useSelector } from 'react-redux';
import api from '../configs/api';
import toast from 'react-hot-toast';

const ResumeBuilder = () => {
  const { resumeId } = useParams();
  const { token } = useSelector(state => state.auth);

  const [resumeData, setResumeData] = useState({
    _id: '',
    title: '',
    personal_info: {},
    professional_summary: "",
    experience: [],
    education: [],
    project: [],
    skills: [],
    template: "classic",
    accent_color: "#3B82F6",
    public: false,
  });

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  const sections = [
    { id: "personal", name: "Personal Info", icon: User },
    { id: "summary", name: "Summary", icon: FileText },
    { id: "experience", name: "Experience", icon: Briefcase },
    { id: "education", name: "Education", icon: GraduationCap },
    { id: "projects", name: "Projects", icon: FolderIcon },
    { id: "skills", name: "Skills", icon: Sparkles },
  ];

  const activeSection = sections[activeSectionIndex];

  const loadExistingResume = async () => {
    try {
      const { data } = await api.get('/api/resumes/get/' + resumeId, {
        headers: { Authorization: token }
      });

      if (data.resume) {
        setResumeData(data.resume);
        document.title = data.resume.title;
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    loadExistingResume();
  }, []);

  const saveResume = async () => {
    try {
      let updatedResumeData = structuredClone(resumeData);

      if (
        typeof resumeData.personal_info?.image === "object" &&
        resumeData.personal_info.image !== null
      ) {
        delete updatedResumeData.personal_info.image;
      }

      if (resumeData.personal_info?.image === "") {
        updatedResumeData.personal_info.image = "";
      }

      const formData = new FormData();

      formData.append("resumeId", resumeId);
      formData.append(
        "resumeData",
        JSON.stringify(updatedResumeData)
      );

      if (
        resumeData.personal_info?.image &&
        typeof resumeData.personal_info.image === "object"
      ) {
        formData.append(
          "image",
          resumeData.personal_info.image
        );
      }

      const { data } = await api.put(
        "/api/resumes/update",
        formData,
        {
          headers: {
            Authorization: token
          }
        }
      );

      setResumeData((prev) => ({
        ...prev,
        ...(data.resume || {})
      }));

      toast.success("Saved Successfully");

    } catch (error) {
      console.error("Error saving resume:", error);

      toast.error(
        error?.response?.data?.message ||
        error.message ||
        "Failed to save resume"
      );
    }
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link
          to="/app"
          className="inline-flex gap-2 items-center text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-12 gap-8">

          {/* LEFT PANEL */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg shadow-sm border p-6">

              {/* Progress + Controls */}
              <div className="relative mb-6">

                {/* Gray Line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gray-200 rounded"></div>

                {/* Blue Progress Line */}
                <div
                  className="absolute top-0 left-0 h-[3px] bg-blue-500 rounded transition-all duration-500"
                  style={{
                    width: `${((activeSectionIndex + 1) * 100) / sections.length}%`
                  }}
                ></div>

                <div className="flex justify-between items-center pt-6">
                  <div className="flex items-center gap-2">
                    <TemplateSelector
                      selectedTemplate={resumeData.template}
                      onChange={(template) =>
                        setResumeData(prev => ({
                          ...prev,
                          template
                        }))
                      }
                    />

                    <ColorPicker
                      selectedColor={resumeData.accent_color}
                      onChange={(color) =>
                        setResumeData(prev => ({
                          ...prev,
                          accent_color: color
                        }))
                      }
                    />
                  </div>

                  {/* Previous / Next Buttons */}
                  <div className="flex items-center">
                    {activeSectionIndex !== 0 && (
                      <button
                        onClick={() =>
                          setActiveSectionIndex(prev =>
                            Math.max(prev - 1, 0)
                          )
                        }
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-black"
                      >
                        <ChevronLeft className="size-4" />
                        Previous
                      </button>
                    )}

                    <button
                      onClick={() =>
                        setActiveSectionIndex(prev =>
                          Math.min(prev + 1, sections.length - 1)
                        )
                      }
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-black"
                    >
                      Next
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Forms */}
              {activeSection.id === "personal" && (
                <PersonalInfoForm
                  data={resumeData.personal_info}
                  onChange={(data) =>
                    setResumeData(prev => ({
                      ...prev,
                      personal_info: data
                    }))
                  }
                />
              )}

              {activeSection.id === "summary" && (
                <ProfessionalSummaryForm
                  data={resumeData.professional_summary}
                  onChange={(data) =>
                    setResumeData(prev => ({
                      ...prev,
                      professional_summary: data
                    }))
                  }
                />
              )}

              {activeSection.id === "experience" && (
                <ExperienceForm
                  data={resumeData.experience}
                  onChange={(data) =>
                    setResumeData(prev => ({
                      ...prev,
                      experience: data
                    }))
                  }
                />
              )}

              {activeSection.id === "education" && (
                <EducationForm
                  data={resumeData.education}
                  onChange={(data) =>
                    setResumeData(prev => ({
                      ...prev,
                      education: data
                    }))
                  }
                />
              )}

              {activeSection.id === "projects" && (
                <ProjectForm
                  data={resumeData.project}
                  onChange={(data) =>
                    setResumeData(prev => ({
                      ...prev,
                      project: data
                    }))
                  }
                />
              )}

              {activeSection.id === "skills" && (
                <SkillsForm
                  data={resumeData.skills}
                  onChange={(data) =>
                    setResumeData(prev => ({
                      ...prev,
                      skills: data
                    }))
                  }
                />
              )}

              <button
                onClick={saveResume}
                className="bg-green-500 text-white px-6 py-2 mt-6 rounded"
              >
                Save Changes
              </button>

            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:col-span-7">
            <ResumePreview
              data={resumeData}
              template={resumeData.template}
              accentColor={resumeData.accent_color}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;