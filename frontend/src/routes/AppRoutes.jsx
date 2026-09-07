import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import LandingPage from '../pages/public/LandingPage';
import AboutPage from '../pages/public/AboutPage';
import FacilitiesPage from '../pages/public/FacilitiesPage';
import TrainersPage from '../pages/public/TrainersPage';
import SchedulePage from '../pages/public/SchedulePage';
import FreePassPage from '../pages/public/FreePassPage';
import GalleryPage from '../pages/public/GalleryPage';
import FaqPage from '../pages/public/FaqPage';
import ContactPage from '../pages/public/ContactPage';
import MembershipPlansPage from '../pages/public/MembershipPlansPage';
import LoginPage from '../pages/public/LoginPage';
import StudentRegisterPage from '../pages/public/StudentRegisterPage';
import TrainerRegisterPage from '../pages/public/TrainerRegisterPage';
import UnauthorizedPage from '../pages/public/UnauthorizedPage';
import NotFoundPage from '../pages/public/NotFoundPage';
import ComplaintPage from '../pages/public/ComplaintPage';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentAmenityBookings from '../pages/student/StudentAmenityBookings';
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
import AdminCmsPage from '../pages/admin/AdminCmsPage';
import ManageMemberships from '../pages/admin/ManageMemberships';
import ManageComplaints from '../pages/admin/ManageComplaints';
import ManagePayments from '../pages/admin/ManagePayments';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Catalog Routes */}
        <Route index element={<LandingPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="facilities" element={<FacilitiesPage />} />
        <Route path="trainers" element={<TrainersPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="free-pass" element={<FreePassPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="complaint" element={<ComplaintPage />} />
        <Route path="complaints" element={<ComplaintPage />} />
        <Route path="membership-plans" element={<MembershipPlansPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<StudentRegisterPage />} />
        <Route path="register/student" element={<StudentRegisterPage />} />
        <Route path="trainer-register" element={<TrainerRegisterPage />} />
        <Route path="register/trainer" element={<TrainerRegisterPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />

        {/* Student Protected Routes (ROLE_STUDENT) */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']} />}>
          <Route path="student/dashboard" element={<StudentDashboard />} />
          <Route path="student/amenity-bookings" element={<StudentAmenityBookings />} />
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
          <Route path="admin/cms" element={<AdminCmsPage />} />
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
