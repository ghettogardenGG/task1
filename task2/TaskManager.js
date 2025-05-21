class TaskManager {
  constructor(threads = 1) {
    this.threads = threads;
    this.tasks = new Map();
    this.status = new Map();
    this.dependencies = new Map();
    this.dependents = new Map();
    this.priorityQueue = [];
    this.runningTasks = 0;
    this.taskIdCounter = 1;
  }

  addTask(task, priority, dependencies = [], timeout = null) {
    const id = `task${this.taskIdCounter++}`;
    this.tasks.set(id, { id, task, priority, dependencies, timeout });
    this.status.set(id, "pending");
    this.dependencies.set(id, new Set(dependencies));

    for (const dep of dependencies) {
      if (!this.dependents.has(dep)) this.dependents.set(dep, new Set());
      this.dependents.get(dep).add(id);
    }
    this.queueTask(id);
  }

  queueTask(id) {
    this.priorityQueue.push(id);
    this.priorityQueue.sort(
      (a, b) => this.tasks.get(b).priority - this.tasks.get(a).priority
    );
  }

  async executeTasks() {
    // console.log(this.priorityQueue);
    // console.log(this.dependents);
    // console.log(this.dependencies);
    // console.log(this.status);
    return new Promise((resolve) => {
      const tryExecute = () => {
        if (this.priorityQueue.length === 0 && this.runningTasks === 0) {
          resolve();
          return;
        }

        while (this.runningTasks < this.threads) {
          const nextTaskId = this.priorityQueue.find((id) => {
            const deps = this.dependencies.get(id);
            return [...deps].every((dep) =>
              ["completed"].includes(this.status.get(dep))
            );
          });
          if (!nextTaskId) break;

          this.priorityQueue = this.priorityQueue.filter(
            (id) => id !== nextTaskId
          );
          this.runTask(nextTaskId, tryExecute);
        }
      };
      tryExecute();
    });
  }

  async runTask(id, onComplete) {
    const { task, timeout } = this.tasks.get(id);
    this.status.set(id, "running");
    this.runningTasks++;

    let timeoutId;
    let isTimeout = false;

    const taskPromise = new Promise(async (resolve, reject) => {
      if (timeout != null) {
        timeoutId = setTimeout(() => {
          isTimeout = true;
          reject(new Error("timeout"));
        }, timeout);
      }
      try {
        await task();
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    });

    taskPromise
      .then(() => this.status.set(id, "completed"))
      .catch((err) => {
        if (isTimeout) {
          this.status.set(id, "timeout");
        } else {
          this.status.set(id, "failed");
        }
        this.cancelDependents(id, onComplete);
      })
      .finally(() => {
        this.runningTasks--;
        onComplete();
      });
  }

  cancelDependents(id, onComplete) {
    if (this.dependents.has(id)) {
      for (const dep of this.dependents.get(id)) {
        if (this.status.get(dep) === "pending") {
          this.status.set(dep, "canceled");
          this.priorityQueue = this.priorityQueue.filter((tid) => tid !== dep);
          this.cancelDependents(dep, onComplete);
        }
      }
    }
    if (onComplete) onComplete();
  }

  getStatus() {
    const statusObj = {};
    for (const [id, stat] of this.status.entries()) {
      statusObj[id] = stat;
    }
    return statusObj;
  }

  changePriority(id, newPriority) {
    if (this.tasks.has(id)) {
      this.tasks.get(id).priority = newPriority;
      this.priorityQueue = this.priorityQueue.filter((tid) => tid !== id);
      this.queueTask(id);
    }
  }
}

// Пример использования
const taskManager = new TaskManager(2);

taskManager.addTask(
  async () => {
    console.log("Выполнение задачи 1");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Задача 1 завершена");
  },
  2,
  []
);
taskManager.addTask(
  async () => {
    console.log("Выполнение задачи 2");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Задача 2 завершена");
  },
  1,
  ["task1"]
);
taskManager.addTask(
  async () => {
    console.log("Выполнение задачи 3");
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("Задача 3 завершена");
  },
  3,
  []
);
taskManager.addTask(
  async () => {
    console.log("Выполнение задачи 4");
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log("Задача 4 завершена");
  },
  1,
  ["task2", "task3"]
);
//Выполнение задач
// taskManager
//   .executeTasks()
//   .then(() => {
//     console.log("Все задачи выполнены");
//     // Получение и вывод статуса всех задач после выполнения
//     console.log("Статус задач после выполнения:", taskManager.getStatus());
//   })
//   .catch((error) => {
//     console.error("Ошибка при выполнении задач:", error);
//   });
//Пример использования getStatus во время выполнения задач
// const intervalId = setInterval(() => {
//   const status = taskManager.getStatus();
//   console.log("Текущий статус задач:", status);
//   // Остановка интервала, когда все задачи будут выполнены
//   if (
//     Object.values(status).every(
//       (s) => s === "completed" || s === "failed" || s === "canceled"
//     )
//   ) {
//     clearInterval(intervalId);
//   }
// }, 500);
taskManager.addTask(
  async () => {
    console.log("Выполнение задачи 5");
    await new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Ошибка в задаче 5")), 1500)
    );
  },
  2,
  []
);
taskManager.addTask(
  async () => {
    console.log("Выполнение задачи 6");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Задача 6 завершена");
  },
  1,
  []
);
taskManager.addTask(
  async () => {
    console.log("Выполнение задачи 7");
    await new Promise((resolve) => setTimeout(resolve, 2500));
    console.log("Задача 7 завершена");
  },
  2,
  ["task5"]
);
taskManager
  .executeTasks()
  .then(() => {
    console.log("Все дополнительные задачи выполнены");
    // Получение и вывод статуса всех задач после выполнения дополнительных задач
    console.log(
      "Статус задач после выполнения дополнительных задач:",
      taskManager.getStatus()
    );
  })
  .catch((error) => {
    console.error("Ошибка при выполнении дополнительных задач:", error);
  });
