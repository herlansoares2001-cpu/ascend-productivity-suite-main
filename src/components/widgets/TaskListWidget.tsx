import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Plus, ListTodo, Trash2 } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";

export function TaskListWidget() {
  const { tasks, createTask, toggleTask, deleteTask, isLoading } = useTasks();
  const [newTask, setNewTask] = useState("");

  const handleAddTask = () => {
    if (newTask.trim()) {
      createTask.mutate(newTask.trim());
      setNewTask("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <motion.div
      className="widget-card h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-secondary" />
          <h3 className="text-sm font-light text-muted-foreground">Tarefas do Dia</h3>
        </div>
        <span className="text-xs text-muted-foreground font-light">
          {completedCount}/{tasks.length}
        </span>
      </div>

      {/* Add Task Input */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nova tarefa..."
          className="flex-1 bg-card/50 border border-border/50 rounded-xl px-3 py-2 text-sm font-light placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
        />
        <motion.button
          onClick={handleAddTask}
          disabled={createTask.isPending}
          className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Task List */}
      <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <p className="text-sm text-muted-foreground font-light text-center py-4">Carregando...</p>
        ) : (
          <AnimatePresence>
            {tasks.length > 0 ? (
              tasks.slice(0, 5).map((task) => (
                <motion.div
                  key={task.id}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-card/50 cursor-pointer group"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  layout
                >
                  <motion.div
                    onClick={() => toggleTask.mutate({ id: task.id, completed: task.completed })}
                    initial={false}
                    animate={{ scale: task.completed ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary/50" />
                    )}
                  </motion.div>
                  <span 
                    className={`text-sm font-light flex-1 ${task.completed ? 'text-muted-foreground line-through' : ''}`}
                    onClick={() => toggleTask.mutate({ id: task.id, completed: task.completed })}
                  >
                    {task.title}
                  </span>
                  <motion.button
                    onClick={() => deleteTask.mutate(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground font-light text-center py-4">
                Nenhuma tarefa ainda
              </p>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
