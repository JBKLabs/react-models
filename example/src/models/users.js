import uuid from 'uuid/v1';

export default {
  name: 'users',
  state: { 0: { id: uuid(), firstName: 'Brian', lastName: 'Maule' } },
  reducers: {
    setUser: (state, user) => ({
      ...state,
      [user.id]: user
    })
  },
  effects: (dispatch) => ({
    addUserAsync: async (user) => {
      console.log('added', user);
      dispatch.users.setUser({
        id: uuid(),
        ...user
      });
    }
  })
};
