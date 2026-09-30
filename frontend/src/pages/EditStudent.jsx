import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { getStudent, patchStudent } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

const EditStudent = () => {
  const { user } = useAuth();
  const customFieldsConfig = user?.custom_fields_config || [];
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const [formData, setFormData] = useState({
    roll_number: '',
    name: '',
    email: '',
    age: '',
    course: '',
    skills: ''
  });
  const [customFieldsData, setCustomFieldsData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const data = await getStudent(id);
        if (data.message === "Student not found") {
          setErrorState(true);
          return;
        }
        setFormData({
          roll_number: data.roll_number || '',
          name: data.name,
          email: data.email,
          age: data.age,
          course: data.course || '',
          skills: data.skills || ''
        });
        
        const initialCustomFields = {};
        customFieldsConfig.forEach(field => {
          initialCustomFields[field.name] = (data.custom_fields && data.custom_fields[field.name]) || '';
        });
        setCustomFieldsData(initialCustomFields);
      } catch (error) {
        console.error('Error fetching student:', error);
        setErrorState(true);
        addToast('Failed to load student details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id, addToast]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(formData.age) || formData.age < 5 || formData.age > 100) {
      newErrors.age = 'Please enter a valid age (5-100)';
    }

    if (!formData.course.trim()) {
      newErrors.course = 'Course is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        age: parseInt(formData.age, 10),
        course: formData.course,
        custom_fields: customFieldsData
      };
      if (formData.roll_number) {
        payload.roll_number = formData.roll_number;
      }
      if (formData.skills !== undefined) {
        payload.skills = formData.skills || null;
      }
      await patchStudent(id, payload);
      addToast('Student updated successfully');
      navigate(`/students/${id}`);
    } catch (error) {
      console.error('Error updating student:', error);
      addToast('Failed to update student.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-col gap-4 max-w-2xl" style={{ maxWidth: '800px' }}>
        <div className="skeleton" style={{ width: '200px', height: '32px' }}></div>
        <div className="card">
          <div className="skeleton" style={{ width: '100%', height: '400px' }}></div>
        </div>
      </div>
    );
  }

  if (errorState) {
    return (
      <div className="flex-col items-center justify-center h-full gap-4 text-center">
        <h2>Student Not Found</h2>
        <p className="text-muted max-w-md">The student you are trying to edit does not exist or an error occurred.</p>
        <Link to="/students" className="btn btn-primary">
          Back to Students
        </Link>
      </div>
    );
  }

  return (
    <div className="edit-student-page flex-col gap-4 max-w-2xl" style={{ maxWidth: '800px' }}>
      <div className="flex items-center gap-4" style={{ marginBottom: '1rem' }}>
        <Link to="/students" className="icon-btn" title="Back to Students">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 style={{ marginBottom: '0.25rem' }}>Edit Student</h2>
          <p className="text-muted text-sm">Update student details for #{id}</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>Student Information</h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="roll_number">Roll Number (Optional)</label>
              <input
                type="text"
                id="roll_number"
                name="roll_number"
                className="form-input text-muted"
                value={formData.roll_number}
                onChange={handleChange}
                placeholder="e.g. 101 or A-12"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-input ${errors.name ? 'error' : ''}`}
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                className={`form-input ${errors.age ? 'error' : ''}`}
                value={formData.age}
                onChange={handleChange}
                min="5"
                max="100"
              />
              {errors.age && <span className="error-text">{errors.age}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="course">Course</label>
              <input
                type="text"
                id="course"
                name="course"
                className={`form-input ${errors.course ? 'error' : ''}`}
                value={formData.course}
                onChange={handleChange}
              />
              {errors.course && <span className="error-text">{errors.course}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="skills">Skills (Optional)</label>
              <input
                type="text"
                id="skills"
                name="skills"
                className="form-input"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. React, Node.js, Python"
              />
            </div>
            
            {/* Render Custom Fields in the same grid */}
            {customFieldsConfig.map((field, idx) => (
              <div className="form-group" style={{ marginBottom: 0 }} key={idx}>
                <label className="form-label" htmlFor={`cf_${idx}`}>{field.name}</label>
                <input
                  type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                  id={`cf_${idx}`}
                  className="form-input"
                  value={customFieldsData[field.name] || ''}
                  onChange={(e) => setCustomFieldsData(prev => ({ ...prev, [field.name]: e.target.value }))}
                  placeholder={`Enter ${field.name}`}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4" style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <Link to="/students" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudent;
