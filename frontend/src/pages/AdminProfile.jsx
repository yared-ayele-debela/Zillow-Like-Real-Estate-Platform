import AdminLayout from '../components/admin/AdminLayout';
import ProfileForm from '../components/profile/ProfileForm';

const AdminProfile = () => (
  <AdminLayout>
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProfileForm />
    </div>
  </AdminLayout>
);

export default AdminProfile;
