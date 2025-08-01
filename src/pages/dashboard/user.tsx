import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/context/AuthContext";
import { useAuthModal } from '@/components/context/AuthModalContext';

const YEARS = [
  { label: "Freshman", value: 1 },
  { label: "Sophomore", value: 2 },
  { label: "Junior", value: 3 },
  { label: "Senior", value: 4 },
];
const SEMESTERS = ["Semester 1", "Semester 2"];

export default function UserDashboard() {
  const { user } = useAuth();
  const academicYear = user?.academic_year ?? 1; // fallback to 1 if not logged in
  // Filter years to show only up to user's current academic year
  const userEligibleYears = YEARS.filter(y => y.value <= academicYear);
  
  // Read from URL
  const params = new URLSearchParams(window.location.search);
  const urlYear = Number(params.get('year'));
  const urlSemester = params.get('semester');
  
  const [openYear, setOpenYear] = useState<number | null>(
    urlYear && userEligibleYears.some(y => y.value === urlYear)
      ? urlYear
      : userEligibleYears.length > 0 ? userEligibleYears[0].value : null
  );
  
  const [openSemester, setOpenSemester] = useState<string>(
    urlSemester && SEMESTERS.includes(urlSemester)
      ? urlSemester
      : SEMESTERS[0]
  );
  
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!openYear || !openSemester) return;
    
    // Update URL
    const params = new URLSearchParams();
    params.set('year', openYear.toString());
    params.set('semester', openSemester);
    window.history.pushState({}, '', `${window.location.pathname}?${params}`);
    
    // Fetch courses for the selected year and semester
    setLoading(true);
    setError(null);
    
    fetch(`/courses?year=${openYear}&semester=${encodeURIComponent(openSemester)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch courses");
        return res.json();
      })
      .then((data) => setCourses(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [openYear, openSemester]);

  const toggleCourse = (code: string) => {
    setSelectedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white p-6 flex flex-col gap-4">
        {userEligibleYears.map((year) => (
          <div key={year.value}>
            <button
              className={`w-full text-left font-semibold py-2 px-3 rounded hover:bg-blue-50 transition ${
                openYear === year.value ? 'bg-blue-100 text-blue-700' : ''
              }`}
              onClick={() => setOpenYear(openYear === year.value ? null : year.value)}
            >
              {year.label}
            </button>
            {/* Semesters Toggle */}
            {openYear === year.value && (
              <div className="ml-4 mt-2 flex flex-col gap-1">
                {SEMESTERS.map((sem) => (
                  <button
                    key={sem}
                    className={`text-sm py-1 px-2 rounded hover:bg-blue-50 transition ${
                      openSemester === sem ? 'bg-blue-200 text-blue-800' : ''
                    }`}
                    onClick={() => setOpenSemester(sem)}
                  >
                    {sem}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col p-8 gap-6 relative">
        <h2 className="text-2xl font-bold mb-4">
          Courses for {userEligibleYears.find(y => y.value === openYear)?.label} - {openSemester}
        </h2>

        
        {loading ? (
          <div className="text-center py-8">Loading courses...</div>
        ) : error ? (
          <div className="text-red-500 p-4 bg-red-50 rounded">{error}</div>
        ) : (
          <div className="space-y-4">
            {courses.length > 0 ? (
              <Card>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Select
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Credits
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {!loading && !error && courses
                        .filter(course =>
                          course.year === YEARS.find(y => y.value === openYear)?.label &&
                          course.semester === (SEMESTERS.indexOf(openSemester) + 1)
                        )
                        .map((course) => (
                          <tr 
                            key={course.code}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => toggleCourse(course.code)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedCourses.has(course.code)}
                                onChange={() => toggleCourse(course.code)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {course.code}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {course.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {course.credits || 3}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No courses found for {YEARS.find(y => y.value === openYear)?.label} - {openSemester}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
