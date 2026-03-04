import ProtectedRoute from '../components/auth/ProtectedRoute';
import ProfileForm from '../components/profile/ProfileForm';

const Profile = () => (
  <ProtectedRoute>
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProfileForm />
      </div>
    </div>
  </ProtectedRoute>
);

export default Profile;
