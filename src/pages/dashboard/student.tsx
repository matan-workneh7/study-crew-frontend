import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/context/AuthContext";
import { useAuthModal } from '@/components/context/AuthModalContext';

const SEMESTERS = ["Semester 1", "Semester 2"];

export default function StudentDashboard() {
  const { user } = useAuth();
  const { openModal } = useAuthModal();
  const academicYear = user?.academic_year ?? 1; // fallback to 1 if not logged in
  const [coursesBySemester, setCoursesBySemester] = useState<{ [semester: string]: any[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all(
      SEMESTERS.map((semester) =>
        fetch(`/courses?year=${academicYear}&semester=${encodeURIComponent(semester)}`)
          .then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch courses for ${semester}`);
            return res.json();
          })
          .then((data) => ({ semester, data }))
      )
    )
      .then((results) => {
        const courses: { [semester: string]: any[] } = {};
        results.forEach(({ semester, data }) => {
          courses[semester] = data;
        });
        setCoursesBySemester(courses);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [academicYear]);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Button
        className="mb-6 w-full py-4 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white"
        onClick={() => openModal('login', 'user')}
      >
        Get Help Now
      </Button>
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
      <h2 className="text-lg mb-4">Year: {academicYear}</h2>
      {loading && <p>Loading courses...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {SEMESTERS.map((semester) => (
        <div key={semester} className="mb-8">
          <h3 className="text-xl font-semibold mb-2">{semester}</h3>
          <div className="space-y-4">
            {(coursesBySemester[semester] || []).length === 0 ? (
              <p className="text-gray-500">No courses found for {semester}.</p>
            ) : (
              coursesBySemester[semester].map((course: any) => (
                <Card key={course.code} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                  <span className="font-semibold w-full md:w-1/3">{course.name}</span>
                  <span className="w-full md:w-1/6 text-gray-600">{course.code}</span>
                  <span className="w-full md:w-1/6 text-gray-600">Year {course.year}</span>
                  <span className="w-full md:w-1/6 text-gray-600">{course.credit_hour} Credit Hour</span>
                  {course.description && (
                    <div className="text-gray-500 text-sm mt-2 md:mt-0 md:ml-8 w-full">{course.description}</div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
