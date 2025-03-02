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
  where,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { FaPlus, FaTrash, FaCheckCircle, FaFilter } from "react-icons/fa";

const TaskManager = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Normal",
    dueDate: "",
  });
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  // ✅ Fetch Tasks from Firestore
  const fetchTasks = async () => {
    try {
      let q = query(collection(db, "tasks"), orderBy("dueDate", "asc"));
      if (filter !== "all") q = query(q, where("status", "==", filter));

      const querySnapshot = await getDocs(q);
      setTasks(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setLoading(false);
    }
  };

  // ✅ Add a New Task
  const addTask = async () => {
    if (!newTask.title.trim() || !newTask.dueDate) return;
    try {
      await addDoc(collection(db, "tasks"), {
        ...newTask,
        createdBy: user.displayName || "Anonymous",
        status: "Pending",
      });
      setNewTask({
        title: "",
        description: "",
        priority: "Normal",
        dueDate: "",
      });
      fetchTasks();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // ✅ Mark Task as Completed
  const completeTask = async (taskId) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), { status: "Completed" });
      fetchTasks();
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  // ✅ Delete Task
  const deleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteDoc(doc(db, "tasks", taskId));
        setTasks(tasks.filter((task) => task.id !== taskId));
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaPlus className="mr-2 text-green-500" /> Task Manager
      </h2>

      {/* ✅ Task Creation Form */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          Create a New Task
        </h3>
        <input
          type="text"
          placeholder="Task Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-300 dark:bg-gray-700"
        />
        <textarea
          placeholder="Task Description (Optional)"
          value={newTask.description}
          onChange={(e) =>
            setNewTask({ ...newTask, description: e.target.value })
          }
          className="w-full px-4 py-2 border rounded-lg mt-2 focus:ring-2 focus:ring-green-300 dark:bg-gray-700"
        />
        <div className="flex space-x-2 mt-3">
          <select
            value={newTask.priority}
            onChange={(e) =>
              setNewTask({ ...newTask, priority: e.target.value })
            }
            className="w-1/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-300 dark:bg-gray-700"
          >
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
          </select>
          <input
            type="date"
            value={newTask.dueDate}
            onChange={(e) =>
              setNewTask({ ...newTask, dueDate: e.target.value })
            }
            className="w-2/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-300 dark:bg-gray-700"
          />
        </div>
        <button
          onClick={addTask}
          className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
        >
          Add Task
        </button>
      </div>

      {/* ✅ Task Filters */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          Task List
        </h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg"
        >
          <option value="all">All</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* ✅ Task List */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
        ) : tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {task.title}
              </h4>
              <p className="text-gray-700 dark:text-gray-300">
                {task.description}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">
                  Due: {task.dueDate} • Priority: {task.priority}
                </span>
                <div className="flex space-x-2">
                  {task.status === "Pending" && (
                    <button
                      onClick={() => completeTask(task.id)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <FaCheckCircle />
                    </button>
                  )}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No tasks found.</p>
        )}
      </div>
    </div>
  );
};

export default TaskManager;
