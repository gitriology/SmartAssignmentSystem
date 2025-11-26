import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import TeacherDashboard from "./pages/Dashboard/TeacherDashboard";
import StudentDashboard from "./pages/Dashboard/StudentDashboard";
import CreateAssignment from "./pages/Assignments/CreateAssignment";
import EditAssignment from "./pages/Assignments/EditAssignment";
import AssignmentDetails from "./pages/Assignments/AssignmentDetails";
import AllAssignments from "./pages/Assignments/AllAssignments";
import UploadSubmission from "./pages/Submissions/UploadSubmission";
import ViewSubmission from "./pages/Submissions/ViewSubmission";
import GradeSubmission from "./pages/Submissions/GradeSubmission";
import TeacherAnalytics from "./pages/Analytics/TeacherAnalytics";
import StudentAnalytics from "./pages/Analytics/StudentAnalytics";
import StudentSubmissions from "./pages/Submissions/StudentsSubmissions";
import ResubmitSubmission from "./pages/Submissions/ReSubmitSubmissions";
import AllSubmissions from "./pages/Submissions/AllSubmissions";
import UserProfile from "./pages/Users/UserProfile";
import ProblemsList from "./pages/Coding/ProblemList";
import CreateProblem from "./pages/Coding/CreateProblem";
import ProblemDetails from "./pages/Coding/ProblemDetails";
import SolveProblem from "./pages/Coding/SolveProblem";
import MyCodingSubmissions from "./pages/Coding/MyCodingSubmission";
import AllCodingSubmissions from "./pages/Coding/AllCodingSubmissions";
import ViewCodingSubmission from "./pages/Coding/ViewCodingSubmission";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Teacher */}
          <Route
            path="/teacher/dashboard"
            element={<ProtectedRoute role="Teacher"><TeacherDashboard /></ProtectedRoute>}
          />
          <Route
            path="/teacher/profile/:id"
            element={<ProtectedRoute role="Teacher"><UserProfile /></ProtectedRoute>}
          />
          <Route
            path="/teacher/assignments/create"
            element={<ProtectedRoute role="Teacher"><CreateAssignment /></ProtectedRoute>}
          />
          <Route
            path="/teacher/assignments/:id/edit"
            element={<ProtectedRoute role="Teacher"><EditAssignment /></ProtectedRoute>}
          />
          <Route path="/teacher/analytics" element={<ProtectedRoute role="Teacher"><TeacherAnalytics /></ProtectedRoute>} />
          <Route path="/assignments/:id/allSubmissions" element={<ProtectedRoute role="Teacher"><AllSubmissions /></ProtectedRoute>} />

          {/* Student */}
          <Route path="/student/dashboard" element={<ProtectedRoute role="Student"><StudentDashboard /></ProtectedRoute>} />
          <Route
            path="/student/profile/:id"
            element={<ProtectedRoute role="Student"><UserProfile /></ProtectedRoute>}
          />
          <Route path="/student/analytics" element={<ProtectedRoute role="Student"><StudentAnalytics /></ProtectedRoute>} />
          <Route path="/student/my" element={<ProtectedRoute role="Student"><StudentSubmissions /></ProtectedRoute>} />
          <Route
  path="/coding/submission/:id"
  element={
    <ProtectedRoute>
      <ViewCodingSubmission />
    </ProtectedRoute>
  }
/>


          {/* Common */}
          <Route path="/assignments" element={<AllAssignments />} />
          <Route path="/assignments/:id" element={<AssignmentDetails />} />
          <Route path="/assignments/:id/submit" element={<ProtectedRoute role="Student"><UploadSubmission /></ProtectedRoute>} />
          <Route path="/assignments/:id/submissions" element={<ProtectedRoute role="Teacher"><AllAssignments /></ProtectedRoute>} />
          <Route path="/submissions/:id/resubmit" element={<ProtectedRoute role="Student">     <ResubmitSubmission />
        </ProtectedRoute>
          }
          />
          <Route path="/submissions/:id" element={<ProtectedRoute role={["Student", "Teacher"]}><ViewSubmission /></ProtectedRoute>} />
          <Route path="/submissions/:id/grade" element={<ProtectedRoute role="Teacher"><GradeSubmission /></ProtectedRoute>} />
          <Route path="/coding/all-submissions" element={<AllCodingSubmissions />} />
          {/* Coding Routes */} 
<Route
  path="/coding/problems"
  element={
    <ProtectedRoute>
      <ProblemsList />
    </ProtectedRoute>
  }
/>

<Route
  path="/coding/problem/:id"
  element={
    <ProtectedRoute>
      <ProblemDetails />
    </ProtectedRoute>
  }
/>

<Route
  path="/coding/solve/:id"
  element={
    <ProtectedRoute role="Student">
      <SolveProblem />
    </ProtectedRoute>
  }
/>

<Route
  path="/coding/create"
  element={
    <ProtectedRoute role="Teacher">
      <CreateProblem />
    </ProtectedRoute>
  }
/>

<Route
  path="/coding/my"
  element={
    <ProtectedRoute role="Student">
      <MyCodingSubmissions />
    </ProtectedRoute>
  }
/>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
