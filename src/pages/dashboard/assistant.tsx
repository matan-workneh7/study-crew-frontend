import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/context/AuthContext";

const YEARS = [
  { label: "Freshman", value: 1 },
  { label: "Sophomore", value: 2 },
  { label: "Junior", value: 3 },
  { label: "Senior", value: 4 },
];
const SEMESTERS = ["Semester 1", "Semester 2"];

export default function AssistantDashboard() {
  const { user } = useAuth();
  const academicYear = user?.academic_year ?? 1; // fallback to 1 if not logged in
  const eligibleYears = YEARS.filter(y => y.value < academicYear);
  // Read from URL
  const params = new URLSearchParams(window.location.search);
  const urlYear = Number(params.get('year'));
  const urlSemester = params.get('semester');
  const [openYear, setOpenYear] = useState<number | null>(
    urlYear && eligibleYears.some(y => y.value === urlYear)
      ? urlYear
      : eligibleYears.length > 0 ? eligibleYears[0].value : null
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

  const handleSubmit = () => {
    // TODO: navigate to next page with selectedCourses
    alert("Selected: " + Array.from(selectedCourses).join(", "));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white p-6 flex flex-col gap-4">
        {eligibleYears.length === 0 ? (
          <div className="text-gray-500 text-center mt-10">No eligible years to assist based on your academic year.</div>
        ) : (
          eligibleYears.map((year) => (
            <div key={year.value}>
              <button
                className={`w-full text-left font-semibold py-2 px-3 rounded hover:bg-blue-50 transition ${openYear === year.value ? 'bg-blue-100 text-blue-700' : ''}`}
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
                      className={`text-sm py-1 px-2 rounded hover:bg-blue-50 transition ${openSemester === sem ? 'bg-blue-200 text-blue-800' : ''}`}
                      onClick={() => setOpenSemester(sem)}
                    >
                      {sem}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col p-8 gap-6 relative">
        <h2 className="text-2xl font-bold mb-4">Courses for {YEARS.find(y => y.value === openYear)?.label} - {openSemester}</h2>
        <div className="flex flex-col gap-4">
          {loading && <div>Loading courses...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {!loading && !error && courses
            .filter(course =>
              course.year === YEARS.find(y => y.value === openYear)?.label &&
              course.semester === (SEMESTERS.indexOf(openSemester) + 1)
            )
            .map((course) => (
              <Card
                key={course.code}
                className={`flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-4 cursor-pointer transition border-2 ${selectedCourses.has(course.code) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                onClick={() => toggleCourse(course.code)}
              >
                <div className="flex flex-col md:flex-row gap-2 md:gap-8 items-start md:items-center w-full">
                  <span className="font-semibold w-full md:w-1/3">{course.name}</span>
                  <span className="w-full md:w-1/6 text-gray-600">{course.code}</span>
                  <span className="w-full md:w-1/6 text-gray-600">Year {course.year}</span>
                  <span className="w-full md:w-1/6 text-gray-600">{course.credit_hour} Credit Hour</span>
                </div>
                {course.description && (
                  <div className="text-gray-500 text-sm mt-2 md:mt-0 md:ml-8 w-full">{course.description}</div>
                )}
                <input
                  type="checkbox"
                  checked={selectedCourses.has(course.code)}
                  readOnly
                  className="ml-4 accent-blue-600 w-5 h-5"
                />
              </Card>
            ))}
        </div>
        {/* Submit button sticky at the bottom */}
        <div className="sticky bottom-0 left-0 w-full bg-gray-50 pt-6 pb-2 flex justify-end">
          <Button
            className="px-8 py-3 text-lg font-semibold"
            disabled={selectedCourses.size === 0}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </main>
    </div>
  );
}
