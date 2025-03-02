import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import {
  FaCalendarPlus,
  FaClock,
  FaTrash,
  FaCheckCircle,
} from "react-icons/fa";

const EventScheduler = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  // ✅ Fetch Scheduled Events
  const fetchEvents = async () => {
    try {
      const q = query(collection(db, "events"), orderBy("date", "asc"));
      const querySnapshot = await getDocs(q);
      setEvents(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setLoading(false);
    }
  };

  // ✅ Schedule a New Event
  const scheduleEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.date || !newEvent.time) return;
    try {
      await addDoc(collection(db, "events"), {
        ...newEvent,
        createdAt: serverTimestamp(),
        createdBy: user.displayName || "Anonymous",
      });
      setNewEvent({ title: "", description: "", date: "", time: "" });
      fetchEvents();
    } catch (error) {
      console.error("Error scheduling event:", error);
    }
  };

  // ✅ Delete an Event
  const deleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteDoc(doc(db, "events", eventId));
        setEvents(events.filter((event) => event.id !== eventId));
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaCalendarPlus className="mr-2 text-blue-500" /> Event Scheduler
      </h2>

      {/* ✅ Event Creation Form */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          Schedule a New Event
        </h3>
        <input
          type="text"
          placeholder="Event Title"
          value={newEvent.title}
          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 dark:bg-gray-700"
        />
        <textarea
          placeholder="Event Description (Optional)"
          value={newEvent.description}
          onChange={(e) =>
            setNewEvent({ ...newEvent, description: e.target.value })
          }
          className="w-full px-4 py-2 border rounded-lg mt-2 focus:ring-2 focus:ring-blue-300 dark:bg-gray-700"
        />
        <div className="flex space-x-2 mt-3">
          <input
            type="date"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            className="w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 dark:bg-gray-700"
          />
          <input
            type="time"
            value={newEvent.time}
            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
            className="w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 dark:bg-gray-700"
          />
        </div>
        <button
          onClick={scheduleEvent}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
        >
          Schedule Event
        </button>
      </div>

      {/* ✅ Upcoming Events List */}
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
        Upcoming Events
      </h3>
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading events...</p>
        ) : events.length > 0 ? (
          events.map((event) => (
            <div
              key={event.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {event.title}
              </h4>
              <p className="text-gray-700 dark:text-gray-300">
                {event.description}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500 flex items-center">
                  <FaClock className="mr-1" /> {event.date} at {event.time}
                </span>
                {user && (
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No upcoming events.
          </p>
        )}
      </div>
    </div>
  );
};

export default EventScheduler;
