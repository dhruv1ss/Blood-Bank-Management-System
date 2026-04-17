import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Calendar, Clock, X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../lib/api';

class BookingErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, errorInfo) { console.error('Booking Render Error:', error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <h2 className="text-red-600 font-bold mb-2">Rendering Error Crashed the Modal</h2>
                        <p className="text-sm text-gray-700 font-mono bg-gray-100 p-2 rounded">{this.state.error?.toString()}</p>
                        <button onClick={this.props.onClose} className="mt-4 bg-gray-900 text-white px-4 py-2 rounded">Close Window</button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

const AppointmentBooking = ({ camp, onClose, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: Select Date, 2: Select Time, 3: Confirm
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const fetchAvailableSlots = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching slots for camp:', camp);
            
            if (!camp || !camp.id) {
                throw new Error('Invalid camp data');
            }
            
            const response = await api.get(`/appointments/camps/${camp.id}/slots`);
            console.log('Slots response:', response.data);
            
            if (response.data.status === 'success') {
                setAvailableSlots(response.data.data);
            } else {
                throw new Error(response.data.message || 'Failed to fetch slots');
            }
        } catch (err) {
            console.error('Fetch slots error:', err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch available slots');
        } finally {
            setLoading(false);
        }
    }, [camp]);

    useEffect(() => {
        if (step === 2 && selectedDate) {
            fetchAvailableSlots();
        }
    }, [step, selectedDate, fetchAvailableSlots]);

    const handleBookAppointment = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Please log in to book an appointment');
            }
            
            console.log('Booking appointment:', { campId: camp.id, timeSlot: selectedTime });
            
            const response = await api.post(
                '/appointments/book',
                {
                    campId: camp.id,
                    timeSlot: selectedTime,
                    bloodGroup: localStorage.getItem('userBloodGroup'),
                    age: localStorage.getItem('userAge')
                }
            );

            console.log('Booking response:', response.data);

            if (response.data.status === 'success') {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess?.();
                    onClose();
                }, 2000);
            } else {
                throw new Error(response.data.message || 'Booking failed');
            }
        } catch (err) {
            console.error('Booking error:', err);
            setError(err.response?.data?.message || err.message || 'Failed to book appointment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <BookingErrorBoundary onClose={onClose}>
            <motion.div
                initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-gray-900">Request Donation Slot</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Camp Info */}
                <div className="bg-red-50 rounded-xl p-4 mb-4">
                    <p className="text-sm font-bold text-gray-900">{camp?.name || 'Unknown Camp'}</p>
                    <p className="text-xs text-gray-600 mt-1">{camp?.address || 'No address'}</p>
                    {!camp?.id && (
                        <p className="text-xs text-red-600 mt-1">⚠️ Invalid camp data</p>
                    )}
                </div>

                {/* Admin Approval Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                    <div className="flex gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">Admin Approval Required</p>
                            <p className="text-xs text-blue-700 mt-1">
                                Your donation request will be reviewed by our admin team. You'll receive a notification once approved.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Success State */}
                {success && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-center py-8"
                    >
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Request Submitted!</h3>
                        <p className="text-sm text-gray-600">Your donation request has been sent for admin approval. You'll be notified once approved.</p>
                    </motion.div>
                )}

                {/* Error State */}
                {error && !success && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {!success && (
                    <>
                        {/* Step 1: Select Date */}
                        {step === 1 && (
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-3">Select Date</label>
                                <div className="space-y-2 mb-6">
                                    {[0, 1, 2, 3, 4].map(i => {
                                        const d = new Date(camp.date);
                                        const isValid = camp.date && !isNaN(d.getTime());
                                        if (isValid) d.setDate(d.getDate() + i);
                                        
                                        const dateStr = isValid ? d.toISOString().split('T')[0] : `pending-${i}`;
                                        const isSelected = selectedDate === dateStr;

                                        return (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedDate(dateStr)}
                                                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                                                    isSelected
                                                        ? 'border-red-500 bg-red-50'
                                                        : 'border-gray-200 hover:border-red-200'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="font-medium text-gray-900">
                                                        {isValid ? d.toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        }) : 'Date TBA'}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!selectedDate}
                                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg transition-colors"
                                >
                                    Continue
                                </button>
                            </div>
                        )}

                        {/* Step 2: Select Time */}
                        {step === 2 && (
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-3">Select Time Slot</label>
                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin">
                                            <Clock className="w-6 h-6 text-red-600" />
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2">Loading available slots...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 gap-2 mb-6 max-h-64 overflow-y-auto">
                                            {availableSlots.map(slot => (
                                                <button
                                                    key={slot.time}
                                                    onClick={() => setSelectedTime(slot.time)}
                                                    disabled={!slot.available}
                                                    className={`p-2 rounded-lg border-2 transition-all text-sm font-medium ${
                                                        selectedTime === slot.time
                                                            ? 'border-red-500 bg-red-50 text-red-700'
                                                            : slot.available
                                                            ? 'border-gray-200 text-gray-700 hover:border-red-200'
                                                            : 'border-gray-100 text-gray-400 bg-gray-50 cursor-not-allowed'
                                                    }`}
                                                >
                                                    {slot.time}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setStep(1)}
                                                className="flex-1 border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={() => setStep(3)}
                                                disabled={!selectedTime}
                                                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg transition-colors"
                                            >
                                                Continue
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Step 3: Confirm */}
                        {step === 3 && (
                            <div>
                                <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-600 font-medium">CAMP</p>
                                        <p className="text-sm font-bold text-gray-900">{camp.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 font-medium">DATE</p>
                                        <p className="text-sm font-bold text-gray-900">
                                            {(() => {
                                                const d = new Date(selectedDate);
                                                return (selectedDate && !isNaN(d.getTime())) ? d.toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : 'TBA';
                                            })()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 font-medium">TIME SLOT</p>
                                        <p className="text-sm font-bold text-gray-900">{selectedTime}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="flex-1 border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleBookAppointment}
                                        disabled={loading}
                                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg transition-colors"
                                    >
                                        {loading ? 'Submitting...' : 'Submit Request'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </motion.div>
        </motion.div>
        </BookingErrorBoundary>
    );
};

export default AppointmentBooking;
