import AgentLayout from '../components/agent/AgentLayout';
import ProfileForm from '../components/profile/ProfileForm';

const AgentProfile = () => (
  <AgentLayout>
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileForm />
      </div>
    </div>
  </AgentLayout>
);

export default AgentProfile;
