declare module '*.worker.mjs' {
  const WorkerFactory: {
    new (): Worker;
  };
  export default WorkerFactory;
}
