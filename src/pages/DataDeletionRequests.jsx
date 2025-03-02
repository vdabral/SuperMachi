import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { FaUserSlash, FaCheckCircle, FaTimes, FaTrash } from "react-icons/fa";

const DataDeletionRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic
  const [userRequest, setUserRequest] = useState(null);

  useEffect(() => {
    fetchDeletionRequests();
  }, []);

  // ✅ Fetch Data Deletion Requests from Firestore
  const fetchDeletionRequests = async () => {
    try {
      const q = query(
        collection(db, "dataDeletionRequests"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      setRequests(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      if (user) {
        const userReq = querySnapshot.docs.find(
          (doc) => doc.data().userId === user.uid
        );
        setUserRequest(userReq ? { id: userReq.id, ...userReq.data() } : null);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching deletion requests:", error);
      setLoading(false);
    }
  };

  // ✅ Submit Data Deletion Request (User)
  const submitDeletionRequest = async () => {
    if (!user) return alert("You must be logged in to request data deletion.");
    try {
      const requestRef = await addDoc(collection(db, "dataDeletionRequests"), {
        userId: user.uid,
        userEmail: user.email || "Anonymous",
        status: "Pending",
        reason: "",
        createdAt: serverTimestamp(),
      });
      setUserRequest({
        id: requestRef.id,
        userId: user.uid,
        userEmail: user.email,
        status: "Pending",
        reason: "",
      });
    } catch (error) {
      console.error("Error submitting data deletion request:", error);
    }
  };

  // ✅ Update Deletion Request Status (Admin)
  const updateRequestStatus = async (requestId, newStatus) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, "dataDeletionRequests", requestId), {
        status: newStatus,
      });
      setRequests(
        requests.map((req) =>
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      );
    } catch (error) {
      console.error("Error updating request status:", error);
    }
  };

  // ✅ Delete Request Record (Admin)
  const deleteRequest = async (requestId) => {
    if (!isAdmin) return;
    if (
      window.confirm("Are you sure you want to delete this request record?")
    ) {
      try {
        await deleteDoc(doc(db, "dataDeletionRequests", requestId));
        setRequests(requests.filter((req) => req.id !== requestId));
      } catch (error) {
        console.error("Error deleting request:", error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaUserSlash className="mr-2 text-red-500" /> Data Deletion Requests
      </h2>

      {/* ✅ User: Submit Deletion Request */}
      {!isAdmin && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
          {userRequest ? (
            <p className="text-gray-800 dark:text-gray-300">
              Your data deletion request is currently{" "}
              <strong>{userRequest.status}</strong>.
            </p>
          ) : (
            <>
              <p className="text-gray-800 dark:text-gray-300 mb-3">
                You can request to delete your account and personal data. This
                action is irreversible.
              </p>
              <button
                onClick={submitDeletionRequest}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
              >
                Request Data Deletion
              </button>
            </>
          )}
        </div>
      )}

      {/* ✅ Admin: Manage Deletion Requests */}
      {isAdmin && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            User Requests
          </h3>
          {loading ? (
            <p className="text-gray-600 dark:text-gray-400">
              Loading deletion requests...
            </p>
          ) : requests.length > 0 ? (
            requests.map((req) => (
              <div
                key={req.id}
                className="p-4 border-b border-gray-300 dark:border-gray-700"
              >
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>User:</strong> {req.userEmail}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Status:</strong> {req.status}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Requested on:</strong>{" "}
                  {new Date(req.createdAt.seconds * 1000).toLocaleString()}
                </p>
                <div className="mt-2 flex space-x-3">
                  {req.status === "Pending" && (
                    <>
                      <button
                        onClick={() => updateRequestStatus(req.id, "Approved")}
                        className="text-green-600 hover:text-green-800"
                      >
                        <FaCheckCircle /> Approve
                      </button>
                      <button
                        onClick={() => updateRequestStatus(req.id, "Denied")}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTimes /> Deny
                      </button>
                    </>
                  )}
                  {req.status === "Approved" && (
                    <button
                      onClick={() => updateRequestStatus(req.id, "Completed")}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaCheckCircle /> Mark as Completed
                    </button>
                  )}
                  <button
                    onClick={() => deleteRequest(req.id)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <FaTrash /> Delete Record
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              No data deletion requests found.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DataDeletionRequests;
