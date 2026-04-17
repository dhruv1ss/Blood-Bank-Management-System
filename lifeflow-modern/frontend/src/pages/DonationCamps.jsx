/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Clock, Users, Search, Filter, ChevronRight, Heart, Building2, Phone } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../lib/api';
import AppointmentBooking from '../components/AppointmentBooking.jsx';

// Fix for default marker icon issue - using SVG to avoid external asset dependency
const defaultIconSvg = `<svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 0C5.596 0 0 5.596 0 12.5C0 21.875 12.5 41 12.5 41C12.5 41 25 21.875 25 12.5C25 5.596 19.404 0 12.5 0ZM12.5 17C10.015 17 8 14.985 8 12.5C8 10.015 10.015 8 12.5 8C14.985 8 17 10.015 17 12.5C17 14.985 14.985 17 12.5 17Z" fill="#2563eb" stroke="white" stroke-width="1"/></svg>`;
const defaultIconUrl = `data:image/svg+xml;base64,${btoa(defaultIconSvg)}`;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: defaultIconUrl,
    iconUrl: defaultIconUrl,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom red marker icon using SVG
const redIconSvg = `<svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 0C5.596 0 0 5.596 0 12.5C0 21.875 12.5 41 12.5 41C12.5 41 25 21.875 25 12.5C25 5.596 19.404 0 12.5 0ZM12.5 17C10.015 17 8 14.985 8 12.5C8 10.015 10.015 8 12.5 8C14.985 8 17 10.015 17 12.5C17 14.985 14.985 17 12.5 17Z" fill="#ef4444" stroke="white" stroke-width="1"/></svg>`;
const redIconUrl = `data:image/svg+xml;base64,${btoa(redIconSvg)}`;

const redIcon = new L.Icon({
    iconUrl: redIconUrl,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Gujarat-only donation camp data
const cities = ['All Cities', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Patan'];

// Component to fly to selected marker
const MapFlyTo = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 13, { duration: 1.5 });
        }
    }, [position, map]);
    return null;
};

// Component to fix map sizing issues (gray areas)
const ResizeMap = () => {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
};

const CampCard = ({ camp, isSelected, onClick }) => {
    const fillPercent = Math.round((camp.filled / camp.slots) * 100);
    const spotsLeft = camp.slots - camp.filled;
    const dateObj = new Date(camp.date);
    const formattedDate = (camp.date && !isNaN(dateObj.getTime())) 
        ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'TBA';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={onClick}
            className={`cursor-pointer rounded-2xl border p-5 transition-all hover:shadow-lg ${
                isSelected
                    ? 'bg-red-600 text-white border-red-600 shadow-xl shadow-red-500/30'
                    : 'bg-white border-gray-100 hover:border-red-200'
            }`}
        >
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-gray-900'}`}>{camp.name}</h3>
                    <p className={`text-xs mt-0.5 flex items-center gap-1 ${isSelected ? 'text-red-100' : 'text-gray-500'}`}>
                        <Building2 className="w-3 h-3" /> {camp.hospital}
                    </p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600'}`}>
                    {spotsLeft} left
                </span>
            </div>

            <div className={`flex items-center gap-3 text-xs mb-3 ${isSelected ? 'text-red-100' : 'text-gray-500'}`}>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formattedDate}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{camp.time.split('–')[0].trim()}</span>
            </div>

            <div className="mb-3">
                <div className={`w-full rounded-full h-1.5 ${isSelected ? 'bg-white/20' : 'bg-gray-100'}`}>
                    <div
                        className={`h-1.5 rounded-full transition-all ${isSelected ? 'bg-white' : 'bg-red-500'}`}
                        style={{ width: `${fillPercent}%` }}
                    />
                </div>
                <p className={`text-[10px] mt-1 ${isSelected ? 'text-red-100' : 'text-gray-400'}`}>{fillPercent}% filled ({camp.filled}/{camp.slots} slots)</p>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex gap-1 flex-wrap">
                    {camp.bloodGroups.slice(0, 3).map(bg => (
                        <span key={bg} className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-red-50 text-red-700'}`}>
                            {bg}
                        </span>
                    ))}
                    {camp.bloodGroups.length > 3 && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            +{camp.bloodGroups.length - 3}
                        </span>
                    )}
                </div>
                <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-300'}`} />
            </div>
        </motion.div>
    );
};

const DonationCamps = () => {
    const navigate = useNavigate();
    const [selectedCamp, setSelectedCamp] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState('All Cities');
    const [selectedBloodGroup, setSelectedBloodGroup] = useState('All Types');
    const [selectedDate, setSelectedDate] = useState('All Dates');
    const [availabilityFilter, setAvailabilityFilter] = useState('All');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [dynamicCamps, setDynamicCamps] = useState([]);
    const [showBooking, setShowBooking] = useState(false);
    
    // Default map center (Gujarat)
    const mapCenter = [22.2587, 71.1924];

    const bloodGroups = ['All Types', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const dateFilters = ['All Dates', 'Today', 'This Week', 'This Month', 'Next Month'];
    const availabilityFilters = ['All', 'Available (>50%)', 'Limited (<50%)', 'Almost Full (<10%)'];

    useEffect(() => {
        const fetchCamps = async () => {
            try {
                const res = await api.get('/public/camps');
                const data = res.data;
                
                if (data.status === 'success') {
                    // Map backend data to frontend expected format
                    const mappedCamps = data.camps.map(c => ({
                        id: `api_${c.id}`,
                        name: c.name,
                        hospital: c.organization?.orgName || c.organization?.name || 'Local Organizer',
                        date: new Date(c.date).toISOString().split('T')[0],
                        time: `${c.startTime} – ${c.endTime}`,
                        address: c.address,
                        city: c.city,
                        lat: parseFloat(c.lat) || 23.0225, // Default coords if missing
                        lng: parseFloat(c.lng) || 72.5714,
                        slots: c.totalSlots || 100,
                        filled: 0, // dynamic camps start at 0 filled
                        bloodGroups: c.bloodGroupsNeeded ? c.bloodGroupsNeeded.split(',').map(s => s.trim()) : ['Any'],
                        contact: c.contactPhone || 'N/A',
                        description: c.description || 'Join our blood donation camp to save lives in your community.'
                    }));
                    setDynamicCamps(mappedCamps);
                }
            } catch (error) {
                console.error("Failed to fetch public camps", error);
            }
        };
        fetchCamps();
    }, []);

    const allCamps = dynamicCamps;

    // Filter out logically expired camps (past date, or today but past end time)
    const activeCampsList = allCamps.filter(camp => {
        if (!camp.date) return true;
        
        const now = new Date();
        const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        
        let endTime24h = "23:59";
        
        if (camp.time) {
            // Static camps use format like "9:00 AM – 5:00 PM"
            // Dynamic camps use "09:00 – 17:00"
            const parts = camp.time.split('–');
            const endStr = parts.length > 1 ? parts[1].trim() : parts[0].trim();
            
            const ampmMatch = endStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (ampmMatch) {
                let h = parseInt(ampmMatch[1], 10);
                const m = ampmMatch[2];
                const ampm = ampmMatch[3].toUpperCase();
                if (ampm === 'PM' && h < 12) h += 12;
                if (ampm === 'AM' && h === 12) h = 0;
                endTime24h = `${h.toString().padStart(2, '0')}:${m}`;
            } else {
                const hourMatch = endStr.match(/(\d{1,2}):(\d{2})/);
                if (hourMatch) {
                    endTime24h = `${hourMatch[1].padStart(2, '0')}:${hourMatch[2]}`;
                }
            }
        }
        
        const currentTimeStr = now.toTimeString().slice(0, 5); // "HH:MM"
        
        if (camp.date > todayStr) return true;
        if (camp.date === todayStr) {
            return endTime24h >= currentTimeStr;
        }
        return false;
    });

    const filteredCamps = activeCampsList.filter(c => {
        const matchCity = selectedCity === 'All Cities' || c.city === selectedCity;
        const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           c.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           c.city.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Blood group filter
        const matchBloodGroup = selectedBloodGroup === 'All Types' || 
                               c.bloodGroups.includes(selectedBloodGroup) ||
                               c.bloodGroups.includes('Any');
        
        // Date filter
        let matchDate = true;
        if (selectedDate !== 'All Dates') {
            const campDate = new Date(c.date);
            const today = new Date();
            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
            const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
            const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);
            
            switch (selectedDate) {
                case 'Today':
                    matchDate = campDate.toDateString() === today.toDateString();
                    break;
                case 'This Week':
                    matchDate = campDate >= today && campDate <= weekFromNow;
                    break;
                case 'This Month':
                    matchDate = campDate >= today && campDate <= monthFromNow;
                    break;
                case 'Next Month':
                    matchDate = campDate >= nextMonthStart && campDate <= nextMonthEnd;
                    break;
            }
        }
        
        // Availability filter
        let matchAvailability = true;
        if (availabilityFilter !== 'All') {
            const fillPercent = (c.filled / c.slots) * 100;
            switch (availabilityFilter) {
                case 'Available (>50%)':
                    matchAvailability = fillPercent <= 50;
                    break;
                case 'Limited (<50%)':
                    matchAvailability = fillPercent > 50 && fillPercent <= 90;
                    break;
                case 'Almost Full (<10%)':
                    matchAvailability = fillPercent > 90;
                    break;
            }
        }
        
        return matchCity && matchSearch && matchBloodGroup && matchDate && matchAvailability;
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-[calc(100vh-80px)] flex flex-col"
        >
            {/* Page Header */}
            <div className="bg-gradient-to-r from-gray-900 via-red-950 to-gray-900 text-white py-12 px-6">
                <div className="container mx-auto max-w-6xl">
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                        <div className="flex flex-wrap items-center justify-between gap-8 mb-16 relative">
                            <div className="max-w-2xl">
                                <h1 className="text-5xl font-black text-white brand-font mb-4">Donation Camps <span className="text-[var(--accent)]">.</span></h1>
                                <p className="text-[var(--text-muted)] text-xl font-medium">Find a verified donation camp near you and schedule your contribution.</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Search & Filter Bar */}
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                        className="mt-8 space-y-4"
                    >
                        {/* Main Search and City Filter */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-grow">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search by name, hospital, or city..."
                                    className="w-full bg-white/10 border border-white/10 text-white placeholder-gray-500 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 transition-all"
                                />
                            </div>
                            <div className="relative">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    value={selectedCity}
                                    onChange={e => setSelectedCity(e.target.value)}
                                    className="bg-white/10 border border-white/10 text-white rounded-xl pl-12 pr-8 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-500/40 appearance-none cursor-pointer"
                                >
                                    {cities.map(c => <option key={c} value={c} className="bg-gray-900 text-white">{c}</option>)}
                                </select>
                            </div>
                            <button
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className={`flex items-center gap-2 px-4 py-3.5 rounded-xl font-medium transition-all ${
                                    showAdvancedFilters 
                                        ? 'bg-red-600 text-white' 
                                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                            >
                                <Filter className="w-4 h-4" />
                                Advanced
                            </button>
                        </div>

                        {/* Advanced Filters */}
                        <AnimatePresence>
                            {showAdvancedFilters && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Blood Group</label>
                                        <select
                                            value={selectedBloodGroup}
                                            onChange={e => setSelectedBloodGroup(e.target.value)}
                                            className="w-full bg-white/10 border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/40 appearance-none cursor-pointer"
                                        >
                                            {bloodGroups.map(bg => <option key={bg} value={bg} className="bg-gray-900 text-white">{bg}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                                        <select
                                            value={selectedDate}
                                            onChange={e => setSelectedDate(e.target.value)}
                                            className="w-full bg-white/10 border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/40 appearance-none cursor-pointer"
                                        >
                                            {dateFilters.map(df => <option key={df} value={df} className="bg-gray-900 text-white">{df}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Availability</label>
                                        <select
                                            value={availabilityFilter}
                                            onChange={e => setAvailabilityFilter(e.target.value)}
                                            className="w-full bg-white/10 border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/40 appearance-none cursor-pointer"
                                        >
                                            {availabilityFilters.map(af => <option key={af} value={af} className="bg-gray-900 text-white">{af}</option>)}
                                        </select>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Active Filters Display */}
                        {(selectedCity !== 'All Cities' || selectedBloodGroup !== 'All Types' || selectedDate !== 'All Dates' || availabilityFilter !== 'All' || searchQuery) && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-wrap gap-2"
                            >
                                <span className="text-xs text-gray-400">Active filters:</span>
                                {searchQuery && (
                                    <span className="bg-red-600/20 text-red-300 px-2 py-1 rounded-md text-xs flex items-center gap-1">
                                        Search: "{searchQuery}"
                                        <button onClick={() => setSearchQuery('')} className="hover:text-white">×</button>
                                    </span>
                                )}
                                {selectedCity !== 'All Cities' && (
                                    <span className="bg-red-600/20 text-red-300 px-2 py-1 rounded-md text-xs flex items-center gap-1">
                                        City: {selectedCity}
                                        <button onClick={() => setSelectedCity('All Cities')} className="hover:text-white">×</button>
                                    </span>
                                )}
                                {selectedBloodGroup !== 'All Types' && (
                                    <span className="bg-red-600/20 text-red-300 px-2 py-1 rounded-md text-xs flex items-center gap-1">
                                        Blood: {selectedBloodGroup}
                                        <button onClick={() => setSelectedBloodGroup('All Types')} className="hover:text-white">×</button>
                                    </span>
                                )}
                                {selectedDate !== 'All Dates' && (
                                    <span className="bg-red-600/20 text-red-300 px-2 py-1 rounded-md text-xs flex items-center gap-1">
                                        Date: {selectedDate}
                                        <button onClick={() => setSelectedDate('All Dates')} className="hover:text-white">×</button>
                                    </span>
                                )}
                                {availabilityFilter !== 'All' && (
                                    <span className="bg-red-600/20 text-red-300 px-2 py-1 rounded-md text-xs flex items-center gap-1">
                                        {availabilityFilter}
                                        <button onClick={() => setAvailabilityFilter('All')} className="hover:text-white">×</button>
                                    </span>
                                )}
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedCity('All Cities');
                                        setSelectedBloodGroup('All Types');
                                        setSelectedDate('All Dates');
                                        setAvailabilityFilter('All');
                                    }}
                                    className="text-xs text-gray-400 hover:text-white underline"
                                >
                                    Clear all
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-white/80 text-sm font-medium">
                        {filteredCamps.length} camps found based on your search
                    </motion.div>
                </div>
            </div>

            {/* Main Content: Map + Cards */}
            <div className="flex-grow flex flex-col lg:flex-row bg-gray-50">
                {/* Camp List (Left Sidebar) */}
                <div className="w-full lg:w-96 xl:w-[420px] flex flex-col border-r border-gray-100 bg-white shadow-sm shrink-0">
                    <div className="flex-grow overflow-y-auto p-4 space-y-3">
                        <AnimatePresence>
                            {filteredCamps.length === 0 ? (
                                <div className="text-center py-20 text-gray-400">
                                    <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                    <p className="font-medium">No camps found</p>
                                    <p className="text-sm mt-1">Try adjusting your search or filter</p>
                                </div>
                            ) : (
                                filteredCamps.map(camp => (
                                    <CampCard
                                        key={camp.id}
                                        camp={camp}
                                        isSelected={selectedCamp?.id === camp.id}
                                        onClick={() => setSelectedCamp(selectedCamp?.id === camp.id ? null : camp)}
                                    />
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Map (Right Side) */}
                <div className="flex-grow relative min-h-[400px] lg:min-h-0">
                    <MapContainer
                        center={mapCenter}
                        zoom={7}
                        className="w-full h-full min-h-[400px] lg:min-h-0"
                        style={{ height: '100%', minHeight: '400px' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.google.com/intl/en_US/help/terms_maps.html">Google Maps</a>'
                            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                        />
                        <ResizeMap />
                        
                        {selectedCamp && <MapFlyTo position={[selectedCamp.lat, selectedCamp.lng]} />}
                        
                        {filteredCamps.map(camp => (
                            <Marker
                                key={camp.id}
                                position={[camp.lat, camp.lng]}
                                icon={redIcon}
                                eventHandlers={{ click: () => setSelectedCamp(camp) }}
                            >
                                <Popup>
                                    <div className="min-w-[200px]">
                                        <h3 className="font-bold text-gray-900 text-sm mb-1">{camp.name}</h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mb-2"><Building2 className="w-3 h-3" /> {camp.hospital}</p>
                                        {camp.autoGeocoded && (
                                            <p className="text-xs text-green-600 flex items-center gap-1 mb-2">
                                                <MapPin className="w-3 h-3" /> Auto-located in {camp.city}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-600 flex items-center gap-1 mb-1"><Calendar className="w-3 h-3 text-red-500" /> {(() => {
                                            const d = new Date(camp.date);
                                            return (camp.date && !isNaN(d.getTime())) ? d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Date TBA';
                                        })()}</p>
                                        <p className="text-xs text-gray-600 flex items-center gap-1 mb-1"><Clock className="w-3 h-3 text-red-500" /> {camp.time}</p>
                                        <p className="text-xs text-gray-600 flex items-center gap-1 mb-2"><MapPin className="w-3 h-3 text-red-500" /> {camp.address}</p>
                                        <p className="text-xs text-gray-600 flex items-center gap-1 mb-3"><Phone className="w-3 h-3 text-red-500" /> {camp.contact}</p>
                                        <div className="flex gap-1 flex-wrap mb-3">
                                            {camp.bloodGroups.map(bg => (
                                                <span key={bg} className="text-[10px] font-black px-2 py-0.5 rounded-md bg-red-50 text-red-700">{bg}</span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Users className="w-3 h-3" />
                                            <span>{camp.slots - camp.filled} slots available</span>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>

                    {/* Selected Camp Detail Overlay */}
                    <AnimatePresence>
                        {selectedCamp && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 p-5 z-[1000] right-0 left-auto"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-black text-gray-900 text-lg brand-font">{selectedCamp.name}</h3>
                                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5 text-red-500" /> {selectedCamp.address}</p>
                                    </div>
                                    <button onClick={() => setSelectedCamp(null)} className="text-gray-300 hover:text-gray-600 transition-colors text-lg leading-none ml-4">✕</button>
                                </div>
                                <p className="text-sm text-gray-500 mt-3 leading-relaxed">{selectedCamp.description}</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <a href={`tel:${selectedCamp.contact}`} className="flex-1 text-center text-sm font-bold py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                        <Phone className="w-4 h-4" /> Call
                                    </a>
                                    <button 
                                        onClick={() => {
                                            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                                            if (!token) {
                                                alert('Please log in to book an appointment');
                                                navigate('/login');
                                                return;
                                            }
                                            const rawId = String(selectedCamp.id).replace('api_', '');
                                            navigate(`/dashboard?section=donate&campId=${rawId}`);
                                        }}
                                        className="flex-1 bg-red-600 hover:bg-red-700 transition-colors text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2">
                                        <Heart className="w-4 h-4" /> Book Appointment
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Appointment Booking Modal */}
            <AnimatePresence>
                {showBooking && selectedCamp && (
                    <AppointmentBooking
                        camp={selectedCamp}
                        onClose={() => setShowBooking(false)}
                        onSuccess={() => {
                            // Refresh camps or show success message
                            setSelectedCamp(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default DonationCamps;
