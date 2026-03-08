import { useEffect, useState } from "react";
import { getAllPaidRegistrations, type PaidRegistration } from "../api/register.api";
import { toast } from "react-hot-toast";
import { COURSES } from "../constants/courses";

// Helper function to get course label by ID
const getCourseLabelById = (courseId: string | null): string => {
  if (!courseId) return "–";
  
  const allCourses = [...COURSES.physical, ...COURSES.online];
  const course = allCourses.find((c) => c.id === courseId);
  return course ? course.label : courseId;
};

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<PaidRegistration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<PaidRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [filterCourseType, setFilterCourseType] = useState("");

  // Fetch all paid registrations
  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setIsLoading(true);
        const response = await getAllPaidRegistrations();
        setRegistrations(response.data || []);
        setFilteredRegistrations(response.data || []);
      } catch (error) {
        console.error("Failed to fetch registrations:", error);
        toast.error("Failed to load registrations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = registrations;

    // Search by name or email
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (reg) =>
          reg.firstName.toLowerCase().includes(query) ||
          reg.lastName.toLowerCase().includes(query) ||
          reg.email.toLowerCase().includes(query) ||
          reg.phone.includes(query)
      );
    }

    // Filter by branch
    if (filterBranch) {
      filtered = filtered.filter((reg) => {
        const branchValue = reg.branch || null;
        return filterBranch === "null" ? branchValue === null : branchValue === filterBranch;
      });
    }

    // Filter by course type
    if (filterCourseType === "physical") {
      filtered = filtered.filter((reg) => reg.physicalCourse);
    } else if (filterCourseType === "online") {
      filtered = filtered.filter((reg) => reg.onlineCourses && reg.onlineCourses.length > 0);
    }

    setFilteredRegistrations(filtered);
  }, [searchQuery, filterBranch, filterCourseType, registrations]);

  // Get unique branches (including null for non-members)
  const uniqueBranches = Array.from(
    new Set(
      registrations
        .map((reg) => reg.branch)
        .map((branch) => branch || "null")
    )
  ).sort((a, b) => {
    if (a === "null") return 1; // Put "null" at the end
    if (b === "null") return -1;
    return a.localeCompare(b);
  });

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterBranch("");
    setFilterCourseType("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="animate-spin inline-block w-12 h-12 border-4 border-yellow-400 border-t-black rounded-full mb-4" />
          <p className="text-black font-semibold">Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <div className="bg-black px-6 py-5 flex items-center gap-6 border-b-4 border-yellow-400">
        <div>
          <p className="text-yellow-400 text-xs font-bold uppercase tracking-[0.3em] mb-0.5">
            Admin Panel
          </p>
          <h1 className="text-yellow-400 font-black text-2xl">Skills Hub Admin</h1>
        </div>
      </div>

      {/* Accent stripe */}
      <div className="h-2 bg-gradient-to-r from-yellow-400 via-red-600 to-yellow-400" />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="border-4 border-black bg-yellow-400 p-6 shadow-[4px_4px_0_black]">
            <p className="text-xs text-black/60 font-bold uppercase tracking-widest mb-2">
              Total Paid
            </p>
            <p className="text-4xl font-black text-black">{registrations.length}</p>
          </div>
          <div className="border-4 border-black bg-white p-6 shadow-[4px_4px_0_black]">
            <p className="text-xs text-black/60 font-bold uppercase tracking-widest mb-2">
              With Physical Course
            </p>
            <p className="text-4xl font-black text-black">
              {registrations.filter((r) => r.physicalCourse).length}
            </p>
          </div>
          <div className="border-4 border-black bg-white p-6 shadow-[4px_4px_0_black]">
            <p className="text-xs text-black/60 font-bold uppercase tracking-widest mb-2">
              With Online Course
            </p>
            <p className="text-4xl font-black text-black">
              {registrations.filter((r) => r.onlineCourses?.length).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0_black] mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-black mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium text-black placeholder-black/30 outline-none transition-all duration-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-black mb-2">
                Branch
              </label>
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium text-black outline-none transition-all duration-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-200 cursor-pointer"
              >
                <option value="">All Branches</option>
                {uniqueBranches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch === "null" ? "No Branch (Non-member)" : branch}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-black mb-2">
                Course Type
              </label>
              <select
                value={filterCourseType}
                onChange={(e) => setFilterCourseType(e.target.value)}
                className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium text-black outline-none transition-all duration-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-200 cursor-pointer"
              >
                <option value="">All Types</option>
                <option value="physical">Physical Course</option>
                <option value="online">Online Course</option>
              </select>
            </div>
            <button
              onClick={handleClearFilters}
              className="w-full bg-red-600 border-2 border-red-600 text-white font-bold uppercase tracking-widest py-3 text-sm transition-all duration-200 hover:bg-white hover:text-red-600 active:translate-y-0.5 shadow-[2px_2px_0_red]"
            >
              Clear Filters
            </button>
          </div>
          <p className="text-xs text-black/50 mt-4 font-medium">
            Showing {filteredRegistrations.length} of {registrations.length} registrations
          </p>
        </div>

        {/* Registrations Table */}
        {filteredRegistrations.length === 0 ? (
          <div className="border-4 border-black bg-yellow-50 p-8 text-center">
            <p className="text-lg font-semibold text-black">No registrations found</p>
            <p className="text-sm text-black/60 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-black">
                  <th className="border-2 border-black bg-yellow-400 text-black px-4 py-3 text-left font-bold text-xs uppercase tracking-widest">
                    Name
                  </th>
                  <th className="border-2 border-black bg-yellow-400 text-black px-4 py-3 text-left font-bold text-xs uppercase tracking-widest">
                    Email
                  </th>
                  <th className="border-2 border-black bg-yellow-400 text-black px-4 py-3 text-left font-bold text-xs uppercase tracking-widest">
                    Phone
                  </th>
                  <th className="border-2 border-black bg-yellow-400 text-black px-4 py-3 text-left font-bold text-xs uppercase tracking-widest">
                    Branch
                  </th>
                  <th className="border-2 border-black bg-yellow-400 text-black px-4 py-3 text-left font-bold text-xs uppercase tracking-widest">
                    Physical Course
                  </th>
                  <th className="border-2 border-black bg-yellow-400 text-black px-4 py-3 text-left font-bold text-xs uppercase tracking-widest">
                    Online Courses
                  </th>
                  <th className="border-2 border-black bg-yellow-400 text-black px-4 py-3 text-left font-bold text-xs uppercase tracking-widest">
                    Registered
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((reg, index) => (
                  <tr key={reg.id} className={index % 2 === 0 ? "bg-white" : "bg-yellow-50"}>
                    <td className="border-2 border-black px-4 py-3 text-sm font-medium text-black">
                      {reg.firstName} {reg.lastName}
                    </td>
                    <td className="border-2 border-black px-4 py-3 text-sm font-medium text-black">
                      {reg.email}
                    </td>
                    <td className="border-2 border-black px-4 py-3 text-sm font-medium text-black">
                      {reg.phone}
                    </td>
                    <td className="border-2 border-black px-4 py-3 text-sm font-medium text-black">
                      {reg.branch || "–"}
                    </td>
                    <td className="border-2 border-black px-4 py-3 text-sm font-medium text-black">
                      {getCourseLabelById(reg.physicalCourse)}
                    </td>
                    <td className="border-2 border-black px-4 py-3 text-sm font-medium text-black">
                      {reg.onlineCourses && reg.onlineCourses.length > 0
                        ? reg.onlineCourses.map((courseId) => getCourseLabelById(courseId)).join(", ")
                        : "–"}
                    </td>
                    <td className="border-2 border-black px-4 py-3 text-sm font-medium text-black">
                      {new Date(reg.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
