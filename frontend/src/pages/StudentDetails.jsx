import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash, Mail, Cake, Hash, Activity, Book, Sparkles, Languages, FileText, Briefcase, Compass } from 'lucide-react';
import { getStudent, deleteStudent, sendStudentEmail, generateEmailDraft, generateResumeSummary, generateInterviewPrep, generateCareerRecommendations } from '../services/api';
import { useToast } from '../hooks/useToast';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiTone, setAiTone] = useState('professional');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  

  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [resumeSummary, setResumeSummary] = useState(null);

  const [isGeneratingInterview, setIsGeneratingInterview] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState(null);

  const [isGeneratingCareer, setIsGeneratingCareer] = useState(false);
  const [careerRecommendations, setCareerRecommendations] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const data = await getStudent(id);
        if (data.message === "Student not found") {
          setErrorState(true);
          return;
        }
        setStudent(data);
      } catch (error) {
        console.error('Error fetching student:', error);
        setErrorState(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteStudent(id);
      addToast('Student deleted successfully');
      navigate('/students');
    } catch (error) {
      console.error('Error deleting student:', error);
      addToast('Failed to delete student', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };



  const handleGenerateResume = async () => {
    setIsGeneratingResume(true);
    try {
      const result = await generateResumeSummary({ student_id: student.id });
      setResumeSummary(result.resume_summary);
      addToast('Resume summary generated successfully!');
    } catch (error) {
      console.error('Error generating resume summary:', error);
      addToast('Failed to generate resume summary', 'error');
    } finally {
      setIsGeneratingResume(false);
    }
  };

  const handleGenerateInterview = async () => {
    if (!student.course) {
      addToast('Student must have a course to generate questions', 'error');
      return;
    }
    setIsGeneratingInterview(true);
    try {
      const result = await generateInterviewPrep({ student_id: student.id });
      setInterviewQuestions(result.questions);
      addToast('Interview questions generated successfully!');
    } catch (error) {
      console.error('Error generating interview questions:', error);
      addToast('Failed to generate interview questions', 'error');
    } finally {
      setIsGeneratingInterview(false);
    }
  };

  const handleGenerateCareer = async () => {
    if (!student.course) {
      addToast('Student must have a course to generate career recommendations', 'error');
      return;
    }
    setIsGeneratingCareer(true);
    try {
      const result = await generateCareerRecommendations({ student_id: student.id });
      setCareerRecommendations(result.recommendations);
      addToast('Career recommendations generated successfully!');
    } catch (error) {
      console.error('Error generating career recommendations:', error);
      addToast('Failed to generate career recommendations', 'error');
    } finally {
      setIsGeneratingCareer(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      addToast('Subject and body are required', 'error');
      return;
    }
    
    setIsSendingEmail(true);
    try {
      await sendStudentEmail(id, { subject: emailSubject, body: emailBody });
      addToast('Email sent successfully');
      setShowEmailModal(false);
      setEmailSubject('');
      setEmailBody('');
    } catch (error) {
      console.error('Error sending email:', error);
      addToast('Failed to send email', 'error');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleGenerateEmail = async () => {
    if (!aiInstruction.trim()) return;
    setIsGeneratingAI(true);
    try {
      const draft = await generateEmailDraft({
        student_id: student.id,
        instruction: aiInstruction,
        tone: aiTone
      });
      setEmailSubject(draft.subject || '');
      setEmailBody(draft.body || '');
      addToast('Draft generated successfully', 'success');
    } catch (error) {
      console.error('Error generating email:', error);
      addToast('Failed to generate draft. Please try again.', 'error');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-col gap-4 max-w-3xl" style={{ maxWidth: '1000px' }}>
        <div className="skeleton" style={{ width: '200px', height: '32px' }}></div>
        <div className="card">
          <div className="flex items-center gap-4 mb-4">
            <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%' }}></div>
            <div className="flex-col gap-2">
              <div className="skeleton" style={{ width: '150px', height: '24px' }}></div>
              <div className="skeleton" style={{ width: '100px', height: '16px' }}></div>
            </div>
          </div>
          <div className="skeleton" style={{ width: '100%', height: '200px' }}></div>
        </div>
      </div>
    );
  }

  if (errorState || !student) {
    return (
      <div className="flex-col items-center justify-center h-full gap-4 text-center">
        <h2>Student Not Found</h2>
        <p className="text-muted max-w-md">The student you are looking for does not exist or an error occurred.</p>
        <Link to="/students" className="btn btn-primary">
          Back to Students
        </Link>
      </div>
    );
  }

  return (
    <div className="student-details-page flex-col gap-4 max-w-3xl" style={{ maxWidth: '1000px' }}>
      <div className="flex items-center gap-4" style={{ marginBottom: '1rem' }}>
        <Link to="/students" className="icon-btn" title="Back to Students">
          <ArrowLeft size={20} />
        </Link>
        <div className="text-muted text-sm flex items-center gap-2">
          <Link to="/students" style={{ color: 'inherit' }}>Students</Link> / 
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Student Details</span>
        </div>
      </div>

      <div className="card flex-col gap-6" style={{ padding: '2rem' }}>
        <div className="flex justify-between items-start flex-wrap gap-4" style={{ paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-6">
            <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '2rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)' }}>
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{student.name}</h2>
              <div className="flex items-center gap-2 text-muted">
                <span className="badge badge-success">Active</span>
                <span>•</span>
                <span>Student #{student.roll_number || student.id}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button className="btn btn-secondary" onClick={handleGenerateCareer} disabled={isGeneratingCareer || !student.course}>
              <Compass size={16} /> {isGeneratingCareer ? 'Generating...' : 'Career Guidance'}
            </button>
            <button className="btn btn-secondary" onClick={handleGenerateInterview} disabled={isGeneratingInterview || !student.course}>
              <Briefcase size={16} /> {isGeneratingInterview ? 'Generating...' : 'Interview Prep'}
            </button>
            <button className="btn btn-secondary" onClick={handleGenerateResume} disabled={isGeneratingResume}>
              <FileText size={16} /> {isGeneratingResume ? 'Generating...' : 'Resume Summary'}
            </button>

            <button className="btn btn-primary" onClick={() => setShowEmailModal(true)}>
              <Mail size={16} /> Email
            </button>
            <Link to={`/students/${student.id}/edit`} className="btn btn-secondary">
              <Edit size={16} /> Edit
            </Link>
            <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
              <Trash size={16} /> Delete
            </button>
          </div>
        </div>

        {resumeSummary && (
          <div className="flex-col gap-2 p-4 rounded-md border" style={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--border-color)' }}>
            <h3 className="font-medium flex items-center gap-2 text-primary">
              <FileText size={18} /> AI Generated Resume Summary
            </h3>
            <p style={{ lineHeight: '1.6', margin: 0, color: 'var(--text-primary)' }}>
              {resumeSummary}
            </p>
          </div>
        )}



        {interviewQuestions && (
          <div className="flex-col gap-2 p-4 rounded-md border" style={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--border-color)' }}>
            <h3 className="font-medium flex items-center gap-2 text-primary">
              <Briefcase size={18} /> AI Mock Interview Questions
            </h3>
            <div style={{ lineHeight: '1.6', margin: 0, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
              {interviewQuestions}
            </div>
          </div>
        )}

        {careerRecommendations && (
          <div className="flex-col gap-2 p-4 rounded-md border" style={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--border-color)' }}>
            <h3 className="font-medium flex items-center gap-2 text-primary">
              <Compass size={18} /> AI Career Recommendations
            </h3>
            <div style={{ lineHeight: '1.6', margin: 0, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
              {careerRecommendations}
            </div>
          </div>
        )}

        <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          <div className="info-section">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} className="text-muted" /> Account Information
            </h3>
            <div className="flex-col gap-4" style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
              <div className="flex items-center gap-3">
                <div style={{ color: 'var(--text-secondary)' }}><Hash size={18} /></div>
                <div>
                  <div className="text-xs text-muted">Student ID</div>
                  <div className="font-medium">{student.id}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div style={{ color: 'var(--text-secondary)' }}><Activity size={18} /></div>
                <div>
                  <div className="text-xs text-muted">Status</div>
                  <div className="font-medium">Active</div>
                </div>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={18} className="text-muted" /> Personal Information
            </h3>
            <div className="flex-col gap-4" style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
              <div className="flex items-center gap-3">
                <div style={{ color: 'var(--text-secondary)' }}><Mail size={18} /></div>
                <div>
                  <div className="text-xs text-muted">Email Address</div>
                  <div className="font-medium">{student.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div style={{ color: 'var(--text-secondary)' }}><Cake size={18} /></div>
                <div>
                  <div className="text-xs text-muted">Age</div>
                  <div className="font-medium">{student.age} years old</div>
                </div>
              </div>
              {student.course && (
                <div className="flex items-center gap-3">
                  <div style={{ color: 'var(--text-secondary)' }}><Book size={18} /></div>
                  <div>
                    <div className="text-xs text-muted">Course</div>
                    <div className="font-medium">{student.course}</div>
                  </div>
                </div>
              )}
              {student.skills && (
                <div className="flex items-center gap-3">
                  <div style={{ color: 'var(--text-secondary)' }}><Activity size={18} /></div>
                  <div>
                    <div className="text-xs text-muted">Skills</div>
                    <div className="font-medium">{student.skills}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {student.custom_fields && Object.keys(student.custom_fields).length > 0 && (
            <div className="info-section">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} className="text-muted" /> Additional Information
              </h3>
              <div className="flex-col gap-4" style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                {Object.entries(student.custom_fields).map(([key, value]) => (
                  value && (
                    <div className="flex items-center gap-3" key={key}>
                      <div style={{ color: 'var(--text-secondary)' }}><Activity size={18} /></div>
                      <div>
                        <div className="text-xs text-muted">{key}</div>
                        <div className="font-medium">{value}</div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {showDeleteModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header flex justify-between items-center">
              <h3 className="modal-title">Delete Student?</h3>
              <button className="icon-btn" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete <strong>{student.name}</strong>? This action cannot be undone.
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete Student'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showEmailModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', width: '100%' }}>
            <div className="modal-header flex justify-between items-center">
              <h3 className="modal-title">Send Email to {student.name}</h3>
              <button className="icon-btn" onClick={() => setShowEmailModal(false)}>✕</button>
            </div>
            <div className="modal-body flex-col gap-4">
              
              <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Sparkles size={16} style={{ color: 'var(--primary-color)' }} />
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Generate with AI</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="E.g., Inform about tomorrow's lecture at 9 AM"
                    value={aiInstruction}
                    onChange={(e) => setAiInstruction(e.target.value)}
                    style={{ flex: 1, minWidth: '200px' }}
                    disabled={isGeneratingAI}
                  />
                  <select 
                    className="input" 
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                    style={{ width: 'auto' }}
                    disabled={isGeneratingAI}
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="strict">Strict</option>
                  </select>
                </div>
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                  onClick={handleGenerateEmail}
                  disabled={isGeneratingAI || !aiInstruction.trim()}
                >
                  {isGeneratingAI ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label>Subject</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Email Subject" 
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label>Body</label>
                <textarea 
                  className="input" 
                  placeholder="Email Body" 
                  rows="5"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  style={{ resize: 'vertical' }}
                ></textarea>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowEmailModal(false)} disabled={isSendingEmail}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSendEmail} disabled={isSendingEmail}>
                {isSendingEmail ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default StudentDetails;
