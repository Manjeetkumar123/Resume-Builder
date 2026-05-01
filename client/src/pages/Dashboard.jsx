import React, { useEffect, useState } from 'react'
import { PencilIcon, PlusIcon, TrashIcon, UploadCloudIcon, FilePenLineIcon, XIcon } from 'lucide-react'
import { dummyResumeData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'

// ✅ PDF FIX
import * as pdfjsLib from "pdfjs-dist"
import pdfWorker from "pdfjs-dist/build/pdf.worker?url"

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const Dashboard = () => {
  const { user, token } = useSelector(state => state.auth)

  const colors = ["#9333ea", "#d97706", "#dc2626", "#0284c7", "#16a34a"]

  const [allResume, setAllResumes] = useState([])
  const [showCreateResume, setShowCreateResume] = useState(false)
  const [showUploadResume, setShowUploadResume] = useState(false)
  const [title, setTitle] = useState('')
  const [resume, setResume] = useState(null)
  const [editResumeId, setEditResumeId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    let text = ""
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items.map(item => item.str).join(" ")
      text += pageText + "\n"
    }
    return text
  }

  const loadAllResumes = async () => {
    try {
      const { data } = await api.get('/api/users/resumes', {
        headers: { Authorization: token }
      })
      setAllResumes(data.resumes)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  const createResume = async (event) => {
    try {
      event.preventDefault()

      const { data } = await api.post('/api/resumes/create', { title }, {
        headers: { Authorization: token }
      })

      setAllResumes(prev => [...prev, data.resume])
      setTitle('')
      setShowCreateResume(false)

      navigate(`/app/builder/${data.resume._id}`)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  // ✅ FIXED EDIT FUNCTION
  const editTitle = async (event) => {
    try {
      event.preventDefault()

      const { data } = await api.put('/api/resumes/update', {
        resumeId: editResumeId,
        resumeData: { title }
      }, { headers: { Authorization: token } })

      setAllResumes(allResume.map(resume =>
        resume._id === editResumeId
          ? { ...resume, title }
          : resume
      ))

      setTitle('')
      setEditResumeId('')
      setShowCreateResume(false) // ✅ important fix

      toast.success(data.message)

    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  const uploadResume = async (event) => {
    event.preventDefault()

    if (!resume) return toast.error("Please select a PDF file")

    setIsLoading(true)

    try {
      const resumeText = await extractTextFromPDF(resume)

      const { data } = await api.post('/api/ai/upload-resume',
        { title, resumeText },
        { headers: { Authorization: token } }
      )

      setTitle('')
      setResume(null)
      setShowUploadResume(false)

      navigate(`/app/builder/${data.resumeId}`)

    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }

    setIsLoading(false)
  }

 const deleteResume = async (resumeId) => {
  try {
    const confirm = window.confirm('Are you sure you want to delete this resume?')
    
    if (confirm) {
      const { data } = await api.delete(`/api/resumes/delete/${resumeId}`, {
        headers: { Authorization: token }
      })

      setAllResumes(allResume.filter(resume => resume._id !== resumeId))
      toast.success(data.message)
    }

  } catch (error) {
    toast.error(error?.response?.data?.message || error.message)
  }
}

  useEffect(() => {
    loadAllResumes()
  }, [])

  return (
    <div>
      <div className='max-w-7xl mx-auto px-4 py-8'>

        <p className='text-2xl font-medium mb-6 bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent sm:hidden'>
          Welcome, {user?.name || "User"}
        </p>

        <div className='flex gap-4'>

          {/* Create Resume */}
          <button
            onClick={() => {
              setShowCreateResume(true)
              setEditResumeId('') // ✅ reset edit mode
              setTitle('')
            }}
            className='w-full bg-white sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 hover:border-indigo-500 hover:shadow-lg'
          >
            <PlusIcon className='size-11 p-2.5 bg-indigo-500 text-white rounded-full' />
            <p className='text-sm'>Create Resume</p>
          </button>

          {/* Upload Resume */}
          <button
            onClick={() => setShowUploadResume(true)}
            className='w-full bg-white sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 hover:border-purple-500 hover:shadow-lg'
          >
            <UploadCloudIcon className='size-11 p-2.5 bg-purple-500 text-white rounded-full' />
            <p className='text-sm'>Upload Existing</p>
          </button>
        </div>

        <hr className='border-slate-300 my-6 sm:w-[305px]' />

        {/* Resume List */}
        <div className="grid grid-cols-2 sm:flex flex-wrap gap-4">
          {allResume.map((resume, index) => {
            const baseColor = colors[index % colors.length]

            return (
              <div
                key={resume._id}
                onClick={() => navigate(`/app/builder/${resume._id}`)}
                className='relative w-full sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 border cursor-pointer'
                style={{
                  background: `linear-gradient(135deg, ${baseColor}10, ${baseColor}40)`,
                  borderColor: baseColor + '40'
                }}
              >
                <FilePenLineIcon className="size-7" style={{ color: baseColor }} />

                <p className='text-sm text-center px-2' style={{ color: baseColor }}>
                  {resume.title}
                </p>

                <div className='absolute top-1 right-1 flex gap-1'>
                  <TrashIcon
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteResume(resume._id)
                    }}
                    className="size-6 text-red-600 cursor-pointer"
                  />
                  <PencilIcon
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditResumeId(resume._id)
                      setTitle(resume.title)
                      setShowCreateResume(true)
                    }}
                    className="size-6 text-gray-700 cursor-pointer"
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Create/Edit Modal */}
        {showCreateResume && (
          <div className='fixed inset-0 bg-black/70 flex items-center justify-center'>
            <form
              onSubmit={editResumeId ? editTitle : createResume} // ✅ MAIN FIX
              onClick={e => e.stopPropagation()}
              className='bg-white p-6 rounded-lg w-full max-w-sm'
            >
              <h2 className='text-xl font-bold mb-4'>
                {editResumeId ? "Edit Resume" : "Create Resume"}
              </h2>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Enter title'
                className='w-full px-4 py-2 border rounded mb-4'
                required
              />

              <button className='w-full py-2 bg-indigo-600 text-white rounded'>
                {editResumeId ? "Update" : "Create"}
              </button>

              <XIcon
                className='absolute top-4 right-4 cursor-pointer'
                onClick={() => setShowCreateResume(false)}
              />
            </form>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadResume && (
          <div className='fixed inset-0 bg-black/70 flex items-center justify-center'>
            <form
              onSubmit={uploadResume}
              onClick={e => e.stopPropagation()}
              className='bg-white p-6 rounded-lg w-full max-w-sm'
            >
              <h2 className='text-xl font-bold mb-4'>Upload Resume</h2>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Enter title'
                className='w-full px-4 py-2 border rounded mb-4'
                required
              />

              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setResume(e.target.files[0])}
                className='mb-4'
                required
              />

              <button
                type="submit"
                disabled={isLoading}
                className='w-full py-2 bg-purple-600 text-white rounded'
              >
                {isLoading ? "Processing PDF..." : "Upload & Analyze"}
              </button>

              <XIcon
                className='absolute top-4 right-4 cursor-pointer'
                onClick={() => setShowUploadResume(false)}
              />
            </form>
          </div>
        )}

      </div>
    </div>
  )
}

export default Dashboard