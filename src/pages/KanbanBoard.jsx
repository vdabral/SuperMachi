import { useEffect, useState } from "react";
import { firestore } from "../firebaseConfig"; // Updated to use firestore
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FaPlus, FaTrash, FaGripLines } from "react-icons/fa";

const KanbanBoard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  // ✅ Fetch Tasks from Firestore
  const fetchTasks = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(firestore, "kanban_tasks")
      ); // Updated to use firestore
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
    if (!newTask.trim()) return;
    try {
      const taskRef = await addDoc(collection(firestore, "kanban_tasks"), {
        // Updated to use firestore
        title: newTask,
        status: "To Do",
        createdBy: user.displayName || "Anonymous",
      });
      setTasks([...tasks, { id: taskRef.id, title: newTask, status: "To Do" }]);
      setNewTask("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // ✅ Update Task Status in Firestore
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await updateDoc(doc(firestore, "kanban_tasks", taskId), {
        status: newStatus,
      }); // Updated to use firestore
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  // ✅ Delete Task
  const deleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteDoc(doc(firestore, "kanban_tasks", taskId)); // Updated to use firestore
        setTasks(tasks.filter((task) => task.id !== taskId));
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  // ✅ Handle Drag & Drop
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    const draggedTask = tasks[source.index];

    if (draggedTask.status !== destination.droppableId) {
      updateTaskStatus(draggedTask.id, destination.droppableId);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        Kanban Board
      </h2>

      {/* ✅ Add New Task */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          Add a New Task
        </h3>
        <div className="flex">
          <input
            type="text"
            placeholder="Task Title"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="w-full px-4 py-2 border rounded-l-lg focus:ring-2 focus:ring-blue-300 dark:bg-gray-700"
          />
          <button
            onClick={addTask}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-r-lg transition"
          >
            <FaPlus />
          </button>
        </div>
      </div>

      {/* ✅ Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-3 gap-6">
          {["To Do", "In Progress", "Completed"].map((status) => (
            <Droppable key={status} droppableId={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md min-h-[300px]"
                >
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    {status}
                  </h3>

                  {tasks
                    .filter((task) => task.status === status)
                    .map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-md flex justify-between items-center mb-2"
                          >
                            <span className="flex items-center">
                              <FaGripLines className="text-gray-500 dark:text-gray-300 mr-2" />
                              {task.title}
                            </span>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
