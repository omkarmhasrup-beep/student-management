import { useState, useEffect } from 'react';
import { Users, UserCheck, Cake, UserPlus, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { getStudents, getDashboardStats, getDashboardInsights } from '../services/api';
import '../styles/components.css';

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ total_students: 0, new_students: 0, total_courses: 0 });
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [data, statsData] = await Promise.all([
          getStudents(1, 100),
          getDashboardStats()
        ]);
        setStudents(data.items || []);
        setStats(statsData);

        // Fetch AI insights after we have data, to not block main render if it's slow
        getDashboardInsights()
          .then(res => setInsights(res.insights))
          .catch(err => {
            console.error(err);
            setInsights("Failed to load AI insights. AI service might be unavailable.");
          });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalStudents = stats.total_students;
  const activeStudents = totalStudents; 
  
  const averageAge = students.length > 0 
    ? Math.round(students.reduce((acc, curr) => acc + (curr.age || 0), 0) / students.length)
    : 0;
    
  const newStudents = stats.new_students;

  const StatCard = ({ title, value, icon: Icon, trend, trendUp }) => (
    <div className="card stat-card flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-muted text-sm">{title}</span>
        <div className="icon-wrapper" style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)' }}>
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <h2 style={{ fontSize: '1.875rem', margin: 0 }}>{loading ? <div className="skeleton" style={{width: '60px', height: '36px'}}></div> : value}</h2>
        {!loading && trend && (
          <span className="badge" style={{ backgroundColor: trendUp ? 'var(--success-bg)' : 'var(--danger-bg)', color: trendUp ? 'var(--success-color)' : 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '4px'}}>
            {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {trend}%
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="dashboard-page flex-col gap-4">
      <div className="dashboard-stats-grid">
        <StatCard title="Total Students" value={totalStudents} icon={Users} />
        <StatCard title="Active Students" value={activeStudents} icon={UserCheck} />
        <StatCard title="Average Age" value={averageAge} icon={Cake} />
        <StatCard title="New Students" value={newStudents} icon={UserPlus} />
      </div>

      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(var(--primary-color-rgb), 0.1), rgba(var(--secondary-color-rgb), 0.1))', border: '1px solid var(--primary-light)' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
          <Sparkles size={20} style={{ color: 'var(--primary-color)' }} />
          <h3 style={{ margin: 0 }}>✨ AI Insights</h3>
        </div>
        <p className="text-muted" style={{ lineHeight: '1.6' }}>
          {insights || "Loading AI insights..."}
        </p>
      </div>

      <div className="card">
        <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
          <h3>Recent Students</h3>
        </div>
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Age</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton" style={{width: '20px', height: '20px'}}></div></td>
                    <td><div className="skeleton" style={{width: '120px', height: '20px'}}></div></td>
                    <td><div className="skeleton" style={{width: '180px', height: '20px'}}></div></td>
                    <td><div className="skeleton" style={{width: '30px', height: '20px'}}></div></td>
                  </tr>
                ))
              ) : students.length > 0 ? (
                [...students].sort((a, b) => b.id - a.id).slice(0, 5).map((student) => (
                  <tr key={student.id}>
                    <td>#{student.roll_number || student.id}</td>
                    <td className="font-medium">{student.name}</td>
                    <td className="text-muted">{student.email}</td>
                    <td>{student.age}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }} className="text-muted">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
