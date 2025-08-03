import React, { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';

interface Course {
  _id: string;
  title: string;
  instructorName: string;
  imageUrl: string;
  price: number;
}

interface PopularCourse {
  _id: string;
  courseId: Course;
  slug: string;
}

const ManagePopularCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [popularCourses, setPopularCourses] = useState<PopularCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [slugInputs, setSlugInputs] = useState<{ [courseId: string]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [coursesRes, popularRes] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/admin/popular-courses', { credentials: 'include' })
        ]);
        const coursesData = await coursesRes.json();
        const popularData = await popularRes.json();
        setCourses(coursesData);
        setPopularCourses(popularData);
        setSlugInputs(
          popularData.reduce((acc: any, pc: PopularCourse) => {
            if (pc.courseId?._id) {
              acc[pc.courseId._id] = pc.slug;
            }
            return acc;
          }, {})
        );
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isPopular = (courseId: string) =>
    popularCourses.some((pc) => pc.courseId?._id === courseId);

  const getPopularId = (courseId: string) =>
    popularCourses.find((pc) => pc.courseId?._id === courseId)?._id;

  const handleAddPopular = async (course: Course) => {
    const slug = slugInputs[course._id]?.trim();
    if (!slug) {
      setError('Slug is required');
      return;
    }
    setError(null);
    try {
      const res = await fetch('/api/admin/popular-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ courseId: course._id, slug })
      });
      if (!res.ok) throw new Error('Failed to add popular course');
      const newPopular = await res.json();
      setPopularCourses((prev) => [...prev, { ...newPopular, courseId: course }]);
    } catch (err) {
      setError('Failed to add popular course');
    }
  };

  const handleRemovePopular = async (courseId: string) => {
    const popularId = getPopularId(courseId);
    if (!popularId) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/popular-courses/${popularId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to remove popular course');
      setPopularCourses((prev) => prev.filter((pc) => pc.courseId?._id !== courseId));
    } catch (err) {
      setError('Failed to remove popular course');
    }
  };

  const pageStyle = {
    background: dark ? '#111' : '#fff',
    color: dark ? '#fff' : '#111',
    minHeight: '100vh',
    transition: 'background 0.2s, color 0.2s',
  } as React.CSSProperties;

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    color: dark ? '#fff' : '#111',
  } as React.CSSProperties;

  return (
    <div style={pageStyle}>
      <SiteHeader />
      <div style={{ maxWidth: 800, margin: '40px auto', background: dark ? '#222' : '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: 32, color: dark ? '#fff' : '#111' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1>Manage Popular Courses</h1>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Instructor</th>
                <th>Price</th>
                <th>SEO Slug</th>
                <th>Popular</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td><img src={course.imageUrl} alt={course.title} style={{ width: 60, borderRadius: 6 }} /></td>
                  <td>{course.title}</td>
                  <td>{course.instructorName}</td>
                  <td>${course.price}</td>
                  <td>
                    <input
                      type="text"
                      value={slugInputs[course._id] || ''}
                      onChange={e => setSlugInputs({ ...slugInputs, [course._id]: e.target.value })}
                      placeholder="seo-slug"
                      disabled={isPopular(course._id)}
                      style={{ width: 120, color: dark ? '#fff' : '#111', background: dark ? '#333' : '#fff', border: '1px solid #ccc', borderRadius: 4, padding: '4px 8px' }}
                    />
                  </td>
                  <td>
                    {isPopular(course._id) ? (
                      <button onClick={() => handleRemovePopular(course._id)} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px' }}>Remove</button>
                    ) : (
                      <button onClick={() => handleAddPopular(course)} style={{ background: '#1a8917', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px' }}>Add</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <SiteFooter />
    </div>
  );
};

export default ManagePopularCourses; 