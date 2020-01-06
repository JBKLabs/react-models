export default {
  name: 'tasks',
  state: {},
  reducers: {
    setTask: () => ({})
  },
  effects: (dispatch) => ({
    addTaskAsync: async () => {
      dispatch.tasks.setTask();
    }
  })
};