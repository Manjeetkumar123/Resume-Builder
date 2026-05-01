import React from "react";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

const ModernTemplate = ({ data, accentColor }) => {

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split("-");
        return new Date(year, month - 1).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short"
        });
    };

    return (
        <div className="max-w-5xl mx-auto bg-white shadow-lg">

            {/* Header */}
            <div className="p-6 text-white" style={{ backgroundColor: accentColor }}>
                <h1 className="text-3xl font-bold">
                    {data.personal_info?.full_name || "Your Name"}
                </h1>

                <div className="flex flex-wrap gap-4 mt-3 text-sm">

                    {data.personal_info?.email && (
                        <div className="flex items-center gap-1">
                            <Mail size={16} />
                            <span>{data.personal_info.email}</span>
                        </div>
                    )}

                    {data.personal_info?.phone && (
                        <div className="flex items-center gap-1">
                            <Phone size={16} />
                            <span>{data.personal_info.phone}</span>
                        </div>
                    )}

                    {data.personal_info?.location && (
                        <div className="flex items-center gap-1">
                            <MapPin size={16} />
                            <span>{data.personal_info.location}</span>
                        </div>
                    )}

                    {/* ✅ LinkedIn replaced with Globe */}
                    {data.personal_info?.linkedin && (
                        <div className="flex items-center gap-1">
                            <Globe size={16} />
                            <a
                                href={data.personal_info.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline"
                            >
                                Profile
                            </a>
                        </div>
                    )}

                    {data.personal_info?.website && (
                        <div className="flex items-center gap-1">
                            <Globe size={16} />
                            <span>{data.personal_info.website}</span>
                        </div>
                    )}

                </div>
            </div>

            <div className="p-6">

                {/* Summary */}
                {data.professional_summary && (
                    <section className="mb-6">
                        <h2 className="text-xl font-semibold mb-2" style={{ color: accentColor }}>
                            Summary
                        </h2>
                        <p className="text-gray-700">{data.professional_summary}</p>
                    </section>
                )}

                {/* Experience */}
                {data.experience?.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-xl font-semibold mb-3" style={{ color: accentColor }}>
                            Experience
                        </h2>

                        {data.experience.map((exp, index) => (
                            <div key={index} className="mb-4">
                                <div className="flex justify-between">
                                    <div>
                                        <h3 className="font-semibold">{exp.position}</h3>
                                        <p className="text-gray-600">{exp.company}</p>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {formatDate(exp.start_date)} - {exp.is_current ? "Present" : formatDate(exp.end_date)}
                                    </span>
                                </div>

                                {exp.description && (
                                    <p className="text-gray-700 mt-1 whitespace-pre-line">
                                        {exp.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </section>
                )}

                {/* Projects */}
                {data.project?.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-xl font-semibold mb-3" style={{ color: accentColor }}>
                            Projects
                        </h2>

                        {data.project.map((proj, index) => (
                            <div key={index} className="mb-3">
                                <h3 className="font-semibold">{proj.name}</h3>
                                <p className="text-gray-600">{proj.description}</p>
                            </div>
                        ))}
                    </section>
                )}

                {/* Education */}
                {data.education?.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-xl font-semibold mb-3" style={{ color: accentColor }}>
                            Education
                        </h2>

                        {data.education.map((edu, index) => (
                            <div key={index} className="flex justify-between mb-2">
                                <div>
                                    <h3 className="font-semibold">
                                        {edu.degree} {edu.field && `in ${edu.field}`}
                                    </h3>
                                    <p className="text-gray-600">{edu.institution}</p>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {formatDate(edu.graduation_date)}
                                </span>
                            </div>
                        ))}
                    </section>
                )}

                {/* Skills */}
                {data.skills?.length > 0 && (
                    <section>
                        <h2 className="text-xl font-semibold mb-3" style={{ color: accentColor }}>
                            Skills
                        </h2>

                        <div className="flex flex-wrap gap-2">
                            {data.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-gray-200 rounded-full text-sm"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
};

export default ModernTemplate;