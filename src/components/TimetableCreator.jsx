import React, { useState } from 'react';
import { PlusCircle, Trash2, Calendar, Clock, User, BookOpen } from 'lucide-react';

const TimetableCreator = () => {
  const [formData, setFormData] = useState({
    subject: '',
    teacher: '',
    classSection: '',
    day: 'Monday',
    startTime: '09:00',
    duration: '60',
    room: ''
  });

  const [entries, setEntries] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addEntry = (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.teacher) return;
    
    setEntries([...entries, { ...formData, id: Date.now() }]);
    // Reset subject/teacher but keep day/class for faster data entry
    setFormData(prev => ({ ...prev, subject: '', teacher: '', room: '' }));
  };

  const removeEntry = (id) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-gray-50 min-h-screen font-sans">
      
      {/* LEFT: Input Form Panel */}
      <div className="w-full lg:w-1/3 bg-white p-6 rounded-xl shadow-md border border-gray-200 h-fit sticky top-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <PlusCircle className="text-indigo-600" /> Define Period
        </h2>
        
        <form onSubmit={addEntry} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Subject Name</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input 
                name="subject" value={formData.subject} onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Mathematics" required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Teacher</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input 
                  name="teacher" value={formData.teacher} onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Mr. Smith" required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Class/Section</label>
              <input 
                name="classSection" value={formData.classSection} onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="10-A" required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Day</label>
              <select 
                name="day" value={formData.day} onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Start Time</label>
              <input 
                type="time" name="startTime" value={formData.startTime} onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-indigo-200 mt-4"
          >
            Add to Draft Schedule
          </button>
        </form>
      </div>

      {/* RIGHT: Live Data List */}
      <div className="flex-1">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gray-800 p-4 flex justify-between items-center text-white">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Current Configuration ({entries.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {entries.length === 0 ? (
              <div className="p-12 text-center text-gray-400 italic">
                No periods added yet. Use the form to start building.
              </div>
            ) : (
              entries.map((item) => (
                <div key={item.id} className="p-4 hover:bg-indigo-50 transition-colors flex items-center justify-between group">
                  <div className="flex gap-4 items-center">
                    <div className="bg-indigo-100 text-indigo-700 font-bold p-3 rounded-lg w-16 text-center text-xs uppercase">
                      {item.day.substring(0, 3)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{item.subject} <span className="text-gray-400 text-sm font-normal">({item.classSection})</span></h4>
                      <div className="flex gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.startTime}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {item.teacher}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeEntry(item.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {entries.length > 0 && (
          <div className="mt-4 flex justify-end">
            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-full font-bold shadow-md">
              Generate Final Timetable
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimetableCreator;