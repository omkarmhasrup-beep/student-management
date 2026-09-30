import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { createStudent } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

const AddStudent = () => {
  const { user } = useAuth();
  const customFieldsConfig = user?.custom_fields_config || [];
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    roll_number: '',
    name: '',
    email: '',
    age: '',
    course: '',
    skills: ''
  });
  
  // Initialize custom fields with empty strings
  const initialCustomFields = {};
  customFieldsConfig.forEach(field => {
    initialCustomFields[field.name] = '';
  });
  const [customFieldsData, setCustomFieldsData] = useState(initialCustomFields);

  const [errors, setErrors] = useState({});

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
    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        age: parseInt(formData.age, 10),
        course: formData.course,
        skills: formData.skills || null,
        custom_fields: customFieldsData
      };
      if (formData.roll_number) {
        payload.roll_number = formData.roll_number;
      }
      await createStudent(payload);
      addToast('Student created successfully');
      navigate('/students');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        let detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          detail = detail.map(d => d.msg).join(', ');
        }
        addToast(`Failed to create student: ${detail}`, 'error');
      } else {
        addToast('Failed to create student. Please check details.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-student-page flex-col gap-4 max-w-2xl" style={{ maxWidth: '800px' }}>
      <div className="flex items-center gap-4" style={{ marginBottom: '1rem' }}>
        <Link to="/students" className="icon-btn" title="Back to Students">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 style={{ marginBottom: '0.25rem' }}>Add New Student</h2>
          <p className="text-muted text-sm">Enter student details below to create an account.</p>
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
                className={`form-input`}
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
                placeholder="e.g. Jane Doe"
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
                placeholder="e.g. jane@example.com"
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
                placeholder="e.g. 20"
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
                placeholder="e.g. Computer Science"
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
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={18} />
              {loading ? 'Creating...' : 'Create Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;
