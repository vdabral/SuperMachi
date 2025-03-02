import { useState, useEffect } from "react";
import { firestore } from "../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    const q = query(collection(firestore, "events"), orderBy("date", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date || !location.trim() || !description.trim())
      return;

    setLoading(true);
    try {
      await addDoc(collection(firestore, "events"), {
        title,
        date,
        location,
        description,
        createdBy: user.uid,
        attendees: [],
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setDate("");
      setLocation("");
      setDescription("");
      setIsFormVisible(false);
    } catch (error) {
      console.error("Error creating event:", error);
    }
    setLoading(false);
  };

  const handleRSVP = async (eventId, attendees) => {
    if (!user) return alert("Please sign in to RSVP.");
    const eventRef = doc(firestore, "events", eventId);

    try {
      if (attendees.includes(user.uid)) {
        await updateDoc(eventRef, { attendees: arrayRemove(user.uid) });
      } else {
        await updateDoc(eventRef, { attendees: arrayUnion(user.uid) });
      }
    } catch (error) {
      console.error("Error updating RSVP:", error);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const groupEventsByMonth = () => {
    const grouped = {};

    events.forEach((event) => {
      const eventDate = new Date(event.date);
      const monthYear = eventDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }

      grouped[monthYear].push(event);
    });

    return grouped;
  };

  const groupedEvents = groupEventsByMonth();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          Community Events
        </h2>

        {user && (
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center"
          >
            {isFormVisible ? (
              <span>Cancel</span>
            ) : (
              <>
                <span className="mr-1">+</span>
                <span>New Event</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Event Creation Form */}
      {user && isFormVisible && (
        <form
          onSubmit={handleCreateEvent}
          className="mb-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md"
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Create New Event
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Event Title
              </label>
              <input
                type="text"
                placeholder="Enter event title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location
            </label>
            <input
              type="text"
              placeholder="Enter location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              placeholder="Enter event description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-24"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsFormVisible(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2 text-white rounded-lg transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      )}

      {!user && !events.length && (
        <div className="text-center py-16 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-8">
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
            No upcoming events
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Sign in to create the first community event!
          </p>
        </div>
      )}

      {/* Event List Grouped by Month */}
      {Object.keys(groupedEvents).length > 0
        ? Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
            <div key={monthYear} className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2 dark:border-gray-700">
                {monthYear}
              </h3>
              <div className="grid grid-cols-1 gap-6">
                {monthEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between">
                      <div className="mb-4 md:mb-0">
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {event.title}
                        </h4>
                        <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                          <span className="mr-2">📅</span>
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="mr-2">📍</span>
                          <span>{event.location}</span>
                        </div>
                      </div>

                      {user && (
                        <button
                          onClick={() =>
                            handleRSVP(event.id, event.attendees || [])
                          }
                          className={`px-6 py-2 rounded-lg self-start shrink-0 ${
                            event.attendees?.includes(user?.uid)
                              ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 border border-red-300 dark:border-red-800"
                              : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 border border-green-300 dark:border-green-800"
                          }`}
                        >
                          {event.attendees?.includes(user?.uid)
                            ? "Cancel RSVP"
                            : "Attend Event"}
                        </button>
                      )}
                    </div>

                    <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300">
                        {event.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-sm font-medium px-3 py-1 rounded-full">
                          {event.attendees?.length || 0}{" "}
                          {event.attendees?.length === 1 ? "Person" : "People"}{" "}
                          Attending
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        : !isFormVisible &&
          user && (
            <div className="text-center py-16 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                No upcoming events
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Be the first to create a community event!
              </p>
              <button
                onClick={() => setIsFormVisible(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
              >
                Create Event
              </button>
            </div>
          )}
    </div>
  );
};

export default EventsPage;
