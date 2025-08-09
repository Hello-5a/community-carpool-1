import React, { useState, useEffect } from 'react';
import { Car, Users, MapPin, User, Bell, Plus, Calendar } from 'lucide-react';

const CarpoolWebsite = () => {
  const [vehicles, setVehicles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [formData, setFormData] = useState({
    ownerName: '',
    ownerFlat: '',
    vehicleName: '',
    destination: '',
    availableSeats: 1,
    departureTime: '',
    contactInfo: ''
  });
  const [applicationData, setApplicationData] = useState({
    applicantName: '',
    applicantFlat: '',
    contactInfo: '',
    message: ''
  });

  // Load data from memory on component mount
  useEffect(() => {
    const savedVehicles = vehicles; // In-memory storage
    const savedNotifications = notifications;
  }, []);

  const handleVehicleRegistration = (e) => {
    e.preventDefault();
    
    const newVehicle = {
      id: Date.now(),
      ...formData,
      applicants: [],
      registeredAt: new Date().toLocaleDateString()
    };

    setVehicles(prev => [...prev, newVehicle]);
    
    // Reset form
    setFormData({
      ownerName: '',
      ownerFlat: '',
      vehicleName: '',
      destination: '',
      availableSeats: 1,
      departureTime: '',
      contactInfo: ''
    });

    // Show success message
    alert('Vehicle registered successfully!');
    setActiveTab('browse');
  };

  const handleSeatApplication = (vehicleId, e) => {
    e.preventDefault();
    
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    const newApplicant = {
      id: Date.now(),
      ...applicationData,
      appliedAt: new Date().toLocaleString()
    };

    // Update vehicle with new applicant
    setVehicles(prev => prev.map(v => 
      v.id === vehicleId 
        ? { ...v, applicants: [...v.applicants, newApplicant] }
        : v
    ));

    // Create notification for vehicle owner
    const newNotification = {
      id: Date.now(),
      vehicleId: vehicleId,
      vehicleName: vehicle.vehicleName,
      destination: vehicle.destination,
      ownerName: vehicle.ownerName,
      applicantName: applicationData.applicantName,
      applicantFlat: applicationData.applicantFlat,
      applicantContact: applicationData.contactInfo,
      message: applicationData.message,
      timestamp: new Date().toLocaleString(),
      read: false
    };

    setNotifications(prev => [...prev, newNotification]);

    // Reset application form
    setApplicationData({
      applicantName: '',
      applicantFlat: '',
      contactInfo: '',
      message: ''
    });

    alert('Seat application submitted successfully! The vehicle owner will be notified.');
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const getAvailableSeats = (vehicle) => {
    return vehicle.availableSeats - vehicle.applicants.length;
  };

  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
        active 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <Icon size={20} />
      {label}
      {id === 'notifications' && notifications.filter(n => !n.read).length > 0 && (
        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-1">
          {notifications.filter(n => !n.read).length}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Car className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">Community Carpool</h1>
          </div>
          <p className="text-xl text-gray-600">Share rides, save money, build community</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <TabButton 
            id="browse" 
            label="Browse Rides" 
            icon={Car} 
            active={activeTab === 'browse'} 
            onClick={setActiveTab} 
          />
          <TabButton 
            id="register" 
            label="Register Vehicle" 
            icon={Plus} 
            active={activeTab === 'register'} 
            onClick={setActiveTab} 
          />
          <TabButton 
            id="notifications" 
            label="Notifications" 
            icon={Bell} 
            active={activeTab === 'notifications'} 
            onClick={setActiveTab} 
          />
        </div>

        {/* Browse Rides Tab */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Rides</h2>
            
            {vehicles.length === 0 ? (
              <div className="text-center py-12">
                <Car className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No rides available yet</h3>
                <p className="text-gray-500">Be the first to register a vehicle and offer a ride!</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {vehicles.map(vehicle => (
                  <div key={vehicle.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{vehicle.vehicleName}</h3>
                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                          <MapPin size={16} />
                          <span>{vehicle.destination}</span>
                        </div>
                      </div>
                      <div className="bg-blue-100 px-3 py-1 rounded-full">
                        <div className="flex items-center gap-1 text-blue-700">
                          <Users size={14} />
                          <span className="text-sm font-medium">{getAvailableSeats(vehicle)} left</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User size={16} />
                        <span className="text-sm">{vehicle.ownerName} (Flat {vehicle.ownerFlat})</span>
                      </div>
                      {vehicle.departureTime && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} />
                          <span className="text-sm">{vehicle.departureTime}</span>
                        </div>
                      )}
                      <div className="text-sm text-gray-500">Contact: {vehicle.contactInfo}</div>
                    </div>

                    {getAvailableSeats(vehicle) > 0 ? (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-800 mb-3">Apply for a seat</h4>
                        <form onSubmit={(e) => handleSeatApplication(vehicle.id, e)} className="space-y-3">
                          <input
                            type="text"
                            placeholder="Your full name"
                            value={applicationData.applicantName}
                            onChange={(e) => setApplicationData(prev => ({...prev, applicantName: e.target.value}))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Your flat number"
                            value={applicationData.applicantFlat}
                            onChange={(e) => setApplicationData(prev => ({...prev, applicantFlat: e.target.value}))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Your contact info"
                            value={applicationData.contactInfo}
                            onChange={(e) => setApplicationData(prev => ({...prev, contactInfo: e.target.value}))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                          <textarea
                            placeholder="Optional message"
                            value={applicationData.message}
                            onChange={(e) => setApplicationData(prev => ({...prev, message: e.target.value}))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows="2"
                          />
                          <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            Apply for Seat
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="border-t pt-4 text-center">
                        <span className="text-red-600 font-medium">No seats available</span>
                      </div>
                    )}

                    {vehicle.applicants.length > 0 && (
                      <div className="border-t mt-4 pt-4">
                        <h5 className="font-medium text-gray-700 mb-2">Applied passengers:</h5>
                        <div className="space-y-1">
                          {vehicle.applicants.map(applicant => (
                            <div key={applicant.id} className="text-sm text-gray-600">
                              {applicant.applicantName} (Flat {applicant.applicantFlat})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Register Vehicle Tab */}
        {activeTab === 'register' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Register Your Vehicle</h2>
            
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <form onSubmit={handleVehicleRegistration} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                    <input
                      type="text"
                      value={formData.ownerName}
                      onChange={(e) => setFormData(prev => ({...prev, ownerName: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Flat Number</label>
                    <input
                      type="text"
                      value={formData.ownerFlat}
                      onChange={(e) => setFormData(prev => ({...prev, ownerFlat: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Name/Model</label>
                  <input
                    type="text"
                    value={formData.vehicleName}
                    onChange={(e) => setFormData(prev => ({...prev, vehicleName: e.target.value}))}
                    placeholder="e.g., Toyota Camry, Honda Civic"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData(prev => ({...prev, destination: e.target.value}))}
                    placeholder="e.g., Downtown Office Complex, Central Mall"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Seats</label>
                    <select
                      value={formData.availableSeats}
                      onChange={(e) => setFormData(prev => ({...prev, availableSeats: parseInt(e.target.value)}))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {[1,2,3,4,5,6,7].map(num => (
                        <option key={num} value={num}>{num} seat{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Departure Time (Optional)</label>
                    <input
                      type="text"
                      value={formData.departureTime}
                      onChange={(e) => setFormData(prev => ({...prev, departureTime: e.target.value}))}
                      placeholder="e.g., 8:00 AM daily"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Information</label>
                  <input
                    type="text"
                    value={formData.contactInfo}
                    onChange={(e) => setFormData(prev => ({...prev, contactInfo: e.target.value}))}
                    placeholder="Phone number or preferred contact method"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium text-lg"
                >
                  Register Vehicle
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Seat Applications</h2>
            
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No notifications yet</h3>
                <p className="text-gray-500">When someone applies for a seat in your vehicle, you'll see it here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
                      notification.read ? 'border-gray-300' : 'border-blue-500'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800 mb-2">
                          New Seat Application 
                          {!notification.read && <span className="text-blue-600"> (New)</span>}
                        </h3>
                        <div className="space-y-2 text-gray-600">
                          <p><strong>Applicant:</strong> {notification.applicantName} (Flat {notification.applicantFlat})</p>
                          <p><strong>Contact:</strong> {notification.applicantContact}</p>
                          <p><strong>For Vehicle:</strong> {notification.vehicleName} → {notification.destination}</p>
                          {notification.message && (
                            <p><strong>Message:</strong> "{notification.message}"</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-2">{notification.timestamp}</div>
                        {!notification.read && (
                          <button
                            onClick={() => markNotificationAsRead(notification.id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                          >
                            Mark as Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CarpoolWebsite;
