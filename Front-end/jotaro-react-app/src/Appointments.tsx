import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Navbar from './Navbar'; // Import the Navbar component
// ─── Dummy Data ───────────────────────────────────────────────────────────────

const DUMMY_USER = {
  userId: 3,
  name: 'Rahim Chowdhury',
  userType: 'Agent' as 'Agent' | 'User', // Change to 'User' to see read-only view
};

const DUMMY_USERS: User[] = [
  { userId: 1, name: 'Ayesha Begum' },
  { userId: 2, name: 'Karim Hossain' },
  { userId: 3, name: 'Rahim Chowdhury' },
  { userId: 4, name: 'Sumaiya Akter' },
  { userId: 5, name: 'Tariq Islam' },
];

const DUMMY_APPOINTMENTS: Appointment[] = [
  {
    appointmentId: 101,
    userId: 1,
    propertyId: 201,
    // 3 days from now → Upcoming
    appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    agentId: 3,
  },
  {
    appointmentId: 102,
    userId: 2,
    propertyId: 202,
    // today → Today
    appointmentDate: new Date().toISOString(),
    agentId: 3,
  },
  {
    appointmentId: 103,
    userId: 4,
    propertyId: 203,
    // 5 days ago → Expired
    appointmentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    agentId: 3,
  },
  {
    appointmentId: 104,
    userId: 5,
    propertyId: 204,
    // 10 days from now → Upcoming
    appointmentDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    agentId: 3,
  },
];

// Placeholder images — no backend needed
const PROPERTY_IMAGES: Record<number, string> = {
  201: 'https://picsum.photos/seed/house201/400/300',
  202: 'https://picsum.photos/seed/house202/400/300',
  203: 'https://picsum.photos/seed/house203/400/300',
  204: 'https://picsum.photos/seed/house204/400/300',
};

const USER_IMAGES: Record<number, string> = {
  1: 'https://i.pravatar.cc/150?img=1',
  2: 'https://i.pravatar.cc/150?img=2',
  3: 'https://i.pravatar.cc/150?img=3',
  4: 'https://i.pravatar.cc/150?img=4',
  5: 'https://i.pravatar.cc/150?img=5',
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Appointment {
  appointmentId: number;
  userId: number;
  propertyId: number;
  appointmentDate: string;
  agentId: number;
  userName?: string;
}

interface User {
  userId: number;
  name: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Appointments: React.FC<{ toggleDarkMode: () => void; darkMode: boolean }> = ({ toggleDarkMode, darkMode }) => {
  const user = DUMMY_USER;

  const [appointments, setAppointments] = useState<Appointment[]>(DUMMY_APPOINTMENTS);
  const [newAppointmentForm, setNewAppointmentForm] = useState<Partial<Appointment> | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getUserName = (userId: number) => {
    const found = DUMMY_USERS.find(u => u.userId === userId);
    return found ? found.name : `User ${userId}`;
  };

  const filteredAppointments = appointments.filter((appt) => {
    const userName = getUserName(appt.userId).toLowerCase();
    const agentName = getUserName(appt.agentId).toLowerCase();
    const matchesSearch = `${appt.propertyId} ${appt.userId} ${appt.agentId} ${userName} ${agentName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const apptDate = new Date(appt.appointmentDate);
    const inDateRange =
      (!startDate || apptDate >= new Date(startDate)) &&
      (!endDate || apptDate <= new Date(endDate));
    return matchesSearch && inDateRange;
  });

  // ── Local CRUD (replaces API calls) ───────────────────────────────────────

  const handleDelete = (appointmentId: number) => {
    toast.warning(
      <div>
        <p>Are you sure you want to cancel this appointment?</p>
        <div className="mt-2 flex gap-3 justify-center">
          <button
            className="px-3 py-1 text-white rounded-lg hover:bg-red-500"
            onClick={() => {
              toast.dismiss();
              setAppointments(prev => prev.filter(a => a.appointmentId !== appointmentId));
              toast.success('Appointment cancelled');
            }}
          >
            yes✅
          </button>
          <button
            className="px-3 py-1 text-white rounded-lg hover:bg-green-500"
            onClick={() => toast.dismiss()}
          >
            no❌
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false, draggable: false }
    );
  };

  const handleSave = () => {
    if (
      !newAppointmentForm?.userId ||
      !newAppointmentForm?.propertyId ||
      !newAppointmentForm?.appointmentDate ||
      !newAppointmentForm?.userName
    ) {
      toast.warning('Please fill out all required fields.');
      return;
    }

    // Validate user ID + name match against dummy users
    const matchedUser = DUMMY_USERS.find(u => u.userId === newAppointmentForm.userId);
    if (!matchedUser) {
      toast.error('Invalid User ID');
      return;
    }
    if (matchedUser.name.toLowerCase() !== newAppointmentForm.userName?.toLowerCase()) {
      toast.error('User name does not match the User ID');
      return;
    }

    const { userName, ...appointmentData } = newAppointmentForm;

    if (appointmentData.appointmentId) {
      // Update existing appointment in local state
      setAppointments(prev =>
        prev.map(a =>
          a.appointmentId === appointmentData.appointmentId
            ? { ...a, ...appointmentData, agentId: user.userId }
            : a
        )
      );
      toast.success('Appointment updated successfully');
    } else {
      // Add new appointment to local state
      const newId = Math.max(...appointments.map(a => a.appointmentId), 100) + 1;
      setAppointments(prev => [
        ...prev,
        {
          appointmentId: newId,
          userId: appointmentData.userId!,
          propertyId: appointmentData.propertyId!,
          appointmentDate: appointmentData.appointmentDate!,
          agentId: user.userId,
        },
      ]);
      toast.success('Appointment added successfully');
    }

    setNewAppointmentForm(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="font-sans text-gray-900 bg-white dark:bg-gray-900 dark:text-white transition-colors duration-300 min-h-screen">
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} user={user} />

        {/* Stub navbar */}
        <nav className="bg-gray-800 text-white px-6 py-3 flex items-center justify-between">
          <span className="font-bold text-lg">🏠 RealEstate BD</span>
          <span className="text-sm">{user.name} ({user.userType})</span>
        </nav>

        <div className="container mx-auto px-6 py-8 z-10 relative">
          <h1 className="text-3xl font-bold mb-6">My Appointments</h1>

          {/* Search + date filters */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-4 mb-4">
            <input
              type="text"
              placeholder="Search appointments by name, property id, user id..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 w-full md:w-96 rounded-full bg-gray-800 text-white dark:bg-white dark:text-black mb-2 md:mb-0"
            />
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative mt-2 md:mt-0">
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="peer p-2 h-10 rounded-full bg-gray-800 text-white dark:bg-white dark:text-black"
                />
                <label
                  htmlFor="startDate"
                  className={`absolute left-3 top-2 text-gray-400 transition-all duration-200 peer-focus:text-opacity-0 ${startDate ? 'top-[-10px] text-xs text-cyan-500' : ''}`}
                >
                  Start Date
                </label>
              </div>
              <div className="relative mt-2 md:mt-0">
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="peer p-2 h-10 rounded-full bg-gray-800 text-white dark:bg-white dark:text-black"
                />
                <label
                  htmlFor="endDate"
                  className={`absolute left-3 top-2 text-gray-400 transition-all duration-200 peer-focus:text-opacity-0 ${endDate ? 'top-[-10px] text-xs text-cyan-500' : ''}`}
                >
                  End Date
                </label>
              </div>
            </div>
          </div>

          {/* Add button (Agent only) */}
          {user.userType === 'Agent' && (
            <div className="mb-4">
              <button
                onClick={() =>
                  setNewAppointmentForm({
                    agentId: user.userId,
                    userId: 0,
                    propertyId: 0,
                    appointmentDate: '',
                    userName: '',
                  })
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
              >
                <strong>+ Add Appointment</strong>
              </button>
            </div>
          )}

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            {filteredAppointments.map((appt) => (
              <div
                key={appt.appointmentId}
                className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl shadow-lg flex flex-col relative"
              >
                <a
                  href={`/property/${appt.propertyId}`}
                  className="absolute top-10 left-5 z-10 hover:bg-red-500 transition-all duration-500 bg-teal-500 text-white font-semibold px-2 py-1 rounded text-xs"
                >
                  View Property
                </a>

                <div className="flex gap-2 mb-3 h-52 mt-4">
                  <img
                    src={PROPERTY_IMAGES[appt.propertyId] || '/default-house.jpg'}
                    alt="Property"
                    className="w-[72%] h-full object-cover rounded-lg"
                  />
                  <div className="w-[30%] flex flex-col gap-2">
                    <img
                      src={USER_IMAGES[appt.userId] || '/default-user.jpg'}
                      alt="User"
                      className="w-full h-[48%] object-cover rounded-lg"
                    />
                    <img
                      src={USER_IMAGES[appt.agentId] || '/default-user.jpg'}
                      alt="Agent"
                      className="w-full h-[48%] object-cover rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <p className="min-h-[24px]"><strong>Appointment ID:</strong> {appt.appointmentId}</p>
                  <p className="min-h-[24px]"><strong>User:</strong> {getUserName(appt.userId)} (ID: {appt.userId})</p>
                  <p className="min-h-[24px]"><strong>Agent:</strong> {getUserName(appt.agentId)} (ID: {appt.agentId})</p>
                  <p className="min-h-[24px]"><strong>Property ID:</strong> {appt.propertyId}</p>
                  <p className="min-h-[24px]">
                    <strong>Appointment Date:</strong>{' '}
                    {new Date(appt.appointmentDate).toLocaleDateString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-sm mt-1 min-h-[24px]">
                    Status:{' '}
                    {(() => {
                      const apptDate = new Date(appt.appointmentDate);
                      const today = new Date();
                      const isToday =
                        apptDate.getFullYear() === today.getFullYear() &&
                        apptDate.getMonth() === today.getMonth() &&
                        apptDate.getDate() === today.getDate();
                      if (isToday) return <span className="text-yellow-500 font-bold">🕓 Today</span>;
                      if (apptDate > today) return <span className="text-green-500 font-bold">✅ Upcoming</span>;
                      return <span className="text-red-500 font-bold">❌ Expired</span>;
                    })()}
                  </p>
                </div>

                {user.userType === 'Agent' && (
                  <div className="flex gap-2 mt-4 flex-shrink-0">
                    <button
                      onClick={() => handleDelete(appt.appointmentId)}
                      className="px-3 py-1 font-semibold bg-red-600 text-white rounded-2xl hover:bg-red-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() =>
                        setNewAppointmentForm({ ...appt, userName: getUserName(appt.userId) })
                      }
                      className="px-3 py-1 font-semibold bg-green-500 text-white rounded-2xl hover:bg-yellow-600"
                    >
                      Update
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredAppointments.length === 0 && (
            <p className="text-center text-gray-500 mt-6">No appointments found.</p>
          )}

          {/* Modal */}
          {newAppointmentForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-lg mx-4 relative">
                <button
                  onClick={() => setNewAppointmentForm(null)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl"
                >
                  ✖
                </button>

                <h2 className="text-2xl font-semibold mb-4 text-center">
                  {newAppointmentForm.appointmentId ? 'Update Appointment' : 'Add New Appointment'}
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm mb-1">User ID</label>
                    <input
                      type="number"
                      value={newAppointmentForm.userId || ''}
                      onChange={(e) =>
                        setNewAppointmentForm(prev => ({ ...prev!, userId: parseInt(e.target.value) || 0 }))
                      }
                      className="p-2 rounded border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm mb-1">User Name</label>
                    <input
                      type="text"
                      value={newAppointmentForm.userName || ''}
                      onChange={(e) =>
                        setNewAppointmentForm(prev => ({ ...prev!, userName: e.target.value }))
                      }
                      placeholder="Enter user's full name"
                      className="p-2 rounded border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm mb-1">Property ID</label>
                    <input
                      type="number"
                      value={newAppointmentForm.propertyId || ''}
                      onChange={(e) =>
                        setNewAppointmentForm(prev => ({ ...prev!, propertyId: parseInt(e.target.value) || 0 }))
                      }
                      className="p-2 rounded border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm mb-1">Appointment Date</label>
                    <input
                      type="date"
                      value={newAppointmentForm.appointmentDate || ''}
                      onChange={(e) =>
                        setNewAppointmentForm(prev => ({ ...prev!, appointmentDate: e.target.value }))
                      }
                      className="p-2 rounded border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm mb-1">Agent ID</label>
                    <input
                      type="number"
                      value={newAppointmentForm.agentId || user.userId}
                      readOnly
                      className="p-2 rounded border dark:border-gray-600 bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 font-semibold bg-green-600 text-white rounded-full hover:bg-green-700"
                  >
                    {newAppointmentForm.appointmentId ? 'Update' : 'Add Appointment'}
                  </button>
                  <button
                    onClick={() => setNewAppointmentForm(null)}
                    className="px-4 py-2 font-semibold bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;