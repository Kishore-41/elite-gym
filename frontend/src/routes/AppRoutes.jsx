import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage';
import StudentRegisterPage from '../pages/public/StudentRegisterPage';
import TrainerRegisterPage from '../pages/public/TrainerRegisterPage';
import MembershipPlansPage from '../pages/public/MembershipPlansPage';
import UnauthorizedPage from '../pages/public/UnauthorizedPage';
import NotFoundPage from '../pages/public/NotFoundPage';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import MyMembership from '../pages/student/MyMembership';
import PaymentsPage from '../pages/student/PaymentsPage';
import StudentTrainerRequests from '../pages/student/TrainerRequests';
import MyWorkouts from '../pages/student/MyWorkouts';
import ProgressPage from '../pages/student/ProgressPage';
import AttendancePage from '../pages/student/AttendancePage';
import ComplaintsPage from '../pages/student/ComplaintsPage';

// Trainer Pages
import TrainerDashboard from '../pages/trainer/TrainerDashboard';
import TrainerInbox from '../pages/trainer/TrainerRequests';
import WorkoutPlans from '../pages/trainer/WorkoutPlans';
import MyStudents from '../pages/trainer/MyStudents';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageMemberships from '../pages/admin/ManageMemberships';
import ManageComplaints from '../pages/admin/ManageComplaints';
import ManagePayments from '../pages/admin/ManagePayments';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register/student" element={<StudentRegisterPage />} />
        <Route path="register/trainer" element={<TrainerRegisterPage />} />
        <Route path="membership-plans" element={<MembershipPlansPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />

        {/* Student Protected Routes (ROLE_STUDENT) */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']} />}>
          <Route path="student/dashboard" element={<StudentDashboard />} />
          <Route path="student/membership" element={<MyMembership />} />
          <Route path="student/payments" element={<PaymentsPage />} />
          <Route path="student/attendance" element={<AttendancePage />} />
          <Route path="student/complaints" element={<ComplaintsPage />} />
          <Route path="student/trainer-requests" element={<StudentTrainerRequests />} />
          <Route path="student/workouts" element={<MyWorkouts />} />
          <Route path="student/progress" element={<ProgressPage />} />
          <Route path="student" element={<Navigate to="/student/dashboard" replace />} />
        </Route>

        {/* Trainer Protected Routes (ROLE_TRAINER) */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_TRAINER']} />}>
          <Route path="trainer/dashboard" element={<TrainerDashboard />} />
          <Route path="trainer/requests" element={<TrainerInbox />} />
          <Route path="trainer/workout-plans" element={<WorkoutPlans />} />
          <Route path="trainer/students" element={<MyStudents />} />
          <Route path="trainer" element={<Navigate to="/trainer/dashboard" replace />} />
        </Route>

        {/* Admin Protected Routes (ROLE_ADMIN) */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/memberships" element={<ManageMemberships />} />
          <Route path="admin/payments" element={<ManagePayments />} />
          <Route path="admin/complaints" element={<ManageComplaints />} />
          <Route path="admin" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
