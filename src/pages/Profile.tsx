import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Settings, Shield, Bell } from 'lucide-react';

const Profile = () => {
  const { user, signOut } = useAuth();

  const menuItems = [
    { icon: Settings, label: 'Preferences', color: 'text-gray-400' },
    { icon: Shield, label: 'Security', color: 'text-gray-400' },
    { icon: Bell, label: 'Notifications', color: 'text-gray-400' },
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col items-center mb-10 pt-4">
        <div className="w-24 h-24 bg-sage-light rounded-3xl flex items-center justify-center mb-4 relative shadow-inner">
          <User size={48} className="text-sage" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-sage border-4 border-white rounded-full flex items-center justify-center shadow-lg">
            <Settings size={14} className="text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{user?.user_metadata?.full_name || 'Your Profile'}</h2>
        <p className="text-gray-400 text-sm">@{user?.user_metadata?.username || 'user'}</p>
        <p className="text-gray-400 text-xs mt-1">{user?.email}</p>
      </div>

      <div className="space-y-4 mb-8">
        {menuItems.map(({ icon: Icon, label, color }) => (
          <button 
            key={label}
            className="w-full flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl group hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-white transition-all">
                <Icon size={20} className={color} />
              </div>
              <span className="font-bold text-gray-700">{label}</span>
            </div>
          </button>
        ))}
      </div>

      <button 
        onClick={() => signOut()}
        className="w-full flex items-center justify-center gap-3 p-5 bg-red-50 text-red-500 rounded-2xl font-bold hover:bg-red-100 transition-all"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>

      <div className="mt-12 opacity-30 flex flex-col items-center">
        <div className="w-8 h-8 bg-sage rounded-lg flex items-center justify-center mb-2">
          <span className="text-white text-xs font-bold">R</span>
        </div>
        <p className="text-[10px] uppercase tracking-widest font-black text-gray-500">Rituals v1.0.0</p>
      </div>
    </div>
  );
};

export default Profile;
