import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Add these imports at the top
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Add this constant
const customIcon = L.icon({
  iconUrl: '/marker-icon.png',
  iconSize: [38, 45],
  iconAnchor: [19, 45],
  popupAnchor: [0, -45],
});

// Add this geocoding function
const geocodeAddress = async (address: string): Promise<[number, number]> => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data && data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  throw new Error('Location not found');
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Property {
  propertyId: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  numberOfBedroom: number;
  numberOfBathroom: number;
  size: number;
  propertyType: 'Home' | 'Apartment' | 'Industrial' | 'Rental';
  status: 'Available' | 'Sold' | 'Rented' | 'Pending';
  listingDate: string;
  description: string;
  imgUrls: string[];
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const DUMMY_USER = {
  userId: 10,
  name: 'Rahim Chowdhury',
  userType: 'Admin' as 'Admin' | 'Agent' | 'User', // Change to test different views
};

const DUMMY_PROPERTY: Property = {
  propertyId: 201,
  address: '45 Gulshan Avenue',
  city: 'Dhaka',
  state: 'Dhaka Division',
  zipCode: '1212',
  price: 12500000,
  numberOfBedroom: 4,
  numberOfBathroom: 3,
  size: 2400,
  propertyType: 'Apartment',
  status: 'Available',
  listingDate: '2025-03-15',
  description:
    'A spacious modern apartment in the heart of Gulshan, Dhaka. Featuring floor-to-ceiling windows with panoramic city views, a fully equipped kitchen, and premium finishes throughout. The building includes 24/7 security, a rooftop lounge, and covered parking.',
  imgUrls: [
    'https://picsum.photos/seed/prop301a/800/500',
    'https://picsum.photos/seed/prop301b/800/500',
    'https://picsum.photos/seed/prop301c/800/500',
  ],
};

const DUMMY_AGENT = { agentId: 3, agentName: 'Farhan Ahmed' };
const DUMMY_OWNER = { ownerId: 7, ownerName: 'Sumaiya Akter' };

const DUMMY_SUGGESTED: Property[] = [
  {
    propertyId: 202,
    address: '12 Banani Road 11',
    city: 'Dhaka',
    state: 'Dhaka Division',
    zipCode: '1213',
    price: 8900000,
    numberOfBedroom: 3,
    numberOfBathroom: 2,
    size: 1800,
    propertyType: 'Home',
    status: 'Available',
    listingDate: '2025-04-01',
    description: 'Lovely family home in Banani.',
    imgUrls: ['https://picsum.photos/seed/prop302/400/300'],
  },
  {
    propertyId: 203,
    address: '88 Dhanmondi Lake Road',
    city: 'Dhaka',
    state: 'Dhaka Division',
    zipCode: '1205',
    price: 45000,
    numberOfBedroom: 2,
    numberOfBathroom: 1,
    size: 900,
    propertyType: 'Rental',
    status: 'Available',
    listingDate: '2025-05-10',
    description: 'Cozy rental near Dhanmondi Lake.',
    imgUrls: ['https://picsum.photos/seed/prop303/400/300'],
  },
  {
    propertyId: 204,
    address: '5 Uttara Sector 7',
    city: 'Dhaka',
    state: 'Dhaka Division',
    zipCode: '1230',
    price: 6200000,
    numberOfBedroom: 3,
    numberOfBathroom: 2,
    size: 1500,
    propertyType: 'Apartment',
    status: 'Pending',
    listingDate: '2025-02-20',
    description: 'Modern apartment in Uttara.',
    imgUrls: ['https://picsum.photos/seed/prop304/400/300'],
  },
  {
    propertyId: 205,
    address: '200 Tejgaon Industrial Area',
    city: 'Dhaka',
    state: 'Dhaka Division',
    zipCode: '1208',
    price: 22000000,
    numberOfBedroom: 0,
    numberOfBathroom: 4,
    size: 8000,
    propertyType: 'Industrial',
    status: 'Available',
    listingDate: '2025-01-05',
    description: 'Large industrial space in Tejgaon.',
    imgUrls: ['https://picsum.photos/seed/prop305/400/300'],
  },
  {
    propertyId: 206,
    address: '9 Mirpur DOHS',
    city: 'Dhaka',
    state: 'Dhaka Division',
    zipCode: '1216',
    price: 9800000,
    numberOfBedroom: 4,
    numberOfBathroom: 3,
    size: 2200,
    propertyType: 'Home',
    status: 'Sold',
    listingDate: '2024-11-30',
    description: 'Beautiful home in Mirpur DOHS.',
    imgUrls: ['https://picsum.photos/seed/prop306/400/300'],
  },
];

// Dummy assigned maps (which properties have an agent / holder)
const DUMMY_ASSIGNED_MAP: Record<number, boolean> = { 301: true, 302: true, 304: true };
const DUMMY_ASSIGNED_MAP2: Record<number, boolean> = { 301: true, 305: true };

// ─── Sub-components ───────────────────────────────────────────────────────────

const SuggestedCard: React.FC<{ property: Property; user: typeof DUMMY_USER }> = ({
  property,
  user,
}) => {
  const agentName = DUMMY_AGENT.agentName;
  const agentId = DUMMY_AGENT.agentId;
  const ownerName = DUMMY_OWNER.ownerName;
  const ownerId = DUMMY_OWNER.ownerId;

  const canViewOwnership =
    user.userType.toLowerCase() === 'admin' || user.userId === ownerId;

  // Hide sold properties from regular users who aren't the owner
  if (user.userType.toLowerCase() === 'user' && property.status === 'Sold' && user.userId !== ownerId) {
    return null;
  }

  return (
    <div className="relative w-[400px] bg-white dark:bg-slate-900 shadow-xl border-slate-500 dark:border-slate-500 rounded-lg overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition flex flex-col h-[580px]" style={{ zoom: 0.85 }}>
      {canViewOwnership && (
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-white text-sm shadow-lg ${DUMMY_ASSIGNED_MAP2[property.propertyId] ? 'bg-teal-500' : 'bg-indigo-500'}`}>
          {DUMMY_ASSIGNED_MAP2[property.propertyId]
            ? `Occupied by ${ownerName} | ID: ${ownerId}`
            : 'No holder'}
        </div>
      )}

      <a href={`/property/${property.propertyId}`} className="cursor-pointer hover:opacity-75 transition-all duration-500 flex flex-col flex-1">
        <img
          src={property.imgUrls[0]}
          alt="Property"
          className="w-full h-64 object-cover flex-shrink-0"
          loading="lazy"
          onError={e => (e.currentTarget.src = '/default-house.jpg')}
        />
        <div className="p-4 flex flex-col flex-1">
          <div className="font-bold text-lg">
            ৳{property.price.toLocaleString()}
            {property.propertyType === 'Rental' && <span className="text-sm text-gray-500">/month</span>}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-3 text-sm">
              <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-1">🛏 {property.numberOfBedroom} Beds</span>
              <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-1">🛁 {property.numberOfBathroom} Baths</span>
              <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-1">📏 {property.size} sqft</span>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              property.propertyType === 'Home' ? 'bg-green-200 text-green-800'
              : property.propertyType === 'Industrial' ? 'bg-yellow-200 text-yellow-800'
              : property.propertyType === 'Apartment' ? 'bg-cyan-200 text-cyan-800'
              : 'bg-purple-200 text-purple-800'
            }`}>
              {property.propertyType}
            </span>
          </div>
          <div className="mt-2">
            <span className={`text-sm font-medium px-2 py-1 rounded-full text-white ${
              property.status === 'Available' ? 'bg-green-500'
              : property.status === 'Sold' ? 'bg-red-500'
              : property.status === 'Rented' ? 'bg-sky-500'
              : 'bg-yellow-500'
            }`}>
              {property.status}
            </span>
          </div>
          <div className="text-gray-500 text-sm mt-3 flex-1 line-clamp-2">{property.address}</div>
        </div>
      </a>

      <div className="px-4 pb-4 mt-auto flex-shrink-0">
        <div className="text-xs text-gray-400 flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 mb-2">
          <span className="text-yellow-500">Property ID: {property.propertyId}</span>
          <span className={user.userId === agentId ? 'text-red-500 font-semibold' : 'text-cyan-500'}>
            Agent: {agentName}
          </span>
        </div>
        <button className="h-10 w-full bg-cyan-600 text-white rounded hover:bg-cyan-700 flex items-center justify-center">
          <strong>Contact Agent {agentName} 🖂</strong>
        </button>
      </div>
    </div>
  );
};

// ─── Stub modals ──────────────────────────────────────────────────────────────
// These replace ListingAssignment, ListingAssignment2, PropertyUpdateModal, AgentProfileCard, Chat

const StubModal: React.FC<{ title: string; onClose: () => void }> = ({ title, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-80 text-center">
      <p className="text-lg font-semibold mb-4">{title}</p>
      <button onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded-full hover:bg-gray-500">
        Close
      </button>
    </div>
  </div>
);

const StubChat: React.FC<{ agentName: string; onClose: () => void }> = ({ agentName, onClose }) => (
  <div className="fixed bottom-0 right-4 w-[90%] sm:w-[24rem] h-[500px] bg-white dark:bg-gray-800 shadow-xl border border-gray-300 dark:border-gray-700 z-50 rounded-t-2xl flex flex-col">
    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <span className="font-semibold">Chat with {agentName}</span>
      <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-xl">✖</button>
    </div>
    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
      [Chat UI — stub for dummy mode]
    </div>
    <div className="p-3 border-t border-gray-200 dark:border-gray-700">
      <input
        className="w-full p-2 rounded-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
        placeholder="Type a message…"
        disabled
      />
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const PropertyPage: React.FC = () => {
  const darkMode = false; // flip to true to test dark mode

  const user = DUMMY_USER;
  const property = DUMMY_PROPERTY;
  const { agentId, agentName } = DUMMY_AGENT;
  const { ownerId, ownerName } = DUMMY_OWNER;

  const canViewOwnership =
    user.userType.toLowerCase() === 'admin' || user.userId === ownerId;

  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [showAgentProfile, setShowAgentProfile] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hoveredHolder, setHoveredHolder] = useState(false);

  // Modal state
  const [isReviseOpen, setIsReviseOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isAssign2Open, setIsAssign2Open] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [coords, setCoords] = useState<[number, number] | null>(null);

useEffect(() => {
  geocodeAddress(property.address)
    .then(setCoords)
    .catch(() => setCoords([23.7937, 90.4066])); // Dhaka fallback
}, [property.address]);

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="font-sans text-gray-900 bg-white dark:bg-gray-900 dark:text-white min-h-screen transition-colors duration-300">

        {/* Stub navbar */}
        <nav className="bg-gray-800 text-white px-6 py-3 flex items-center justify-between">
          <span className="font-bold text-lg">🏠 RealEstate BD</span>
          <span className="text-sm">{user.name} ({user.userType})</span>
        </nav>

        <div className="container mx-auto p-6 z-10 relative bg-white dark:bg-gray-900">
          <a href="/buy" className="text-blue-500 text-sm">&larr; Back to Browsing</a>

          <h1 className="text-3xl font-bold mt-4 mb-2">
            ৳{property.price.toLocaleString()}
            {property.propertyType === 'Rental' && (
              <span className="text-sm text-gray-500 dark:text-gray-400">/month</span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mb-4">
            {property.address}, {property.city}, {property.state} {property.zipCode}
          </p>

          {/* Image Gallery */}
          <div className="flex overflow-x-auto gap-4 mb-6">
            {property.imgUrls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Property ${idx + 1}`}
                className="h-64 object-cover rounded cursor-pointer min-w-[300px] hover:scale-105 transition-transform"
                onClick={() => setEnlargedImage(url)}
                onError={e => (e.currentTarget.src = '/default-house.jpg')}
              />
            ))}
          </div>

          {/* Enlarged Image Modal */}
          {enlargedImage && (
            <div
              className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
              onClick={() => setEnlargedImage(null)}
            >
              <img
                src={enlargedImage}
                alt="Enlarged"
                className="max-w-[90vw] max-h-[90vh] object-contain rounded shadow-lg"
                onClick={e => e.stopPropagation()}
              />
              <button
                onClick={() => setEnlargedImage(null)}
                className="absolute top-6 right-6 text-white text-3xl font-bold"
              >
                &times;
              </button>
            </div>
          )}

          {/* Holder button */}
          {canViewOwnership && (
            <button
              onClick={() => {
                if (ownerId) {
                  // stub: would call handleRemoveOwnership
                  alert('Remove holder — stub');
                } else {
                  setIsAssign2Open(true);
                }
              }}
              onMouseEnter={() => setHoveredHolder(true)}
              onMouseLeave={() => setHoveredHolder(false)}
              className={`items-center font-semibold content-center text-center w-full mb-4 px-4 py-2 rounded-full text-white text-sm transition-all duration-300 ${
                ownerId ? 'bg-teal-500 hover:bg-red-500' : 'bg-indigo-500 hover:bg-emerald-500'
              }`}
            >
              <span>👑 </span>
              <span>
                {ownerId
                  ? hoveredHolder
                    ? 'Remove holder'
                    : `Occupied by ${ownerName} | ID: ${ownerId}`
                  : 'Select holder'}
              </span>
            </button>
          )}

          {/* Property Info Row 1 */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2 text-xl">
              <span>🏠</span>
              <span><strong>Property ID:</strong> {property.propertyId}</span>
            </div>
            {user.userType.toLowerCase() === 'admin' && (
              <button
                className="bg-red-500 text-white px-4 h-9 rounded-3xl w-[20%] hover:bg-red-600"
                onClick={() => setIsReviseOpen(true)}
              >
                <strong>Revise</strong>
              </button>
            )}
          </div>

          {/* Property Info Row 2 */}
          <div className="flex flex-wrap gap-6 text-gray-700 dark:text-gray-300 mb-8 text-xl">
            <div className="flex items-center space-x-2">
              <span>ℹ</span><span><strong>Status:</strong> {property.status}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🌃</span><span><strong>Type:</strong> {property.propertyType}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📅</span>
              <span>
                <strong>Listed On:</strong>{' '}
                {(() => {
                  const [year, month, day] = property.listingDate.split('-');
                  return `${month}/${day}/${year}`;
                })()}
              </span>
            </div>
          </div>

          {/* Property Info Row 3 */}
          <div className="flex flex-wrap gap-6 text-gray-700 dark:text-gray-300 mb-8 text-xl">
            <div className="flex items-center space-x-2">
              <span>🛏️</span><span><strong>Bedrooms:</strong> {property.numberOfBedroom}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🛁</span><span><strong>Bathrooms:</strong> {property.numberOfBathroom}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📏</span><span><strong>Size:</strong> {property.size} sqft</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Description 📃</h2>
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{property.description}</p>
          </div>

          {/* Map stub */}
          {coords && (
  <div className="my-10">
    <h2 className="text-xl font-semibold mb-2">Location 🗺️</h2>
    <MapContainer center={coords} zoom={16} scrollWheelZoom={false} className="h-96 max-w-5xl rounded shadow z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={coords} icon={customIcon}>
        <Popup>
          <strong>{property.address}</strong><br />
          {property.city}, {property.state} {property.zipCode}
        </Popup>
      </Marker>
    </MapContainer>
  </div>
)}

          {/* Contact Agent */}
          <div className="mt-10 bg-blue-50 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Contact Agent</h2>
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-cyan-600 mb-2 text-white px-6 h-10 w-full rounded-full hover:bg-cyan-700 md:w-[45%]"
            >
              <strong>Chat with {agentName} 💬</strong>
            </button>
            <button
              onClick={() => setShowAgentProfile(prev => !prev)}
              className="bg-yellow-500 text-white px-6 h-10 rounded-full hover:bg-amber-500 w-full md:w-[50%] md:ml-4"
            >
              <strong>{showAgentProfile ? 'Hide Agent Profile' : '👨🏻‍💼 View Agent Profile'}</strong>
            </button>

            {showAgentProfile && (
              <div className="fixed mt-20 inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md text-center">
                  <button
                    onClick={() => setShowAgentProfile(false)}
                    className="absolute top-3 right-4 text-2xl hover:text-red-500"
                  >
                    &times;
                  </button>
                  <div className="text-5xl mb-3">👨🏻‍💼</div>
                  <p className="text-xl font-bold">{agentName}</p>
                  <p className="text-gray-500 text-sm mt-1">Agent ID: {agentId}</p>
                  <p className="text-gray-400 text-sm mt-2">[AgentProfileCard — stub for dummy mode]</p>
                </div>
              </div>
            )}

            {isChatOpen && <StubChat agentName={agentName} onClose={() => setIsChatOpen(false)} />}
          </div>
        </div>

        {/* Suggested Properties */}
        <div className="container mx-auto p-6">
          <h2 className="text-2xl font-bold mb-4">Explore More Properties</h2>
          <div className="overflow-x-auto">
            <div className="flex gap-6 pb-4 min-w-max">
              {DUMMY_SUGGESTED.map(prop => (
                <div key={prop.propertyId} className="flex-shrink-0">
                  <SuggestedCard property={prop} user={user} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Modals ── */}

        {/* Revise modal */}
        {isReviseOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-[500px] flex flex-col gap-4 items-center">
              <p className="text-lg font-semibold">Select an action:</p>
              <button
                className="w-full h-10 bg-green-500 text-white rounded-full hover:bg-green-600"
                onClick={() => { setIsReviseOpen(false); setIsUpdateOpen(true); }}
              >
                <strong>Update Property</strong>
              </button>
              <button
                className="w-full h-10 bg-red-500 text-white rounded-xl hover:bg-red-600"
                onClick={() => { setIsReviseOpen(false); setConfirmDelete(true); }}
              >
                <strong>Remove</strong>
              </button>
              <button className="text-sm text-gray-500 hover:underline" onClick={() => setIsReviseOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Confirm delete */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg text-center max-w-sm w-full">
              <p className="text-lg mb-4">Are you sure you want to remove this property?</p>
              <div className="flex justify-around">
                <button
                  onClick={() => { setConfirmDelete(false); alert('Property removed — stub'); }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Yes, Remove
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update modal stub */}
        {isUpdateOpen && (
          <StubModal title="PropertyUpdateModal — stub for dummy mode" onClose={() => setIsUpdateOpen(false)} />
        )}

        {/* Listing assignment stubs */}
        {isAssignOpen && (
          <StubModal title="ListingAssignment (Agent) — stub for dummy mode" onClose={() => setIsAssignOpen(false)} />
        )}
        {isAssign2Open && (
          <StubModal title="ListingAssignment2 (Holder) — stub for dummy mode" onClose={() => setIsAssign2Open(false)} />
        )}
      </div>
    </div>
  );
};

export default PropertyPage;