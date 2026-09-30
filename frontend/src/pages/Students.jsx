import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Plus, MoreVertical, Edit, Trash, Eye, X, Users, Mail, Sparkles } from 'lucide-react';
import { getStudents, deleteStudent, sendStudentEmail, generateEmailDraft } from '../services/api';
import { useToast } from '../hooks/useToast';

const Students = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [studentToEmail, setStudentToEmail] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const [aiInstruction, setAiInstruction] = useState('');
  const [aiTone, setAiTone] = useState('professional');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const { addToast } = useToast();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await getStudents(1, 100, searchTerm);
      setStudents(data.items || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      addToast('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    const query = searchParams.get('search');
    if (query !== null) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val) {
      setSearchParams({ search: val });
    } else {
      setSearchParams({});
    }
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      await deleteStudent(studentToDelete.id);
      addToast('Student deleted successfully');
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      addToast('Failed to delete student', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setStudentToDelete(null);
    }
  };

  const handleEmailClick = (student) => {
    setStudentToEmail(student);
    setEmailSubject('');
    setEmailBody('');
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    if (!studentToEmail || !emailSubject.trim() || !emailBody.trim()) {
      addToast('Please fill in all fields', 'error');
      return;
    }

    setIsSendingEmail(true);
    try {
      await sendStudentEmail(studentToEmail.id, {
        subject: emailSubject,
        body: emailBody
      });
      addToast('Email sent successfully', 'success');
      setShowEmailModal(false);
    } catch (error) {
      console.error('Error sending email:', error);
      addToast('Failed to send email', 'error');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleGenerateEmail = async () => {
    if (!aiInstruction.trim() || !studentToEmail) return;
    setIsGeneratingAI(true);
    try {
      const draft = await generateEmailDraft({
        student_id: studentToEmail.id,
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

  const filteredStudents = students;

  return (
    <div className="students-page flex-col gap-4">
      <div className="flex justify-between items-center flex-wrap gap-4" style={{ marginBottom: '1rem' }}>
        <div>
          <h2 style={{ marginBottom: '0.25rem' }}>Students</h2>
          <p className="text-muted text-sm">Manage all students from one place.</p>
        </div>
        <Link to="/students/new" className="btn btn-primary">
          <Plus size={18} /> Add Student
        </Link>
      </div>

      <div className="card">
        <div className="flex justify-between items-center flex-wrap gap-4" style={{ marginBottom: '1.5rem' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: '250px', maxWidth: '400px' }}>
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, email or ID..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ width: '100%' }}
            />
          </div>
          <button className="btn btn-secondary" onClick={fetchStudents}>
            Refresh
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Course</th>
                <th>Age</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton" style={{ width: '20px', height: '20px' }}></div></td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%' }}></div>
                        <div className="flex-col gap-1">
                          <div className="skeleton" style={{ width: '100px', height: '16px' }}></div>
                          <div className="skeleton" style={{ width: '140px', height: '12px' }}></div>
                        </div>
                      </div>
                    </td>
                    <td><div className="skeleton" style={{ width: '60px', height: '20px' }}></div></td>
                    <td><div className="skeleton" style={{ width: '30px', height: '20px' }}></div></td>
                    <td><div className="skeleton" style={{ width: '50px', height: '20px', borderRadius: '12px' }}></div></td>
                    <td style={{ textAlign: 'right' }}><div className="skeleton" style={{ width: '24px', height: '24px', display: 'inline-block' }}></div></td>
                  </tr>
                ))
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>#{student.roll_number || student.id}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar" style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', fontSize: '0.875rem' }}>
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium" style={{ fontWeight: 500 }}>{student.name}</div>
                          <div className="text-xs text-muted">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{student.course || '-'}</td>
                    <td>{student.age}</td>
                    <td><span className="badge badge-success">Active</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/students/${student.id}`} className="icon-btn" title="View Details">
                          <Eye size={18} />
                        </Link>
                        <button className="icon-btn" onClick={() => handleEmailClick(student)} title="Send Email">
                          <Mail size={18} />
                        </button>
                        <Link to={`/students/${student.id}/edit`} className="icon-btn" title="Edit">
                          <Edit size={18} />
                        </Link>
                        <button className="icon-btn" onClick={() => handleDeleteClick(student)} style={{ color: 'var(--danger-color)' }} title="Delete">
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="flex-col items-center gap-2">
                      <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '50%', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                        <Users size={32} />
                      </div>
                      <h3 style={{ fontSize: '1.1rem' }}>
                        {searchTerm ? 'No matching students' : 'No students found'}
                      </h3>
                      <p className="text-muted text-sm">
                        {searchTerm ? 'Try changing your search.' : 'Start by adding your first student.'}
                      </p>
                      {!searchTerm && (
                        <Link to="/students/new" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                          <Plus size={16} /> Add Student
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDeleteModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header flex justify-between items-center">
              <h3 className="modal-title">Delete Student?</h3>
              <button className="icon-btn" onClick={() => setShowDeleteModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete <strong>{studentToDelete?.name}</strong>? This action cannot be undone.
            </div>
            <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete} disabled={isDeleting} style={{ backgroundColor: 'var(--danger-color)', color: 'white' }}>
                {isDeleting ? 'Deleting...' : 'Delete Student'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showEmailModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header flex justify-between items-center">
              <h3 className="modal-title">Send Email</h3>
              <button className="icon-btn" onClick={() => setShowEmailModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body form-container">
              <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Sending to: <strong>{studentToEmail?.email}</strong>
              </p>

              <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Sparkles size={16} style={{ color: 'var(--primary-color)' }} />
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Generate with AI</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="E.g., Inform about tomorrow's lecture at 9 AM"
                    value={aiInstruction}
                    onChange={(e) => setAiInstruction(e.target.value)}
                    style={{ flex: 1, minWidth: '200px' }}
                    disabled={isGeneratingAI}
                  />
                  <select
                    className="form-input"
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

              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  className="form-input"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                  disabled={isSendingEmail}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '120px', resize: 'vertical' }}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Enter email message..."
                  disabled={isSendingEmail}
                />
              </div>
            </div>
            <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
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

export default Students;
