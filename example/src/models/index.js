import { buildModel } from '@jbknowledge/react-models';
import users from './users';
import tasks from './tasks';

export const useUsers = buildModel(users);
export const useTasks = buildModel(tasks);
